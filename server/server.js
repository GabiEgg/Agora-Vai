// Servidor do Cristopher: serve o app e guarda contas, fichas, homebrew, configurações e imagens em SQLite.
// Banco: arquivo local (node:sqlite, Node 22.13+) ou Turso na nuvem quando TURSO_DATABASE_URL está definido (veja banco.js).
'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {abrirBanco,paraBuffer}=require('./banco');

const PORT=+process.env.PORT||3000;
const RAIZ=path.resolve(__dirname,'..');
const DB_PATH=path.resolve(process.env.DB_PATH||path.join(__dirname,'dados','dossie.db'));
const PERMITIR_CADASTRO=process.env.PERMITIR_CADASTRO!=='0';
const COOKIE_SECURE=process.env.COOKIE_SECURE==='1';
const TRUST_PROXY=process.env.TRUST_PROXY==='1'; // atrás do proxy de um serviço de hospedagem, o IP real vem em X-Forwarded-For
const MAX_JSON=2*1024*1024, MAX_IMG=8*1024*1024, MAX_DOCS=1000;
const SESSAO_DIAS=30;
const TIPOS_IMG={'image/png':1,'image/jpeg':1,'image/gif':1,'image/webp':1};

/* ---------------- banco ---------------- */
// Em container com volume local, os volumes chegam como root: entrega a pasta do banco ao usuário comum e deixa de ser root.
if(!process.env.TURSO_DATABASE_URL&&process.env.RODAR_COMO&&process.getuid&&process.getuid()===0){
  fs.mkdirSync(path.dirname(DB_PATH),{recursive:true});
  const usuario=process.env.RODAR_COMO;const {execFileSync}=require('node:child_process');
  const uid=+execFileSync('id',['-u',usuario]).toString(),gid=+execFileSync('id',['-g',usuario]).toString();
  for(const f of [path.dirname(DB_PATH),...fs.readdirSync(path.dirname(DB_PATH)).map(n=>path.join(path.dirname(DB_PATH),n))])fs.chownSync(f,uid,gid);
  process.setgid(gid);process.setuid(uid);
}
let db=null; // aberto em iniciar()
const Q={
  usuarioPorNome:'SELECT * FROM usuarios WHERE usuario=?',
  criarUsuario:'INSERT INTO usuarios(id,usuario,hash,sal,criado) VALUES(?,?,?,?,?)',
  criarSessao:'INSERT INTO sessoes(token,usuario_id,expira) VALUES(?,?,?)',
  sessao:'SELECT u.id,u.usuario FROM sessoes s JOIN usuarios u ON u.id=s.usuario_id WHERE s.token=? AND s.expira>?',
  apagarSessao:'DELETE FROM sessoes WHERE token=?',
  limparSessoes:'DELETE FROM sessoes WHERE expira<=?',
  listarDocs:'SELECT doc_id,dados FROM docs WHERE usuario_id=?',
  contarDocs:'SELECT COUNT(*) n FROM docs WHERE usuario_id=?',
  existeDoc:'SELECT 1 FROM docs WHERE usuario_id=? AND doc_id=?',
  gravarDoc:'INSERT INTO docs(usuario_id,doc_id,dados,atualizado) VALUES(?,?,?,?) ON CONFLICT(usuario_id,doc_id) DO UPDATE SET dados=excluded.dados, atualizado=excluded.atualizado',
  apagarDoc:'DELETE FROM docs WHERE usuario_id=? AND doc_id=?',
  gravarImg:'INSERT INTO imagens(id,usuario_id,tipo,dados,criado) VALUES(?,?,?,?,?)',
  imagem:'SELECT tipo,dados FROM imagens WHERE id=?',
  criarMesa:'INSERT INTO mesas(id,nome,codigo,mestre_id,criado) VALUES(?,?,?,?,?)',
  mesaPorCodigo:'SELECT * FROM mesas WHERE codigo=?',
  mesa:'SELECT * FROM mesas WHERE id=?',
  apagarMesa:'DELETE FROM mesas WHERE id=?',
  apagarMembros:'DELETE FROM mesa_membros WHERE mesa_id=?',
  apagarEventos:'DELETE FROM mesa_eventos WHERE mesa_id=?',
  addMembro:'INSERT OR IGNORE INTO mesa_membros(mesa_id,usuario_id,papel,entrou) VALUES(?,?,?,?)',
  tirarMembro:"DELETE FROM mesa_membros WHERE mesa_id=? AND usuario_id=? AND papel<>'mestre'",
  papel:'SELECT papel FROM mesa_membros WHERE mesa_id=? AND usuario_id=?',
  minhasMesas:`SELECT m.id,m.nome,m.codigo,mm.papel,u.usuario mestre FROM mesa_membros mm JOIN mesas m ON m.id=mm.mesa_id JOIN usuarios u ON u.id=m.mestre_id WHERE mm.usuario_id=? ORDER BY m.criado`,
  membros:`SELECT u.usuario,mm.papel FROM mesa_membros mm JOIN usuarios u ON u.id=mm.usuario_id WHERE mm.mesa_id=? ORDER BY mm.entrou`,
  fichasDaMesa:`SELECT u.usuario,d.dados,d.atualizado FROM mesa_membros mm JOIN docs d ON d.usuario_id=mm.usuario_id JOIN usuarios u ON u.id=mm.usuario_id
    WHERE mm.mesa_id=? AND d.doc_id LIKE 'f-%' AND json_extract(d.dados,'$.ficha.mesa')=?`,
  addEvento:'INSERT INTO mesa_eventos(mesa_id,usuario_id,criado,dados) VALUES(?,?,?,?)',
  podarEventos:'DELETE FROM mesa_eventos WHERE mesa_id=? AND id NOT IN (SELECT id FROM mesa_eventos WHERE mesa_id=? ORDER BY id DESC LIMIT 200)',
  iniLista:'SELECT i.chave,i.usuario_id,i.tipo,i.nome,i.valor,i.fonte,i.dados,i.atualizado,u.usuario FROM mesa_ini i LEFT JOIN usuarios u ON u.id=i.usuario_id WHERE i.mesa_id=?',
  iniContar:'SELECT COUNT(*) n FROM mesa_ini WHERE mesa_id=?',
  iniUma:'SELECT chave,usuario_id,tipo FROM mesa_ini WHERE mesa_id=? AND chave=?',
  membroPorNome:'SELECT u.id FROM mesa_membros mm JOIN usuarios u ON u.id=mm.usuario_id WHERE mm.mesa_id=? AND u.usuario=?',
  iniEstado:'SELECT pedido,turno,rodada,atualizado FROM mesa_estado WHERE mesa_id=?',
  iniSetEstado:'INSERT INTO mesa_estado(mesa_id,pedido,turno,rodada,atualizado) VALUES(?,?,?,?,?) ON CONFLICT(mesa_id) DO UPDATE SET pedido=excluded.pedido,turno=excluded.turno,rodada=excluded.rodada,atualizado=excluded.atualizado',
  iniUpsert:'INSERT INTO mesa_ini(mesa_id,chave,usuario_id,tipo,nome,valor,fonte,dados,atualizado) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(mesa_id,chave) DO UPDATE SET nome=excluded.nome,valor=excluded.valor,fonte=excluded.fonte,dados=excluded.dados,atualizado=excluded.atualizado',
  iniValor:'UPDATE mesa_ini SET valor=?,fonte=?,atualizado=? WHERE mesa_id=? AND chave=?',
  iniZerar:"UPDATE mesa_ini SET valor=NULL,fonte=NULL,atualizado=? WHERE mesa_id=?",
  iniDel:'DELETE FROM mesa_ini WHERE mesa_id=? AND chave=?',
  iniDelAgentes:"DELETE FROM mesa_ini WHERE mesa_id=? AND tipo='agente'",
  iniDelTudo:'DELETE FROM mesa_ini WHERE mesa_id=?',
  iniDelEstado:'DELETE FROM mesa_estado WHERE mesa_id=?',
  iniDados:'SELECT chave,usuario_id,tipo,nome,dados FROM mesa_ini WHERE mesa_id=? AND chave=?',
  iniSetDados:'UPDATE mesa_ini SET dados=?,atualizado=? WHERE mesa_id=? AND chave=?',
  membrosIds:`SELECT u.id,u.usuario,mm.papel FROM mesa_membros mm JOIN usuarios u ON u.id=mm.usuario_id WHERE mm.mesa_id=? ORDER BY mm.entrou`,
  docUm:'SELECT dados FROM docs WHERE usuario_id=? AND doc_id=?',
  pingAdd:'INSERT INTO mesa_ping(mesa_id,de_id,para,criado,dados) VALUES(?,?,?,?,?)',
  /* Pings para mim: enviados ao meu id, ou "mestre" nas campanhas que mestro, ou "todos" nas campanhas em que jogo. */
  pingMeus:`SELECT p.id,p.mesa_id,p.criado,p.dados,p.para,p.de_id,mm.papel,u.usuario de,m.nome mesa FROM mesa_ping p JOIN mesa_membros mm ON mm.mesa_id=p.mesa_id AND mm.usuario_id=? JOIN usuarios u ON u.id=p.de_id JOIN mesas m ON m.id=p.mesa_id
    WHERE p.id>? AND p.criado>? AND p.de_id<>? AND (p.para=? OR (p.para='mestre' AND mm.papel='mestre') OR (p.para='todos' AND mm.papel<>'mestre')) ORDER BY p.id LIMIT 50`,
  pingUltimo:'SELECT MAX(id) n FROM mesa_ping',
  pingPodar:'DELETE FROM mesa_ping WHERE criado<?',
  pingHist:`SELECT p.id,p.criado,p.dados,p.para,p.de_id,u.usuario de,u2.usuario paraNome FROM mesa_ping p JOIN usuarios u ON u.id=p.de_id LEFT JOIN usuarios u2 ON u2.id=p.para WHERE p.mesa_id=? ORDER BY p.id DESC LIMIT 200`,
  pingDel:'DELETE FROM mesa_ping WHERE mesa_id=? AND id=?',
  fichasDaMesaDono:`SELECT d.usuario_id,d.doc_id,d.dados FROM mesa_membros mm JOIN docs d ON d.usuario_id=mm.usuario_id WHERE mm.mesa_id=? AND d.doc_id LIKE 'f-%' AND json_extract(d.dados,'$.ficha.mesa')=?`,
  apagarPings:'DELETE FROM mesa_ping WHERE mesa_id=?',
  logAdd:'INSERT INTO mesa_log(mesa_id,usuario_id,criado,dados) VALUES(?,?,?,?)',
  logLista:'SELECT id,criado,dados FROM mesa_log WHERE mesa_id=? AND id>? ORDER BY id LIMIT 2000',
  logContar:'SELECT COUNT(*) n FROM mesa_log WHERE mesa_id=?',
  logApagar:'DELETE FROM mesa_log WHERE mesa_id=?',
  cfgMesa:'SELECT dados,atualizado FROM mesa_cfg WHERE mesa_id=?',
  cfgMesaSet:'INSERT INTO mesa_cfg(mesa_id,dados,atualizado) VALUES(?,?,?) ON CONFLICT(mesa_id) DO UPDATE SET dados=excluded.dados,atualizado=excluded.atualizado',
  cfgMesaDel:'DELETE FROM mesa_cfg WHERE mesa_id=?',
  eventos:`SELECT e.id,e.criado,e.dados,u.usuario FROM mesa_eventos e JOIN usuarios u ON u.id=e.usuario_id WHERE e.mesa_id=? AND e.id>? ORDER BY e.id DESC LIMIT 50`,
};
setInterval(()=>{if(db)db.run(Q.limparSessoes,Date.now()).catch(()=>{})},3600e3).unref();

