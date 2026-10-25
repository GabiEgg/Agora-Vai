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
const MIME={'.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8'};
let paginaCache=null;
function pagina(){ // o index.html é um fragmento (formato de artifact); aqui ganha o esqueleto de documento
  if(paginaCache&&process.env.NODE_ENV==='production')return paginaCache;
  const corpo=fs.readFileSync(path.join(RAIZ,'index.html'),'utf8').replace(/^<meta charset="utf-8">\s*/,'');
  return paginaCache=`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}</style></head><body>${corpo}</body></html>`;
}
function servirArquivo(res,url){
  const rel=path.normalize(decodeURIComponent(url)).replace(/^([/\\])+/,'');
  if(!/^(js[/\\][\w.-]+\.js|data[/\\](dados|criaturas)\.json)$/.test(rel))return erro(res,404,'Não encontrado');
  const arq=path.join(RAIZ,rel);
  fs.readFile(arq,(e,buf)=>{if(e)return erro(res,404,'Não encontrado');enviar(res,200,buf,MIME[path.extname(arq)]||'application/octet-stream',{'Cache-Control':'no-cache'})});
}

/* ---------------- rotas ---------------- */
const ID_DOC=/^[A-Za-z0-9_\-:.]{1,120}$/;
async function rotear(req,res){
  const url=new URL(req.url,'http://x');const p=url.pathname;const m=req.method;
  if(m==='GET'&&(p==='/'||p==='/index.html'))return enviar(res,200,pagina(),'text/html; charset=utf-8',{'Cache-Control':'no-cache'});
  if(m==='GET'&&(p.startsWith('/js/')||p.startsWith('/data/')))return servirArquivo(res,p);
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
  if(p.startsWith('/api/mesas'))return rotasMesa(req,res,u,p,m,url);
  return erro(res,404,'Não encontrado');
}

/* ---------------- campanhas (mesas compartilhadas) ----------------
   O mestre cria a campanha e passa o código. Jogadores entram com o código e escolhem,
   ficha por ficha, quais ligar à campanha. Só o mestre lê as fichas ligadas; jogadores
   continuam vendo apenas as próprias. Avisos de rituais vão dos jogadores para o mestre. */
