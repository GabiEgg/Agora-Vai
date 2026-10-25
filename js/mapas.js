/* ============================== MAPAS (Escudo do Mestre) ==============================
   Editor de cômodos em grade. O mestre desenha piso, paredes e portas (ou arrasta um retângulo
   para criar um cômodo inteiro), depois clica num cômodo para dar nome e colocar criaturas,
   itens e anotações. Tudo fica salvo na conta (ou no navegador) para usar em outra sessão.
   Grade: string com um caractere por casa: '.' vazio, 'p' piso, '#' parede, 'd' porta. */
S.mapas=S.mapas||[];
const MAPA_TAM=[['16x12','Pequeno (16×12)'],['24x16','Médio (24×16)'],['32x24','Grande (32×24)'],['48x32','Enorme (48×32)']];
const MAPA_FERR=[['comodo','Cômodo','Arraste para criar um cômodo com paredes'],['p','Piso',''],['#','Parede',''],['d','Porta',''],['.','Apagar','']];
const OBJ_ICONE={criatura:'☠',item:'◆',nota:'✎'};
const mapaAtual=()=>S.mapas.find(m=>m.id===S.mapaAberto);
function salvarMapas(){const m=mapaAtual();if(m)m.atualizado=Date.now();Store.touch('mapas')}
function novoMapa(nome,tam){const [w,hh]=tam.split('x').map(Number);return {id:uid(),nome:nome||'Mapa sem nome',w,h:hh,cel:'.'.repeat(w*hh),nomes:[],obj:[],criado:Date.now(),atualizado:Date.now()}}

/* Cômodo = casas de piso ligadas entre si (portas e paredes separam). */
function comodoDe(m,i){
  if(m.cel[i]!=='p')return null;const vis=new Set([i]);const fila=[i];
  while(fila.length){const c=fila.pop();const x=c%m.w,y=Math.floor(c/m.w);
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=m.w||ny>=m.h)return;const n=ny*m.w+nx;if(!vis.has(n)&&m.cel[n]==='p'){vis.add(n);fila.push(n)}})}
  return vis;
}
function nomeComodo(m,cel){const n=(m.nomes||[]).find(x=>cel.has(x.i));return n?n.t:''}
function comodos(m){const vistos=new Set();const out=[];
  for(let i=0;i<m.cel.length;i++){if(m.cel[i]!=='p'||vistos.has(i))continue;const c=comodoDe(m,i);c.forEach(k=>vistos.add(k));out.push({i,cel:c,nome:nomeComodo(m,c),obj:m.obj.filter(o=>c.has(o.i))})}
  return out}

/* ---------- tela ---------- */
function escMapas(){const m=mapaAtual();return m?mapaEditor(m):mapaLista()}
function mapaLista(){
  const ms=S.mapas.slice().sort((a,b)=>(b.atualizado||0)-(a.atualizado||0));
  const cards=ms.map(m=>{const cs=comodos(m);const ncri=m.obj.filter(o=>o.tipo==='criatura').reduce((s,o)=>s+(+o.qtd||1),0);
    return `<div class="card"><h4><button class="linkbtn" data-act="mapaAbrir" data-id="${h(m.id)}">${h(m.nome)}</button></h4>
     <div class="meta"><span>${m.w}×${m.h}</span><span>${cs.length} cômodo${cs.length===1?'':'s'}</span><span>${ncri} criatura${ncri===1?'':'s'}</span><span>${m.obj.filter(o=>o.tipo==='item').length} itens</span></div>
     ${mapaMini(m)}
     <div class="row"><button class="btn sm acc" data-act="mapaAbrir" data-id="${h(m.id)}">Abrir</button><button class="btn sm" data-act="mapaDup" data-id="${h(m.id)}">Duplicar</button>
      ${S.confirm==='mapaDel:'+m.id?`<span class="confirm">Excluir o mapa? <button class="btn sm danger" data-act="mapaDelOk" data-id="${h(m.id)}">Excluir</button><button class="btn sm" data-act="cancel">Cancelar</button></span>`:`<button class="btn sm ghost danger" data-act="mapaDel" data-id="${h(m.id)}">Excluir</button>`}</div></div>`}).join('');
  return `<div class="sec"><div class="sec-h"><h2>Mapas</h2><span class="hint">${ms.length} salvo${ms.length===1?'':'s'}</span></div>
   <div class="card"><h4>Novo mapa</h4><div class="row"><input class="inp" id="mapa-nome" data-keep placeholder="Nome (ex.: Mansão Dantas, térreo)" maxlength="80" style="flex:1 1 200px">
    <select class="inp" id="mapa-tam" aria-label="Tamanho">${MAPA_TAM.map(([k,l])=>opt(k,l,'24x16')).join('')}</select><button class="btn acc" data-act="mapaNovo">Criar</button></div>
    <p class="hint">Desenhe os cômodos e depois clique em cada um para colocar criaturas, itens e anotações. Os mapas ficam salvos com seus objetos para usar em qualquer sessão.</p></div>
   ${cards?`<div class="cards">${cards}</div>`:''}</div>`;
}
/* Miniatura em SVG para a lista. */
function mapaMini(m){const cor={p:'var(--paper)','#':'var(--ink)',d:'var(--accent)'};let r='';
  for(let i=0;i<m.cel.length;i++){const c=m.cel[i];if(c!=='.')r+=`<rect x="${i%m.w}" y="${Math.floor(i/m.w)}" width="1" height="1" fill="${cor[c]}"/>`}
  m.obj.forEach(o=>{r+=`<circle cx="${o.i%m.w+.5}" cy="${Math.floor(o.i/m.w)+.5}" r=".35" fill="${o.tipo==='criatura'?'var(--pv)':'var(--muted)'}"/>`});
  return `<svg class="mapa-mini" viewBox="0 0 ${m.w} ${m.h}" role="img" aria-label="Miniatura de ${h(m.nome)}" preserveAspectRatio="xMidYMid meet"><rect width="${m.w}" height="${m.h}" fill="var(--sunk)"/>${r}</svg>`}