/* ---------------- senhas e sessões ---------------- */
const hashSenha=(senha,sal)=>crypto.scryptSync(senha,sal,64).toString('hex');
function confere(senha,u){const a=Buffer.from(hashSenha(senha,u.sal),'hex'),b=Buffer.from(u.hash,'hex');return a.length===b.length&&crypto.timingSafeEqual(a,b)}
function lerCookie(req,nome){const c=req.headers.cookie||'';for(const p of c.split(';')){const [k,...v]=p.trim().split('=');if(k===nome)return decodeURIComponent(v.join('='))}return null}
async function usuarioDe(req){const t=lerCookie(req,'sessao');if(!t)return null;return await db.get(Q.sessao,t,Date.now())||null}
async function abrirSessao(res,usuarioId){
  const token=crypto.randomBytes(32).toString('hex');await db.run(Q.criarSessao,token,usuarioId,Date.now()+SESSAO_DIAS*864e5);
  res.setHeader('Set-Cookie',`sessao=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSAO_DIAS*86400}${COOKIE_SECURE?'; Secure':''}`);
}
// Limite simples de tentativas de login/cadastro por IP (10 por minuto).
const tentativas=new Map();
function ipDe(req){const xf=TRUST_PROXY&&String(req.headers['x-forwarded-for']||'').split(',')[0].trim();return xf||req.socket.remoteAddress||'?'}
const pingsPorUsuario=new Map();
/* Até 15 pings por minuto por pessoa. */
function pingDemais(uid){const agora=Date.now();const l=(pingsPorUsuario.get(uid)||[]).filter(t=>agora-t<60e3);l.push(agora);pingsPorUsuario.set(uid,l);return l.length>15}
function excedeu(req){const ip=ipDe(req);const agora=Date.now();const l=(tentativas.get(ip)||[]).filter(t=>agora-t<60e3);l.push(agora);tentativas.set(ip,l);return l.length>10}

/* ---------------- utilidades HTTP ---------------- */
function enviar(res,status,corpo,tipo='application/json; charset=utf-8',extra={}){
  const buf=Buffer.isBuffer(corpo)?corpo:Buffer.from(typeof corpo==='string'?corpo:JSON.stringify(corpo));
  res.writeHead(status,{'Content-Type':tipo,'Content-Length':buf.length,'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin',...extra});res.end(buf);
}
const erro=(res,status,msg)=>enviar(res,status,{erro:msg});
function lerCorpo(req,max){return new Promise((ok,falha)=>{const partes=[];let n=0;
  req.on('data',c=>{n+=c.length;if(n>max){falha(Object.assign(new Error('grande'),{status:413}));req.destroy()}else partes.push(c)});
  req.on('end',()=>ok(Buffer.concat(partes)));req.on('error',falha)})}
async function lerJSON(req){const b=await lerCorpo(req,MAX_JSON);try{return JSON.parse(b.toString('utf8')||'null')}catch(e){throw Object.assign(new Error('json'),{status:400})}}

