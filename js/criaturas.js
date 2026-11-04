/* ============================== CRIATURAS E NPCs ==============================
   1) Homebrew → Criaturas e NPCs: editor completo no formato das fichas do bestiário (testes em
      "2d20+10", defesas, resistências, atributos, ataques e habilidades, Enigma de Medo). O que é
      criado entra no bestiário (Escudo) enquanto o pacote estiver ligado.
   2) Escudo → Fichas: o mestre junta NPCs e monstros da campanha em grupos, com descrição e
      informações próprias de cada um, e põe na iniciativa com um clique. */
const CRI_TIPOS={criatura:'Criatura',pessoa:'Pessoa (NPC)',animal:'Animal',relíquia:'Relíquia',modelo:'Modelo'};
const CRI_TAM=['Minúsculo','Pequeno','Médio','Grande','Enorme','Colossal'];
const CRI_ACAO=['Ataque','Passiva','Padrão','Movimento','Completa','Reação','Livre'];

/* ---------- Homebrew: ver uma criatura do bestiário ---------- */
function criBaseView(x){
  return `<div class="sec-h"><h2>${h(x.nome)}</h2>${fonteBadge(x)}<div class="row"><button class="btn acc sm" data-act="hbOverride" data-id="${h(x.id)}">Ajustar para minha mesa</button><button class="btn sm" data-act="hbClone" data-id="${h(x.id)}">Usar como modelo</button>${criBotaoIni(x)}</div></div>
   ${addFichaHtml(x)}<div class="meta"><span>${h(criResumo(x))}</span></div>${criFicha(x)}
   <p class="hint">“Ajustar” cria uma versão sua que substitui esta no bestiário. “Usar como modelo” cria uma criatura nova a partir dela.</p>`;
}
/* Adicionar às fichas de uma campanha que você mestra, escolhendo campanha e grupo. */
function addFichaHtml(c){const ms=mesasMestre();if(!ms.length||!c||!c.id)return '';const mid=ms.some(m=>m.id===S.efHbMesa)?S.efHbMesa:ms.some(m=>m.id===S.mesaAberta)?S.mesaAberta:ms[0].id;
  const o=fichasMesa(mid);const ja=o.itens.filter(z=>z.ref===c.id).length;
  return `<div class="row ef-addhb"><span class="hint">Fichas da campanha:</span>${ms.length>1?`<select class="inp sm" id="efhb-mesa" aria-label="Campanha">${ms.map(m=>opt(m.id,m.nome,mid)).join('')}</select>`:`<b>${h(ms[0].nome)}</b>`}
    <select class="inp sm" id="efhb-grupo" aria-label="Grupo">${o.grupos.map(g=>opt(g.id,g.nome,S.efGrupo||'')).join('')}</select><button class="btn sm" data-act="efAddDe" data-id="${h(c.id)}" data-m="${h(mid)}">Adicionar às fichas</button>${ja?`<span class="hint">já está ${ja>1?ja+' vezes':'lá'}</span>`:''}</div>`}
const criBotaoIni=x=>S.mesaAberta&&mesasMestre().some(m=>m.id===S.mesaAberta)?`<button class="btn sm" data-act="criAdd" data-id="${h(x.id)}">Pôr na iniciativa</button>`:'';

