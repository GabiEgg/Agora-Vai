/* ============================== CAMPANHA (servidor) ==============================
   Só existe quando o app roda no servidor próprio com login. O mestre cria a campanha e
   passa o código; cada jogador liga as fichas que quiser. Só o mestre vê as fichas ligadas. */
async function carregarMesas(){
  if(!(S.conta&&S.conta.usuario))return;
  try{S.mesas=await Api.req('GET','/api/mesas')}catch(e){S.mesas=[]}
  render();
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
      :`<span class="hint">Ligue suas fichas a esta campanha no Dossiê de cada agente.</span><button class="btn sm ghost danger" data-act="mesaSair" data-id="${h(x.id)}">Sair</button>`}</div></div>`).join('')}</div>`
    :'<p class="hint">Você ainda não está em nenhuma campanha.</p>';
  const forms=`<div class="grid g2 camp-form">
     <div class="card"><h4>Sou o mestre</h4><p>Crie a campanha e passe o código para os jogadores.</p><div class="row"><input class="inp" id="mesa-nome" placeholder="Nome da campanha" maxlength="80" style="flex:1 1 160px"><button class="btn acc" data-act="mesaCriar">Criar</button></div></div>
     <div class="card"><h4>Sou jogador</h4><p>Digite o código que o mestre passou.</p><div class="row"><input class="inp" id="mesa-codigo" placeholder="Código (ex.: K7Q2PM)" maxlength="12" style="flex:1 1 160px;text-transform:uppercase"><button class="btn acc" data-act="mesaEntrar">Entrar</button></div></div></div>`;
  return `<div class="sheet"><div class="sheet-head"><div class="name"><span class="eyebrow">Mesa compartilhada</span><h2 class="bigh">Campanha</h2></div></div>
   <div class="pane"><div class="sec"><div class="sec-h"><h2>Suas campanhas</h2></div>${lista}${forms}
    <p class="hint">Jogadores só veem as próprias fichas. O mestre vê, no Escudo do Mestre, as fichas que cada jogador ligar à campanha (somente leitura), os avisos de rituais e a iniciativa.</p></div>
   ${souMestre()?`<div class="sec"><p>Agentes, avisos de rituais, iniciativa e bestiário ficam no <button class="btn sm acc" data-act="view" data-v="escudo">Escudo do Mestre</button>.</p></div>`:''}</div></div>`;
}