function mapaEditor(m){
  const modo=S.mapaModo||'editar';const sel=S.mapaSel!=null?comodoDe(m,S.mapaSel):null;
  const porCel={};m.obj.forEach(o=>(porCel[o.i]=porCel[o.i]||[]).push(o));
  const labels={};(m.nomes||[]).forEach(n=>labels[n.i]=n.t);
  let cells='';
  for(let i=0;i<m.cel.length;i++){const c=m.cel[i];const os=porCel[i];
    cells+=`<i class="mc t${c==='#'?'w':c==='.'?'v':c}${sel&&sel.has(i)?' sel':''}" data-i="${i}">${os?`<span class="mo ${os.some(o=>o.tipo==='criatura')?'cri':''}">${os.length>1?os.length:OBJ_ICONE[os[0].tipo]}</span>`:''}${labels[i]&&modo==='usar'?`<b class="ml">${h(labels[i])}</b>`:''}</i>`}
  const ferr=modo==='editar'?`<div class="chips">${MAPA_FERR.map(([k,l,t])=>`<button class="btn sm" aria-pressed="${(S.mapaFerr||'comodo')===k}" data-act="mapaFerr" data-v="${k}" ${t?`title="${t}"`:''}>${l}</button>`).join('')}
     ${S.confirm==='mapaLimpar'?`<span class="confirm">Apagar todo o desenho? <button class="btn sm danger" data-act="mapaLimparOk">Apagar</button><button class="btn sm" data-act="cancel">Cancelar</button></span>`:`<button class="btn sm ghost danger" data-act="mapaLimpar">Limpar</button>`}</div>
     <p class="hint">${(S.mapaFerr||'comodo')==='comodo'?'Arraste na grade para criar um cômodo: piso por dentro e paredes em volta. Cômodos encostados dividem a parede.':'Clique ou arraste para pintar.'} Quando terminar, vá em <b>Usar</b> e clique num cômodo.</p>`:'<p class="hint">Clique num cômodo para dar nome e colocar criaturas, itens ou anotações.</p>';
  return `<div class="sec"><div class="sec-h"><button class="btn sm" data-act="mapaVoltar">← Mapas</button>
    <input class="inp" id="mapa-titulo" data-mapa-campo="nome" value="${h(m.nome)}" aria-label="Nome do mapa" style="flex:1 1 180px;font-weight:600">
    <div class="chips seg"><button class="btn sm" aria-pressed="${modo==='editar'}" data-act="mapaModo" data-v="editar">Editar</button><button class="btn sm" aria-pressed="${modo==='usar'}" data-act="mapaModo" data-v="usar">Usar</button></div></div>
   ${ferr}
   <div class="mapa-wrap"><div class="mapa ${modo}" style="--w:${m.w}" role="grid" aria-label="Grade do mapa ${h(m.nome)}">${cells}</div></div>
   ${modo==='usar'?mapaLado(m,sel):''}</div>`;
}
function mapaLado(m,sel){
  if(!sel){const cs=comodos(m);
    return `<div class="mapa-lado card"><h4>Cômodos</h4>${cs.length?`<ul class="linha-tempo">${cs.map(c=>`<li><button class="linkbtn" data-act="mapaSel" data-i="${c.i}">${h(c.nome||'Cômodo sem nome')}</button> <span class="hint">${c.cel.size} casas${c.obj.length?' · '+c.obj.map(o=>(o.qtd>1?o.qtd+'× ':'')+o.nome).join(', '):''}</span></li>`).join('')}</ul>`:'<p class="hint">Nenhum cômodo ainda. Desenhe no modo Editar.</p>'}</div>`}
  const nome=nomeComodo(m,sel);const os=m.obj.filter(o=>sel.has(o.i));
  const cris=criaturasOn();const itens=(D.itens||[]).filter(x=>fonteOn(x.fonte||'core')&&!x.naoInventario);
  const add=S.mapaAdd||'criatura';
  return `<div class="mapa-lado card"><div class="sec-h"><h4>Cômodo</h4><button class="btn sm ghost" data-act="mapaSel" data-i="">Fechar</button></div>
    ${fld('Nome do cômodo',`<input class="inp" id="mapa-comodo" data-mapa-campo="comodo" value="${h(nome)}" placeholder="Ex.: Biblioteca">`)}
    ${os.length?`<div class="mapa-objs">${os.map(o=>`<div class="row mapa-obj"><span class="mo-ic">${OBJ_ICONE[o.tipo]}</span>
      <span style="flex:1 1 140px">${o.tipo==='criatura'&&o.ref?`<button class="linkbtn" data-act="criVer" data-id="${h(o.ref)}">${h(o.nome)}</button>`:`<b>${h(o.nome)}</b>`}${o.qtd>1?` ×${o.qtd}`:''}${o.nota?`<br><span class="hint">${h(o.nota)}</span>`:''}</span>
      ${o.tipo==='criatura'&&o.ref?`<button class="btn sm" data-act="mapaCombate" data-id="${h(o.id)}" ${S.mesaAberta?'':'disabled'}>Combate</button>`:''}
      ${o.tipo==='item'&&o.ref?`<button class="btn sm" data-act="mapaItemVer" data-id="${h(o.ref)}">Ver</button>`:''}
      <button class="btn sm ghost danger" data-act="mapaObjDel" data-id="${h(o.id)}" aria-label="Tirar ${h(o.nome)}">✕</button></div>`).join('')}</div>
      ${os.some(o=>o.tipo==='criatura'&&o.ref)?`<div class="row"><button class="btn sm acc" data-act="mapaCombateTodos" ${S.mesaAberta?'':'disabled'}>Pôr todas as criaturas no combate</button></div>`:''}`:'<p class="hint">Nada neste cômodo ainda.</p>'}
    <div class="chips seg" style="margin-top:8px">${[['criatura','Criatura'],['item','Item'],['nota','Anotação']].map(([k,l])=>`<button class="btn sm" aria-pressed="${add===k}" data-act="mapaAddTipo" data-v="${k}">${l}</button>`).join('')}</div>
    ${add==='criatura'?`<div class="row"><input class="inp" id="mapa-add" data-keep list="dl-cri" placeholder="${S.cri?'Nome da criatura ou NPC':'Carregando bestiário…'}" style="flex:1 1 180px"><input class="inp num" type="number" id="mapa-qtd" data-keep value="1" min="1" max="20" style="width:64px" aria-label="Quantidade"><button class="btn" data-act="mapaAdd">Adicionar</button></div>
       <datalist id="dl-cri">${cris.map(c=>`<option value="${h(c.nome)}">`).join('')}</datalist>`
    :add==='item'?`<div class="row"><input class="inp" id="mapa-add" data-keep list="dl-it" placeholder="Item do catálogo ou nome livre" style="flex:1 1 180px"><input class="inp num" type="number" id="mapa-qtd" data-keep value="1" min="1" max="99" style="width:64px" aria-label="Quantidade"><button class="btn" data-act="mapaAdd">Adicionar</button></div>
       <datalist id="dl-it">${itens.map(c=>`<option value="${h(c.nome)}">`).join('')}</datalist>`
    :`<div class="row"><input class="inp" id="mapa-add" data-keep placeholder="Pista, armadilha, segredo…" style="flex:1 1 220px"><button class="btn" data-act="mapaAdd">Adicionar</button></div>`}
    <input class="inp" id="mapa-nota" data-keep placeholder="Observação (opcional)" style="margin-top:6px">
    <p class="hint">O objeto fica na casa em que você clicou. Clique em outra casa do cômodo antes de adicionar para mudar o lugar.</p></div>`;
}