/* ---------- Homebrew: editor ---------- */
function criForm(x){
  const pk=pacotesHB();const isOver=(S.cri||[]).some(b=>b.id===x.id);const at=x.atributos||{};
  const tx=(k,l,ph='',cls='')=>fld(l,`<input class="inp" data-h="${k}" value="${h(getPath(x,k)??'')}" placeholder="${h(ph)}">`,cls);
  const nm=(k,l)=>fld(l,`<input class="inp num" type="number" data-h="${k}" data-num value="${h(getPath(x,k)??'')}">`);
  const ar=(k,l,ph='')=>fld(l,`<textarea class="inp" data-h="${k}" rows="2" placeholder="${h(ph)}">${h(getPath(x,k)||'')}</textarea>`,'span2');
  const sel=(k,l,ops)=>fld(l,`<select class="inp" data-h="${k}" data-r>${ops.map(([a,b])=>opt(a,b,getPath(x,k)??'')).join('')}</select>`);
  const elems=Object.entries(ELEM).map(([a,b])=>[a,a?b:'Nenhum']);
  const acoes=(x.acoes||[]).map((a,i)=>{const tipo=a.ataque?'Ataque':(a.acao||'Passiva');
    return `<div class="cri-ed-acao">
      <div class="row"><select class="inp sm" data-cri-acao-tipo="${i}" aria-label="Tipo da ação">${CRI_ACAO.map(o=>opt(o,o,tipo)).join('')}</select>
       <input class="inp" data-h="acoes.${i}.nome" value="${h(a.nome||'')}" placeholder="Nome" style="flex:1 1 160px">
       <button class="btn sm ghost" data-act="criAcaoMover" data-i="${i}" data-d="-1" aria-label="Subir" ${i?'':'disabled'}>↑</button><button class="btn sm ghost" data-act="criAcaoMover" data-i="${i}" data-d="1" aria-label="Descer" ${i<x.acoes.length-1?'':'disabled'}>↓</button>
       <button class="btn sm ghost danger" data-act="criAcaoDel" data-i="${i}" aria-label="Remover ação">✕</button></div>
      ${a.ataque?`<div class="grid g3">${fld('Alcance',`<input class="inp" data-h="acoes.${i}.alcance" value="${h(a.alcance||'')}" placeholder="Corpo a corpo / Curto / Médio">`)}${fld('Teste de ataque',`<input class="inp" data-h="acoes.${i}.teste" value="${h(a.teste||'')}" placeholder="3d20+15">`)}${fld('Dano e tipo',`<input class="inp" data-h="acoes.${i}.dano" value="${h(a.dano||'')}" placeholder="2d10+5 perfuração">`)}</div>`
        :`<textarea class="inp" data-h="acoes.${i}.texto" rows="2" placeholder="O que a habilidade faz (custo, DT, efeito)">${h(a.texto||'')}</textarea>`}</div>`}).join('');
  return `<div class="sec-h"><h2 data-d="hbNome">${h(x.nome||'Sem nome')}</h2>${isOver?'<span class="badge acc">ajuste de criatura oficial</span>':'<span class="badge hb">homebrew</span>'}
    <div class="row">${criBotaoIni(x)}${S.confirm==='hbDel'?`<span class="confirm">${isOver?'Restaurar o original?':'Excluir?'} <button class="btn sm danger" data-act="hbDelOk">${isOver?'Restaurar':'Excluir'}</button><button class="btn sm" data-act="cancel">Cancelar</button></span>`:`<button class="btn sm danger" data-act="hbDel">${isOver?'Restaurar original':'Excluir'}</button>`}</div></div>
   ${addFichaHtml(x)}
   <div class="cri-ed">
    <h3 class="eyebrow">Identidade</h3>
    <div class="grid g4">${fld('Pacote',`<input class="inp" data-h="pacote" list="pk-list" value="${h(x.pacote||'Minha mesa')}"><datalist id="pk-list">${pk.map(p=>`<option value="${h(p)}">`).join('')}</datalist>`)}${tx('nome','Nome','Ex.: Zumbi de Lodo')}
     ${sel('tipo','Tipo',Object.entries(CRI_TIPOS))}${sel('tamanho','Tamanho',CRI_TAM.map(t=>[t,t]))}
     ${sel('elemento','Elemento',elems)}${sel('elemento2','2º elemento',elems)}${nm('vd','VD (valor de desafio)')}${tx('deslocamento','Deslocamento','9m, voo 12m')}</div>
    ${ar('desc','Descrição','Aparência, comportamento, origem…')}
    <h3 class="eyebrow">Presença e sentidos</h3>
    <div class="grid g3">${tx('presenca','Presença perturbadora','DT 20 · 4d6 mental · NEX 45%+ imune','span2')}${tx('sentidos','Sentidos','visão no escuro, faro')}</div>
    <h3 class="eyebrow">Defesas</h3>
    <div class="grid g4">${nm('defesa','Defesa')}${nm('pv','PV')}${tx('fortitude','Fortitude','3d20+10')}${tx('reflexos','Reflexos','2d20+5')}${tx('vontade','Vontade','2d20+5')}
     ${tx('resistencias','Resistências','Balístico e corte 5; Sangue 10','span2')}${tx('imunidades','Imunidades','Dano de Morte; condições de paralisia')}${tx('vulnerabilidades','Vulnerabilidades','Energia')}</div>
    <p class="hint">Resistências no formato “tipos valor; tipos valor” (ex.: “Balístico, impacto e perfuração 5; Sangue 10” ou “Dano 10”). Assim o combate do Escudo desconta sozinho.</p>
    <h3 class="eyebrow">Atributos e testes</h3>
    <div class="grid g5">${ATTR.map(k=>fld(k,`<input class="inp num" type="number" data-h="atributos.${k}" data-num value="${h(at[k]??0)}">`)).join('')}</div>
    <div class="grid g4">${tx('iniciativa','Iniciativa','2d20+15')}${tx('percepcao','Percepção','2d20+10')}${tx('pericias','Outras perícias','Furtividade 2d20+13; Ocultismo 3d20+5','span2')}</div>
    <div class="row"><button class="btn sm" data-act="criSugerir">Sugerir testes pelos atributos e VD</button><span class="hint">Preenche Iniciativa, Percepção e resistências com dados iguais ao atributo (mínimo 1) e um bônus pelo VD; ajuste depois.</span></div>
    <h3 class="eyebrow">Ações, ataques e habilidades</h3>
    <div class="cri-ed-acoes">${acoes||'<p class="hint">Nenhuma ação ainda.</p>'}</div>
    <div class="row"><button class="btn sm" data-act="criAcaoNova" data-v="Ataque">+ Ataque</button><button class="btn sm" data-act="criAcaoNova" data-v="Padrão">+ Habilidade</button><button class="btn sm" data-act="criAcaoNova" data-v="Passiva">+ Passiva</button></div>
    ${ar('enigma','Enigma de Medo (opcional)','Como a criatura pode ser enfrentada ou banida…')}
   </div>
   <h3 class="eyebrow" style="margin-top:14px">Como fica no bestiário</h3>
   <div class="card cri on"><h4>${h(x.nome||'Sem nome')} ${elBadge(x.elemento)}${elBadge(x.elemento2)}</h4><div class="meta"><span>${h(criResumo(x))}</span></div>${criFicha(x)}</div>
   <p class="hint">Salvo automaticamente. Aparece no bestiário do Escudo enquanto o pacote estiver ligado na aba Mesa.</p>`;
}
/* Sugestão de testes: dados = atributo (mín. 1), bônus cresce com o VD. */
function criSugerir(x){const at=x.atributos||{};const b=Math.round(Math.min(40,(+x.vd||0)/10));const t=a=>`${Math.max(1,+at[a]||0)}d20+${b}`;
  x.iniciativa=t('AGI');x.percepcao=t('PRE');x.fortitude=t('VIG');x.reflexos=t('AGI');x.vontade=t('PRE')}

