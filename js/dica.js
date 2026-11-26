/* ============================== DICAS (janela ao passar o mouse) ==============================
   Qualquer elemento com data-dica="tipo:id" mostra uma janela com tudo sobre o conteúdo:
   rituais, poderes, itens, origens, trilhas, classes, modificações, condições, aliados e elementos.
   No celular (sem mouse), segurar o dedo por meio segundo abre a mesma janela. */
const DICA_ROT={rituais:'Ritual',poderes:'Poder',itens:'Item',origens:'Origem',trilhas:'Trilha',classes:'Classe',modificacoes:'Modificação',condicoes:'Condição',aliados:'Aliado',elementos:'Elemento'};
function dicaDado(t,id){if(t==='elementos')return ELEM_INFO[id]||null;return byId(t,id)}
function dicaLinhas(pares){return pares.filter(([,v])=>v!=null&&v!=='').map(([k,v])=>`<div class="dica-l"><b>${h(k)}</b> ${v}</div>`).join('')}
const dicaP=(t,cls='')=>t?`<p class="${cls}">${h(t)}</p>`:'';
function dicaHtml(t,x){if(!x)return '';const els=(x.elementos||[x.elemento]).filter(Boolean);
  let corpo='';const meta=[];
  switch(t){
   case 'rituais':meta.push(`${x.circulo}º círculo`,`${CUSTO_CIRC[+x.circulo]||0} PE`);
    corpo=dicaLinhas([['Execução',h(x.execucao||'')],['Alcance',h(x.alcance||'')],['Alvo',h(x.alvo||'')],['Duração',h(x.duracao||'')],['Resistência',h(x.resistencia||'')],
      ['Dano',x.dano?h(x.dano+(x.tipoDano?' de '+x.tipoDano:'')):'']])
     +dicaP(x.desc)+(x.discente?`<p><b>Discente:</b> ${h(x.discente)}${x.danoD?` (dano ${h(x.danoD)})`:''}</p>`:'')+(x.verdadeiro?`<p><b>Verdadeiro:</b> ${h(x.verdadeiro)}${x.danoV?` (dano ${h(x.danoV)})`:''}</p>`:'');break;
   case 'poderes':meta.push(tipoPoderNome(x.tipo));
    corpo=dicaLinhas([['Pré-requisitos',h(x.prereq||'')]])+dicaP(x.desc)+(x.afinidade?`<p><b>Com afinidade:</b> ${h(x.afinidade)}</p>`:'');break;
   case 'itens':meta.push(TIPO_ITEM[x.tipo]||x.tipo,'Cat. '+(CAT_NOME[+x.cat||0]||x.cat),(x.esp??1)+' esp.');
    corpo=dicaLinhas([['Dano',x.dano?h(x.dano+(x.critico?' · '+x.critico:'')+(x.tipoDano?' · '+x.tipoDano:'')):''],['Alcance',x.alcance?h(ALCANCE[x.alcance]||x.alcance):''],
      ['Proficiência',h(x.proficiencia||'')],['Defesa',x.defesa?'+'+h(x.defesa):''],['Pente',x.pente?h(x.pente)+' balas':'']])+dicaP(x.desc);break;
   case 'origens':{const per=(x.pericias||[]).map(perNome).join(', ');
    corpo=dicaLinhas([['Perícias treinadas',h(per+(x.periciasNota?' '+x.periciasNota:''))]])
     +(x.poderNome||x.poderDesc?`<p><b>${h(x.poderNome||'Poder')}:</b> ${h(x.poderDesc||'')}</p>`:'')+dicaP(x.desc)
     +((x.opcoes||[]).length?`<p><b>Variantes:</b> ${x.opcoes.map(o=>h(o.nome)).join(', ')}</p>`:'');break}
   case 'trilhas':{const c=byId('classes',x.classe);if(c)meta.push(c.nome);
    corpo=dicaP(x.desc,'hint')+(x.habilidades||[]).map(hb=>`<p><b>${hb.nex>=10?'NEX '+hb.nex+'%':'Estágio '+hb.nex} · ${h(hb.nome)}:</b> ${h(hb.desc||'')}</p>`).join('');break}
   case 'classes':corpo=dicaP(x.desc,'hint')+dicaLinhas([['PV',`${h(x.pvBase)} + Vigor (+${h(x.pvNex)} + Vigor por NEX)`],['PE',`${h(x.peBase)} + Presença (+${h(x.peNex)} + Presença por NEX)`],
      ['Sanidade',`${h(x.sanBase)} (+${h(x.sanNex)} por NEX)`],['Perícias',h([(x.periciasFixas||[]).map(perNome).join(', '),x.periciasEscolha,x.periciasLivres?`${x.periciasLivres} + Intelecto à escolha`:''].filter(Boolean).join(' · '))],
      ['Proficiências',h(x.proficiencias||'')]])
     +(x.habilidades||[]).map(hb=>`<p><b>${h(hb.nome)}${hb.nex>5?' (NEX '+hb.nex+'%)':''}:</b> ${h(hb.desc||'')}</p>`).join('');break;
   case 'modificacoes':meta.push(x.maldicao?'Maldição':'Modificação',MOD_APLICA[x.aplica]||x.aplica||'');corpo=dicaP(x.desc);break;
   case 'condicoes':meta.push(x.tipo?(TIPO_COND[x.tipo]||x.tipo):'');corpo=dicaP(x.desc);break;
   case 'aliados':corpo=dicaP(x.desc)+(x.bonus?`<p><b>Bônus:</b> ${h(x.bonus)}</p>`:'')+(x.habilidade?`<p><b>Habilidade:</b> ${h(x.habilidade)}</p>`:'');break;
   case 'elementos':meta.push(x.tipo==='fusao'?'Fusão de '+(x.componentes||[]).map(c=>ELEM[c]||c).join(' + '):'Elemento');
    corpo=dicaLinhas([['Forte contra',x.vence?h(ELEM[x.vence]||x.vence):''],['Fraco contra',x.fraco?h(ELEM[x.fraco]||x.fraco):'']])+dicaP(x.desc)
     +(x.propriedades?`<p><b>Propriedades:</b> ${h(x.propriedades)}</p>`:'')+(x.sintomas?`<p><b>Exposição:</b> ${h(x.sintomas)}</p>`:'');break;
  }
  return `<div class="dica-h"><span class="eyebrow">${h(DICA_ROT[t]||'')}</span><b>${h(x.nome||'')}</b>${t==='elementos'?elBadge(x.id):els.map(elBadge).join('')}${fonteBadge(x)||''}</div>
   ${meta.filter(Boolean).length?`<div class="meta">${meta.filter(Boolean).map(m=>`<span>${h(m)}</span>`).join('')}</div>`:''}<div class="dica-c">${corpo||'<p class="hint">Sem descrição.</p>'}</div>`}

