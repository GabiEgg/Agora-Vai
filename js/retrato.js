/* ============================== RETRATO ==============================
   Portrait do agente: arte que muda com o estado (normal, machucado, perturbado, caído, louco, morto),
   barras de PV e de Determinação (ou PE e SAN) que se mexem quando os valores mudam,
   e contadores de quedas e enlouquecimentos na sessão (zerados em "Nova sessão"). */
const RET_ESTADOS=[['normal','Normal'],['machucado','Machucado'],['perturbado','Perturbado'],['caido','Caído'],['louco','Enlouquecendo'],['morto','Morto']];
const RET_NOME=Object.fromEntries(RET_ESTADOS);
/* Sem arte própria, o estado usa a mais próxima e um efeito por cima. */
const RET_RESERVA={machucado:['normal'],perturbado:['normal'],caido:['machucado','normal'],louco:['perturbado','normal'],morto:['caido','machucado','normal']};
const retDados=f=>{const r=f.retrato=f.retrato||{};r.arte=r.arte||{};r.sessao=r.sessao||{quedas:0,loucuras:0,desde:Date.now()};r.total=r.total||{quedas:0,loucuras:0};return r};
function retEstado(f,r){const rt=f.retrato||{};
  if(rt.morto)return 'morto';
  if(r.conds.has('morrendo')||r.conds.has('inconsciente'))return 'caido';
  if(r.conds.has('enlouquecendo'))return 'louco';
  if(r.conds.has('machucado'))return 'machucado';
  if(r.conds.has('perturbado'))return 'perturbado';
  return 'normal'}
function retArte(f,est){const a=(f.retrato||{}).arte||{};if(a[est])return {id:a[est],proprio:true};for(const k of RET_RESERVA[est]||[])if(a[k])return {id:a[k],proprio:false};return null}
const retSrc=id=>'/_blob/'+id;
/* Conta as quedas (entrar em morrendo) e os enlouquecimentos: chamado a cada salvamento da ficha. */
function retMonitor(f){
  if(!f||!f.classe)return;let r;try{r=calc(f)}catch(e){return}
  const caido=r.conds.has('morrendo'),louco=r.conds.has('enlouquecendo');const rt=retDados(f);
  /* Resumo público: é só isto (e o retrato) que os colegas de campanha recebem do servidor. */
  f.publico={estado:retEstado(f,r),det:!!r.det,pv:r.pv,pvMax:r.pvMax,pe:r.pe,peMax:r.peMax,san:r.san,sanMax:r.sanMax};
  if(!rt.ult){rt.ult={caido,louco};return}
  if(caido&&!rt.ult.caido){rt.sessao.quedas++;rt.total.quedas++}
  if(louco&&!rt.ult.louco){rt.sessao.loucuras++;rt.total.loucuras++}
  rt.ult={caido,louco};
}
/* Barras: guardam o valor anterior para animar a mudança depois de redesenhar. */
S._retAnt=S._retAnt||{};
function retBarras(f,r,cls=''){
  const bar=(k,l,col)=>{const max=r[k+'Max'];if(!max)return '';const cur=r[k];const pct=Math.max(0,Math.min(100,cur/max*100));const chave=f.id+':'+k;const ant=S._retAnt[chave];S._retAnt[chave]=pct;
    const mud=ant==null||ant===pct?'':ant>pct?'perde':'ganha';
    return `<div class="ret-bar ${mud}" style="--c:var(--${col})" title="${l} ${cur}/${max}"><span class="ret-bl">${l}</span><span class="ret-bv">${cur}/${max}</span><div class="ret-trilho"><i data-ret-de="${ant??pct}" data-ret-para="${pct}" style="width:${ant??pct}%"></i></div></div>`};
  return `<div class="ret-barras ${cls}">${bar('pv','PV','pv')}${r.det?bar('pe','PD','pe'):bar('san','SAN','san')+bar('pe','PE','pe')}</div>`}
