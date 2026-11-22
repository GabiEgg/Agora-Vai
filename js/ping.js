/* ============================== PING ==============================
   Aviso rápido entre mestre e jogadores de uma campanha (só com o servidor próprio).
   Jogador → mestre; mestre → todos os jogadores ou um jogador. Quem recebe vê um pop-up com som. */
const PING_RAPIDOS={jogador:['Preciso falar com você','Posso agir agora?','Tenho uma ideia','Pausa rápida','Olha o chat','Vou rolar um teste'],
  mestre:['Sua vez!','Rolem iniciativa','Pausa de 5 minutos','Voltando!','Olhem o mapa','Façam um teste de Percepção']};
S.pings=[];S.pingUlt=0;S.pingMembros={};
const pingChave=()=>'cristopher-ping-'+((S.conta&&S.conta.usuario)||'');
const pingUltGuardado=()=>{try{return +localStorage.getItem(pingChave())||0}catch(e){return 0}};
const pingAtivo=()=>!!(S.conta&&S.conta.usuario&&(S.mesas||[]).length);
const pingSouMestre=mid=>((S.mesas||[]).find(m=>m.id===mid)||{}).papel==='mestre';
/* Campanha padrão para enviar: a aberta no Escudo, a da ficha atual ou a primeira. */
function pingMesaPadrao(){const ms=S.mesas||[];const f=F();
  return (S.view==='escudo'&&ms.find(m=>m.id===S.mesaAberta))||(f&&f.mesa&&ms.find(m=>m.id===f.mesa))||ms.find(m=>m.id===S.pingMesa)||ms[0]}

async function pingBuscar(){
  if(!pingAtivo())return;
  if(S._pingDono!==S.conta.usuario){S._pingDono=S.conta.usuario;S.pingUlt=0;S.pings=[];pingMostrar()}
  if(!S.pingUlt)S.pingUlt=pingUltGuardado();
  try{const r=await Api.req('GET','/api/ping?depois='+(S.pingUlt||0));
    S.pingUlt=Math.max(r.ultimo||0,S.pingUlt||0);try{localStorage.setItem(pingChave(),S.pingUlt)}catch(e){}
    const novos=(r.pings||[]).filter(p=>!S.pings.some(x=>x.id===p.id));
    novos.forEach(pingOrdem);
    if(novos.length){r.pings=novos;r.pings.forEach(p=>S.pings.push(p));pingSom(r.pings.some(p=>p.urgente));pingMostrar();pingTitulo()}
  }catch(e){}
}
let _pingTick=0;
setInterval(()=>{_pingTick++;pingBotao();if(document.visibilityState==='visible'||_pingTick%4===0)pingBuscar()},4000);
setTimeout(()=>{pingBotao();pingBuscar()},1500);

/* Som curto (dois bipes) e vibração no celular. */
function pingSom(urgente){
  try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=pingSom.ctx||(pingSom.ctx=new C());
    [0,0.18].concat(urgente?[0.36,0.54]:[]).forEach((t,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=i%2?880:660;
      g.gain.setValueAtTime(0.0001,ctx.currentTime+t);g.gain.exponentialRampToValueAtTime(0.18,ctx.currentTime+t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+t+0.15);
      o.connect(g).connect(ctx.destination);o.start(ctx.currentTime+t);o.stop(ctx.currentTime+t+0.16)})}catch(e){}
  try{navigator.vibrate&&navigator.vibrate(urgente?[120,60,120,60,120]:[120,60,120])}catch(e){}
}
/* Aba do navegador avisa quando há ping não lido. */
let _pingTitulo=null;
function pingTitulo(){if(_pingTitulo===null)_pingTitulo=document.title;document.title=S.pings.length?`(${S.pings.length}) Ping! · ${_pingTitulo}`:_pingTitulo}