let _dicaEl=null,_dicaAlvo=null,_dicaT=0;
function dicaPainel(){if(!_dicaEl){_dicaEl=document.createElement('div');_dicaEl.className='dica';_dicaEl.setAttribute('role','tooltip');_dicaEl.hidden=true;document.body.appendChild(_dicaEl)}return _dicaEl}
function dicaMostrar(alvo){const [t,...r]=String(alvo.dataset.dica||'').split(':');const id=r.join(':');const x=dicaDado(t,id);if(!x)return;
  const el=dicaPainel();el.innerHTML=dicaHtml(t,x);el.hidden=false;_dicaAlvo=alvo;
  const b=alvo.getBoundingClientRect(),vw=innerWidth,vh=innerHeight;el.style.maxHeight=(vh-16)+'px';
  const w=el.offsetWidth,hh=el.offsetHeight;let left,top;
  /* Prefere ao lado (direita, depois esquerda); senão abaixo ou acima. */
  if(b.right+8+w<=vw-8){left=b.right+8;top=Math.max(8,Math.min(b.top,vh-hh-8))}
  else if(b.left-8-w>=8){left=b.left-8-w;top=Math.max(8,Math.min(b.top,vh-hh-8))}
  else{left=Math.min(Math.max(8,b.left),vw-w-8);top=b.bottom+6+hh<=vh-8?b.bottom+6:Math.max(8,b.top-hh-6)}
  el.style.left=left+'px';el.style.top=top+'px'}
function dicaEsconder(){clearTimeout(_dicaT);if(_dicaEl)_dicaEl.hidden=true;_dicaAlvo=null}
document.addEventListener('mouseover',e=>{const a=e.target.closest&&e.target.closest('[data-dica]');if(!a||a===_dicaAlvo)return;
  clearTimeout(_dicaT);_dicaT=setTimeout(()=>dicaMostrar(a),_dicaAlvo?60:280)});
