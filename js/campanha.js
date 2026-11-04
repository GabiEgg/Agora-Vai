/* ============================== CAMPANHA (servidor) ==============================
   Só existe quando o app roda no servidor próprio com login. O mestre cria a campanha e
   passa o código; cada jogador liga as fichas que quiser. Só o mestre vê as fichas ligadas. */
async function carregarMesas(){
  if(!(S.conta&&S.conta.usuario))return;
  try{S.mesas=await Api.req('GET','/api/mesas')}catch(e){S.mesas=[]}
  render();publicarRegras();buscarRegrasDasFichas();if(mesaSincronizada())sincronizarRegras(S.cfg.syncMesa,true);
}
const mesaAtual=()=>(S.mesas||[]).find(m=>m.id===S.mesaAberta);
async function abrirMesa(id){
  S.mesaAberta=id;S.mesaDados=null;S.mesaEventos=[];S.mesaUltimo=0;render();
  await atualizarMesa(true);
}
async function atualizarMesa(fichasTambem){
  const m=mesaAtual();if(!m||m.papel!=='mestre')return;let mudou=false;
  try{
    if(fichasTambem||!S.mesaDados){const d=await Api.req('GET',`/api/mesas/${encodeURIComponent(m.id)}/fichas`);const k=JSON.stringify(d);if(k!==S._mesaKey){S._mesaKey=k;S.mesaDados=d;mudou=true}}
    const ev=await Api.req('GET',`/api/mesas/${encodeURIComponent(m.id)}/eventos?depois=${S.mesaUltimo||0}`);
    if(ev.length){S.mesaEventos=ev.concat(S.mesaEventos||[]).slice(0,50);S.mesaUltimo=ev[0].id;mudou=true;
      if(S._mesaPrimeira)toast(`Novo aviso: ${ev[0].agente||ev[0].usuario} usou ${ev[0].ritual||'um ritual'}.`)}
    S._mesaPrimeira=true;
  }catch(e){if(e.status===404){S.mesaAberta=null;mudou=true}}
  if(mudou&&(S.view==='campanha'||S.view==='escudo')&&!document.activeElement.closest('.camp-form,.cb-painel,.mapa-lado'))render();
}
/* A atualização automática do mestre fica em escudo.js. */

function renderCampanha(){
  const ms=S.mesas||[];const m=mesaAtual();
  const lista=ms.length?`<div class="cards">${ms.map(x=>`<div class="card ${x.id===S.mesaAberta?'on-camp':''}"><h4>${h(x.nome)} <span class="badge ${x.papel==='mestre'?'acc':''}">${x.papel==='mestre'?'Mestre':'Jogador'}</span></h4>
     <div class="meta"><span>Mestre: ${h(x.mestre)}</span>${x.codigo?`<span>Código: <b class="codigo">${h(x.codigo)}</b></span>`:''}</div>
     <div class="row">${x.papel==='mestre'?`<button class="btn sm acc" data-act="mesaAbrir" data-id="${h(x.id)}">Abrir no Escudo</button>
       <button class="btn sm" data-act="mesaCopiar" data-v="${h(x.codigo)}">Copiar código</button>
       ${S.confirm==='mesaDel:'+x.id?`<span class="confirm">Excluir a campanha? <button class="btn sm danger" data-act="mesaExcluir" data-id="${h(x.id)}">Excluir</button><button class="btn sm" data-act="cancel">Cancelar</button></span>`:`<button class="btn sm ghost danger" data-act="mesaDel" data-id="${h(x.id)}">Excluir</button>`}`
      :`<span class="hint">Ligue suas fichas a esta campanha no Dossiê de cada agente.</span><button class="btn sm" data-act="regrasSync" data-id="${h(x.id)}">Usar as regras do mestre</button><button class="btn sm ghost danger" data-act="mesaSair" data-id="${h(x.id)}">Sair</button>`}</div></div>`).join('')}</div>`
    :'<p class="hint">Você ainda não está em nenhuma campanha.</p>';
  const forms=`<div class="grid g2 camp-form">
     <div class="card"><h4>Sou o mestre</h4><p>Crie a campanha e passe o código para os jogadores.</p><div class="row"><input class="inp" id="mesa-nome" placeholder="Nome da campanha" maxlength="80" style="flex:1 1 160px"><button class="btn acc" data-act="mesaCriar">Criar</button></div></div>
     <div class="card"><h4>Sou jogador</h4><p>Digite o código que o mestre passou.</p><div class="row"><input class="inp" id="mesa-codigo" placeholder="Código (ex.: K7Q2PM)" maxlength="12" style="flex:1 1 160px;text-transform:uppercase"><button class="btn acc" data-act="mesaEntrar">Entrar</button></div></div></div>`;
  return `<div class="sheet"><div class="sheet-head"><div class="name"><span class="eyebrow">Mesa compartilhada</span><h2 class="bigh">Campanha</h2></div></div>
   <div class="pane"><div class="sec"><div class="sec-h"><h2>Suas campanhas</h2></div>${lista}${forms}
    <p class="hint">Jogadores só veem as próprias fichas. O mestre vê, no Escudo do Mestre, as fichas que cada jogador ligar à campanha (somente leitura), os avisos de rituais e a iniciativa.</p></div>
   ${souMestre()?`<div class="sec"><p>Agentes, avisos de rituais, iniciativa e bestiário ficam no <button class="btn sm acc" data-act="view" data-v="escudo">Escudo do Mestre</button>.</p></div>`:''}</div></div>`;
}