/* ---------- Escudo → Fichas da campanha ---------- */
S.escFichas=S.escFichas||{};
const fichasMesa=id=>{const o=S.escFichas[id]=S.escFichas[id]||{grupos:[{id:'g_geral',nome:'Geral'}],itens:[]};if(!o.grupos.length)o.grupos.push({id:'g_geral',nome:'Geral'});return o};
function salvarEscFichas(){Store.touch('escudo')}
function escFichas(m){
  if(!S.cri)carregarCriaturas().catch(()=>{});
  const o=fichasMesa(m.id);const q=slug(S.efQ||'');
  const lista=criaturasOn().slice().sort((a,b)=>a.nome.localeCompare(b.nome));
  const itemHtml=it=>{const c=criPorId(it.ref);const ab=(S.efAbertos||{})[it.id];const ed=(S.efEditando||{})[it.id];const ehHb=!!c&&(S.hb.criaturas||[]).some(z=>z.id===c.id);
    const nome=it.nome||(c&&c.nome)||'Sem nome';const infos=(it.infos||[]).filter(z=>z.t||z.x);const temNotas=!!it.desc||infos.length>0;
    const ler=`${it.desc?`<p class="ef-desc">${h(it.desc)}</p>`:'<p class="hint">Sem descrição ainda.</p>'}
      ${infos.length?`<dl class="ef-dl">${infos.map(z=>`<dt>${h(z.t||'Informação')}</dt><dd>${h(z.x||'')}</dd>`).join('')}</dl>`:''}
      <div class="row"><button class="btn sm" data-act="efEdit" data-id="${h(it.id)}">Editar descrição e informações</button>
       ${ehHb?`<button class="btn sm ghost" data-act="efEditar" data-id="${h(c.id)}">Editar ficha da criatura</button>`:c?`<button class="btn sm ghost" data-act="efAjustar" data-id="${h(c.id)}">Ajustar ficha para minha mesa</button>`:''}
       ${S.confirm==='efDel:'+it.id?`<span class="confirm">Tirar das fichas? <button class="btn sm danger" data-act="efDelOk" data-id="${h(it.id)}">Tirar</button><button class="btn sm" data-act="cancel">Cancelar</button></span>`:`<button class="btn sm ghost danger" data-act="efDel" data-id="${h(it.id)}">Tirar</button>`}</div>
      ${c?`<details class="ef-stats"><summary>Ficha completa</summary>${criFicha(c)}</details>`:''}`;
    const editar=`${fld('Nome nesta campanha',`<input class="inp" data-ef="${h(it.id)}" data-k="nome" value="${h(it.nome||'')}" placeholder="${h(c?c.nome:'')}">`)}
      ${fld('Descrição do mestre',`<textarea class="inp" data-ef="${h(it.id)}" data-k="desc" rows="3" placeholder="Quem é, o que quer, onde está, como reage aos agentes…">${h(it.desc||'')}</textarea>`)}
      <div class="ef-infos">${(it.infos||[]).map((inf,j)=>`<div class="ef-info"><div class="row"><input class="inp" data-ef="${h(it.id)}" data-k="infos.${j}.t" value="${h(inf.t||'')}" placeholder="Título (ex.: Segredo, Fraqueza, Fala)" style="flex:1 1 160px"><button class="btn sm ghost danger" data-act="efInfoDel" data-id="${h(it.id)}" data-j="${j}" aria-label="Remover informação">✕</button></div>
        <textarea class="inp" data-ef="${h(it.id)}" data-k="infos.${j}.x" rows="2" placeholder="Texto">${h(inf.x||'')}</textarea></div>`).join('')}</div>
      <div class="row"><button class="btn sm" data-act="efInfoNova" data-id="${h(it.id)}">+ Informação</button><button class="btn sm acc" data-act="efEdit" data-id="${h(it.id)}">Concluir</button></div>`;
    return `<div class="card ef-item ${ab?'on':''}"><div class="ef-topo">
       <button class="ef-seta" data-act="efTgl" data-id="${h(it.id)}" aria-expanded="${!!ab}" aria-label="${ab?'Esconder':'Mostrar'} descrição e informações de ${h(nome)}">${ab?'▾':'▸'}</button>
       <div class="ef-tit"><b>${h(nome)}</b> ${c?elBadge(c.elemento):''}${ehHb?' <span class="badge hb">homebrew</span>':''}${!c?' <span class="badge warnb">ficha não encontrada</span>':''}
        <div class="meta">${c?`<span>${h(criResumo(c))}</span>`:''}${temNotas?`<span>${infos.length?infos.length+' informação'+(infos.length>1?'ões':''):'com descrição'}</span>`:''}</div></div>
       <div class="ef-acoes"><select class="inp sm" data-ef="${h(it.id)}" data-k="grupo" aria-label="Grupo de ${h(nome)}">${o.grupos.map(g=>opt(g.id,g.nome,it.grupo||o.grupos[0].id)).join('')}</select>
        <button class="btn sm acc" data-act="efIni" data-id="${h(it.id)}" ${c?'':'disabled'}>Iniciativa</button></div></div>
      ${ab?`<div class="ef-corpo">${ed?editar:ler}</div>`:''}</div>`};
  const grupos=o.grupos.map(g=>{const its=o.itens.filter(it=>(it.grupo||o.grupos[0].id)===g.id&&(!q||slug((it.nome||'')+' '+((criPorId(it.ref)||{}).nome||'')+' '+(it.desc||'')).includes(q)));
    const gab=!g.fechado;const ged=(S.efgEditando||{})[g.id];const ginf=(g.infos||[]).filter(z=>z.t||z.x);
    const gNotas=gab?`<div class="ef-gnotas">${ged?`${fld('Descrição do grupo',`<textarea class="inp" data-efg="${h(g.id)}" data-k="desc" rows="3" placeholder="Quem são, onde se reúnem, o que querem…">${h(g.desc||'')}</textarea>`)}
        <div class="ef-infos">${(g.infos||[]).map((inf,j)=>`<div class="ef-info"><div class="row"><input class="inp" data-efg="${h(g.id)}" data-k="infos.${j}.t" value="${h(inf.t||'')}" placeholder="Título (ex.: Objetivo, Base, Hierarquia)" style="flex:1 1 160px"><button class="btn sm ghost danger" data-act="efgInfoDel" data-id="${h(g.id)}" data-j="${j}" aria-label="Remover informação">✕</button></div>
          <textarea class="inp" data-efg="${h(g.id)}" data-k="infos.${j}.x" rows="2" placeholder="Texto">${h(inf.x||'')}</textarea></div>`).join('')}</div>
        <div class="row"><button class="btn sm" data-act="efgInfoNova" data-id="${h(g.id)}">+ Informação</button><button class="btn sm acc" data-act="efgEdit" data-id="${h(g.id)}">Concluir</button></div>`
      :`${g.desc?`<p class="ef-desc">${h(g.desc)}</p>`:'<p class="hint">Sem descrição do grupo ainda.</p>'}${ginf.length?`<dl class="ef-dl">${ginf.map(z=>`<dt>${h(z.t||'Informação')}</dt><dd>${h(z.x||'')}</dd>`).join('')}</dl>`:''}
        <div class="row"><button class="btn sm" data-act="efgEdit" data-id="${h(g.id)}">Editar descrição e informações</button></div>`}</div>`:'';
    return `<div class="sec ef-grupo"><div class="sec-h"><button class="ef-seta" data-act="efgTgl" data-id="${h(g.id)}" aria-expanded="${!!gab}" aria-label="${gab?'Recolher':'Abrir'} o grupo ${h(g.nome)}">${gab?'▾':'▸'}</button><h2>${S.efRenomear===g.id?`<input class="inp" id="ef-gnome" data-keep value="${h(g.nome)}" style="max-width:240px"> <button class="btn sm" data-act="efGrupoOk" data-id="${h(g.id)}">OK</button>`:h(g.nome)}</h2><span class="hint">${its.length}${!gab&&(g.desc||ginf.length)?' · com notas':''}${!gab?' · recolhido':''}</span>
      <div class="row">${its.some(it=>criPorId(it.ref))?`<button class="btn sm" data-act="efGrupoIni" data-id="${h(g.id)}">Todos na iniciativa</button>`:''}<button class="btn sm ghost" data-act="efGrupoRen" data-id="${h(g.id)}">Renomear</button>${o.grupos.length>1?`<button class="btn sm ghost danger" data-act="efGrupoDel" data-id="${h(g.id)}">Apagar grupo</button>`:''}</div></div>
      ${gab?`${gNotas}${its.length?`<div class="cards">${its.map(itemHtml).join('')}</div>`:'<p class="hint">Nada neste grupo.</p>'}`:''}</div>`}).join('');
  return `<div class="sec"><div class="sec-h"><h2>Fichas da campanha</h2><span class="hint">${o.itens.length} NPC${o.itens.length===1?'':'s'} e criaturas</span></div>
    <div class="card"><div class="row"><input class="inp" id="ef-add" data-keep list="dl-ef" placeholder="${S.cri?'Criatura ou NPC do bestiário (inclui homebrew)':'Carregando bestiário…'}" style="flex:1 1 220px">
      <select class="inp" id="ef-grupo" aria-label="Grupo">${o.grupos.map(g=>opt(g.id,g.nome,S.efGrupo||'')).join('')}</select><button class="btn acc" data-act="efAdd">Adicionar</button></div>
     <datalist id="dl-ef">${lista.map(c=>`<option value="${h(c.nome)}">`).join('')}</datalist>
     <div class="row" style="margin-top:6px"><button class="btn sm" data-act="efNovoNpc" data-v="pessoa">+ Criar NPC novo</button><button class="btn sm" data-act="efNovoNpc" data-v="criatura">+ Criar monstro novo</button>
      <input class="inp sm" id="ef-gnovo" data-keep placeholder="Novo grupo (ex.: Culto, Aliados, Chefes)" style="flex:1 1 180px"><button class="btn sm" data-act="efGrupoNovo">+ Grupo</button></div>
     <p class="hint">“Criar” abre o editor completo no Homebrew (pacote “${h(m.nome)}”); a ficha volta para cá sozinha. Cada um pode ter descrição e quantas informações você quiser, só para você.</p></div>
    ${o.itens.length>4?`<input class="inp" id="ef-q" data-keep placeholder="Buscar nas fichas…" value="${h(S.efQ||'')}" style="margin:8px 0">`:''}</div>
   ${grupos}`;
}
function efNovoItem(m,ref,grupo){const o=fichasMesa(m.id);const it={id:'ef_'+uid(),ref,grupo:grupo||o.grupos[0].id,nome:'',desc:'',infos:[]};o.itens.push(it);salvarEscFichas();return it}