function retFigura(f,r,{grande=false}={}){return retFiguraDe({nome:f.nome,est:retEstado(f,r),arte:(f.retrato||{}).arte,grande})}
function retFiguraDe({nome,est,arte,grande=false}){
  const art=retArte({retrato:{arte:arte||{}}},est);const ini=String(nome||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();const f={nome};
  return `<div class="ret-fig est-${est} ${art&&!art.proprio?'reserva':''} ${art?'':'vazia'} ${grande?'grande':''}">
    ${art?`<img src="${retSrc(art.id)}" alt="Retrato de ${h(f.nome||'agente')}: ${RET_NOME[est]}" loading="lazy">`:`<span class="ret-ini" aria-hidden="true">${h(ini)}</span>`}
    <span class="ret-est">${RET_NOME[est]}</span></div>`}
function retContadores(f,{curto=false}={}){const s=((f.retrato||{}).sessao)||{quedas:0,loucuras:0};const t=((f.retrato||{}).total)||{quedas:0,loucuras:0};
  return curto?`<span class="ret-cont" title="Nesta sessão: ${s.quedas} queda(s) e ${s.loucuras} enlouquecimento(s). No total: ${t.quedas} e ${t.loucuras}."><span>Caiu <b>${s.quedas}</b></span><span>Enlouqueceu <b>${s.loucuras}</b></span></span>`
   :`<div class="ret-conts"><div><b>${s.quedas}</b><span>quedas nesta sessão</span><small>${t.quedas} no total</small></div><div><b>${s.loucuras}</b><span>vezes enlouqueceu nesta sessão</span><small>${t.loucuras} no total</small></div></div>`}
/* Versão compacta na faixa de vida (todas as abas). Clique abre o retrato completo. */
function retratoMini(f,r){if(!f.classe)return '';
  return `<button class="ret-mini" data-act="retAbrir" title="Retrato de ${h(f.nome||'agente')}: clique para ver, trocar as artes ou começar nova sessão">${retFigura(f,r)}${retContadores(f,{curto:true})}</button>`}
/* Janela do retrato: grande, barras, contadores, artes por estado. */
function retratoModal(){const f=F();if(!f)return;const r=calc(f);const rt=retDados(f);const ro=!!f._alheia&&!f._mestre;
  modal('Retrato · '+(f.nome||'Agente'),`<div class="modal-b ret-modal">
   <div class="ret-topo">${retFigura(f,r,{grande:true})}<div class="ret-lado">${retBarras(f,r,'grandes')}${retContadores(f)}
     ${ro?'':`<div class="row"><button class="btn sm" data-act="retSessao">${S.retConf?'Confirmar: zerar contadores da sessão':'Nova sessão'}</button><button class="btn sm ${rt.morto?'acc':'ghost danger'}" data-act="retMorto">${rt.morto?'Reviver (tirar “morto”)':'Marcar como morto'}</button></div>
     <p class="hint" style="margin:0">Quedas contam cada vez que o agente entra em <i>morrendo</i>; enlouquecimentos, cada vez que entra em <i>enlouquecendo</i>. “Nova sessão” zera os da sessão e mantém o total.</p>`}</div></div>
   ${ro?'':`<h3 class="eyebrow" style="margin:6px 0 0">Artes por estado</h3>
   <p class="hint" style="margin:0">Opcional. Sem arte própria, o estado usa a mais próxima (ex.: caído usa machucado ou normal) com um efeito por cima. ${S.assets?'':'Envio de imagens indisponível aqui: entre na sua conta do servidor.'}</p>
   <div class="ret-artes">${RET_ESTADOS.map(([k,l])=>{const id=rt.arte[k];return `<div class="ret-slot ${retEstado(f,r)===k?'atual':''}"><div class="ret-thumb">${id?`<img src="${retSrc(id)}" alt="${l}">`:'<span>sem arte</span>'}</div><b>${l}</b>
      <div class="row">${S.assets?`<button class="btn sm" data-act="retArte" data-k="${k}">${id?'Trocar':'Enviar'}</button>`:''}${id?`<button class="btn sm ghost danger" data-act="retArteTirar" data-k="${k}" aria-label="Tirar arte ${l}">✕</button>`:''}</div></div>`}).join('')}</div>`}</div>`);
  retAnimar();
}
/* Depois de redesenhar: anima as barras do valor anterior para o novo. */
function retAnimar(){requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelectorAll('[data-ret-para]').forEach(i=>{if(i.dataset.retDe!==i.dataset.retPara)i.style.width=i.dataset.retPara+'%'})))}