/* ============================== REGRAS DA CAMPANHA ==============================
   O mestre publica os livros, regras opcionais e automações que tem ligados; cada jogador pode
   copiar com um clique ou manter sincronizado (aí os interruptores da aba Mesa ficam travados).
   Pacotes de homebrew não entram: o conteúdo deles fica na conta de quem criou. */
const regrasDe=c=>({fontes:{...c.fontes},regras:{...c.regras},auto:{...c.auto},acoesInterludio:+c.acoesInterludio||2});
const chavesOn=o=>Object.keys(o||{}).filter(k=>o[k]&&k!=='core').sort().join(',');
function regrasIguais(a,b){return !!a&&!!b&&chavesOn(a.fontes)===chavesOn(b.fontes)&&chavesOn(a.regras)===chavesOn(b.regras)&&chavesOn(a.auto)===chavesOn(b.auto)&&(+a.acoesInterludio||2)===(+b.acoesInterludio||2)}
let _pubT=null;
function publicarRegras(){
  if(S._semPublicar||!(S.conta&&S.conta.usuario))return;const ms=(S.mesas||[]).filter(m=>m.papel==='mestre');if(!ms.length)return;
  clearTimeout(_pubT);_pubT=setTimeout(()=>{ms.forEach(m=>Api.req('PUT',`/api/mesas/${encodeURIComponent(m.id)}/regras`,regrasDe((S.cfg.mesasCfg||{})[m.id]||S.cfg)).catch(()=>{}))},1200);
}
/* Salva o alvo editado na aba Mesa: regras gerais/de campanha ficam na configuração; as de um agente, na ficha. */
function salvarAlvoRegras(){const a=S.mesaAlvo||'g';if(a.startsWith('f:')){const f=S.fichas[a.slice(2)];if(f){saveF(f);return}}saveCfg()}
/* Busca as regras publicadas das campanhas em que algum agente usa "Da campanha ligada". */
function buscarRegrasDasFichas(){const ids=new Set(Object.values(S.fichas||{}).filter(f=>f.regrasModo==='campanha'&&f.mesa).map(f=>f.mesa));
  ids.forEach(id=>{const m=(S.mesas||[]).find(x=>x.id===id);if(m&&m.papel!=='mestre')buscarRegras(id).then(()=>render()).catch(()=>{})})}