/* ---------- desenho com o ponteiro ---------- */
let _pinta=null;
function celDoPonto(ev){const el=document.elementFromPoint(ev.clientX,ev.clientY);const c=el&&el.closest('.mapa .mc');return c?+c.dataset.i:null}
function pintar(m,i,v){if(i==null||m.cel[i]===v)return false;m.cel=m.cel.slice(0,i)+v+m.cel.slice(i+1);
  const el=document.querySelector(`.mapa .mc[data-i="${i}"]`);if(el)el.className='mc t'+(v==='#'?'w':v==='.'?'v':v);
  if(v!=='p'){m.obj=m.obj.filter(o=>o.i!==i||v==='d');m.nomes=(m.nomes||[]).filter(n=>n.i!==i)}return true}
function retangulo(m,a,b){const ax=a%m.w,ay=Math.floor(a/m.w),bx=b%m.w,by=Math.floor(b/m.w);return [Math.min(ax,bx),Math.min(ay,by),Math.max(ax,bx),Math.max(ay,by)]}
function previaRet(m,a,b){document.querySelectorAll('.mapa .mc.pre').forEach(e=>e.classList.remove('pre'));if(a==null||b==null)return;const [x0,y0,x1,y1]=retangulo(m,a,b);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const el=document.querySelector(`.mapa .mc[data-i="${y*m.w+x}"]`);if(el)el.classList.add('pre')}}
function aplicarRet(m,a,b){const [x0,y0,x1,y1]=retangulo(m,a,b);if(x1-x0<2||y1-y0<2){toast('Um cômodo precisa de pelo menos 3×3 casas (com as paredes).');return}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*m.w+x;const borda=x===x0||x===x1||y===y0||y===y1;
    if(borda){if(m.cel[i]!=='d')pintar(m,i,'#')}else pintar(m,i,'p')}}