const ALFA='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const novoCodigo=()=>Array.from(crypto.randomBytes(6),b=>ALFA[b%ALFA.length]).join('');
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
  if(sub===''&&m==='DELETE'){if(!mestre)return erro(res,403,'Só o mestre pode excluir a campanha.');await db.run(Q.apagarMembros,mesa.id);await db.run(Q.apagarEventos,mesa.id);await db.run(Q.iniDelTudo,mesa.id);await db.run(Q.iniDelEstado,mesa.id);await db.run(Q.logApagar,mesa.id);await db.run(Q.cfgMesaDel,mesa.id);await db.run(Q.apagarMesa,mesa.id);return enviar(res,200,{ok:true})}
  if(sub==='/sair'&&m==='POST'){if(mestre)return erro(res,400,'O mestre não sai da própria campanha; exclua-a se quiser.');await db.run(Q.tirarMembro,mesa.id,u.id);return enviar(res,200,{ok:true})}
  if(sub==='/fichas'&&m==='GET'){if(!mestre)return erro(res,403,'Só o mestre vê as fichas da campanha.');
    const fichas=[];for(const r of await db.all(Q.fichasDaMesa,mesa.id,mesa.id)){try{fichas.push({usuario:r.usuario,atualizado:r.atualizado,ficha:JSON.parse(r.dados).ficha})}catch(e){}}
    return enviar(res,200,{membros:await db.all(Q.membros,mesa.id),fichas})}
  if(sub==='/eventos'&&m==='POST'){const b=await lerJSON(req);if(!b||typeof b!=='object')return erro(res,400,'Aviso inválido');const txt=JSON.stringify(b);if(txt.length>8000)return erro(res,413,'Aviso grande demais.');
    await db.run(Q.addEvento,mesa.id,u.id,Date.now(),txt);await db.run(Q.podarEventos,mesa.id,mesa.id);return enviar(res,200,{ok:true})}
  if(sub==='/eventos'&&m==='GET'){if(!mestre)return erro(res,403,'Só o mestre vê os avisos.');const depois=+url.searchParams.get('depois')||0;
    return enviar(res,200,(await db.all(Q.eventos,mesa.id,depois)).map(e=>({id:e.id,criado:e.criado,usuario:e.usuario,...JSON.parse(e.dados)})))}
  if(sub==='/iniciativa')return rotaIniciativa(req,res,u,m,mesa,mestre);
  /* Regras da campanha: o mestre publica livros, regras opcionais e automações; os jogadores copiam. */
  if(sub==='/regras'&&m==='GET'){const r=await db.get(Q.cfgMesa,mesa.id);let cfg=null;try{cfg=r?JSON.parse(r.dados):null}catch(e){}return enviar(res,200,{cfg,atualizado:r?r.atualizado:0})}
  if(sub==='/regras'&&m==='PUT'){if(!mestre)return erro(res,403,'Só o mestre define as regras da campanha.');const b=await lerJSON(req)||{};
    const bools=o=>{const out={};if(o&&typeof o==='object')for(const [k,v] of Object.entries(o).slice(0,500))if(/^[\w-]{1,64}$/.test(k))out[k]=!!v;return out};
    const cfg={fontes:bools(b.fontes),regras:bools(b.regras),auto:bools(b.auto),acoesInterludio:Math.max(1,Math.min(10,Math.round(+b.acoesInterludio)||2))};
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
async function rotaIniciativa(req,res,u,m,mesa,mestre){
  const agora=Date.now();
  if(m==='GET'){
    const est=await db.get(Q.iniEstado,mesa.id)||{pedido:0,turno:null,rodada:0,atualizado:0};
    const entradas=(await db.all(Q.iniLista,mesa.id)).map(r=>{let dados=null;try{dados=r.dados?JSON.parse(r.dados):null}catch(e){}
      const meu=r.usuario_id===u.id;
      return {chave:r.chave,tipo:r.tipo,nome:r.nome,valor:r.valor,fonte:r.fonte,usuario:r.usuario||null,meu,dados:mestre||meu?dados:null}});
    const out={pedido:est.pedido,turno:est.turno,rodada:est.rodada,entradas,nLog:Number((await db.get(Q.logContar,mesa.id)).n)};
    if(/[?&]log=1/.test(req.url||'')){const dep=Math.max(0,+((req.url||'').match(/[?&]depois=(\d+)/)||[])[1]||0);
      out.log=(await db.all(Q.logLista,mesa.id,dep)).map(r=>{try{return semPV({id:r.id,criado:r.criado,...JSON.parse(r.dados)},mestre)}catch(e){return null}}).filter(Boolean)}
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
    await db.run(Q.logAdd,mesa.id,u.id,agora,JSON.stringify(reg));return enviar(res,200,{ok:true,...semPV(reg,mestre)})}
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
    await db.run(Q.logAdd,mesa.id,u.id,agora,JSON.stringify(reg));return enviar(res,200,{ok:true,...reg})}
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
      const c=aplicarDefesas(v,tipos,dd&&dd.defs,false);valor=c.valor;notaD=c.nota;
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
    for(const r of regs)await db.run(Q.logAdd,mesa.id,u.id,agora,JSON.stringify(r));
    return enviar(res,200,{ok:true,alvo:ent.nome,teste,passou,anula,valor,bruto,cura,nota:[bruto!=null?notaT:notaE,notaD].filter(Boolean).join(', '),efeito,caiu:regs.some(r=>r.caiu)})}
  if(acao==='registro'){ /* jogador relata dano/cura que aplicou na própria ficha; mestre registra turnos e efeitos */
    const t=['recebido','curado','turno','nota'].includes(b.t)?b.t:null;if(!t)return erro(res,400,'Registro inválido.');
    if(t==='turno'&&!mestre)return so();
    const est=await db.get(Q.iniEstado,mesa.id)||{rodada:0};if(!est.pedido)return enviar(res,200,{ok:false});
    const reg={t,rodada:est.rodada||0,alvo:txtCurto(b.alvo,80)||null,alvoChave:txtCurto(b.alvoChave,120)||null,autor:txtCurto(b.autor,80)||null,valor:intOuNulo(b.valor)||0,
      efeitos:(Array.isArray(b.efeitos)?b.efeitos:[]).slice(0,20).map(x=>txtCurto(x,60)).filter(Boolean),texto:txtCurto(b.texto,200)||null,tipos:(Array.isArray(b.tipos)?b.tipos:[]).map(x=>txtCurto(x,20)).filter(x=>TIPOS_DANO.includes(x)).slice(0,4)};
    if(!mestre)reg.alvoChave='a:'+u.id+':'+txtCurto(b.ficha,64);
    if((await db.get(Q.logContar,mesa.id)).n>=2000)return erro(res,400,'Registro do combate cheio.');
    await db.run(Q.logAdd,mesa.id,u.id,agora,JSON.stringify(reg));return enviar(res,200,{ok:true})}
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