async function buscarRegras(id){const r=await Api.req('GET',`/api/mesas/${encodeURIComponent(id)}/regras`);S.regrasMesa=S.regrasMesa||{};S.regrasMesa[id]=r;return r}
async function buscarRegrasJogador(){
  const ms=(S.mesas||[]).filter(m=>m.papel!=='mestre');S._regrasBusca=Date.now();
  await Promise.all(ms.map(m=>buscarRegras(m.id).catch(()=>null)));
}
function aplicarRegras(cfg){
  S.cfg.fontes={core:true,...cfg.fontes};S.cfg.regras={...cfg.regras};S.cfg.auto={...cfgPadrao().auto,...cfg.auto};S.cfg.acoesInterludio=+cfg.acoesInterludio||2;
  S._semPublicar=true;try{saveCfg()}finally{S._semPublicar=false}
}
const mesaSincronizada=()=>!!S.cfg.syncMesa&&(S.mesas||[]).some(m=>m.id===S.cfg.syncMesa&&m.papel!=='mestre');
async function sincronizarRegras(id,silencioso){
  const m=(S.mesas||[]).find(x=>x.id===id);if(!m)return false;
  let r;try{r=await buscarRegras(id)}catch(e){if(!silencioso)toast('Não foi possível buscar as regras da campanha.');return false}
  if(!r.cfg){if(!silencioso)toast(`O mestre de “${m.nome}” ainda não publicou as regras. Elas aparecem quando ele abrir o app.`,6000);return false}
  if(regrasIguais(regrasDe(S.cfg),r.cfg)){if(!silencioso)toast('Suas regras já são iguais às do mestre.');return true}
  aplicarRegras(r.cfg);toast(`Regras de “${m.nome}” aplicadas: livros, regras opcionais e automações iguais às do mestre.`,6000);render();return true;
}
function alvoRegrasHtml(){
  const fs=Object.values(realFichas()).filter(f=>f.regrasModo==='propria');const ms=(S.mesas||[]).filter(m=>m.papel==='mestre');
  let a=S.mesaAlvo||'g';if(a.startsWith('f:')&&cfgAlvo(a)===S.cfg)a=S.mesaAlvo='g';if(a.startsWith('m:')&&!ms.some(m=>'m:'+m.id===a))a=S.mesaAlvo='g';
  const mc=S.cfg.mesasCfg||{};
  const ops=[['g','Regras gerais (fichas sem regras próprias)'],...ms.map(m=>['m:'+m.id,`Campanha “${m.nome}” (você é mestre)${mc[m.id]?'':' · usa as gerais'}`]),...fs.map(f=>['f:'+f.id,`Agente: ${f.nome||'sem nome'}`])];
  let extra='';
  if(a.startsWith('m:')){const id=a.slice(2);extra=mc[id]?`<p class="hint">Estas regras valem só para esta campanha: são as que os jogadores dela copiam e as que o Escudo usa. <button class="btn sm ghost" data-act="regrasJuntar" data-id="${h(id)}">Voltar a usar as regras gerais</button></p>`
    :`<p class="hint">Esta campanha usa as regras gerais. <button class="btn sm acc" data-act="regrasSeparar" data-id="${h(id)}">Dar regras próprias a esta campanha</button></p>`}
  else if(a.startsWith('f:'))extra=`<p class="hint">Estas regras valem só para este agente. <button class="btn sm ghost" data-act="regrasFichaGeral" data-id="${h(a.slice(2))}">Voltar às regras gerais</button></p>`;
  else extra='<p class="hint">Para um agente ter regras próprias (ou seguir as da campanha dele), use o campo <b>Regras</b> no Dossiê do agente.</p>';
  return `<div class="card" style="margin-bottom:12px"><div class="row"><b>Editando</b><select class="inp" data-mesa-alvo style="flex:1 1 220px" aria-label="Quais regras editar">${ops.map(([k,l])=>opt(k,l,a)).join('')}</select></div>${extra}</div>`;
}
function regrasCampanhaHtml(){
  if(!(S.conta&&S.conta.usuario))return alvoRegrasHtml();
  const jog=(S.mesas||[]).filter(m=>m.papel!=='mestre');const mest=(S.mesas||[]).filter(m=>m.papel==='mestre');
  if(jog.length&&(!S._regrasBusca||Date.now()-S._regrasBusca>15000))buscarRegrasJogador().then(()=>{if(S.view==='mesa')render()});
  const linhas=jog.map(m=>{const r=(S.regrasMesa||{})[m.id];const sync=S.cfg.syncMesa===m.id;
    const st=!r?'<span class="chip">verificando…</span>':!r.cfg?'<span class="chip">mestre ainda não publicou</span>':regrasIguais(regrasDe(S.cfg),r.cfg)?'<span class="chip ok">iguais às do mestre</span>':'<span class="chip warn">diferentes das do mestre</span>';
    return `<div class="row regras-camp"><span style="flex:1 1 200px"><b>${h(m.nome)}</b> <span class="hint">mestre ${h(m.mestre)}</span> ${st}</span>
      <button class="btn sm acc" data-act="regrasSync" data-id="${h(m.id)}" ${r&&!r.cfg?'disabled':''}>Usar as regras do mestre</button>
      <label class="chk"><input type="checkbox" data-act="regrasAuto" data-id="${h(m.id)}" ${sync?'checked':''}> Manter sincronizado</label></div>`}).join('');
  return `${jog.length?`<div class="card" style="margin-bottom:12px"><h4>Regras das suas campanhas</h4><p class="hint">Copie os livros, as regras opcionais e as automações que o mestre usa. Com “Manter sincronizado”, mudanças do mestre chegam sozinhas e os interruptores abaixo ficam travados. Pacotes de homebrew não são copiados.</p>${linhas}</div>`:''}
   ${alvoRegrasHtml()}`;
}
/* Mantém sincronizado: ao carregar as campanhas e a cada minuto. O mestre publica ao carregar. */
setInterval(()=>{if(document.visibilityState!=='visible')return;if(mesaSincronizada())sincronizarRegras(S.cfg.syncMesa,true);buscarRegrasDasFichas()},60000);
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="regrasSync"]');if(t)sincronizarRegras(t.dataset.id)});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.act!=='regrasAuto')return;
  if(t.checked){S.cfg.syncMesa=t.dataset.id;sincronizarRegras(t.dataset.id).then(()=>{saveCfg();render()})}
  else{delete S.cfg.syncMesa;saveCfg();render()}});