document.addEventListener('pointerdown',ev=>{
  const c=ev.target.closest('.mapa.editar .mc');if(!c)return;const m=mapaAtual();if(!m)return;ev.preventDefault();
  const i=+c.dataset.i;const f=S.mapaFerr||'comodo';_pinta={f,a:i,b:i};
  if(f!=='comodo')pintar(m,i,f);else previaRet(m,i,i);
});
document.addEventListener('pointermove',ev=>{if(!_pinta)return;const m=mapaAtual();if(!m)return;const i=celDoPonto(ev);if(i==null)return;
  if(_pinta.f==='comodo'){if(i!==_pinta.b){_pinta.b=i;previaRet(m,_pinta.a,i)}}else pintar(m,i,_pinta.f)});
document.addEventListener('pointerup',()=>{if(!_pinta)return;const m=mapaAtual();const p=_pinta;_pinta=null;if(!m)return;
  if(p.f==='comodo'){previaRet(m,null,null);aplicarRet(m,p.a,p.b)}salvarMapas()});
document.addEventListener('pointercancel',()=>{if(_pinta){previaRet(mapaAtual()||{},null,null);_pinta=null}});

function objDoCatalogo(tipo,nome){const n=slug(nome);
  if(tipo==='criatura'){const c=criaturasOn().find(x=>slug(x.nome)===n)||criaturasOn().find(x=>slug(x.nome).includes(n));return c?{ref:c.id,nome:c.nome}:{ref:null,nome}}
  if(tipo==='item'){const it=(D.itens||[]).find(x=>slug(x.nome)===n);return it?{ref:it.id,nome:it.nome}:{ref:null,nome}}
  return {ref:null,nome}}