document.addEventListener('click',async e=>{
  const t=e.target.closest('[data-act]');if(!t)return;const ds=t.dataset;const val=id=>{const el=document.getElementById(id);return el?el.value.trim():''};
  const x=hbCur&&S.hbType==='criaturas'?hbCur():null;
  switch(ds.act){
   case 'criAcaoNova':{if(!x)return;(x.acoes=x.acoes||[]).push(ds.v==='Ataque'?{ataque:true,nome:'',alcance:'Corpo a corpo',teste:'',dano:''}:{acao:ds.v,nome:'',texto:''});saveHB();render();return}
   case 'criAcaoDel':{if(!x)return;x.acoes.splice(+ds.i,1);saveHB();render();return}
   case 'criAcaoMover':{if(!x)return;const i=+ds.i,j=i+ +ds.d;if(j<0||j>=x.acoes.length)return;[x.acoes[i],x.acoes[j]]=[x.acoes[j],x.acoes[i]];saveHB();render();return}
   case 'criSugerir':{if(!x)return;criSugerir(x);saveHB();render();toast('Testes sugeridos. Ajuste o que quiser.');return}
   case 'efAddDe':{const mid=ds.m||S.mesaAberta;const mm=mesasMestre().find(z=>z.id===mid);const c=criPorId(ds.id);if(!mm||!c)return;const o=fichasMesa(mid);
     const g=(ds.src==='best'?(S.efGrupo&&o.grupos.some(z=>z.id===S.efGrupo)?S.efGrupo:o.grupos[0].id):(val('efhb-grupo')||o.grupos[0].id));S.efGrupo=g;
     efNovoItem(mm,c.id,g);toast(`${c.nome} adicionado às fichas de “${mm.nome}” (${(o.grupos.find(z=>z.id===g)||{}).nome}).`);render();return}
  }
  const m=mesaAtual();if(!m||m.papel!=='mestre')return;const o=fichasMesa(m.id);const it=ds.id&&o.itens.find(z=>z.id===ds.id);
  switch(ds.act){
   case 'efTgl':S.efAbertos=S.efAbertos||{};S.efAbertos[ds.id]=!S.efAbertos[ds.id];render();return;
   case 'efEdit':S.efEditando=S.efEditando||{};S.efEditando[ds.id]=!S.efEditando[ds.id];if(!S.efEditando[ds.id])salvarEscFichas();render();return;
   case 'efAdd':{await carregarCriaturas().catch(()=>{});const n=slug(val('ef-add'));if(!n){toast('Digite o nome.');return}
     const c=criaturasOn().find(z=>slug(z.nome)===n)||criaturasOn().find(z=>slug(z.nome).includes(n));if(!c){toast('Não achei no bestiário. Use “Criar NPC novo”.');return}
     const g=val('ef-grupo');S.efGrupo=g;efNovoItem(m,c.id,g);toast(`${c.nome} adicionado às fichas.`);const el=document.getElementById('ef-add');if(el)el.value='';render();return}
   case 'efNovoNpc':{const c={id:'hb_'+uid(),nome:ds.v==='pessoa'?'NPC novo':'Monstro novo',pacote:m.nome,...clone(HB_DEFAULT.criaturas),tipo:ds.v};
     if(ds.v==='pessoa'){c.vd=10;c.defesa=11;c.pv=15;c.acoes=[{ataque:true,nome:'Pistola',alcance:'Curto',teste:'1d20+4',dano:'1d12'}]}
     S.hb.criaturas.push(c);saveHB();efNovoItem(m,c.id,val('ef-grupo'));S.view='hb';S.hbType='criaturas';S.hbSel=c.id;render();toast('Preencha a ficha; ela já está nas fichas da campanha.');return}
   case 'efEditar':S.view='hb';S.hbType='criaturas';S.hbSel=ds.id;render();return;
   case 'efAjustar':{await carregarCriaturas().catch(()=>{});const b=(S.cri||[]).find(z=>z.id===ds.id);if(!b)return;if(!S.hb.criaturas.some(z=>z.id===b.id)){const {fonte,...c}=clone(b);c.pacote=m.nome;S.hb.criaturas.push(c);saveHB()}
     S.view='hb';S.hbType='criaturas';S.hbSel=b.id;render();return}
   case 'efIni':{if(!it)return;const c=criPorId(it.ref);if(!c)return;try{await addCriaturaCombate(c.id,it.nome||c.nome)}catch(err){toast(err.message)}return}
   case 'efGrupoIni':{const its=o.itens.filter(z=>(z.grupo||o.grupos[0].id)===ds.id&&criPorId(z.ref));try{for(const z of its)await addCriaturaCombate(z.ref,z.nome||criPorId(z.ref).nome)}catch(err){toast(err.message)}return}
   case 'efInfoNova':{if(!it)return;(it.infos=it.infos||[]).push({t:'',x:''});S.efEditando={...(S.efEditando||{}),[it.id]:true};salvarEscFichas();render();return}
   case 'efInfoDel':{if(!it)return;it.infos.splice(+ds.j,1);salvarEscFichas();render();return}
   case 'efDel':S.confirm='efDel:'+ds.id;render();return;
   case 'efDelOk':o.itens=o.itens.filter(z=>z.id!==ds.id);S.confirm=null;salvarEscFichas();render();return;
   case 'efgTgl':{const g=o.grupos.find(z=>z.id===ds.id);if(!g)return;g.fechado=!g.fechado;salvarEscFichas();render();return}
   case 'efgEdit':S.efgEditando=S.efgEditando||{};S.efgEditando[ds.id]=!S.efgEditando[ds.id];if(!S.efgEditando[ds.id])salvarEscFichas();render();return;
   case 'efgInfoNova':{const g=o.grupos.find(z=>z.id===ds.id);if(!g)return;(g.infos=g.infos||[]).push({t:'',x:''});S.efgEditando={...(S.efgEditando||{}),[g.id]:true};salvarEscFichas();render();return}
   case 'efgInfoDel':{const g=o.grupos.find(z=>z.id===ds.id);if(!g)return;g.infos.splice(+ds.j,1);salvarEscFichas();render();return}
   case 'efGrupoNovo':{const n=val('ef-gnovo');if(!n){toast('Dê um nome ao grupo.');return}o.grupos.push({id:'g_'+uid(),nome:n.slice(0,60)});const el=document.getElementById('ef-gnovo');if(el)el.value='';salvarEscFichas();render();return}
   case 'efGrupoRen':S.efRenomear=ds.id;render();return;
   case 'efGrupoOk':{const g=o.grupos.find(z=>z.id===ds.id);const n=val('ef-gnome');if(g&&n)g.nome=n.slice(0,60);S.efRenomear=null;salvarEscFichas();render();return}
   case 'efGrupoDel':{const g=o.grupos.find(z=>z.id===ds.id);if(!g)return;const destino=o.grupos.find(z=>z.id!==ds.id);o.itens.forEach(z=>{if(z.grupo===g.id)z.grupo=destino.id});o.grupos=o.grupos.filter(z=>z.id!==ds.id);salvarEscFichas();toast(`Grupo apagado; as fichas foram para “${destino.nome}”.`);render();return}
  }
});
/* Campos das fichas da campanha e tipo das ações do editor. */
document.addEventListener('input',e=>{const t=e.target;
  if(t.dataset.efg){const m=mesaAtual();if(!m)return;const g=fichasMesa(m.id).grupos.find(z=>z.id===t.dataset.efg);if(!g)return;setPath(g,t.dataset.k,t.value);clearTimeout(S._efT);S._efT=setTimeout(salvarEscFichas,500);return}
  if(t.dataset.ef){const m=mesaAtual();if(!m)return;const it=fichasMesa(m.id).itens.find(z=>z.id===t.dataset.ef);if(!it)return;setPath(it,t.dataset.k,t.value);clearTimeout(S._efT);S._efT=setTimeout(salvarEscFichas,500);return}
  if(t.id==='ef-q'){S.efQ=t.value;clearTimeout(S._efQT);S._efQT=setTimeout(render,250)}});
document.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.ef&&t.dataset.k==='grupo'){salvarEscFichas();render();return}
  if(t.id==='efhb-mesa'){S.efHbMesa=t.value;render();return}
  if(t.id==='efhb-grupo'){S.efGrupo=t.value;return}
  if(t.dataset.criAcaoTipo!=null){const x=hbCur();if(!x)return;const a=x.acoes[+t.dataset.criAcaoTipo];if(!a)return;const v=t.value;
    if(v==='Ataque'){a.ataque=true;delete a.acao;a.alcance=a.alcance||'Corpo a corpo';a.teste=a.teste||'';a.dano=a.dano||''}else{delete a.ataque;a.acao=v;a.texto=a.texto||''}
    saveHB();render()}});