document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]');if(!t)return;const a=t.dataset.act;const f=F();if(!f)return;
  if(a==='retAbrir'){S.retConf=false;retratoModal();return}
  if(f._alheia&&!f._mestre)return;
  if(a==='retSessao'){if(!S.retConf){S.retConf=true;retratoModal();return}S.retConf=false;const rt=retDados(f);rt.sessao={quedas:0,loucuras:0,desde:Date.now()};saveF();render();retratoModal();toast('Nova sessão: contadores zerados.');return}
  if(a==='retMorto'){const rt=retDados(f);rt.morto=!rt.morto;saveF();render();retratoModal();return}
  if(a==='retArte'){const k=t.dataset.k;upload(id=>{retDados(f).arte[k]=id;saveF();render();retratoModal()});return}
  if(a==='retArteTirar'){delete retDados(f).arte[t.dataset.k];saveF();render();retratoModal();return}
});

/* ============================== GRUPO ==============================
   Jogadores veem os colegas da mesma campanha: retrato, estado e contadores; as barras dependem do mestre:
   numeros (barras com números), barras (só a barra), sem (sem barras), oculto (jogadores não veem o grupo). */
const GRUPO_MODOS=[['numeros','Retrato, barras e números'],['barras','Retrato e barras (sem números)'],['sem','Só retrato e estado (sem barras)'],['oculto','Nada: jogadores não veem o grupo']];
S.grupo={};
async function grupoBuscar(mid,forcar){if(!mid||!(S.conta&&S.conta.usuario))return;const g=S.grupo[mid];if(!forcar&&g&&Date.now()-g.t<10e3)return;
  try{const r=await Api.req('GET',`/api/mesas/${encodeURIComponent(mid)}/grupo`);const antes=JSON.stringify(g&&g.r);S.grupo[mid]={t:Date.now(),r};
    if(antes!==JSON.stringify(r)&&(S.view==='ficha'||S.view==='escudo')){const ae=document.activeElement;if(!(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName)))render()}}
  catch(e){S.grupo[mid]={t:Date.now(),r:null}}}
function grupoBarra(x,k,l,col){const b=x[k];if(!b)return '';const pct=b.pct!=null?b.pct:Math.max(0,Math.min(100,b.v/b.max*100));
  const ch='g:'+x.id+':'+k;const ant=S._retAnt[ch];S._retAnt[ch]=pct;const mud=ant==null||ant===pct?'':ant>pct?'perde':'ganha';
  return `<div class="ret-bar mini ${mud}" style="--c:var(--${col})" title="${l}${b.v!=null?` ${b.v}/${b.max}`:''}"><span class="ret-bl">${l}</span>${b.v!=null?`<span class="ret-bv">${b.v}/${b.max}</span>`:''}<div class="ret-trilho"><i data-ret-de="${ant??pct}" data-ret-para="${pct}" style="width:${ant??pct}%"></i></div></div>`}
function grupoCard(x){const s=x.sessao||{};
  return `<div class="grupo-card est-${x.estado}"><button class="ret-zoom-btn" data-act="retZoom" data-src="g" data-id="${h(x.id||'')}" title="Ver ${h(x.nome)} em tamanho grande" aria-label="Ampliar retrato de ${h(x.nome)}">${retFiguraDe({nome:x.nome,est:x.estado,arte:x.arte})}</button>
    <div class="grupo-info"><b>${h(x.nome)}</b><small>${h(x.usuario)}</small>
     ${x.pv||x.pe||x.san?`<div class="ret-barras">${grupoBarra(x,'pv','PV','pv')}${x.det?grupoBarra(x,'pe','PD','pe'):grupoBarra(x,'san','SAN','san')}</div>`:''}
     <span class="ret-cont"><span>Caiu <b>${s.quedas||0}</b></span><span>Enlouqueceu <b>${s.loucuras||0}</b></span></span></div></div>`}