document.addEventListener('click',async e=>{
  const t=e.target.closest('[data-act]');
  const cel=!t&&e.target.closest('.mapa.usar .mc');
  if(cel){const m=mapaAtual();const i=+cel.dataset.i;if(m.cel[i]!=='p'){if(S.mapaSel!=null){S.mapaSel=null;render()}return}S.mapaSel=i;render();return}
  if(!t)return;const ds=t.dataset;const m=mapaAtual();
  const val=id=>{const el=document.getElementById(id);return el?el.value.trim():''};
  switch(ds.act){
   case 'mapaNovo':{const nm=novoMapa(val('mapa-nome'),val('mapa-tam')||'24x16');S.mapas.push(nm);S.mapaAberto=nm.id;S.mapaModo='editar';S.mapaSel=null;Store.touch('mapas');render();return}
   case 'mapaAbrir':S.mapaAberto=ds.id;S.mapaSel=null;{const mm=mapaAtual();S.mapaModo=mm&&mm.cel.includes('p')?'usar':'editar'}carregarCriaturas().catch(()=>{});render();return;
   case 'mapaVoltar':S.mapaAberto=null;S.mapaSel=null;render();return;
   case 'mapaDup':{const o=S.mapas.find(x=>x.id===ds.id);if(!o)return;const c={...clone(o),id:uid(),nome:o.nome+' (cópia)',criado:Date.now(),atualizado:Date.now()};c.obj.forEach(x=>x.id=uid());S.mapas.push(c);Store.touch('mapas');render();return}
   case 'mapaDel':S.confirm='mapaDel:'+ds.id;render();return;
   case 'mapaDelOk':S.mapas=S.mapas.filter(x=>x.id!==ds.id);S.confirm=null;Store.touch('mapas');render();return;
   case 'mapaModo':S.mapaModo=ds.v;S.mapaSel=null;render();return;
   case 'mapaFerr':S.mapaFerr=ds.v;render();return;
   case 'mapaLimpar':S.confirm='mapaLimpar';render();return;
   case 'mapaLimparOk':if(m){m.cel='.'.repeat(m.w*m.h);m.obj=[];m.nomes=[];salvarMapas()}S.confirm=null;render();return;
   case 'mapaSel':S.mapaSel=ds.i===''?null:+ds.i;render();return;
   case 'mapaAddTipo':S.mapaAdd=ds.v;render();return;
   case 'mapaAdd':{if(!m||S.mapaSel==null)return;const nome=val('mapa-add');if(!nome){toast('Digite o nome.');return}const tipo=S.mapaAdd||'criatura';
     const c=objDoCatalogo(tipo,nome);const qtd=Math.max(1,Math.min(99,Math.round(+val('mapa-qtd')||1)));
     m.obj.push({id:uid(),i:S.mapaSel,tipo,ref:c.ref,nome:c.nome,qtd:tipo==='nota'?1:qtd,nota:val('mapa-nota')||''});salvarMapas();
     if(tipo==='criatura'&&!c.ref)toast('Não achei no bestiário: ficou como nome livre.');render();return}
   case 'mapaObjDel':if(m){m.obj=m.obj.filter(o=>o.id!==ds.id);salvarMapas();render()}return;
   case 'mapaItemVer':{const it=(D.itens||[]).find(x=>x.id===ds.id);if(it)modal(it.nome,`<div class="modal-b"><p>${h(it.desc||'')}</p></div>`);return}
   case 'mapaCombate':case 'mapaCombateTodos':{if(!m)return;const sel=S.mapaSel!=null?comodoDe(m,S.mapaSel):null;
     const os=ds.act==='mapaCombate'?m.obj.filter(o=>o.id===ds.id):m.obj.filter(o=>o.tipo==='criatura'&&o.ref&&sel&&sel.has(o.i));
     await carregarCriaturas().catch(()=>{});
     try{for(const o of os)for(let k=0;k<(+o.qtd||1);k++)await addCriaturaCombate(o.ref,o.nome)}catch(err){toast(err.message)}return}
  }
});
document.addEventListener('change',e=>{const k=e.target.dataset&&e.target.dataset.mapaCampo;if(!k)return;const m=mapaAtual();if(!m)return;const v=e.target.value.trim().slice(0,80);
  if(k==='nome'){m.nome=v||'Mapa sem nome'}
  else if(k==='comodo'&&S.mapaSel!=null){const sel=comodoDe(m,S.mapaSel);m.nomes=(m.nomes||[]).filter(n=>!sel.has(n.i));
    if(v){const xs=[...sel];const cx=xs.reduce((s,i)=>s+i%m.w,0)/xs.length,cy=xs.reduce((s,i)=>s+Math.floor(i/m.w),0)/xs.length;
      const perto=xs.sort((a,b)=>Math.hypot(a%m.w-cx,Math.floor(a/m.w)-cy)-Math.hypot(b%m.w-cx,Math.floor(b/m.w)-cy))[0];m.nomes.push({i:perto,t:v})}}
  salvarMapas();render()});