function pingRaiz(){let el=document.getElementById('pings');if(!el){el=document.createElement('div');el.id='pings';el.setAttribute('aria-live','assertive');document.body.appendChild(el)}return el}
function pingMostrar(){
  const el=pingRaiz();
  el.innerHTML=S.pings.slice(-4).map(p=>{const hora=new Date(p.criado).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
    return `<div class="ping-pop ${p.urgente?'urg':''}" role="alertdialog" aria-label="Ping de ${h(p.de)}">
     <div class="ping-de"><b>${p.souMestre?h(p.de):'Mestre ('+h(p.de)+')'}</b>${p.agente?` · ${h(p.agente)}`:''}<span>${h(p.mesaNome||'')} · ${hora}${p.paraTodos?' · para todos':''}</span></div>
     <p class="ping-txt">${h(p.texto)}</p>
     <div class="row"><button class="btn sm acc" data-act="pingResp" data-id="${p.id}">Responder</button><button class="btn sm" data-act="pingOk" data-id="${p.id}">Ok</button></div></div>`}).join('')
    +(S.pings.length>4?`<div class="ping-mais">+${S.pings.length-4} ping(s) anteriores <button class="btn sm ghost" data-act="pingLimpar">Fechar todos</button></div>`:'');
}
/* Botão flutuante, só para quem está em alguma campanha no servidor. */
function pingBotao(){
  let b=document.getElementById('ping-btn');
  if(!pingAtivo()){if(b)b.remove();return}
  if(!b){b=document.createElement('button');b.id='ping-btn';b.className='btn acc';b.dataset.act='pingNovo';b.title='Mandar um ping (aviso rápido) para o mestre ou os jogadores';
    b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" fill="currentColor"/></svg><span>Ping</span>';document.body.appendChild(b)}
}

async function pingMembros(mid){if(!pingSouMestre(mid))return [];
  if(!S.pingMembros[mid]||Date.now()-S.pingMembros[mid].t>60e3){try{S.pingMembros[mid]={t:Date.now(),l:await Api.req('GET',`/api/mesas/${encodeURIComponent(mid)}/membros`)}}catch(e){return (S.pingMembros[mid]||{}).l||[]}}
  return S.pingMembros[mid].l}

/* Janela para escrever o ping. resp = ping ao qual se responde (define campanha e destinatário). */
async function pingCompor(resp){
  const ms=S.mesas||[];if(!ms.length){toast('Entre numa campanha para mandar pings.');return}
  const mesa=resp?ms.find(m=>m.id===resp.mesa)||pingMesaPadrao():pingMesaPadrao();S.pingMesa=mesa.id;
  const mestre=mesa.papel==='mestre';const membros=mestre?(await pingMembros(mesa.id)).filter(x=>x.papel!=='mestre'):[];
  const paraSel=resp&&mestre?(resp.deId||'todos'):'todos';
  const rapidos=PING_RAPIDOS[mestre?'mestre':'jogador'];
  modal(resp?'Responder ping':'Mandar ping',`<div class="modal-b ping-form">
   ${ms.length>1?fld('Campanha',`<select class="inp" id="ping-mesa">${ms.map(m=>opt(m.id,m.nome+(m.papel==='mestre'?' (mestre)':''),mesa.id)).join('')}</select>`):''}
   ${mestre?fld('Para',`<select class="inp" id="ping-para">${opt('todos','Todos os jogadores',paraSel)}${membros.map(x=>opt(x.id,x.usuario,paraSel)).join('')}</select>`):`<p class="hint" style="margin:0">Para: <b>${h(mesa.mestre||'o mestre')}</b> (mestre de ${h(mesa.nome)})</p>`}
   ${resp?`<blockquote class="ping-cit"><b>${h(resp.de)}:</b> ${h(resp.texto)}</blockquote>`:''}
   <div class="chips">${rapidos.map(t=>`<button class="btn sm" data-act="pingRapido" data-t="${h(t)}">${h(t)}</button>`).join('')}</div>
   <textarea class="inp" id="ping-txt" rows="3" maxlength="300" placeholder="Mensagem (até 300 caracteres)"></textarea>
   <label class="row" style="gap:6px;font-size:13px"><input type="checkbox" id="ping-urg"> Urgente (toca mais forte e destaca o aviso)</label>
   <div class="row"><button class="btn acc" data-act="pingEnviar">Enviar ping</button><button class="btn" data-act="closeModal">Cancelar</button></div></div>`);
  setTimeout(()=>{const t=document.getElementById('ping-txt');if(t)t.focus()},30);
}
async function pingEnviar(){
  const mid=(document.getElementById('ping-mesa')||{}).value||S.pingMesa;const txt=(document.getElementById('ping-txt')||{}).value||'';
  if(!txt.trim()){toast('Escreva a mensagem ou escolha uma das rápidas.');return}
  const para=(document.getElementById('ping-para')||{}).value;const urgente=!!(document.getElementById('ping-urg')||{}).checked;
  const f=F();const agente=f&&f.mesa===mid&&!pingSouMestre(mid)?f.nome:undefined;
  try{await Api.req('POST',`/api/mesas/${encodeURIComponent(mid)}/ping`,{texto:txt.trim(),para,urgente,agente});closeModal();
    const m=(S.mesas||[]).find(x=>x.id===mid);toast(pingSouMestre(mid)?(para&&para!=='todos'?'Ping enviado ao jogador.':'Ping enviado a todos os jogadores.'):`Ping enviado ao mestre${m&&m.mestre?' ('+m.mestre+')':''}.`)}
  catch(e){toast(e.message||'Não foi possível enviar o ping.')}
}
function pingTirar(id){S.pings=S.pings.filter(p=>String(p.id)!==String(id));pingMostrar();pingTitulo()}

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]');if(!t)return;const a=t.dataset.act;
  if(a==='pingNovo'){pingCompor();return}
  if(a==='pingOk'){pingTirar(t.dataset.id);return}
  if(a==='pingLimpar'){S.pings=[];pingMostrar();pingTitulo();return}
  if(a==='pingResp'){const p=S.pings.find(x=>String(x.id)===t.dataset.id);pingTirar(t.dataset.id);if(p)pingCompor(p);return}
  if(a==='pingRapido'){const el=document.getElementById('ping-txt');if(el){el.value=t.dataset.t;el.focus()}return}
  if(a==='pingEnviar'){pingEnviar();return}
});
document.addEventListener('change',e=>{if(e.target.id==='ping-mesa'){S.pingMesa=e.target.value;const m=(S.mesas||[]).find(x=>x.id===S.pingMesa);if(m)pingCompor({mesa:m.id,de:'',texto:''}).then(()=>{const q=document.querySelector('.ping-cit');if(q)q.remove()})}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)&&e.target.id==='ping-txt'){e.preventDefault();pingEnviar()}});

/* Ordens do mestre que chegam junto com o ping (só o servidor cria, e só a pedido do mestre da campanha). */
function pingOrdem(p){const o=p&&p.ordem;if(!o||p.souMestre)return;
  if(o.tipo==='rmItem'){const f=S.fichas[o.ficha];if(!f||f.mesa!==p.mesa)return;const antes=(f.inventario||[]).length;f.inventario=(f.inventario||[]).filter(x=>x.uid!==o.uid);
    if(f.inventario.length!==antes){saveF(f);if(F()===f)render()}}}
