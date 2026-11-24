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
/* Opções da janela: estilo (cartoes | transmissao), fundo (normal | transparente), tamanho (p | m | g). Ficam na URL e no navegador. */
function janOpcoes(){const q=new URLSearchParams(location.search);let g={};try{g=JSON.parse(localStorage.getItem('cristopher-janela')||'{}')}catch(e){}
  return {estilo:q.get('estilo')||g.estilo||'cartoes',fundo:q.get('fundo')||g.fundo||'normal',tam:q.get('tam')||g.tam||'m'}}
function janSalvar(o){try{localStorage.setItem('cristopher-janela',JSON.stringify(o))}catch(e){}const q=new URLSearchParams(location.search);['estilo','fundo','tam'].forEach(k=>q.set(k,o[k]));history.replaceState(null,'','?'+q.toString())}
/* Um agente no estilo transmissão: arte recortada, números grandes com brilho (PV, SAN ou PD, e PE no canto). */
function janStream(x){const art=retArte({retrato:{arte:x.arte||{}}},x.estado);const [rot,cor,svg]=JAN_ICON[x.estado]||JAN_ICON.normal;
  const ini=String(x.nome||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const kd={pv:'pv',san:'san',pd:'pe',pe:'pe'};
  const num=(b,cls,tit)=>!b?'':b.v!=null?`<button class="js-num ${cls} jan-ed" data-ed="${kd[cls]}" data-id="${h(x.id)}" title="${tit}: clique para alterar">${b.v}/${b.max}</button>`:`<span class="js-bar ${cls}" title="${tit}"><i style="width:${b.pct}%"></i></span>`;
  const pe=x.pe&&!x.det?x.pe:null;
  return `<article class="js-ag est-${x.estado}" aria-label="${h(x.nome)}: ${rot}">
    <div class="js-arte ${art&&!art.proprio?'reserva':''}">${art?`<img src="${retSrc(art.id)}" alt="">`:`<span class="js-ini">${h(ini)}</span>`}</div>
    <div class="js-nums">${num(x.pv,'pv','Vida')}${x.det?num(x.pe,'pd','Determinação'):num(x.san,'san','Sanidade')}</div>
    ${pe?`<button class="js-num pe js-pe jan-ed" data-ed="pe" data-id="${h(x.id)}" title="Pontos de esforço: clique para alterar">${pe.v!=null?pe.v:''}</button>`:''}
    <span class="js-est" style="--ic:${cor}" title="${rot}"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">${svg}</svg></span>
    <span class="js-nome">${h(x.nome)}</span></article>`}
(function(){
  const q=new URLSearchParams(location.search);if(q.get('janela')!=='grupo')return;const mid=q.get('mesa');
  document.body.classList.add('janela');document.title='Grupo · Cristopher';
  let O=janOpcoes();const aplicarO=()=>{document.body.classList.toggle('jan-transp',O.fundo==='transparente');document.documentElement.classList.toggle('jan-transp',O.fundo==='transparente');document.body.dataset.janTam=O.tam;document.body.dataset.janEstilo=O.estilo};aplicarO();
  const barra=document.createElement('div');barra.className='jan-opcoes';barra.innerHTML=`<label>Estilo <select data-jo="estilo"><option value="cartoes">Cartões</option><option value="transmissao">Transmissão</option></select></label>
    <label>Fundo <select data-jo="fundo"><option value="normal">Normal</option><option value="transparente">Transparente (OBS)</option></select></label>
    <label>Tamanho <select data-jo="tam"><option value="p">Pequeno</option><option value="m">Médio</option><option value="g">Grande</option></select></label>`;
  document.body.appendChild(barra);barra.querySelectorAll('select').forEach(sel=>{sel.value=O[sel.dataset.jo];sel.addEventListener('change',()=>{O={...O,[sel.dataset.jo]:sel.value};janSalvar(O);aplicarO();ultimo='';atualizar()})});
  const raiz=document.createElement('main');raiz.id='janela';raiz.setAttribute('aria-live','polite');document.body.appendChild(raiz);
  S._janEst={};let ultimo='';let dados=null;let mestre=null;
  async function atualizar(){
    if(mestre===null){try{const ms=await Api.req('GET','/api/mesas');const m=ms.find(z=>z.id===mid);mestre=!!m&&m.papel==='mestre';document.title=(m?m.nome+' · ':'')+'Grupo · Cristopher'}catch(e){if(e.status===401){raiz.innerHTML='<p class="jan-msg">Entre na sua conta na janela principal do Cristopher e recarregue esta.</p>';return}}}
    if(!mestre){raiz.innerHTML='<p class="jan-msg">Esta janela é só para o mestre da campanha.</p>';barra.remove();return}
    let r;try{r=await Api.req('GET',`/api/mesas/${encodeURIComponent(mid)}/grupo`)}catch(e){raiz.innerHTML=`<p class="jan-msg">${e.status===401?'Entre na sua conta na janela principal do Cristopher e recarregue esta.':h(e.message||'Sem conexão com o servidor.')}</p>`;return}
    dados=r;const L=(r.membros||[]).slice().sort((a,b)=>(b.minha?1:0)-(a.minha?1:0)||String(a.nome).localeCompare(b.nome,'pt'));
    const chave=O.estilo+JSON.stringify(L);if(chave===ultimo)return;ultimo=chave;
    if(!L.length){raiz.innerHTML=`<p class="jan-msg">${r.modo==='oculto'?'O mestre não está mostrando o grupo agora.':'Nenhum agente ligado a esta campanha ainda.'}</p>`;return}
    if(O.estilo==='transmissao'){raiz.innerHTML=L.map(x=>{const mudou=S._janEst[x.id]&&S._janEst[x.id]!==x.estado;S._janEst[x.id]=x.estado;return janStream(x).replace('class="js-ag','class="js-ag'+(mudou?' mudou':''))}).join('');return}
    raiz.innerHTML=L.map(x=>{const [rot,cor,svg]=JAN_ICON[x.estado]||JAN_ICON.normal;const mudou=S._janEst[x.id]&&S._janEst[x.id]!==x.estado;S._janEst[x.id]=x.estado;const s=x.sessao||{};
      return `<article class="jan-card est-${x.estado} ${mudou?'mudou':''}" aria-label="${h(x.nome)}: ${rot}">
        <div class="jan-fig">${retFiguraDe({nome:x.nome,est:x.estado,arte:x.arte})}<span class="jan-icone" style="--ic:${cor}" title="${rot}"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">${svg}</svg></span></div>
        <div class="jan-info"><b>${h(x.nome)}</b><small>${h(x.usuario)}${x.oculta?' · escondida do grupo':''}</small>
         ${x.pv||x.pe||x.san?`<div class="ret-barras">${['pv',...(x.det?['pe']:['san','pe'])].map(k=>x[k]?`<div class="jan-ed-wrap">${grupoBarra(x,k,{pv:'PV',pe:x.det?'PD':'PE',san:'SAN'}[k],{pv:'pv',pe:'pe',san:'san'}[k])}<button class="jan-ed jan-ed-mini" data-ed="${k}" data-id="${h(x.id)}" aria-label="Alterar ${k.toUpperCase()} de ${h(x.nome)}">✎</button></div>`:'').join('')}</div>`:''}
         <span class="ret-cont"><span>Caiu <b>${s.quedas||0}</b></span><span>Enlouqueceu <b>${s.loucuras||0}</b></span></span></div></article>`}).join('');
    retAnimar();
  }
  /* Mestre altera PV/PE/SAN/PD: −15, +8, =20 ou 2d6 (sem sinal = perde). */
  const pop=document.createElement('form');pop.className='jan-pop';pop.hidden=true;pop.innerHTML='<label><span></span><input name="v" autocomplete="off" placeholder="−15, +8, =20, 2d6"></label><button class="btn sm acc">Aplicar</button><button type="button" class="btn sm ghost" data-x>✕</button>';document.body.appendChild(pop);
  let edAlvo=null;
  document.addEventListener('click',e=>{const t=e.target.closest('.jan-ed');if(t&&dados){const x=(dados.membros||[]).find(z=>z.id===t.dataset.id);const k=t.dataset.ed;const b=x&&x[k];if(!b||b.v==null)return;
      edAlvo={x,k,b};pop.querySelector('span').textContent=`${x.nome}: ${{pv:'PV',pe:x.det?'PD':'PE',san:'SAN'}[k]} ${b.v}/${b.max}`;const rc=t.getBoundingClientRect();pop.hidden=false;
      pop.style.left=Math.min(innerWidth-pop.offsetWidth-8,Math.max(8,rc.left))+'px';pop.style.top=Math.min(innerHeight-pop.offsetHeight-8,rc.bottom+6)+'px';const i=pop.querySelector('input');i.value='';i.focus();return}
    if(e.target.closest('[data-x]')||(!e.target.closest('.jan-pop')&&!pop.hidden)){pop.hidden=true;edAlvo=null}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){pop.hidden=true;edAlvo=null}});
  pop.addEventListener('submit',async e=>{e.preventDefault();if(!edAlvo)return;const s=String(pop.v.value||'').trim().replace(',','.');if(!s)return;
    let modo='-',corpo=s;if(/^[=+\-−]/.test(s)){modo=s[0]==='−'?'-':s[0];corpo=s.slice(1)}const x=rollExpr(corpo);if(!corpo||isNaN(x.total)){toast('Use algo como -15, +8, =20 ou 2d6.');return}
    const {b,k}=edAlvo;const novo=modo==='='?x.total:modo==='+'?Math.min(b.max,b.v+x.total):b.v-x.total;
    try{const r=await Api.req('POST',`/api/mesas/${encodeURIComponent(mid)}/fichavital`,{ficha:edAlvo.x.id,k,valor:novo});pop.hidden=true;edAlvo=null;ultimo='';await atualizar();
      toast(`${{pv:'PV',pe:'PE/PD',san:'SAN'}[k]}: ${r.valor}${r.max?'/'+r.max:''}${/d/i.test(corpo)?' ('+x.txt+')':''}`)}catch(err){toast(err.message||'Não foi possível alterar.')}});
  atualizar();setInterval(()=>{if(document.visibilityState==='visible'&&pop.hidden)atualizar()},3000);
})();