document.addEventListener('mouseout',e=>{const a=e.target.closest&&e.target.closest('[data-dica]');if(!a)return;if(e.relatedTarget&&a.contains(e.relatedTarget))return;
  clearTimeout(_dicaT);if(_dicaAlvo===a)dicaEsconder()});
document.addEventListener('focusin',e=>{const a=e.target.closest&&e.target.closest('[data-dica]');if(a&&a.matches(':focus-visible'))dicaMostrar(a)});
document.addEventListener('focusout',()=>{if(_dicaAlvo&&!_dicaAlvo.matches(':hover'))dicaEsconder()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&_dicaAlvo)dicaEsconder()});
document.addEventListener('scroll',()=>{if(_dicaAlvo)dicaEsconder()},true);
document.addEventListener('click',()=>{if(_dicaAlvo)dicaEsconder()},true);
/* Toque: segurar abre a dica sem acionar o botão. */
let _dicaToque=0,_dicaSegurou=false;
document.addEventListener('touchstart',e=>{const a=e.target.closest&&e.target.closest('[data-dica]');_dicaSegurou=false;if(!a)return;clearTimeout(_dicaToque);_dicaToque=setTimeout(()=>{_dicaSegurou=true;dicaMostrar(a)},500)},{passive:true});
document.addEventListener('touchend',e=>{clearTimeout(_dicaToque);if(_dicaSegurou){e.preventDefault();_dicaSegurou=false}});
document.addEventListener('touchmove',()=>clearTimeout(_dicaToque),{passive:true});

/* Explorar origens, classes e trilhas antes de escolher (Dossiê → botão "Ver todas"). */
let _explorar={t:null,q:''};
function explorarAbrir(t){_explorar={t,q:''};explorarRender()}
function explorarRender(){const f=F();const {t,q}=_explorar;const qq=slug(q);const campo={origens:'origem',classes:'classe',trilhas:'trilha'}[t];
  let l=cat(t);if(t==='trilhas'&&f.classe)l=l.filter(x=>x.classe===f.classe);
  if(qq)l=l.filter(x=>slug([x.nome,x.desc,x.poderNome,x.poderDesc,...(x.habilidades||[]).map(y=>y.nome+' '+y.desc)].join(' ')).includes(qq));
  l=l.slice().sort((a,b)=>String(a.nome).localeCompare(b.nome,'pt'));
  const tit={origens:'Origens',classes:'Classes',trilhas:'Trilhas'+(f.classe?' de '+((byId('classes',f.classe)||{}).nome||''):'')}[t];
  modal(tit,`<div class="modal-h" style="padding-top:8px"><input class="inp" id="explorar-q" placeholder="Buscar pelo nome, poder ou habilidade…" value="${h(q)}" style="flex:1 1 200px"><span class="hint">${l.length}</span></div>
   <div class="modal-b explorar">${l.map(x=>`<div class="card explorar-c ${f[campo]===x.id?'on':''}">${dicaHtml(t,x)}<div class="row"><button class="btn sm ${f[campo]===x.id?'':'acc'}" data-act="explorarEscolher" data-t="${t}" data-id="${h(x.id)}" ${f._alheia&&!f._mestre?'disabled':''}>${f[campo]===x.id?'Escolhida':'Escolher'}</button></div></div>`).join('')||'<div class="empty">Nada encontrado.</div>'}</div>`);
  const qi=document.getElementById('explorar-q');if(qi){qi.focus();qi.setSelectionRange(q.length,q.length)}}
document.addEventListener('input',e=>{if(e.target.id==='explorar-q'){_explorar.q=e.target.value;explorarRender()}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act="explorarEscolher"]');if(!b)return;const f=F();if(!f)return;
  const campo={origens:'origem',classes:'classe',trilhas:'trilha'}[b.dataset.t];if(!campo)return;
  const v=b.dataset.id;if(f[campo]!==v){f[campo]=v;if(campo==='classe'){f.trilha='';f.escolhas=[]}if(campo==='origem'){f.origemOpcao=0;f.origemEscolha=''}}
  saveF(f);closeModal();render();toast(`${(byId(b.dataset.t,b.dataset.id)||{}).nome||''} escolhida.`)});