/* Faixa na ficha do jogador, abaixo das barras. */
function grupoFaixa(f){if(!f||f._alheia||!f.mesa||!(S.conta&&S.conta.usuario))return '';
  const g=S.grupo[f.mesa];if(!g){grupoBuscar(f.mesa);return ''}const r=g.r;if(!r||r.modo==='oculto')return '';
  const outros=(r.membros||[]).filter(x=>x.id!==f.id);if(!outros.length)return '';
  return `<div class="grupo-faixa" aria-label="Grupo da campanha"><span class="eyebrow">Grupo</span><div class="grupo-lista">${outros.map(grupoCard).join('')}</div></div>`}
/* Mestre: escolhe o que os jogadores veem (Escudo → Agentes). */
function grupoModoSel(mid){const g=S.grupo[mid];if(!g){grupoBuscar(mid);return ''}const modo=(g.r&&g.r.modo)||'barras';
  return `<label class="row grupo-modo" style="gap:6px;font-size:13px">Os jogadores veem do grupo: <select class="inp" data-grupo-modo="${h(mid)}">${GRUPO_MODOS.map(([k,l])=>opt(k,l,modo)).join('')}</select></label>`}
document.addEventListener('change',async e=>{const m=e.target.dataset&&e.target.dataset.grupoModo;if(!m)return;
  try{await Api.req('PUT',`/api/mesas/${encodeURIComponent(m)}/grupo`,{modo:e.target.value});await grupoBuscar(m,true);toast('Pronto: '+(GRUPO_MODOS.find(x=>x[0]===e.target.value)||[])[1]+'.')}catch(err){toast(err.message||'Não foi possível salvar.')}});
/* Atualiza o grupo a cada 12 s com a ficha aberta. */
setInterval(()=>{if(document.visibilityState!=='visible'||S.view!=='ficha')return;const f=F();if(f&&f.mesa&&!f._alheia)grupoBuscar(f.mesa,true)},12000);

/* ============================== ZOOM ==============================
   Clique num retrato do Grupo (ou do Escudo → Agentes) para ver grande.
   Clique na imagem amplia o ponto clicado; roda do mouse/pinça ajusta; arrastar move; Esc ou fora fecha. */
function retZoomDados(src,id){
  if(src==='g'){const f=F();const g=f&&S.grupo[f.mesa];const x=g&&g.r&&(g.r.membros||[]).find(m=>m.id===id);return x?{nome:x.nome,usuario:x.usuario,est:x.estado,arte:x.arte||{}}:null}
  if(src==='a'){const d=S.mesaDados;const x=d&&d.fichas[+id];if(!x)return null;const f=migrar(clone(x.ficha));let r;try{r=calc(f)}catch(e){return null}return {nome:f.nome,usuario:x.usuario,est:retEstado(f,r),arte:(f.retrato||{}).arte||{}}}
  return null}