/* ---------------- arquivos do app ---------------- */
const MIME={'.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml'};
let paginaCache=null;
function pagina(){ // o index.html é um fragmento (formato de artifact); aqui ganha o esqueleto de documento
  if(paginaCache&&process.env.NODE_ENV==='production')return paginaCache;
  const corpo=fs.readFileSync(path.join(RAIZ,'index.html'),'utf8').replace(/^<meta charset="utf-8">\s*/,'');
  return paginaCache=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}</style></head><body>${corpo}</body></html>`;
}
function servirArquivo(res,url){
  const rel=path.normalize(decodeURIComponent(url)).replace(/^([/\\])+/,'');
  if(!/^(js[/\\][\w.-]+\.js|data[/\\](dados|criaturas)\.json|img[/\\][\w.-]+\.(png|webp|jpg|svg))$/.test(rel))return erro(res,404,'Não encontrado');
  const arq=path.join(RAIZ,rel);
  fs.readFile(arq,(e,buf)=>{if(e)return erro(res,404,'Não encontrado');enviar(res,200,buf,MIME[path.extname(arq)]||'application/octet-stream',{'Cache-Control':'no-cache'})});
}

/* ---------------- rotas ---------------- */
const ID_DOC=/^[A-Za-z0-9_\-:.]{1,120}$/;
async function rotear(req,res){
  const url=new URL(req.url,'http://x');const p=url.pathname;const m=req.method;
  if(m==='GET'&&(p==='/'||p==='/index.html'))return enviar(res,200,pagina(),'text/html; charset=utf-8',{'Cache-Control':'no-cache'});
  if(m==='GET'&&(p.startsWith('/js/')||p.startsWith('/data/')||p.startsWith('/img/')))return servirArquivo(res,p);
  if(m==='GET'&&p.startsWith('/_blob/')){const id=p.slice(7);if(!/^[a-f0-9]{32}$/.test(id))return erro(res,404,'Não encontrado');
    const img=await db.get(Q.imagem,id);if(!img)return erro(res,404,'Não encontrado');
    return enviar(res,200,paraBuffer(img.dados),img.tipo,{'Cache-Control':'private, max-age=31536000, immutable'})}
  if(!p.startsWith('/api/'))return erro(res,404,'Não encontrado');
  // Proteção contra requisições de outros sites: exige o cabeçalho que só o app envia.
  if(m!=='GET'&&req.headers['x-dossie']!=='1')return erro(res,403,'Requisição recusada');

  if(p==='/api/eu'&&m==='GET'){const u=await usuarioDe(req);return enviar(res,200,{usuario:u?u.usuario:null,cadastro:PERMITIR_CADASTRO})}
  if((p==='/api/entrar'||p==='/api/cadastrar')&&m==='POST'){
    if(excedeu(req))return erro(res,429,'Muitas tentativas. Espere um minuto.');
    const b=await lerJSON(req)||{};const usuario=String(b.usuario||'').trim(),senha=String(b.senha||'');
    if(!/^[\p{L}\p{N}_.-]{3,32}$/u.test(usuario))return erro(res,400,'Nome de usuário: 3 a 32 letras, números, ponto, hífen ou sublinhado.');
    if(senha.length<6||senha.length>200)return erro(res,400,'A senha precisa ter pelo menos 6 caracteres.');
    let u=await db.get(Q.usuarioPorNome,usuario);
    if(p==='/api/cadastrar'){
      if(!PERMITIR_CADASTRO)return erro(res,403,'Novos cadastros estão desligados neste servidor.');
      if(u)return erro(res,409,'Esse nome de usuário já existe.');
      const sal=crypto.randomBytes(16).toString('hex');const id=crypto.randomUUID();
      await db.run(Q.criarUsuario,id,usuario,hashSenha(senha,sal),sal,Date.now());u={id,usuario};
    }else if(!u||!confere(senha,u))return erro(res,401,'Usuário ou senha incorretos.');
    await abrirSessao(res,u.id);return enviar(res,200,{usuario:u.usuario});
  }
  if(p==='/api/sair'&&m==='POST'){const t=lerCookie(req,'sessao');if(t)await db.run(Q.apagarSessao,t);
    return enviar(res,200,{ok:true},undefined,{'Set-Cookie':`sessao=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${COOKIE_SECURE?'; Secure':''}`})}

  const u=await usuarioDe(req);if(!u)return erro(res,401,'Não autenticado');
  if(p==='/api/docs'&&m==='GET'){const out={};for(const r of await db.all(Q.listarDocs,u.id)){try{out[r.doc_id]=JSON.parse(r.dados)}catch(e){}}return enviar(res,200,out)}
  const md=p.match(/^\/api\/docs\/([^/]+)$/);
  if(md){const id=decodeURIComponent(md[1]);if(!ID_DOC.test(id))return erro(res,400,'Identificador inválido');
    if(m==='PUT'){const dados=await lerJSON(req);if(!dados||typeof dados!=='object'||Array.isArray(dados))return erro(res,400,'Documento inválido');
      if(!(await db.get(Q.existeDoc,u.id,id))&&Number((await db.get(Q.contarDocs,u.id)).n)>=MAX_DOCS)return erro(res,507,'Limite de documentos da conta atingido.');
      await db.run(Q.gravarDoc,u.id,id,JSON.stringify(dados),Date.now());return enviar(res,200,{ok:true})}
    if(m==='DELETE'){await db.run(Q.apagarDoc,u.id,id);return enviar(res,200,{ok:true})}}
  if(p==='/api/imagens'&&m==='POST'){const tipo=String(req.headers['content-type']||'').split(';')[0].trim();
    if(!TIPOS_IMG[tipo])return erro(res,415,'Use PNG, JPG, GIF ou WebP.');
    const buf=await lerCorpo(req,MAX_IMG);if(!buf.length)return erro(res,400,'Arquivo vazio');
    const id=crypto.randomBytes(16).toString('hex');await db.run(Q.gravarImg,id,u.id,tipo,buf,Date.now());
    return enviar(res,200,{id,url:'/_blob/'+id,sizeBytes:buf.length,contentType:tipo})}
  /* Pings: avisos rápidos entre mestre e jogadores. GET traz os novos para mim (de todas as campanhas). */
  if(p==='/api/ping'&&m==='GET'){const depois=+url.searchParams.get('depois')||0;
    /* Primeira consulta (depois=0): só os dos últimos 2 minutos, para não perder um ping que chegou enquanto a página abria. */
    const lista=await db.all(Q.pingMeus,u.id,depois,Date.now()-(depois?6*3600e3:120e3),u.id,u.id);
    if(!depois&&!lista.length){const r=await db.get(Q.pingUltimo);return enviar(res,200,{ultimo:(r&&r.n)||0,pings:[]})}
    if(Math.random()<0.02)await db.run(Q.pingPodar,Date.now()-30*86400e3);
    return enviar(res,200,{ultimo:lista.length?lista[lista.length-1].id:depois,pings:lista.map(x=>{let d={};try{d=JSON.parse(x.dados)}catch(e){}return {id:x.id,mesa:x.mesa_id,mesaNome:x.mesa,de:x.de,deId:x.papel==='mestre'?x.de_id:undefined,souMestre:x.papel==='mestre',criado:x.criado,paraTodos:x.para==='todos',...d}})})}
  if(p.startsWith('/api/mesas'))return rotasMesa(req,res,u,p,m,url);
  return erro(res,404,'Não encontrado');
}

/* ---------------- campanhas (mesas compartilhadas) ----------------
   O mestre cria a campanha e passa o código. Jogadores entram com o código e escolhem,
   ficha por ficha, quais ligar à campanha. Só o mestre lê as fichas ligadas; jogadores
   continuam vendo apenas as próprias. Avisos de rituais vão dos jogadores para o mestre. */
const ALFA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const novoCodigo=()=>Array.from(crypto.randomBytes(6),b=>ALFA[b%ALFA.length]).join('');
const MODOS_GRUPO=['numeros','barras','sem','oculto'];
const modoGrupo=v=>MODOS_GRUPO.includes(v)?v:'barras';
async function lerCfgMesa(id){const r=await db.get(Q.cfgMesa,id);try{return (r&&JSON.parse(r.dados))||{}}catch(e){return {}}}
async function rotasMesa(req,res,u,p,m,url){
  if(p==='/api/mesas'&&m==='GET')return enviar(res,200,(await db.all(Q.minhasMesas,u.id)).map(x=>({id:x.id,nome:x.nome,papel:x.papel,mestre:x.mestre,codigo:x.papel==='mestre'?x.codigo:undefined})));
  if(p==='/api/mesas'&&m==='POST'){const b=await lerJSON(req)||{};const nome=String(b.nome||'').trim().slice(0,80);if(!nome)return erro(res,400,'Dê um nome para a campanha.');
    if((await db.all(Q.minhasMesas,u.id)).filter(x=>x.papel==='mestre').length>=20)return erro(res,400,'Limite de 20 campanhas como mestre.');
    const id=crypto.randomUUID();let codigo=novoCodigo();while(await db.get(Q.mesaPorCodigo,codigo))codigo=novoCodigo();
    await db.run(Q.criarMesa,id,nome,codigo,u.id,Date.now());await db.run(Q.addMembro,id,u.id,'mestre',Date.now());
    return enviar(res,200,{id,nome,codigo,papel:'mestre',mestre:u.usuario})}
  if(p==='/api/mesas/entrar'&&m==='POST'){if(excedeu(req))return erro(res,429,'Muitas tentativas. Espere um minuto.');
    const b=await lerJSON(req)||{};const mesa=await db.get(Q.mesaPorCodigo,String(b.codigo||'').trim().toUpperCase());if(!mesa)return erro(res,404,'Código não encontrado.');
    await db.run(Q.addMembro,mesa.id,u.id,'jogador',Date.now());const pap=(await db.get(Q.papel,mesa.id,u.id)).papel;
    return enviar(res,200,{id:mesa.id,nome:mesa.nome,papel:pap})}
  const mm=p.match(/^\/api\/mesas\/([\w-]{1,64})(\/[a-z]+)?$/);if(!mm)return erro(res,404,'Não encontrado');
  const mesa=await db.get(Q.mesa,mm[1]);const pap=mesa&&(await db.get(Q.papel,mesa.id,u.id));if(!mesa||!pap)return erro(res,404,'Campanha não encontrada.');
  const mestre=pap.papel==='mestre';const sub=mm[2]||'';
  if(sub===''&&m==='DELETE'){if(!mestre)return erro(res,403,'Só o mestre pode excluir a campanha.');await db.run(Q.apagarMembros,mesa.id);await db.run(Q.apagarEventos,mesa.id);await db.run(Q.apagarPings,mesa.id);await db.run(Q.iniDelTudo,mesa.id);await db.run(Q.iniDelEstado,mesa.id);await db.run(Q.logApagar,mesa.id);await db.run(Q.cfgMesaDel,mesa.id);await db.run(Q.apagarMesa,mesa.id);return enviar(res,200,{ok:true})}
  if(sub==='/sair'&&m==='POST'){if(mestre)return erro(res,400,'O mestre não sai da própria campanha; exclua-a se quiser.');await db.run(Q.tirarMembro,mesa.id,u.id);return enviar(res,200,{ok:true})}
  if(sub==='/fichas'&&m==='GET'){if(!mestre)return erro(res,403,'Só o mestre vê as fichas da campanha.');
    const fichas=[];for(const r of await db.all(Q.fichasDaMesa,mesa.id,mesa.id)){try{fichas.push({usuario:r.usuario,atualizado:r.atualizado,ficha:JSON.parse(r.dados).ficha})}catch(e){}}
    return enviar(res,200,{membros:await db.all(Q.membros,mesa.id),fichas})}
  if(sub==='/eventos'&&m==='POST'){const b=await lerJSON(req);if(!b||typeof b!=='object')return erro(res,400,'Aviso inválido');const txt=JSON.stringify(b);if(txt.length>8000)return erro(res,413,'Aviso grande demais.');
    await db.run(Q.addEvento,mesa.id,u.id,Date.now(),txt);await db.run(Q.podarEventos,mesa.id,mesa.id);return enviar(res,200,{ok:true})}
  if(sub==='/eventos'&&m==='GET'){if(!mestre)return erro(res,403,'Só o mestre vê os avisos.');const depois=+url.searchParams.get('depois')||0;
    return enviar(res,200,(await db.all(Q.eventos,mesa.id,depois)).map(e=>({id:e.id,criado:e.criado,usuario:e.usuario,...JSON.parse(e.dados)})))}
  if(sub==='/iniciativa')return rotaIniciativa(req,res,u,m,mesa,mestre);
  /* Grupo: o que cada jogador vê dos colegas (retrato, estado, contadores e, conforme o mestre, barras com ou sem números).
     Só sai daqui o resumo público da ficha; o resto continua só para o mestre. */
  if(sub==='/grupo'&&m==='GET'){const cfgG=await lerCfgMesa(mesa.id);const modoCfg=modoGrupo(cfgG.grupo);const ocultas=new Set(Array.isArray(cfgG.fichasOcultas)?cfgG.fichasOcultas:[]);
    /* Mestre: vê todas as fichas, com números; jogadores: conforme o modo, sem as fichas que o mestre escondeu (cada um sempre vê a própria). */
    const modo=mestre?'numeros':modoCfg;
    if(modoCfg==='oculto'&&!mestre)return enviar(res,200,{modo:modoCfg,membros:[]});
    const idOk=v=>typeof v==='string'&&/^[\w-]{1,64}$/.test(v)?v:undefined;const n=v=>Math.max(0,Math.min(999,Math.round(+v)||0));
    const membros=[];for(const r of await db.all(Q.fichasDaMesa,mesa.id,mesa.id)){let f;try{f=JSON.parse(r.dados).ficha}catch(e){continue}if(!f)continue;
      const fid=String(f.id||'');const minha=r.usuario===u.usuario;if(!mestre&&!minha&&ocultas.has(fid))continue;
      const pub=f.publico||{};const rt=f.retrato||{};const arte={};for(const k of ['normal','machucado','perturbado','caido','louco','morto']){const v=idOk((rt.arte||{})[k]);if(v)arte[k]=v}
      const e={usuario:r.usuario,id:idOk(String(f.id||'')),nome:txtCurto(f.nome,80)||'Agente',estado:['normal','machucado','perturbado','caido','louco','morto'].includes(pub.estado)?pub.estado:'normal',
        arte,morto:!!rt.morto,sessao:{quedas:n((rt.sessao||{}).quedas),loucuras:n((rt.sessao||{}).loucuras)},minha:minha||undefined,oculta:mestre&&ocultas.has(fid)||undefined};
      if(rt.morto)e.estado='morto';
      if(modo==='numeros'||modo==='barras'){const barra=k=>{const c=Math.round(+pub[k]),mx=Math.round(+pub[k+'Max']);if(!(mx>0)||!Number.isFinite(c))return undefined;
          return modo==='numeros'?{v:Math.max(-999,Math.min(9999,c)),max:Math.min(9999,mx)}:{pct:Math.round(Math.max(0,Math.min(100,c/mx*100)))}};
        e.det=!!pub.det;e.pv=barra('pv');if(pub.det||modo==='numeros')e.pe=barra('pe');if(!pub.det)e.san=barra('san')}
      membros.push(e)}
    return enviar(res,200,{modo:mestre?modoCfg:modo,membros})}
  if(sub==='/grupo'&&m==='PUT'){if(!mestre)return erro(res,403,'Só o mestre escolhe o que o grupo vê.');const b=await lerJSON(req)||{};
    const cfg=await lerCfgMesa(mesa.id);if(b.modo!==undefined)cfg.grupo=modoGrupo(b.modo);
    if(b.ficha!==undefined){const fid=txtCurto(b.ficha,64);if(!/^[\w-]{1,64}$/.test(fid))return erro(res,400,'Ficha inválida.');const l=new Set(Array.isArray(cfg.fichasOcultas)?cfg.fichasOcultas:[]);if(b.oculta)l.add(fid);else l.delete(fid);cfg.fichasOcultas=[...l].slice(0,200)}
    await db.run(Q.cfgMesaSet,mesa.id,JSON.stringify(cfg),Date.now());return enviar(res,200,{ok:true,modo:modoGrupo(cfg.grupo),fichasOcultas:cfg.fichasOcultas||[]})}
  /* Mestre muda PV, PE (ou PD) ou SAN de um agente: grava na ficha do jogador e avisa o app dele. */
  if(sub==='/fichavital'&&m==='POST'){if(!mestre)return erro(res,403,'Só o mestre altera os pontos de um agente.');const b=await lerJSON(req)||{};
    const fid=txtCurto(b.ficha,64);const k=['pv','pe','san'].includes(b.k)?b.k:null;const v=Math.round(+b.valor);if(!fid||!k||!Number.isFinite(v))return erro(res,400,'Pedido inválido.');
    for(const r of await db.all(Q.fichasDaMesaDono,mesa.id,mesa.id)){let doc;try{doc=JSON.parse(r.dados)}catch(e){continue}const f=doc&&doc.ficha;if(!f||String(f.id)!==fid)continue;
      const pub=f.publico=f.publico||{};const max=Math.round(+pub[k+'Max'])||null;const val=Math.max(k==='pv'?(max?-max:-999):0,Math.min(max||9999,v));
      f[k]=val;pub[k]=val;f.atualizado=Date.now();
      /* Estado do retrato já atualizado (o app do jogador refina ao abrir: condições manuais etc.). */
      if(!(f.retrato&&f.retrato.morto)){const pv=+pub.pv,pvM=+pub.pvMax,sa=+pub.san,saM=+pub.sanMax;
        pub.estado=pvM&&pv<=0?'caido':!pub.det&&saM&&sa<=0?'louco':pvM&&pv<=pvM/2?'machucado':!pub.det&&saM&&sa<saM/2?'perturbado':'normal'}await db.run(Q.gravarDoc,r.usuario_id,r.doc_id,JSON.stringify(doc),Date.now());
      const rot={pv:'PV',pe:pub.det?'PD':'PE',san:'Sanidade'}[k];
      await db.run(Q.pingAdd,mesa.id,u.id,r.usuario_id,Date.now(),JSON.stringify({texto:`O mestre mudou ${rot} de ${txtCurto(f.nome,80)||'seu agente'} para ${val}${max?'/'+max:''}.`,ordem:{tipo:'vital',ficha:fid,k,valor:val}}));
      return enviar(res,200,{ok:true,k,valor:val,max})}
    return erro(res,404,'Ficha não encontrada nesta campanha.')}
  /* Histórico de pings da campanha: o mestre vê todos; o jogador, os que mandou e os que recebeu. O mestre pode apagar qualquer um. */
  if(sub==='/pings'&&m==='GET'){const lista=await db.all(Q.pingHist,mesa.id);
    const out=[];for(const x of lista){const meu=x.de_id===u.id;const paraMim=x.para===u.id||(x.para==='todos'&&!mestre)||(x.para==='mestre'&&mestre);
      if(!mestre&&!meu&&!paraMim)continue;let d={};try{d=JSON.parse(x.dados)}catch(e){}
      out.push({id:x.id,criado:x.criado,de:x.de,deMestre:x.de_id===mesa.mestre_id,meu,para:x.para==='todos'?'todos':x.para==='mestre'?'mestre':(x.paraNome||'jogador'),texto:d.texto||'',urgente:!!d.urgente,agente:d.agente,ordem:d.ordem?d.ordem.tipo:undefined})}
    return enviar(res,200,{pings:out,podeApagar:mestre})}
  if(sub==='/pingdel'&&m==='POST'){if(!mestre)return erro(res,403,'Só o mestre apaga pings do histórico.');const b=await lerJSON(req)||{};
    const ids=(Array.isArray(b.ids)?b.ids:[b.id]).map(x=>Math.round(+x)).filter(x=>x>0).slice(0,500);for(const id of ids)await db.run(Q.pingDel,mesa.id,id);return enviar(res,200,{ok:true,apagados:ids.length})}
  /* Zerar quedas e enlouquecimentos da sessão (de todos ou de uma ficha): grava nas fichas e avisa o app de cada jogador. */
  if(sub==='/zerarsessao'&&m==='POST'){if(!mestre)return erro(res,403,'Só o mestre zera os contadores dos jogadores.');const b=await lerJSON(req)||{};const so=b.ficha?txtCurto(b.ficha,64):null;let n=0;
    for(const r of await db.all(Q.fichasDaMesaDono,mesa.id,mesa.id)){let doc;try{doc=JSON.parse(r.dados)}catch(e){continue}const f=doc&&doc.ficha;if(!f||(so&&String(f.id)!==so))continue;
      f.retrato=f.retrato||{};f.retrato.sessao={quedas:0,loucuras:0,desde:Date.now()};await db.run(Q.gravarDoc,r.usuario_id,r.doc_id,JSON.stringify(doc),Date.now());n++;
      await db.run(Q.pingAdd,mesa.id,u.id,r.usuario_id,Date.now(),JSON.stringify({texto:`O mestre começou uma nova sessão: quedas e enlouquecimentos de ${txtCurto(f.nome,80)||'seu agente'} foram zerados.`,ordem:{tipo:'zerarSessao',ficha:String(f.id)}}))}
    return enviar(res,200,{ok:true,fichas:n})}
  /* Mestre remove um item do inventário de um agente da campanha: grava na ficha do jogador e avisa o app dele (pelo canal do ping). */
  if(sub==='/fichaitem'&&m==='POST'){if(!mestre)return erro(res,403,'Só o mestre pode mexer na ficha de outro jogador.');const b=await lerJSON(req)||{};
    const alvo=await db.get(Q.membroPorNome,mesa.id,txtCurto(b.usuario,40));if(!alvo)return erro(res,404,'Jogador não está nesta campanha.');
    const fid=txtCurto(b.ficha,64);const uid=txtCurto(b.uid,64);if(!/^[\w-]{1,64}$/.test(fid)||!uid)return erro(res,400,'Pedido inválido.');
    const row=await db.get(Q.docUm,alvo.id,'f-'+fid);let doc=null;try{doc=row&&JSON.parse(row.dados)}catch(e){}
    const f=doc&&doc.ficha;if(!f||f.mesa!==mesa.id)return erro(res,404,'Ficha não encontrada nesta campanha.');
    const inv=Array.isArray(f.inventario)?f.inventario:[];const it=inv.find(x=>x&&x.uid===uid);if(!it)return erro(res,404,'O item já não está na ficha.');
    f.inventario=inv.filter(x=>x!==it);f.atualizado=Date.now();await db.run(Q.gravarDoc,alvo.id,'f-'+fid,JSON.stringify(doc),Date.now());
    const nomeIt=txtCurto(it.nome,80)||'item';
    await db.run(Q.pingAdd,mesa.id,u.id,alvo.id,Date.now(),JSON.stringify({texto:`O mestre removeu “${nomeIt}” da ficha de ${txtCurto(f.nome,80)||'seu agente'}.`,ordem:{tipo:'rmItem',ficha:fid,uid}}));
    return enviar(res,200,{ok:true,nome:nomeIt})}
  if(sub==='/membros'&&m==='GET')return enviar(res,200,(await db.all(Q.membrosIds,mesa.id)).map(x=>({id:mestre||x.papel==='mestre'?x.id:undefined,usuario:x.usuario,papel:x.papel})));
  if(sub==='/ping'&&m==='POST'){if(pingDemais(u.id))return erro(res,429,'Calma: muitos pings seguidos. Espere alguns segundos.');
    const b=await lerJSON(req)||{};const texto=txtCurto(b.texto,300);if(!texto)return erro(res,400,'Escreva a mensagem do ping.');
    let para='mestre';
    if(mestre){para=b.para==='todos'||!b.para?'todos':String(b.para);if(para!=='todos'){const alvo=(await db.all(Q.membrosIds,mesa.id)).find(x=>x.id===para&&x.papel!=='mestre');if(!alvo)return erro(res,404,'Jogador não está nesta campanha.')}}
    const dados={texto,agente:txtCurto(b.agente,80)||undefined,urgente:!!b.urgente||undefined};
    await db.run(Q.pingAdd,mesa.id,u.id,para,Date.now(),JSON.stringify(dados));return enviar(res,200,{ok:true,para})}
  /* Regras da campanha: o mestre publica livros, regras opcionais e automações; os jogadores copiam. */
  if(sub==='/regras'&&m==='GET'){const r=await db.get(Q.cfgMesa,mesa.id);let cfg=null;try{cfg=r?JSON.parse(r.dados):null}catch(e){}return enviar(res,200,{cfg,atualizado:r?r.atualizado:0})}
  if(sub==='/regras'&&m==='PUT'){if(!mestre)return erro(res,403,'Só o mestre define as regras da campanha.');const b=await lerJSON(req)||{};
    const bools=o=>{const out={};if(o&&typeof o==='object')for(const [k,v] of Object.entries(o).slice(0,500))if(/^[\w-]{1,64}$/.test(k))out[k]=!!v;return out};
    const ant=await lerCfgMesa(mesa.id);
    const cfg={...ant,fontes:bools(b.fontes),regras:bools(b.regras),auto:bools(b.auto),acoesInterludio:Math.max(1,Math.min(10,Math.round(+b.acoesInterludio)||2))};
    await db.run(Q.cfgMesaSet,mesa.id,JSON.stringify(cfg),Date.now());return enviar(res,200,{ok:true})}
  return erro(res,404,'Não encontrado');
}

/* ---------------- iniciativa da campanha ----------------
   O mestre pede iniciativa; cada jogador rola no app ou digita o que tirou nos dados físicos.
   Cada entrada é uma linha (agente, criatura ou NPC), para que respostas simultâneas não se atropelem.
   Jogadores veem a ordem; só o mestre vê os dados das criaturas (PV etc.). */
const txtCurto=(v,n)=>String(v??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n);
const intOuNulo=v=>{if(v===null||v===undefined||v==='')return null;const n=Math.round(+v);return Number.isFinite(n)&&n>=-100&&n<=1000?n:undefined};
/* Tipos de dano e cálculo de resistência, imunidade e vulnerabilidade (dobra o dano).
   defs = {res:{tipo:n}, resTudo, imu:[tipos], imuTudo, imuExceto:[tipos], vul:[tipos]} vem da ficha da criatura.
   Dano de vários tipos: só resiste/é imune se valer para todos; vulnerável se for a qualquer um. */
const TIPOS_DANO=['balistico','corte','impacto','perfuracao','eletricidade','fogo','frio','quimico','mental','sangue','morte','conhecimento','energia','medo'];
function aplicarDefesas(valor,tipos,defs,ignorar){
  if(!defs||ignorar)return {valor,nota:ignorar?'resistências ignoradas':''};
  const ts=tipos.length?tipos:[null];
  const imune=t=>(defs.imuTudo&&!(t&&(defs.imuExceto||[]).includes(t)))||(t&&(defs.imu||[]).includes(t));
  if(ts.every(imune))return {valor:0,nota:'imune'};
  const vul=ts.some(t=>t&&(defs.vul||[]).includes(t));
  const res=Math.min(...ts.map(t=>Math.max(+defs.resTudo||0,t&&defs.res&&+defs.res[t]||0)));
  let v=Math.max(0,valor-res);const nota=[];if(res)nota.push('resistência '+res);
  if(vul){v*=2;nota.push('vulnerável (×2)')}
  return {valor:v,nota:nota.join(', ')};
}
/* Jogadores não veem os PV das criaturas, só se caíram. */
/* "4d20+10": rola 4d20 e fica com o maior; "–2d20+3" (ou "-2d20"): rola 2 e fica com o pior. */
function rolarD20(expr){const m=String(expr||'').replace(/–/g,'-').match(/^\s*(-?)(\d*)d20\s*([+-]\s*\d+)?/);if(!m)return null;
  const k=Math.max(1,Math.min(10,+(m[2]||1)));const rs=Array.from({length:k},()=>1+crypto.randomInt(20));const pick=m[1]?Math.min(...rs):Math.max(...rs);
  const bonus=m[3]?+m[3].replace(/\s/g,''):0;return {total:pick+bonus,txt:`${k}d20${m[1]?' (pior)':''} [${rs.join(', ')}] ${bonus>=0?'+':'−'} ${Math.abs(bonus)}`}}
const semPV=(r,mestre)=>{if(mestre||r.alvoTipo==='agente')return r;const {pvAntes,pvDepois,pvMax,...resto}=r;return resto};
/* Grava um acontecimento do combate carimbando se o alvo ou o autor estavam ocultos naquele momento:
   assim o registro continua escondido dos jogadores mesmo depois que o combate acaba. */
async function gravarLog(mesaId,uid,quando,reg){
  const oc=async ch=>{if(!ch)return false;const e=await db.get(Q.iniDados,mesaId,ch);try{return !!(e&&e.dados&&JSON.parse(e.dados).oculto)}catch(x){return false}};
  const r={...reg};if(await oc(r.alvoChave||(r.t==='turno'?r.chave:null)))r.alvoOculto=true;if(await oc(r.autorChave))r.autorOculto=true;
  await db.run(Q.logAdd,mesaId,uid,quando,JSON.stringify(r))}
async function rotaIniciativa(req,res,u,m,mesa,mestre){
  const agora=Date.now();
  if(m==='GET'){
    const est=await db.get(Q.iniEstado,mesa.id)||{pedido:0,turno:null,rodada:0,atualizado:0};
    const entradas=(await db.all(Q.iniLista,mesa.id)).map(r=>{let dados=null;try{dados=r.dados?JSON.parse(r.dados):null}catch(e){}
      const meu=r.usuario_id===u.id;
      const caido=r.tipo!=='agente'&&dados&&+dados.pvMax?(dados.pv??+dados.pvMax)<=0:undefined; /* jogadores sabem se caiu, não os PV */
      return {chave:r.chave,tipo:r.tipo,nome:r.nome,valor:r.valor,fonte:r.fonte,usuario:r.usuario||null,meu,caido,dados:mestre||meu?dados:null}});
    /* Participantes escondidos pelo mestre não existem para os jogadores: nem na ordem, nem a vez, nem o dano que sofrem. */
    const ocultos=new Set();let lista=entradas;
    if(!mestre){const todos=await db.all(Q.iniLista,mesa.id);for(const r of todos){try{if(r.dados&&JSON.parse(r.dados).oculto)ocultos.add(r.chave)}catch(e){}}lista=entradas.filter(e=>!ocultos.has(e.chave))}
    else entradas.forEach(e=>{if(e.dados&&e.dados.oculto)e.oculto=true});
    const out={pedido:est.pedido,turno:ocultos.has(est.turno)?null:est.turno,rodada:est.rodada,entradas:lista,nLog:Number((await db.get(Q.logContar,mesa.id)).n)};
    if(/[?&]log=1/.test(req.url||'')){const dep=Math.max(0,+((req.url||'').match(/[?&]depois=(\d+)/)||[])[1]||0);
      out.log=(await db.all(Q.logLista,mesa.id,dep)).map(r=>{try{return semPV({id:r.id,criado:r.criado,...JSON.parse(r.dados)},mestre)}catch(e){return null}}).filter(Boolean)
        .filter(x=>mestre||(!x.alvoOculto&&!ocultos.has(x.alvoChave)&&!(x.t==='turno'&&ocultos.has(x.chave))))
        .map(x=>{if(mestre)return x;const {alvoOculto,autorOculto,...y}=x;return autorOculto||ocultos.has(x.autorChave)?{...y,autor:'???',autorChave:null}:y})}
    return enviar(res,200,out)}
  if(m!=='POST')return erro(res,405,'Método não permitido');
  const b=await lerJSON(req)||{};const acao=String(b.acao||'');
  const so=()=>erro(res,403,'Só o mestre pode fazer isso.');
  const estado=async(campos)=>{const e=await db.get(Q.iniEstado,mesa.id)||{pedido:0,turno:null,rodada:0};const n={...e,...campos};
    await db.run(Q.iniSetEstado,mesa.id,n.pedido||0,n.turno??null,n.rodada||0,agora)};
  if(acao==='valor'){
    const valor=intOuNulo(b.valor);if(valor===undefined)return erro(res,400,'Valor de iniciativa inválido.');
    const fonte=b.fonte==='fisico'?'fisico':'app';
    if(b.chave&&mestre){const ex=await db.get(Q.iniUma,mesa.id,String(b.chave));if(!ex)return erro(res,404,'Entrada não encontrada.');
      await db.run(Q.iniValor,valor,fonte,agora,mesa.id,ex.chave);return enviar(res,200,{ok:true})}
    const ficha=txtCurto(b.ficha,64);if(!/^[\w-]{1,64}$/.test(ficha))return erro(res,400,'Ficha inválida.');
    let dono=u.id; /* o mestre pode registrar o valor que um jogador tirou nos dados físicos */
    if(mestre&&b.usuario){const mb=await db.get(Q.membroPorNome,mesa.id,txtCurto(b.usuario,40));if(!mb)return erro(res,404,'Jogador não está na campanha.');dono=mb.id}
    const nome=txtCurto(b.nome,80)||'Agente';const chave='a:'+dono+':'+ficha;
    if(!(await db.get(Q.iniUma,mesa.id,chave))&&(await db.get(Q.iniContar,mesa.id)).n>=60)return erro(res,400,'Iniciativa cheia (60 entradas).');
    await db.run(Q.iniUpsert,mesa.id,chave,dono,'agente',nome,valor,fonte,null,agora);return enviar(res,200,{ok:true,chave})}
  if(acao==='dano'||acao==='cura'){ /* qualquer membro: dano/cura num participante, com resistências da criatura */
    const ent=await db.get(Q.iniDados,mesa.id,txtCurto(b.alvo,120));if(!ent)return erro(res,404,'Alvo não está no combate.');
    if(!mestre&&ent.tipo==='agente'&&acao==='dano')return erro(res,403,'Jogadores só causam dano em criaturas e NPCs pelo app.');
    const bruto=intOuNulo(b.valor);if(bruto==null||bruto<0)return erro(res,400,'Valor inválido.');
    const tipos=(Array.isArray(b.tipos)?b.tipos:[]).map(t=>txtCurto(t,20)).filter(t=>TIPOS_DANO.includes(t)).slice(0,4);
    let dd=null;try{dd=ent.dados?JSON.parse(ent.dados):null}catch(e){}
    const calc=acao==='dano'?aplicarDefesas(bruto,tipos,dd&&dd.defs,!!(mestre&&b.ignorar)):{valor:bruto,nota:''};
    /* autor: o mestre escolhe; o jogador é sempre o próprio agente */
    let autor=txtCurto(b.autor,80)||null,autorChave=txtCurto(b.autorChave,120)||null;
    if(!mestre){const ficha=txtCurto(b.ficha,64);autorChave='a:'+u.id+':'+ficha;autor=autor||'Agente'}
    let pvAntes=null,pvDepois=null;
    if(dd&&+dd.pvMax){pvAntes=dd.pv??+dd.pvMax;pvDepois=acao==='dano'?pvAntes-calc.valor:Math.min(+dd.pvMax,pvAntes+calc.valor);dd.pv=pvDepois;
      await db.run(Q.iniSetDados,JSON.stringify(dd),agora,mesa.id,ent.chave)}
    const est=await db.get(Q.iniEstado,mesa.id)||{rodada:0};
    const reg={t:acao,alvo:ent.nome,alvoChave:ent.chave,alvoTipo:ent.tipo,autor,autorChave,bruto,valor:calc.valor,tipos,nota:calc.nota,origem:txtCurto(b.origem,80)||null,rodada:est.rodada||0,pvAntes,pvDepois,pvMax:dd&&+dd.pvMax||null,caiu:pvAntes!=null&&pvAntes>0&&pvDepois<=0};
    if((await db.get(Q.logContar,mesa.id)).n>=2000)return erro(res,400,'Registro do combate cheio.');
    await gravarLog(mesa.id,u.id,agora,reg);return enviar(res,200,{ok:true,...semPV(reg,mestre)})}
  if(acao==='ataque'){ /* teste de ataque contra a Defesa do alvo; o jogador só fica sabendo se acertou */
    const ent=await db.get(Q.iniDados,mesa.id,txtCurto(b.alvo,120));if(!ent)return erro(res,404,'Alvo não está no combate.');
    if(!mestre&&ent.tipo==='agente')return erro(res,403,'Jogadores só atacam criaturas e NPCs pelo app.');
    const valor=intOuNulo(b.valor);if(valor==null)return erro(res,400,'Valor inválido.');
    let dd=null;try{dd=ent.dados?JSON.parse(ent.dados):null}catch(e){}
    const def=dd&&dd.def!=null&&dd.def!==''?+dd.def:null;
    const acertou=def!=null?valor>=def:(mestre&&typeof b.acertou==='boolean'?b.acertou:null);
    let autor=txtCurto(b.autor,80)||null,autorChave=txtCurto(b.autorChave,120)||null;
    if(!mestre){autorChave='a:'+u.id+':'+txtCurto(b.ficha,64);autor=autor||'Agente'}
    const est=await db.get(Q.iniEstado,mesa.id)||{rodada:0};
    const reg={t:'ataque',alvo:ent.nome,alvoChave:ent.chave,alvoTipo:ent.tipo,autor,autorChave,valor,acertou,critico:!!b.critico,origem:txtCurto(b.origem,80)||null,rodada:est.rodada||0};
    if((await db.get(Q.logContar,mesa.id)).n>=2000)return erro(res,400,'Registro do combate cheio.');
    await gravarLog(mesa.id,u.id,agora,reg);return enviar(res,200,{ok:true,...reg})}
  if(acao==='ritual'){ /* ritual num alvo da iniciativa: teste de resistência da criatura, dano/cura e efeito */
    const ent=await db.get(Q.iniDados,mesa.id,txtCurto(b.alvo,120));if(!ent)return erro(res,404,'Alvo não está no combate.');
    let dd=null;try{dd=ent.dados?JSON.parse(ent.dados):null}catch(e){}
    const dt=intOuNulo(b.dt);const resist=txtCurto(b.resistencia,60);const nomeRit=txtCurto(b.ritual,80)||'Ritual';
    const tipoT=/fortitude/i.test(resist)?'fortitude':/reflexos/i.test(resist)?'reflexos':/vontade/i.test(resist)?'vontade':null;
    let teste=null;const expr=tipoT&&dd&&dd.saves&&dd.saves[tipoT];
    if(tipoT&&dt!=null&&expr){const t=rolarD20(expr);if(t)teste={tipo:tipoT,total:t.total,txt:t.txt,passou:t.total>=dt}}
    const anula=/anula|desacredita/i.test(resist);const passou=!!(teste&&teste.passou);
    const notaT=teste?`${tipoT[0].toUpperCase()+tipoT.slice(1)} ${teste.total} vs DT ${dt}: ${passou?(anula?'passou (anulou)':'passou (metade)'):'falhou'}`:tipoT?`teste de ${tipoT} não rolado (o mestre decide)`:'';
    let autor=txtCurto(b.autor,80)||null,autorChave=txtCurto(b.autorChave,120)||null;
    if(!mestre){autorChave='a:'+u.id+':'+txtCurto(b.ficha,64);autor=autor||'Agente'}
    const est=await db.get(Q.iniEstado,mesa.id)||{rodada:0};const regs=[];
    let bruto=intOuNulo(b.dano);if(bruto!=null&&!mestre&&ent.tipo==='agente')bruto=null; /* jogadores não ferem aliados pelo app */
    let pvAntes=null,pvDepois=null,valor=null,notaD='';
    if(bruto!=null&&bruto>0){let v=passou?(anula?0:Math.floor(bruto/2)):bruto;
      const tipos=(Array.isArray(b.tipos)?b.tipos:[]).map(t=>txtCurto(t,20)).filter(t=>TIPOS_DANO.includes(t)).slice(0,4);
      const c=aplicarDefesas(v,tipos,dd&&dd.defs,mestre&&!!b.ignorar);valor=c.valor;notaD=c.nota;
      if(dd&&+dd.pvMax){pvAntes=dd.pv??+dd.pvMax;pvDepois=pvAntes-valor;dd.pv=pvDepois}
      regs.push({t:'dano',alvo:ent.nome,alvoChave:ent.chave,alvoTipo:ent.tipo,autor,autorChave,bruto,valor,tipos,nota:[notaT,notaD].filter(Boolean).join(', '),origem:nomeRit,rodada:est.rodada||0,pvAntes,pvDepois,pvMax:dd&&+dd.pvMax||null,caiu:pvAntes!=null&&pvAntes>0&&pvDepois<=0})}
    const cura=intOuNulo(b.cura);
    if(cura!=null&&cura>0){if(dd&&+dd.pvMax){pvAntes=dd.pv??+dd.pvMax;pvDepois=Math.min(+dd.pvMax,pvAntes+cura);dd.pv=pvDepois}
      regs.push({t:'cura',alvo:ent.nome,alvoChave:ent.chave,alvoTipo:ent.tipo,autor,autorChave,bruto:cura,valor:cura,tipos:[],nota:'',origem:nomeRit,rodada:est.rodada||0,pvAntes,pvDepois,pvMax:dd&&+dd.pvMax||null})}
    /* efeito com duração fica marcado no alvo (criatura/NPC) se não foi anulado */
    const efeito=!!b.efeito&&!(passou&&anula)&&ent.tipo!=='agente';
    if(efeito){dd=dd||{};dd.conds=Array.isArray(dd.conds)?dd.conds:[];if(!dd.conds.includes(nomeRit)&&dd.conds.length<12)dd.conds.push(nomeRit)}
    if(bruto!=null||cura!=null||efeito)await db.run(Q.iniSetDados,JSON.stringify(dd),agora,mesa.id,ent.chave);
    const notaE=notaT.replace('passou (metade)','passou (efeito parcial)');
    if(!regs.length)regs.push({t:'efeito',alvo:ent.nome,alvoChave:ent.chave,alvoTipo:ent.tipo,autor,autorChave,origem:nomeRit,nota:notaE,rodada:est.rodada||0,efeito});
    if((await db.get(Q.logContar,mesa.id)).n>=1990)return erro(res,400,'Registro do combate cheio.');
    for(const r of regs)await gravarLog(mesa.id,u.id,agora,r);
    return enviar(res,200,{ok:true,alvo:ent.nome,teste,passou,anula,valor,bruto,cura,nota:[bruto!=null?notaT:notaE,notaD].filter(Boolean).join(', '),efeito,caiu:regs.some(r=>r.caiu)})}
  if(acao==='registro'){ /* jogador relata dano/cura que aplicou na própria ficha; mestre registra turnos e efeitos */
    const t=['recebido','curado','turno','nota'].includes(b.t)?b.t:null;if(!t)return erro(res,400,'Registro inválido.');
    if(t==='turno'&&!mestre)return so();
    const est=await db.get(Q.iniEstado,mesa.id)||{rodada:0};if(!est.pedido)return enviar(res,200,{ok:false});
    const reg={t,rodada:est.rodada||0,alvo:txtCurto(b.alvo,80)||null,alvoChave:txtCurto(b.alvoChave,120)||null,autor:txtCurto(b.autor,80)||null,valor:intOuNulo(b.valor)||0,
      efeitos:(Array.isArray(b.efeitos)?b.efeitos:[]).slice(0,20).map(x=>txtCurto(x,60)).filter(Boolean),texto:txtCurto(b.texto,200)||null,tipos:(Array.isArray(b.tipos)?b.tipos:[]).map(x=>txtCurto(x,20)).filter(x=>TIPOS_DANO.includes(x)).slice(0,4)};
    if(!mestre)reg.alvoChave='a:'+u.id+':'+txtCurto(b.ficha,64);
    if((await db.get(Q.logContar,mesa.id)).n>=2000)return erro(res,400,'Registro do combate cheio.');
    await gravarLog(mesa.id,u.id,agora,reg);return enviar(res,200,{ok:true})}
  if(!mestre)return so();
  if(acao==='pedir'){await db.run(Q.logApagar,mesa.id);await db.run(Q.iniDelAgentes,mesa.id);await db.run(Q.iniZerar,agora,mesa.id);await estado({pedido:agora,turno:null,rodada:1});return enviar(res,200,{ok:true,pedido:agora})}
  if(acao==='entrada'){ /* criatura ou NPC do mestre */
    const tipo=b.tipo==='npc'?'npc':'criatura';const valor=intOuNulo(b.valor);if(valor===undefined)return erro(res,400,'Valor inválido.');
    const nome=txtCurto(b.nome,80);if(!nome)return erro(res,400,'Dê um nome.');
    const dados=b.dados&&typeof b.dados==='object'?JSON.stringify(b.dados):null;if(dados&&dados.length>6000)return erro(res,413,'Dados grandes demais.');
    let chave=String(b.chave||'');if(chave){if(!/^[cm]:[\w-]{1,64}$/.test(chave))return erro(res,400,'Chave inválida.')}
    else{if((await db.get(Q.iniContar,mesa.id)).n>=60)return erro(res,400,'Iniciativa cheia (60 entradas).');chave=(tipo==='npc'?'m:':'c:')+crypto.randomUUID()}
    let dadosF=dados;if(b.dados===undefined&&b.chave){const ex=await db.get(Q.iniDados,mesa.id,chave);dadosF=ex?ex.dados:null} /* sem "dados": mantém PV e efeitos atuais */
    await db.run(Q.iniUpsert,mesa.id,chave,null,tipo,nome,valor,valor==null?null:'mestre',dadosF,agora);return enviar(res,200,{ok:true,chave})}
  if(acao==='mesclar'){ /* mestre completa dados de uma criatura (testes de resistência, defesas) */
    const ent=await db.get(Q.iniDados,mesa.id,txtCurto(b.chave,120));if(!ent)return erro(res,404,'Entrada não encontrada.');
    let dd={};try{dd=ent.dados?JSON.parse(ent.dados):{}}catch(e){}
    for(const k of ['saves','defs'])if(b[k]&&typeof b[k]==='object')dd[k]=b[k];
    const txt=JSON.stringify(dd);if(txt.length>6000)return erro(res,413,'Dados grandes demais.');
    await db.run(Q.iniSetDados,txt,agora,mesa.id,ent.chave);return enviar(res,200,{ok:true})}
  if(acao==='ocultar'){if(!mestre)return erro(res,403,'Só o mestre esconde participantes.');const ent=await db.get(Q.iniDados,mesa.id,txtCurto(b.chave,120));if(!ent)return erro(res,404,'Entrada não encontrada.');
    if(ent.tipo==='agente')return erro(res,400,'Agentes dos jogadores não podem ser escondidos.');
    let dd={};try{dd=ent.dados?JSON.parse(ent.dados):{}}catch(e){}dd.oculto=!!b.oculto;await db.run(Q.iniSetDados,JSON.stringify(dd),agora,mesa.id,ent.chave);return enviar(res,200,{ok:true,oculto:dd.oculto})}
  if(acao==='efeitos'){const ent=await db.get(Q.iniDados,mesa.id,txtCurto(b.chave,120));if(!ent)return erro(res,404,'Entrada não encontrada.');
    let dd={};try{dd=ent.dados?JSON.parse(ent.dados):{}}catch(e){}dd.conds=(Array.isArray(b.conds)?b.conds:[]).slice(0,12).map(x=>txtCurto(x,40)).filter(Boolean);
    await db.run(Q.iniSetDados,JSON.stringify(dd),agora,mesa.id,ent.chave);return enviar(res,200,{ok:true})}
  if(acao==='remover'){await db.run(Q.iniDel,mesa.id,String(b.chave||''));return enviar(res,200,{ok:true})}
  if(acao==='turno'){const rodada=Math.max(0,Math.min(9999,Math.round(+b.rodada)||0));await estado({turno:b.turno?txtCurto(b.turno,120):null,rodada});return enviar(res,200,{ok:true})}
  if(acao==='encerrar'){await db.run(Q.iniDelTudo,mesa.id);await estado({pedido:0,turno:null,rodada:0});return enviar(res,200,{ok:true})}
  return erro(res,400,'Ação desconhecida.');
}

async function iniciar(){
  db=await abrirBanco(DB_PATH);
  http.createServer((req,res)=>{rotear(req,res).catch(e=>{if(!res.headersSent)erro(res,e.status||500,e.status===413?'Arquivo grande demais.':e.status===400?'Requisição inválida.':'Erro interno.');if(!e.status)console.error(e)})})
    .listen(PORT,()=>console.log(`Cristopher em http://localhost:${PORT} · banco: ${db.tipo}`));
}
iniciar().catch(e=>{console.error('Não foi possível abrir o banco de dados:',e.message);process.exit(1)});