/* Regras por campanha (mestre) e por agente. */
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t)return;const ds=t.dataset;
  if(ds.act==='regrasSeparar'){S.cfg.mesasCfg=S.cfg.mesasCfg||{};S.cfg.mesasCfg[ds.id]=regrasCopia(S.cfg);saveCfg();toast('Esta campanha agora tem regras próprias (começam iguais às gerais).');render()}
  else if(ds.act==='regrasJuntar'){if(S.cfg.mesasCfg)delete S.cfg.mesasCfg[ds.id];saveCfg();toast('A campanha voltou a usar as regras gerais.');render()}
  else if(ds.act==='regrasFichaGeral'){const f=S.fichas[ds.id];if(f){f.regrasModo='padrao';saveF(f)}S.mesaAlvo='g';render()}
  else if(ds.act==='regrasEditar'){S.mesaAlvo='f:'+ds.id;S.view='mesa';S.mesaTab=S.mesaTab||'fontes';render()}});
document.addEventListener('change',e=>{const t=e.target;
  if(t.hasAttribute('data-mesa-alvo')){S.mesaAlvo=t.value;render();return}
  if(t.hasAttribute('data-regras-modo')){const f=F();if(!f||f._alheia)return;const v=t.value;
    if(v==='propria'&&!f.regrasCfg)f.regrasCfg=regrasCopia(cfgFicha(f));
    f.regrasModo=v;saveF(f);if(v==='campanha')buscarRegrasDasFichas();
    toast(v==='propria'?'Este agente agora tem regras próprias (começam iguais às que ele usava). Edite em Mesa.':v==='campanha'?'Este agente segue as regras da campanha ligada.':'Este agente usa as regras gerais.',5000);render()}});
