/* ============================== JANELA DO GRUPO ==============================
   index.html?janela=grupo&mesa=ID: só os retratos dos agentes da campanha, com barra de PV e de Determinação
   (ou SAN), ícone do estado (bem, machucado, perturbado, caído, enlouquecendo, morto) e contadores.
   O mestre vê todos com números; o jogador vê conforme o que o mestre liberou no Grupo (e sempre o próprio). */
const JAN_ICON={
  normal:['Bem','#2e9b5a','<path d="M12 20.5s-7.2-4.4-9.4-9A5.4 5.4 0 0 1 12 5.6a5.4 5.4 0 0 1 9.4 5.9c-2.2 4.6-9.4 9-9.4 9z"/>'],
  machucado:['Machucado','#d2333f','<path d="M12 2.5s-6.2 7.1-6.2 11.3a6.2 6.2 0 0 0 12.4 0C18.2 9.6 12 2.5 12 2.5z"/>'],
  perturbado:['Perturbado','#3d8fb8','<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.3 5h2.6l-.4 7h-1.8zm1.3 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>'],
  caido:['Caído','#b8121f','<path d="M3 15.5h18v3H3zM6.5 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM10 10.5h8.5a2.5 2.5 0 0 1 2.5 2.5v1.5H10z"/>'],
  louco:['Enlouquecendo','#9a4dd6','<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 12m-1 0a1 1 0 1 1 2 0a3 3 0 1 1-6 0a5 5 0 1 1 10 0a7 7 0 1 1-14 0a9 9 0 0 1 9-9"/>'],
  morto:['Morto','#555','<path d="M12 2.5a8 8 0 0 0-8 8c0 2.9 1.4 4.9 3 6v3.5h10V16.5c1.6-1.1 3-3.1 3-6a8 8 0 0 0-8-8zM9 14a1.7 1.7 0 1 1 0-3.4A1.7 1.7 0 0 1 9 14zm6 0a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4zM10.5 18h1v2h-1zm2 0h1v2h-1z"/>']};
function abrirJanelaGrupo(mid){if(!mid){toast('Escolha uma campanha primeiro.');return}
  const w=window.open(location.pathname+'?janela=grupo&mesa='+encodeURIComponent(mid),'cristopher-grupo-'+mid,'width=980,height=360');
  if(!w)toast('O navegador bloqueou a janela. Permita pop-ups para este site e tente de novo.',6000)}
(function(){
  const q=new URLSearchParams(location.search);if(q.get('janela')!=='grupo')return;const mid=q.get('mesa');
  document.body.classList.add('janela');document.title='Grupo · Cristopher';
  const raiz=document.createElement('main');raiz.id='janela';raiz.setAttribute('aria-live','polite');document.body.appendChild(raiz);
  S._janEst={};let ultimo='';
  async function atualizar(){
    let r;try{r=await Api.req('GET',`/api/mesas/${encodeURIComponent(mid)}/grupo`)}catch(e){raiz.innerHTML=`<p class="jan-msg">${e.status===401?'Entre na sua conta na janela principal do Cristopher e recarregue esta.':h(e.message||'Sem conexão com o servidor.')}</p>`;return}
    const L=(r.membros||[]).slice().sort((a,b)=>(b.minha?1:0)-(a.minha?1:0)||String(a.nome).localeCompare(b.nome,'pt'));
    const chave=JSON.stringify(L);if(chave===ultimo)return;ultimo=chave;
    if(!L.length){raiz.innerHTML=`<p class="jan-msg">${r.modo==='oculto'?'O mestre não está mostrando o grupo agora.':'Nenhum agente ligado a esta campanha ainda.'}</p>`;return}
    raiz.innerHTML=L.map(x=>{const [rot,cor,svg]=JAN_ICON[x.estado]||JAN_ICON.normal;const mudou=S._janEst[x.id]&&S._janEst[x.id]!==x.estado;S._janEst[x.id]=x.estado;const s=x.sessao||{};
      return `<article class="jan-card est-${x.estado} ${mudou?'mudou':''}" aria-label="${h(x.nome)}: ${rot}">
        <div class="jan-fig">${retFiguraDe({nome:x.nome,est:x.estado,arte:x.arte})}<span class="jan-icone" style="--ic:${cor}" title="${rot}"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">${svg}</svg></span></div>
        <div class="jan-info"><b>${h(x.nome)}</b><small>${h(x.usuario)}${x.oculta?' · escondida do grupo':''}</small>
         ${x.pv||x.pe||x.san?`<div class="ret-barras">${grupoBarra(x,'pv','PV','pv')}${x.det?grupoBarra(x,'pe','PD','pe'):grupoBarra(x,'san','SAN','san')}</div>`:''}
         <span class="ret-cont"><span>Caiu <b>${s.quedas||0}</b></span><span>Enlouqueceu <b>${s.loucuras||0}</b></span></span></div></article>`}).join('');
    retAnimar();
  }
  atualizar();setInterval(()=>{if(document.visibilityState==='visible')atualizar()},3000);
})();