function retZoomAbrir(d,est){if(!d)return;S.retZoom={...d,ver:est||d.est};retZoomDesenhar()}
function retZoomDesenhar(){const z=S.retZoom;let el=document.getElementById('ret-zoom');
  if(!z){if(el)el.remove();document.removeEventListener('keydown',retZoomTecla);return}
  if(!el){el=document.createElement('div');el.id='ret-zoom';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);document.addEventListener('keydown',retZoomTecla)}
  el.setAttribute('aria-label','Retrato de '+(z.nome||'agente'));
  const art=retArte({retrato:{arte:z.arte}},z.ver);const outras=RET_ESTADOS.filter(([k])=>z.arte[k]);
  el.innerHTML=`<div class="rz-fundo" data-act="retZoomFechar"></div>
   <figure class="rz-fig">${art?`<div class="rz-palco"><img id="rz-img" src="${retSrc(art.id)}" alt="Retrato de ${h(z.nome)}: ${RET_NOME[z.ver]}" draggable="false"></div>`:`<div class="rz-vazio">${retFiguraDe({nome:z.nome,est:z.ver,arte:{},grande:true})}<p>${h(z.nome)} ainda não tem arte${outras.length?' para este estado':''}.</p></div>`}
    <figcaption><b>${h(z.nome)}</b>${z.usuario?` <small>${h(z.usuario)}</small>`:''} · ${RET_NOME[z.ver]}${art&&!art.proprio?' <small>(arte de outro estado)</small>':''}${z.ver===z.est?' <span class="badge acc">agora</span>':''}
     ${art?'<span class="hint rz-dica">Clique na imagem para ampliar · roda do mouse ou pinça ajusta · arraste para mover</span>':''}</figcaption>
    ${outras.length>1||(outras.length&&!z.arte[z.ver])?`<div class="rz-estados">${outras.map(([k,l])=>`<button class="rz-mini ${k===z.ver?'on':''}" data-act="retZoomVer" data-k="${k}" aria-pressed="${k===z.ver}"><img src="${retSrc(z.arte[k])}" alt=""><span>${l}</span></button>`).join('')}</div>`:''}
   </figure><button class="btn sm rz-fechar" data-act="retZoomFechar" aria-label="Fechar">✕</button>`;
  const img=document.getElementById('rz-img');if(img)retZoomGestos(img);
  const b=el.querySelector('.rz-fechar');if(b)b.focus();
}
function retZoomTecla(e){if(e.key==='Escape'){S.retZoom=null;retZoomDesenhar()}}
/* Zoom e arrasto da imagem (mouse, roda e toque). */
function retZoomGestos(img){
  const st={s:1,x:0,y:0};const pal=img.parentElement;
  const aplicar=()=>{st.s=Math.max(1,Math.min(5,st.s));if(st.s===1){st.x=0;st.y=0}
    const W=pal.clientWidth,H=pal.clientHeight,lx=W*(st.s-1)/2,ly=H*(st.s-1)/2;st.x=Math.max(-lx,Math.min(lx,st.x));st.y=Math.max(-ly,Math.min(ly,st.y));
    img.style.transform=`translate(${st.x}px,${st.y}px) scale(${st.s})`;img.classList.toggle('ampliada',st.s>1)};
  const focar=(cx,cy,ns)=>{const r=pal.getBoundingClientRect();const px=cx-r.left-r.width/2,py=cy-r.top-r.height/2;const k=ns/st.s;st.x=px-(px-st.x)*k;st.y=py-(py-st.y)*k;st.s=ns;aplicar()};
  let arr=null,moveu=false;const toques=new Map();let pinca=null;
  img.addEventListener('pointerdown',e=>{img.setPointerCapture(e.pointerId);toques.set(e.pointerId,{x:e.clientX,y:e.clientY});moveu=false;
    if(toques.size===2){const [a,b]=[...toques.values()];pinca={d:Math.hypot(a.x-b.x,a.y-b.y),s:st.s};arr=null}else arr={x:e.clientX,y:e.clientY,ox:st.x,oy:st.y}});
  img.addEventListener('pointermove',e=>{if(!toques.has(e.pointerId))return;toques.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinca&&toques.size===2){const [a,b]=[...toques.values()];focar((a.x+b.x)/2,(a.y+b.y)/2,pinca.s*Math.hypot(a.x-b.x,a.y-b.y)/pinca.d);moveu=true;return}
    if(arr&&st.s>1){const dx=e.clientX-arr.x,dy=e.clientY-arr.y;if(Math.abs(dx)+Math.abs(dy)>3)moveu=true;st.x=arr.ox+dx;st.y=arr.oy+dy;aplicar()}});
  const fim=e=>{toques.delete(e.pointerId);if(toques.size<2)pinca=null;
    if(arr&&!moveu&&e.type==='pointerup')focar(e.clientX,e.clientY,st.s>1?1:2.5);arr=null};
  img.addEventListener('pointerup',fim);img.addEventListener('pointercancel',fim);
  pal.addEventListener('wheel',e=>{e.preventDefault();focar(e.clientX,e.clientY,st.s*(e.deltaY<0?1.2:1/1.2))},{passive:false});
  aplicar();
}
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t)return;const a=t.dataset.act;
  if(a==='retZoom'){retZoomAbrir(retZoomDados(t.dataset.src,t.dataset.id));return}
  if(a==='retZoomVer'){if(S.retZoom){S.retZoom.ver=t.dataset.k;retZoomDesenhar()}return}
  if(a==='retZoomFechar'){S.retZoom=null;retZoomDesenhar();return}});
