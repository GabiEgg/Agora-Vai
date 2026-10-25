/* ============================== ESCUDO DO MESTRE ==============================
   Aparece para quem é mestre de alguma campanha. Reúne o combate (iniciativa compartilhada
   e criaturas em cena), os agentes ligados, os avisos de rituais, o bestiário dos livros e
   uma referência rápida. Os jogadores veem um aviso na ficha quando o mestre pede iniciativa. */
const ESC_TABS=[['combate','Combate'],['mapas','Mapas'],['agentes','Agentes'],['avisos','Avisos'],['bestiario','Bestiário'],['ref','Referência']];
const souMestre=()=>(S.mesas||[]).some(m=>m.papel==='mestre');
const mesasMestre=()=>(S.mesas||[]).filter(m=>m.papel==='mestre');

/* ---------- dados ---------- */
let _criP=null;
function carregarCriaturas(){
  if(S.cri)return Promise.resolve(S.cri);
  if(!_criP)_criP=fetch('data/criaturas.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()})
    .then(j=>{S.cri=(j.criaturas||[]).concat(hbCriaturas());render();return S.cri}).catch(e=>{_criP=null;toast('Não foi possível carregar o bestiário.');throw e});
  return _criP;
}
/* Criaturas homebrew (se algum pacote tiver uma lista "criaturas"). */
function hbCriaturas(){return (S.hb&&S.hb.criaturas||[]).map(x=>({...x,_hb:true}))}
const criaturasOn=()=>(S.cri||[]).filter(x=>x._hb||fonteOn(x.fonte||'core'));
const criPorId=id=>(S.cri||[]).find(x=>x.id===id);

async function abrirEscudo(){
  S.view='escudo';S.escTab=S.escTab||'combate';
  const ms=mesasMestre();if(ms.length&&!ms.some(m=>m.id===S.mesaAberta))S.mesaAberta=ms[0].id;
  render();carregarCriaturas().catch(()=>{});
  if(S.mesaAberta){await atualizarMesa(true);await atualizarIni()}
}
async function atualizarIni(){
  const m=mesaAtual();if(!m||m.papel!=='mestre')return;
  try{const {d,L}=await buscarLog(m.id);const k=JSON.stringify(d)+L.ultimo;
    completarCriaturas(d,m.id);
    if(k!==S._iniKey){S._iniKey=k;S.ini=d;if(S.view==='escudo'&&!document.activeElement.closest('.cb-painel,.mapa-lado'))render()}}catch(e){}
}
const iniPost=(corpo,mesaId)=>Api.req('POST',`/api/mesas/${encodeURIComponent(mesaId||S.mesaAberta)}/iniciativa`,corpo);

/* ---------- rolagens de criatura ("3d20+10" = rola 3d20, fica com o maior, soma 10) ---------- */
function rollCri(label,expr){
  const m=String(expr||'').replace(/–/g,'-').match(/^\s*(-?)(\d*)d20\s*([+-]\s*\d+)?/);
  if(!m){toast('Sem teste definido.');return null}
  const k=+(m[2]||1);const dados=m[1]?2-k:k;const bonus=m[3]?+m[3].replace(/\s/g,''):0;
  return rollTest(label,dados,bonus).v;
}
const savesCri=c=>({fortitude:c.fortitude||null,reflexos:c.reflexos||null,vontade:c.vontade||null});
/* Criaturas que entraram no combate antes desta versão ganham testes de resistência e defesas. */
function completarCriaturas(d,mesaId){if(!S.cri)return;S._mesclados=S._mesclados||new Set();
  (d.entradas||[]).forEach(e=>{const dd=e.dados||{};if(e.tipo!=='criatura'||!dd.ref||(dd.saves&&dd.defs)||S._mesclados.has(e.chave))return;const c=criPorId(dd.ref);if(!c)return;
    S._mesclados.add(e.chave);iniPost({acao:'mesclar',chave:e.chave,saves:savesCri(c),defs:defesasCri(c)},mesaId).catch(()=>S._mesclados.delete(e.chave))})}
function iniDe(c){return /d20/.test(c.iniciativa||'')?c.iniciativa:null}

/* ---------- tela ---------- */
function renderEscudo(){
  const ms=mesasMestre();
  if(!ms.length)return `<div class="sheet"><div class="pane"><div class="empty">O Escudo do Mestre aparece para quem cria uma campanha. Crie uma na aba Campanha.</div></div></div>`;
  const m=mesaAtual()||ms[0];
  const sel=ms.length>1?`<select class="inp sm" data-act-change="escMesa" aria-label="Campanha">${ms.map(x=>opt(x.id,x.nome,m.id)).join('')}</select>`:`<b>${h(m.nome)}</b>`;
  const tabs=`<div class="tabs" role="tablist">${ESC_TABS.map(([k,l])=>`<button class="tab" role="tab" aria-selected="${S.escTab===k}" data-act="escTab" data-v="${k}">${l}${k==='avisos'&&(S.mesaEventos||[]).length?` <span class="badge acc">${S.mesaEventos.length}</span>`:''}</button>`).join('')}</div>`;
  const pane={combate:escCombate,mapas:escMapas,agentes:escAgentes,avisos:escAvisos,bestiario:escBestiario,ref:escRef}[S.escTab]||escCombate;
  return `<div class="sheet"><div class="sheet-head"><div class="name"><span class="eyebrow">Só você vê esta tela</span><h2 class="bigh">Escudo do Mestre</h2></div>
    <div class="row"><span class="hint">Campanha</span> ${sel} <span class="hint">código <b class="codigo">${h(m.codigo||'')}</b></span><button class="btn sm" data-act="escAtualizar">Atualizar</button></div></div>
   ${tabs}<div class="pane">${pane(m)}</div></div>`;
}

/* ---------- combate ---------- */
const ordenarIni=es=>es.slice().sort((a,b)=>(b.valor??-999)-(a.valor??-999)||String(a.nome).localeCompare(String(b.nome)));
function escCombate(m){
  const d=S.ini||{pedido:0,entradas:[],rodada:0,turno:null};const es=ordenarIni(d.entradas||[]);
  const fichas=(S.mesaDados&&S.mesaDados.fichas)||[];
  const temEntrada=x=>es.some(e=>e.tipo==='agente'&&e.chave.endsWith(':'+x.ficha.id)&&e.usuario===x.usuario);
  const pend=d.pedido?fichas.filter(x=>!temEntrada(x)):[];
  const linha=(e,i)=>{const atual=d.turno===e.chave;const dd=e.dados||{};const cri=dd.ref?criPorId(dd.ref):null;
    const pv=+dd.pvMax?`<div class="mini-vit" style="--c:var(--pv);min-width:120px"><span>PV ${dd.pv??dd.pvMax}/${dd.pvMax}</span><div class="bar"><i style="width:${Math.max(0,Math.min(100,(dd.pv??dd.pvMax)/dd.pvMax*100))}%"></i></div></div>`:'';
    const ag=e.tipo==='agente'?agenteDe(e):null;const ra=ag&&ag.r;
    const pvAg=ra?`<div class="mini-vit" style="--c:var(--pv);min-width:120px"><span>PV ${ra.pv}/${ra.pvMax}</span><div class="bar"><i style="width:${Math.max(0,Math.min(100,ra.pv/ra.pvMax*100))}%"></i></div></div>`:'';
    const efs=efeitosDe(e);const atks=cri?(cri.acoes||[]).filter(a=>a.ataque):[];
    const extra=`<div class="ini-extra">${efs.map((n,k)=>`<span class="cond">${h(n)}${e.tipo!=='agente'?` <button class="linkbtn" data-act="efDel" data-ch="${h(e.chave)}" data-k="${k}" aria-label="Tirar ${h(n)}">✕</button>`:''}</span>`).join('')}
      ${e.tipo!=='agente'?`<select class="inp sm" data-act-change="efAdd" data-ch="${h(e.chave)}" aria-label="Adicionar efeito em ${h(e.nome)}"><option value="">+ efeito</option>${(D.condicoes||[]).filter(c=>fonteOn(c.fonte||'core')).map(c=>`<option>${h(c.nome)}</option>`).join('')}<option value="_">Outro…</option></select>`:''}
      ${atks.map(a=>`<button class="rollchip" data-act="criRoll" data-id="${h(cri.id)}" data-ch="${h(e.chave)}" data-l="${h(a.nome)}" data-x="${h(a.teste)}">${h(a.nome)} ${h(a.teste)}</button><button class="rollchip" data-act="criDano" data-id="${h(cri.id)}" data-ch="${h(e.chave)}" data-l="${h(a.nome)}" data-x="${h(a.dano)}">Dano ${h(a.dano)}</button>`).join('')}</div>`;
    return `<div class="ini-row ${atual?'atual':''}" ${atual?'aria-current="true"':''}>
      <span class="ini-pos">${e.valor==null?'–':i+1}</span>
      <div class="ini-nome"><button class="linkbtn" data-act="cbAlvo" data-ch="${h(e.chave)}" title="Escolher como alvo do dano"><b>${h(e.nome)}</b></button> <span class="badge ${e.tipo==='agente'?'acc':''}">${e.tipo==='agente'?h(e.usuario||'agente'):e.tipo==='npc'?'NPC':'criatura'}</span>${e.fonte?` <span class="hint">${e.fonte==='fisico'?'dados físicos':e.fonte==='app'?'rolado no app':'mestre'}</span>`:''}
       ${cri?` <button class="linkbtn hint" data-act="criVer" data-id="${h(cri.id)}">ficha</button>`:''}${dd.def?` <span class="hint">Defesa ${dd.def}</span>`:''}${ra?` <span class="hint">Defesa ${ra.defesa}</span>`:''}${dd.defs&&defesasTxt(dd.defs)?` <span class="hint">· ${h(defesasTxt(dd.defs))}</span>`:''}</div>
      ${pv}${pvAg}
      <input class="inp num sm" type="number" id="ini-v-${h(e.chave)}" data-keep value="${e.valor??''}" style="width:64px" aria-label="Iniciativa de ${h(e.nome)}">
      <button class="btn sm" data-act="iniSet" data-ch="${h(e.chave)}" data-tipo="${e.tipo}">OK</button>
      ${e.tipo!=='agente'&&cri&&iniDe(cri)?`<button class="btn sm" data-act="iniRolarCri" data-ch="${h(e.chave)}" title="Rolar iniciativa (${h(cri.iniciativa)})">${D20}</button>`:''}
      <button class="btn sm ghost danger" data-act="iniDel" data-ch="${h(e.chave)}" aria-label="Tirar ${h(e.nome)} do combate">✕</button>${extra}</div>`};
  const pendHtml=pend.length?`<div class="alert"><p><b>Aguardando iniciativa:</b> os jogadores veem um aviso na ficha para rolar no app ou digitar o que tiraram. Você também pode digitar aqui.</p>
     ${pend.map(x=>`<div class="row" style="margin-top:4px"><span>${h(x.ficha.nome)} <span class="hint">(${h(x.usuario)})</span></span><input class="inp num sm" type="number" id="ini-p-${h(x.ficha.id)}" data-keep style="width:64px" aria-label="Iniciativa de ${h(x.ficha.nome)}"><button class="btn sm" data-act="iniPend" data-ficha="${h(x.ficha.id)}" data-u="${h(x.usuario)}" data-nome="${h(x.ficha.nome)}">OK</button></div>`).join('')}</div>`:'';
  return `<div class="sec"><div class="sec-h"><h2>Iniciativa</h2>${d.pedido?`<span class="chip ok">Rodada ${d.rodada||1}</span>`:''}
     <div class="row"><button class="btn sm acc" data-act="iniPedir">${d.pedido?'Pedir de novo':'Pedir iniciativa'}</button>
      ${es.length?`<button class="btn sm" data-act="iniProx">Próximo turno</button>`:''}${d.pedido||es.length?`<button class="btn sm ghost" data-act="iniFim">Encerrar combate</button>`:''}${!d.pedido&&d.nLog?`<button class="btn sm" data-act="resumoVer" data-m="${h(m.id)}">Resumo do último combate</button>`:''}</div></div>
    ${!d.pedido&&!es.length?'<p class="hint">Clique em “Pedir iniciativa”: cada jogador com ficha ligada a esta campanha recebe um aviso para rolar no app ou digitar o valor dos dados físicos. Adicione criaturas pelo Bestiário ou abaixo.</p>':''}
    ${pendHtml}
    ${es.length?painelDano(es):''}
    ${es.length?`<div class="ini-list">${es.map(linha).join('')}</div>`:''}
    ${ultimosLog()}
    <div class="row"><input class="inp sm" id="ini-npc-nome" data-keep placeholder="Outro participante (nome)" style="flex:1 1 180px"><input class="inp num sm" type="number" id="ini-npc-v" data-keep placeholder="Inic." style="width:70px"><input class="inp num sm" type="number" id="ini-npc-pv" data-keep placeholder="PV" style="width:70px"><button class="btn sm" data-act="iniNpc">Adicionar</button><button class="btn sm" data-act="escTab" data-v="bestiario">Adicionar do bestiário</button></div></div>`;
}
function agenteDe(e){const x=((S.mesaDados&&S.mesaDados.fichas)||[]).find(y=>e.chave.endsWith(':'+y.ficha.id)&&y.usuario===e.usuario);if(!x)return null;
  try{const f=migrar(clone(x.ficha));return {f,r:calc(f)}}catch(err){return null}}
function painelDano(es){
  const cb=S.cb=S.cb||{};if(!es.some(e=>e.chave===cb.alvo))cb.alvo=(es.find(e=>e.tipo!=='agente')||es[0]).chave;
  const alvo=es.find(e=>e.chave===cb.alvo);const defs=alvo&&alvo.dados&&alvo.dados.defs;
  const sel=(k,ops,v)=>`<select class="inp" data-act-change="cbSel" data-k="${k}">${ops.map(([val,l])=>opt(val,l,v||'')).join('')}</select>`;
  const nomes=es.map(e=>[e.chave,e.nome]);
  return `<div class="card cb-painel"><h4>Dano e cura</h4>
    <div class="grid g4">${fld('Alvo',sel('alvo',nomes,cb.alvo))}${fld('Quem causou',sel('autor',[['','Ninguém / ambiente'],...nomes],cb.autor))}
     ${fld('Valor',`<input class="inp" id="cb-v" data-keep placeholder="15 ou 2d8+4" inputmode="text">`)}${fld('Tipo de dano',sel('tipo',[['','Sem tipo'],...TIPOS_DANO],cb.tipo))}</div>
    <div class="row"><button class="btn acc" data-act="cbDano">Causar dano</button><button class="btn" data-act="cbCura">Curar</button>
     <label class="chk"><input type="checkbox" id="cb-ign" data-keep> Ignorar resistências</label>
     <span class="hint">${defs&&defesasTxt(defs)?h(alvo.nome)+': '+h(defesasTxt(defs)):alvo&&alvo.tipo==='agente'?'O jogador recebe um aviso na ficha para aplicar.':'Sem resistências conhecidas.'}</span></div></div>`;
}
function ultimosLog(){const L=S.logs[S.mesaAberta];if(!L||!L.itens.length||!(S.ini&&S.ini.pedido))return '';
  const it=L.itens.filter(x=>x.t!=='turno'&&x.t!=='ataque').slice(-6).reverse();if(!it.length)return '';
  return `<div class="sec"><h3 class="eyebrow">Últimos acontecimentos</h3><ul class="linha-tempo">${it.map(x=>{const tp=(x.tipos||[]).map(t=>TIPO_NOME[t]).join('+');
    return `<li><span class="hint">R${x.rodada}</span> ${h(x.t==='dano'?`${x.autor||'Alguém'} → ${x.alvo}: ${x.valor}${x.bruto!==x.valor?' (de '+x.bruto+')':''}${tp?' '+tp:''}${x.nota?' · '+x.nota:''}${x.caiu?' · caiu':''}`
      :x.t==='cura'?`${x.autor||'Alguém'} curou ${x.alvo}: +${x.valor}${x.origem?' ('+x.origem+')':''}`:x.t==='efeito'?`${x.autor||'Alguém'} → ${x.alvo}: ${x.origem||'ritual'}${x.nota?' · '+x.nota:''}`:x.t==='recebido'?`${x.alvo}: −${x.valor} PV na ficha${x.texto?' ('+x.texto+')':''}`:`${x.alvo}: +${x.valor} PV na ficha${x.texto?' com '+x.texto:''}`)}</li>`}).join('')}</ul></div>`}
async function iniProximo(){
  const d=S.ini||{};const es=ordenarIni(d.entradas||[]).filter(e=>e.valor!=null);if(!es.length){toast('Ninguém tem iniciativa ainda.');return}
  let i=es.findIndex(e=>e.chave===d.turno);let rodada=d.rodada||1;
  if(i<0)i=0;else{i++;if(i>=es.length){i=0;rodada++}}
  await iniPost({acao:'turno',turno:es[i].chave,rodada});
  if(es[i].tipo==='agente')await atualizarMesa(true);await registrarTurno(es[i]);await atualizarIni();toast(`Vez de ${es[i].nome}${i===0&&d.turno?` · rodada ${rodada}`:''}.`);
}
function nomeLivre(base){const ns=new Set(((S.ini||{}).entradas||[]).map(e=>e.nome));if(!ns.has(base))return base;let n=2;while(ns.has(base+' '+n))n++;return base+' '+n}
async function addCriaturaCombate(id,nome){
  const c=criPorId(id);if(!c)return;if(!S.mesaAberta){toast('Abra uma campanha primeiro.');return}
  const v=iniDe(c)?rollCri(`${c.nome}: iniciativa`,c.iniciativa):null;
  await iniPost({acao:'entrada',tipo:'criatura',nome:nomeLivre(nome||c.nome),valor:v,dados:{ref:c.id,pv:c.pv,pvMax:c.pv,def:c.defesa,defs:defesasCri(c),saves:savesCri(c),conds:[]}});
  await atualizarIni();toast(`${c.nome} entrou no combate${v!=null?' com iniciativa '+v:''}.`);
}

/* ---------- agentes e avisos ---------- */
function escAgentes(m){
  if(!S.mesaDados)return '<p class="hint">Carregando…</p>';
  const jog=S.mesaDados.membros.filter(x=>x.papel!=='mestre');
  return `<div class="sec"><div class="sec-h"><h2>Agentes</h2><span class="hint">${jog.length} jogador${jog.length===1?'':'es'}</span></div>${agentesCards()||`<div class="empty">Nenhuma ficha ligada ainda. ${jog.length?'Peça aos jogadores para escolher esta campanha no Dossiê de cada agente.':'Passe o código <b>'+h(m.codigo)+'</b> para os jogadores.'}</div>`}</div>`;
}
function agentesCards(){const d=S.mesaDados;if(!d||!d.fichas.length)return '';
  return `<div class="cards">${d.fichas.map((x,i)=>{const f=migrar(clone(x.ficha));let r;try{r=calc(f)}catch(e){r=null}const c=r&&r.c;
    const bar=(k,l,col)=>r&&r[k+'Max']?`<div class="mini-vit" style="--c:var(--${col})"><span>${l} ${r[k]}/${r[k+'Max']}</span><div class="bar"><i style="width:${Math.max(0,Math.min(100,r[k]/r[k+'Max']*100))}%"></i></div></div>`:'';
    const conds=r?[...r.conds.values()].map(z=>z.c.nome):[];
    return `<div class="card"><h4>${h(f.nome)} <span class="badge">${h(x.usuario)}</span></h4>
      <div class="meta"><span>${c?h(c.nome):'Sem classe'}</span><span>${c&&c.estagios?'Estágio '+f.estagio:'NEX '+f.nex+'%'}</span>${r?`<span>Defesa ${r.defesa}</span><span>DT ${r.dt}</span><span>Percepção ${r.per.percepcao?sgn(r.per.percepcao.bonus):''}</span>`:''}</div>
      ${r?bar('pv','PV','pv')+bar('pe',r.det?'PD':'PE','pe')+(r.det?'':bar('san','SAN','san')):''}
      ${conds.length?`<div class="chips">${conds.map(n=>`<span class="cond">${h(n)}</span>`).join('')}</div>`:''}
      <div class="row"><button class="btn sm" data-act="verFicha" data-i="${i}">Ver ficha</button><span class="hint">atualizada ${new Date(x.atualizado).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span></div></div>`}).join('')}</div>`}
function escAvisos(){
  const av=(S.mesaEventos||[]).map(e=>`<div class="aviso"><div class="meta"><span>${new Date(e.criado).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span><span>${h(e.agente||e.usuario)}</span>${e.elemento?elBadge(e.elemento):''}</div>
     <b>${h(e.ritual||'Ritual')} → ${h(e.alvo||'')}</b><span class="dt">DT ${h(e.dt)}</span><p>${h(avisoTexto(e))}</p>${e.alcance||e.duracao?`<p class="hint">${[e.alcance&&'Alcance '+e.alcance,e.duracao&&'Duração '+e.duracao].filter(Boolean).map(h).join(' · ')}</p>`:''}</div>`).join('');
  return `<div class="sec"><div class="sec-h"><h2>Avisos de rituais</h2></div>${av?`<div class="avisos">${av}</div>`:'<p class="hint">Quando um jogador conjurar um ritual em alguém, aparece aqui o que rolar: teste de resistência, DT e efeito.</p>'}</div>`;
}

/* ---------- bestiário ---------- */
const TIPO_CRI={criatura:'Criaturas',pessoa:'Pessoas',animal:'Animais',relíquia:'Relíquias',modelo:'Modelos'};
function escBestiario(){
  if(!S.cri)return '<p class="hint">Abrindo os arquivos de criaturas…</p>';
  const bf=S.bf||{};const q=slug(S.bq||'');
  let list=criaturasOn();
  if(bf.e)list=list.filter(c=>c.elemento===bf.e||c.elemento2===bf.e||(bf.e==='_'&&!c.elemento));
  if(bf.t)list=list.filter(c=>(c.tipo||'criatura')===bf.t);
  if(bf.f)list=list.filter(c=>(c.fonte||'')===bf.f);
  if(q)list=list.filter(c=>slug(c.nome+' '+(c.acoes||[]).map(a=>a.nome).join(' ')).includes(q));
  list=list.slice().sort((a,b)=>(a.vd??999)-(b.vd??999)||a.nome.localeCompare(b.nome));
  const fontes=[...new Set(criaturasOn().map(c=>c.fonte))];
  const chip=(k,v,l,cls='')=>`<button class="btn sm ${cls}" aria-pressed="${(bf[k]||'')===v}" data-act="criF" data-k="${k}" data-v="${v}">${l}</button>`;
  return `<div class="sec"><div class="sec-h"><h2>Bestiário</h2><span class="hint">${list.length} de ${criaturasOn().length}</span></div>
   <input class="inp" id="cri-q" data-keep placeholder="Buscar criatura, NPC ou habilidade…" value="${h(S.bq||'')}" aria-label="Buscar no bestiário">
   <div class="chips filtros">${chip('e','','Todos')}${['sangue','morte','conhecimento','energia','medo'].map(e=>chip('e',e,ELEM[e],'el el-'+e)).join('')}${chip('e','_','Sem elemento')}</div>
   <div class="chips filtros">${chip('t','','Todos os tipos')}${Object.entries(TIPO_CRI).map(([k,l])=>chip('t',k,l)).join('')}</div>
   ${fontes.length>1?`<div class="chips filtros">${chip('f','','Todas as fontes')}${fontes.map(fid=>chip('f',fid,FONTE(fid).sigla)).join('')}</div>`:''}
   <p class="hint">Testes no formato “3d20+10”: role 3d20, fique com o maior e some 10. Clique em qualquer teste ou dano para rolar. “Combate” coloca a criatura na iniciativa com a vida dela.</p>
   ${list.length?`<div class="cri-list">${list.slice(0,150).map(criCard).join('')}</div>${list.length>150?'<p class="hint">Mostrando 150. Refine a busca.</p>':''}`:'<div class="empty">Nada encontrado.</div>'}</div>`;
}
function criResumo(c){return [c.vd!=null?'VD '+c.vd:'',c.tamanho,c.pv!=null?c.pv+' PV':'',c.defesa!=null?'Defesa '+c.defesa:''].filter(Boolean).join(' · ')}
function criCard(c){const aberto=(S.criAbertas||{})[c.id];
  return `<div class="card cri ${aberto?'on':''}"><h4><button class="linkbtn" data-act="criTgl" data-id="${h(c.id)}" aria-expanded="${!!aberto}">${h(c.nome)}</button> ${elBadge(c.elemento)}${elBadge(c.elemento2)}${c.tipo&&c.tipo!=='criatura'?` <span class="badge">${h(c.tipo)}</span>`:''} ${fonteBadge(c)}
    <span class="row"><button class="btn sm" data-act="criAdd" data-id="${h(c.id)}" ${S.mesaAberta?'':'disabled'}>Combate</button></span></h4>
    <div class="meta"><span>${h(criResumo(c))}</span></div>${aberto?criFicha(c):''}</div>`}
function criFicha(c){
  const rb=(label,expr)=>expr&&/d20/.test(expr)?`<button class="rollchip" data-act="criRoll" data-id="${h(c.id)}" data-l="${h(label)}" data-x="${h(expr)}">${h(label)} ${h(expr)}</button>`:expr?`<span class="chip">${h(label)} ${h(expr)}</span>`:'';
  const at=c.atributos||{};
  const linhas=[
    c.presenca?`<p><b>Presença perturbadora</b> ${h(c.presenca)}</p>`:'',
    `<div class="chips">${rb('Iniciativa',c.iniciativa)}${rb('Percepção',c.percepcao)}${rb('Fortitude',c.fortitude)}${rb('Reflexos',c.reflexos)}${rb('Vontade',c.vontade)}</div>`,
    c.sentidos?`<p class="hint">Sentidos: ${h(c.sentidos)}</p>`:'',
    `<div class="meta">${['AGI','FOR','INT','PRE','VIG'].map(k=>`<span>${k} ${at[k]??'—'}</span>`).join('')}<span>Deslocamento ${h(c.deslocamento||'—')}</span></div>`,
    c.imunidades?`<p><b>Imunidades</b> ${h(c.imunidades)}</p>`:'',c.resistencias?`<p><b>Resistências</b> ${h(c.resistencias)}</p>`:'',c.vulnerabilidades?`<p><b>Vulnerabilidades</b> ${h(c.vulnerabilidades)}</p>`:'',
    c.pericias?`<p><b>Perícias</b> ${h(c.pericias)}</p>`:''];
  const acoes=(c.acoes||[]).map(a=>a.ataque?`<div class="cri-acao"><b>${h(a.nome)}</b> <span class="hint">${h(a.alcance)}</span>
      <div class="row">${rb('Ataque',a.teste)}<button class="rollchip" data-act="criDano" data-id="${h(c.id)}" data-l="${h(a.nome)}" data-x="${h(a.dano)}">Dano ${h(a.dano)}</button></div></div>`
    :`<div class="cri-acao"><div><b>${h(a.nome)}</b> <span class="badge">${h(a.acao)}</span></div><p>${h(a.texto)}</p></div>`).join('');
  return `<div class="cri-ficha">${linhas.join('')}<div class="cri-acoes">${acoes}</div>${c.enigma?`<div class="afin"><b>Enigma de Medo.</b> ${h(c.enigma)}</div>`:''}</div>`;
}

/* ---------- referência ---------- */
function escRef(){
  const conds=(D.condicoes||[]).filter(c=>fonteOn(c.fonte||'core'));
  return `<div class="sec"><div class="sec-h"><h2>Dificuldades</h2></div>
    <div class="chips"><span class="chip">Fácil DT 5</span><span class="chip">Média DT 10</span><span class="chip">Difícil DT 15</span><span class="chip">Desafiadora DT 20</span><span class="chip">Formidável DT 25</span><span class="chip">Heroica DT 30</span><span class="chip">Quase impossível DT 40</span></div>
    <p class="hint">Teste oposto: quem tirar mais vence; empate favorece quem defende. Ajuda: cada ajudante que passa em DT 10 dá +1 (+2 com 20, +3 com 30).</p></div>
   <div class="sec"><div class="sec-h"><h2>Alcances</h2></div>
    <div class="chips"><span class="chip">Curto 9m</span><span class="chip">Médio 18m</span><span class="chip">Longo 36m</span><span class="chip">Extremo 90m</span></div></div>
   <div class="sec"><div class="sec-h"><h2>Condições</h2></div><div class="condgrid">${conds.map(c=>`<div class="condbtn" style="cursor:default"><b>${h(c.nome)}</b><span>${h(c.desc||'')}</span></div>`).join('')}</div></div>`;
}

/* ---------- jogador: aviso de iniciativa na ficha ---------- */
function iniBanner(f,r){
  if(!f||f._alheia||!f.mesa||!(S.conta&&S.conta.usuario))return '';
  const d=(S.iniJog||{})[f.mesa];if(!d)return '';if(!d.pedido)return resumoJogadorHtml(f);
  const minha=(d.entradas||[]).find(e=>e.meu&&e.chave.endsWith(':'+f.id));
  const es=ordenarIni(d.entradas||[]).filter(e=>e.valor!=null);
  const atual=es.find(e=>e.chave===d.turno);
  if(!minha||minha.valor==null){const p=r.per.iniciativa;
    return `<div class="ini-aviso" role="status"><b>O mestre pediu iniciativa.</b>
      <button class="btn sm acc" data-act="iniRolar">Rolar no app (${p.dados<1?(2-p.dados)+'d20 pior':p.dados+'d20'} ${sgn(p.bonus)})</button>
      <span class="hint">ou o que tirou nos dados:</span><input class="inp num sm" type="number" id="ini-meu" data-keep style="width:70px" aria-label="Valor da iniciativa rolada nos dados físicos"><button class="btn sm" data-act="iniMeu">Enviar</button></div>${avisosDanoHtml(f)}`}
  const inim=es.filter(e=>e.tipo!=='agente');
  const pos=es.findIndex(e=>e.chave===minha.chave)+1;
  return `<div class="ini-aviso ok" role="status"><span>Iniciativa <b>${minha.valor}</b> · ${pos}º de ${es.length} · rodada ${d.rodada||1}</span>${atual?`<span>Vez de <b>${h(atual.nome)}</b>${atual.chave===minha.chave?' (você!)':''}</span>`:''}
    <details><summary class="hint">Ordem</summary><ol class="hint">${es.map(e=>`<li>${h(e.nome)} (${e.valor})</li>`).join('')}</ol></details>
    ${inim.length?`<span class="hint">Inimigos: ${inim.map(e=>h(e.nome)).join(', ')}. Ataque pelo Inventário e escolha o alvo na rolagem de dano.</span>`:''}</div>${avisosDanoHtml(f)}`;
}
async function atualizarIniJogador(){
  const f=F();if(!f||f._alheia||!f.mesa||!(S.conta&&S.conta.usuario))return;
  try{const {d,L}=await buscarLog(f.mesa);S.iniJog=S.iniJog||{};
    const k=JSON.stringify(d)+L.ultimo;
    const ant0=(S.iniJog||{})[f.mesa];if(S._pvSnap&&(S._pvSnap[f.id]==null||(d.pedido&&(!ant0||ant0.pedido!==d.pedido)))){try{S._pvSnap[f.id]=calc(f).pv}catch(e){}}
    if(k===S._iniJogKey)return;
    const antes=S.iniJog[f.mesa];S._iniJogKey=k;S.iniJog[f.mesa]=d;
    if(d.pedido&&(!antes||antes.pedido!==d.pedido))toast('O mestre pediu iniciativa!',6000);
    if(antes&&antes.pedido&&!d.pedido)toast('O mestre encerrou o combate.',5000);
    if(avisosDano(f).length&&L.ultimo!==S._ultAviso){S._ultAviso=L.ultimo;toast('Você tem dano ou cura do mestre para aplicar.',5000)}
    const ae=document.activeElement;if(S.view==='ficha'&&!(ae&&ae.matches('.ini-aviso input')&&ae.value))render()}catch(e){}
}
async function enviarIniMeu(valor,fonte){
  const f=F();if(!f||!f.mesa)return;
  try{await iniPost({acao:'valor',ficha:f.id,nome:f.nome||'Agente',valor,fonte},f.mesa);const el=document.getElementById('ini-meu');if(el){el.value='';el.blur()}toast(`Iniciativa ${valor} enviada ao mestre.`);S._iniJogKey=null;atualizarIniJogador()}
  catch(e){toast('Não foi possível enviar: '+e.message)}
}

/* Atualiza sozinho: mestre no Escudo a cada 6 s; jogador com ficha ligada a cada 8 s. */
let _tickEsc=0;
setInterval(()=>{if(document.visibilityState!=='visible')return;_tickEsc++;
  if(S.view==='escudo'&&S.mesaAberta){atualizarMesa(_tickEsc%5===0||!!(S.ini&&S.ini.pedido));atualizarIni()}
  else if(S.view==='ficha'&&_tickEsc%4!==1)atualizarIniJogador()},6000);

/* ---------- eventos ---------- */
document.addEventListener('click',async e=>{
  const t=e.target.closest('[data-act]');if(!t)return;const a=t.dataset.act;const ds=t.dataset;
  const val=id=>{const el=document.getElementById(id);return el?el.value.trim():''};
  const erroT=err=>toast(err.message||String(err));
  switch(a){
   case 'escTab':S.escTab=ds.v;if(ds.v==='bestiario')carregarCriaturas().catch(()=>{});render();return;
   case 'escAtualizar':S._mesaKey=null;S._iniKey=null;await atualizarMesa(true);await atualizarIni();render();return;
   case 'iniPedir':try{await iniPost({acao:'pedir'});await atualizarIni();toast('Pedido enviado: os jogadores veem o aviso na ficha.')}catch(err){erroT(err)}return;
   case 'iniProx':try{await iniProximo()}catch(err){erroT(err)}return;
   case 'iniFim':{if(S.confirm!=='iniFim'){S.confirm='iniFim';toast('Clique de novo em “Encerrar combate” para confirmar.');setTimeout(()=>{if(S.confirm==='iniFim')S.confirm=null},5000);return}
     S.confirm=null;try{const mid=S.mesaAberta;await iniPost({acao:'encerrar'});await atualizarIni();toast('Combate encerrado.');await mostrarResumo(mid,'Combate encerrado: resumo')}catch(err){erroT(err)}return}
   case 'cbAlvo':S.cb=S.cb||{};S.cb.alvo=ds.ch;render();document.querySelector('.cb-painel')?.scrollIntoView({block:'nearest'});return;
   case 'cbDano':case 'cbCura':{const cb=S.cb||{};const s=val('cb-v');if(!s){toast('Digite o valor.');return}
     const x=rollExpr(s.replace(/^[-−+]/,''));if(!(x.total>=0)||isNaN(x.total)){toast('Use um número ou dados, como 2d8+4.');return}
     const es=(S.ini||{}).entradas||[];const autor=es.find(y=>y.chave===cb.autor);
     if(/d/i.test(s))pushRoll({t:(a==='cbDano'?'Dano':'Cura')+(autor?': '+autor.nome:''),v:x.total,d:x.txt});
     try{await enviarDano({mesa:S.mesaAberta,ch:cb.alvo,v:x.total,tipos:cb.tipo?[cb.tipo]:[],autor:autor?autor.nome:null,autorChave:autor?autor.chave:null,cura:a==='cbCura',ignorar:document.getElementById('cb-ign')?.checked});
       const el=document.getElementById('cb-v');if(el)el.value='';await atualizarIni()}catch(err){erroT(err)}return}
   case 'efDel':{const ent=((S.ini||{}).entradas||[]).find(x=>x.chave===ds.ch);if(!ent)return;const cs=((ent.dados||{}).conds||[]).filter((_,k)=>k!==+ds.k);
     try{await iniPost({acao:'efeitos',chave:ds.ch,conds:cs});await atualizarIni()}catch(err){erroT(err)}return}
   case 'iniDel':try{await iniPost({acao:'remover',chave:ds.ch});await atualizarIni()}catch(err){erroT(err)}return;
   case 'iniSet':{const v=val('ini-v-'+ds.ch);const ent=((S.ini||{}).entradas||[]).find(x=>x.chave===ds.ch);if(!ent)return;
     try{if(ent.tipo==='agente')await iniPost({acao:'valor',chave:ds.ch,valor:v===''?null:+v,fonte:'fisico'});
       else await iniPost({acao:'entrada',chave:ds.ch,tipo:ent.tipo,nome:ent.nome,valor:v===''?null:+v});await atualizarIni()}catch(err){erroT(err)}return}
   case 'iniRolarCri':{const ent=((S.ini||{}).entradas||[]).find(x=>x.chave===ds.ch);const c=ent&&ent.dados&&criPorId(ent.dados.ref);if(!c)return;
     const v=rollCri(`${ent.nome}: iniciativa`,c.iniciativa);try{await iniPost({acao:'entrada',chave:ent.chave,tipo:ent.tipo,nome:ent.nome,valor:v});await atualizarIni()}catch(err){erroT(err)}return}
   case 'iniNpc':{const n=val('ini-npc-nome');if(!n){toast('Dê um nome.');return}const v=val('ini-npc-v');const pv=val('ini-npc-pv');
     try{await iniPost({acao:'entrada',tipo:'npc',nome:n,valor:v===''?null:+v,dados:pv?{pv:+pv,pvMax:+pv}:null});['ini-npc-nome','ini-npc-v','ini-npc-pv'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});await atualizarIni()}catch(err){erroT(err)}return}
   case 'iniPend':{const v=val('ini-p-'+ds.ficha);if(v===''){toast('Digite o valor.');return}
     try{await iniPost({acao:'valor',ficha:ds.ficha,usuario:ds.u,nome:ds.nome,valor:+v,fonte:'fisico'});await atualizarIni()}catch(err){erroT(err)}return}
   case 'iniRolar':{const f=F();const r=calc(f);const p=r.per.iniciativa;const roll=rollTest(`${f.nome}: Iniciativa`,p.dados,p.bonus,{attr:p.attr});enviarIniMeu(roll.v,'app');return}
   case 'iniMeu':{const v=val('ini-meu');if(v===''||isNaN(+v)){toast('Digite o valor que você tirou.');return}enviarIniMeu(Math.round(+v),'fisico');return}
   case 'criTgl':S.criAbertas=S.criAbertas||{};S.criAbertas[ds.id]=!S.criAbertas[ds.id];render();return;
   case 'criF':S.bf=S.bf||{};S.bf[ds.k]=ds.v;render();return;
   case 'criAdd':try{await addCriaturaCombate(ds.id)}catch(err){erroT(err)}return;
   case 'criRoll':{const c=criPorId(ds.id);const ent=ds.ch&&((S.ini||{}).entradas||[]).find(x=>x.chave===ds.ch);if(rollCri(`${ent?ent.nome:c?c.nome:''}: ${ds.l}`,ds.x)==null)return;
     const atk=ent&&c&&(c.acoes||[]).find(a=>a.ataque&&a.nome===ds.l);
     if(atk&&S.rolls[0]){S.rolls[0].crit=S.rolls[0].nat===20;S.rolls[0].acts=(S.rolls[0].acts||[]).concat(acoesAtaque({autor:ent.nome,autorChave:ent.chave,origem:atk.nome,dano:atk.dano}).sort((a,b)=>{const ea=S.ini.entradas.find(x=>x.chave===a.ch),eb=S.ini.entradas.find(x=>x.chave===b.ch);return (ea.tipo==='agente'?0:1)-(eb.tipo==='agente'?0:1)}));renderRolls()}return}
   case 'criDano':{const c=criPorId(ds.id);const ent=ds.ch&&((S.ini||{}).entradas||[]).find(x=>x.chave===ds.ch);
     const v=rollDano(`${ent?ent.nome:c?c.nome:''}: ${ds.l}`,ds.x,{},ent?{autor:ent.nome,autorChave:ent.chave,origem:ds.l}:{});
     if(ent&&v!=null){const tp=tiposDe(ds.x);S.cb={...(S.cb||{}),autor:ent.chave,tipo:tp[0]||''};render();const el=document.getElementById('cb-v');if(el)el.value=v}return}
   case 'criVer':{const c=criPorId(ds.id);if(c)modal(c.nome,`<div class="modal-b"><div class="meta"><span>${h(criResumo(c))}</span></div>${criFicha(c)}</div>`);return}
  }
});
document.addEventListener('input',e=>{if(e.target.id==='cri-q'){S.bq=e.target.value;clearTimeout(S._bqT);S._bqT=setTimeout(render,250)}});
document.addEventListener('change',async e=>{const ac=e.target.dataset.actChange;
  if(ac==='cbSel'){S.cb=S.cb||{};S.cb[e.target.dataset.k]=e.target.value;render();return}
  if(ac==='efAdd'){let v=e.target.value;if(!v)return;if(v==='_'){v=(prompt('Nome do efeito')||'').trim();if(!v){render();return}}
    const ent=((S.ini||{}).entradas||[]).find(x=>x.chave===e.target.dataset.ch);if(!ent)return;const cs=[...((ent.dados||{}).conds||[])];if(!cs.includes(v))cs.push(v);
    try{await iniPost({acao:'efeitos',chave:ent.chave,conds:cs});await atualizarIni()}catch(err){toast(err.message)}return}
  if(ac==='escMesa'){S.mesaAberta=e.target.value;S.ini=null;S._iniKey=null;S.mesaDados=null;S._mesaKey=null;S.mesaEventos=[];S.mesaUltimo=0;render();atualizarMesa(true).then(atualizarIni)}});
