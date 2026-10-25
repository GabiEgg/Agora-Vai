/* ============================== CÁLCULOS ============================== */
function modos(f){
  const c=byId('classes',f.classe);
  return {c,det:efeitoRegra('determinacao'),pat:regraOn('evolucao_patentes'),nivelSep:regraOn('nex_experiencia'),est:!!(c&&c.estagios)};
}
function patenteIdx(f){let i=0;PATENTES.forEach((p,k)=>{if((+f.pp||0)>=p.pp)i=k});return i}
/* Progresso usado para liberar habilidades: estágio (Sobrevivente) ou NEX. */
const progresso=(f,m)=>m.est?(+f.estagio||1):f.nex;
function nivelDe(f,m){if(m.est)return Math.max(1,Math.min(5,+f.estagio||1));if(m.nivelSep)return Math.max(1,Math.min(20,+f.nivel||1));return nivelNex(f.nex)}
function escolhasClasse(c){if(!c||!c.periciasEscolha)return [];
  return String(c.periciasEscolha).split(';').map(g=>g.split('|').map(s=>resolvePer(s.trim())).filter(Boolean)).filter(g=>g.length)}
function resolvePer(s){if(!s)return null;const n=slug(s);const p=pericias().find(x=>x.id===s||slug(x.nome)===n);return p?p.id:null}
function origemDe(f){const o=byId('origens',f.origem);if(!o)return {o:null,per:[],mods:[]};
  const op=o.opcoes&&o.opcoes[+f.origemOpcao||0];
  return {o,op,per:op?op.pericias:(o.pericias||[]),mods:(o.mods||[]).concat(op?op.mods||[]:[])}}
/* Itens: categoria efetiva com modificações e maldições. */
function modsDoItem(it){return (it.modsAplicadas||[]).map(id=>byId('modificacoes',id)).filter(Boolean)}
const TIPOS_GERAIS=['acessorio','explosivo','operacional','medicamento','geral'];
function catItem(it,r){const ms=modsDoItem(it);let c=+it.cat||0;let mald=0;ms.forEach(m=>{if(m.maldicao){c+=mald?1:2;mald++}else c+=1});
  if(r){if(r.catRedGeral&&TIPOS_GERAIS.includes(it.tipo))c-=r.catRedGeral;if(it.favorita&&r.favorita)c-=r.favorita}
  return Math.max(0,c)}
function espItem(it){const ms=modsDoItem(it);return Math.max(0,(+it.esp||0)+ms.reduce((s,m)=>s+((m.efeitos||{}).esp||0),0))}
function aplicaMod(m,it){const a=m.aplica;if(a==='arma')return it.tipo==='arma';if(a==='corpo')return it.tipo==='arma'&&it.forma==='corpo';
  if(a==='fogo')return it.tipo==='arma'&&(it.forma==='fogo'||it.forma==='disparo');if(a==='granada')return it.tipo==='explosivo';return it.tipo===a}

function condicoesAtivas(f,r){
  const imune=r.imuneCond||new Set();const set=new Map();const add=(id,orig)=>{if(set.has(id)||imune.has(id))return;const c=byId('condicoes',id);if(!c)return;set.set(id,{c,orig});(c.inclui||[]).forEach(x=>add(x,c.nome))};
  (f.condicoes||[]).forEach(x=>add(x.id||x,null));
  if(r.pvMax){if(r.pv<=0)add('morrendo','auto');else if(r.pv<=r.pvMax/2)add('machucado','auto')}
  if(!r.det&&r.sanMax){if(r.san<=0)add('enlouquecendo','auto');else if(r.san<r.sanMax/2)add('perturbado','auto')}
  return set;
}

function calc(f){
  const M=modos(f);const {c,det}=M;const prog=progresso(f,M);const lv=nivelDe(f,M);
  const og=origemDe(f);const o=og.o;const t=byId('trilhas',f.trilha);
  const r={c,o,og,t,lv,prog,det,pat:M.pat,est:M.est,nivelSep:M.nivelSep,alertas:[]};
  const mods=[];const add=(list,fonte)=>(list||[]).forEach(m=>m&&m.alvo&&mods.push({alvo:m.alvo,valor:+m.valor||0,fonte}));
  const flags=[];const flag=(x,fonte)=>{if(x)flags.push({...x,_fonte:fonte})};
  add(og.mods,o?(o.poderNome||o.nome):'');flag(o,o&&o.poderNome);
  const habs=[];
  const hk=(dono,x)=>dono.id+':'+x.nome;r.hk=hk;
  let nTrilha=0;
  if(c)(c.habilidades||[]).forEach(x=>{if(+x.nex<=prog){habs.push(x);add(x.mods,x.nome);flag({...x,escolha:(f.habEscolhas||{})[hk(c,x)]},x.nome)}});
  if(t)(t.habilidades||[]).forEach(x=>{if(+x.nex<=prog){nTrilha++;habs.push(x);add(x.mods,x.nome);flag({...x,escolha:(f.habEscolhas||{})[hk(t,x)]},x.nome)}});
  r.nTrilha=nTrilha;
  r.habs=habs;
  const pods=f.poderes.map(p=>({p,d:byId('poderes',p.ref)})).filter(x=>x.d);r.pods=pods;
  pods.forEach(({p,d})=>{add(d.mods,d.nome);if(f.afinidade&&d.elemento===f.afinidade)add(d.modsAfinidade,d.nome+' (afinidade)');flag({...d,escolha:p.escolha},d.nome);if(f.afinidade&&d.elemento===f.afinidade&&d.afin)flag({...d.afin,escolha:p.escolha,_afin:true},d.nome+' (afinidade)')});
  const inv=f.inventario;
  inv.forEach(it=>{if(!it.equipado)return;const n0=mods.length;add(it.mods,it.nome);modsDoItem(it).forEach(m=>{const e=m.efeitos||{};
    if(e.defesa)mods.push({alvo:'defesa',valor:e.defesa,fonte:m.nome,equip:true});if(e.deslocamento)mods.push({alvo:'deslocamento',valor:e.deslocamento,fonte:m.nome});
    if(e.pericia&&e.pericia.id)mods.push({alvo:'per:'+e.pericia.id,valor:+e.pericia.valor||0,fonte:m.nome});
    else if(e.pericia&&typeof e.pericia==='object')Object.entries(e.pericia).forEach(([k,v])=>mods.push({alvo:'per:'+k,valor:v,fonte:m.nome}));
    if(e.pv)mods.push({alvo:'pv',valor:e.pv,fonte:m.nome});if(e.pe)mods.push({alvo:'pe',valor:e.pe,fonte:m.nome});if(e.dt)mods.push({alvo:'dtRitual',valor:e.dt,fonte:m.nome})});
    mods.slice(n0).forEach(x=>x.equip=true)});
  const aliados=(f.aliados||[]).filter(a=>a.ativo&&a.ref).map(a=>({a,d:byId('aliados',a.ref)})).filter(x=>x.d);r.aliados=aliados;
  aliados.forEach(({a,d})=>{const b=d.bonusEf||{};add(b.mods,d.nome);if(b.per)Object.entries(b.per).forEach(([k,v])=>mods.push({alvo:'per:'+k,valor:v,fonte:d.nome}));if(b.deslocamento)mods.push({alvo:'deslocamento',valor:b.deslocamento,fonte:d.nome})});
  if(regraOn('idade'))(f.desvantagens||[]).forEach(id=>{const dv=D.desvantagensIdade.find(x=>x.id===id);if(dv)add(dv.mods,dv.nome)});
  // bônus e efeitos ativos (aba Bônus)
  const ef={defesa:0,ataque:0,dano:0,margem:0,mult:0,pericias:0,attr:{},per:{},dadosPer:{},danoArma:[],rd:[],resistPar:0,testes:0,dt:0,testesAttr:{},desloc:0};
  // Efeitos de rituais só acumulam se forem em alvos diferentes (arma × agente) ou em estatísticas
  // diferentes; na mesma estatística e no mesmo alvo vale o maior. Equipamento e poderes sempre somam.
  // ef.acumula: o efeito soma com outros rituais (ex.: Armadura de Sangue); ef.semEquip: não soma com a Defesa de equipamento (vale o maior).
  const contrib=[];const poe=(stat,v,b)=>{const rit=b.ritual!==false;const e={...((ritualDe(b)||{}).ef||{}),...(b.ef||{})};
    if(e.semEquip&&stat==='defesa'){defSemEquip.push({v,nome:b.nome});return}
    contrib.push({stat:rit?alvoEf(b)+'|'+stat:stat,v,nome:b.nome,ritual:rit&&!e.acumula})};
  const defSemEquip=[];const imuneEf=new Set();
  (f.bonus||[]).forEach(b=>{
    if(b.alvo&&!isNaN(+b.valor)&&b.tipo==='fixo'){mods.push({alvo:b.alvo,valor:+b.valor,fonte:b.nome})}
    let e=b.ef;if(!e)return;
    if(b.cont&&e.cont){e={...e};Object.entries(e.cont.por||{}).forEach(([k,v])=>e[k]=(+b.cont.atual||0)*v)} /* ex.: Embaralhar, +2 Defesa por cópia restante */
    if(e.imune)e.imune.forEach(id=>imuneEf.add(id));
    if(e.dt)ef.dt+=+e.dt;
    ['defesa','ataque','margem','mult','pericias','resistPar'].forEach(k=>{if(e[k])poe(k,+e[k],b)});
    if(e.attr&&e.valor)poe('attr:'+(b.attrEscolhido||String(e.attr).split('|')[0]),+e.valor,b);
    if(e.pericia)poe('per:'+e.pericia.id,+e.pericia.valor,b);
    if(e.dadosPer)Object.entries(e.dadosPer).forEach(([k,v])=>poe('dadosPer:'+k,+v,b));
    if(e.testesAttr)Object.entries(e.testesAttr).forEach(([k,v])=>poe('testesAttr:'+k,+v,b));
    if(e.deslocamento)poe('desloc',+e.deslocamento,b);
    if(e.danoArma)poe('danoArma:'+(/d/i.test(String(e.danoArma))?'dados':'fixo'),e.danoArma,b); /* dado elemental e dano fixo acumulam entre si */
    if(e.rd)String(e.rd).split(/[,;]/).forEach(t=>{const mm=t.trim().match(/^(.*?)\s*(\d+)$/);if(mm)poe('rd:'+mm[1].trim(),+mm[2],b);else poe('rdTxt:'+t.trim(),t.trim(),b)});
  });
  const peso=v=>typeof v==='number'?v:String(v).split('+').reduce((s,t)=>{const d=t.match(/(\d*)d(\d+)/);return s+(d?(+(d[1]||1))*(+d[2]+1)/2:(+t||0))},0);
  const melhor={};const naoAcumula=[];const somados=[];
  const disputa=(stat,c,x)=>{if(peso(c.v)>peso(x.v)){naoAcumula.push({stat,vale:c,ignorado:x});return c}naoAcumula.push({stat,vale:x,ignorado:c});return x};
  contrib.forEach(c=>{if(!c.ritual){somados.push(c);return}const x=melhor[c.stat];melhor[c.stat]=x?disputa(c.stat,c,x):c});
  // "+X em todos os testes" do agente disputa com "+X no ataque" e "+X numa perícia" de outro ritual do agente.
  const tod=melhor['agente|pericias'];ef.fonte={};
  if(tod){Object.keys(melhor).filter(k=>(k==='agente|ataque'||k.startsWith('agente|per:'))&&melhor[k].nome!==tod.nome).forEach(k=>{const x=melhor[k];
    disputa(k,x,tod)})}
  ef.ataqueArma=0;ef.fonte.pericias=tod?tod.nome:'';
  Object.entries(melhor).map(([stat,c])=>[stat,c.v,c.nome]).concat(somados.map(c=>[c.stat,c.v,c.nome])).forEach(([stat,v,nome])=>{
    const cat=stat.includes('|')?stat.split('|')[0]:'';const [k,sub]=stat.replace(/^[a-z]+\|/,'').split(/:(.*)/);
    if(k==='ataque'&&cat==='arma')ef.ataqueArma+=v;
    else if(['defesa','ataque','margem','mult','pericias','resistPar'].includes(k)){ef[k]+=v;if(k==='ataque'&&cat)ef.fonte.ataque=nome}
    else if(k==='attr')ef.attr[sub]=(ef.attr[sub]||0)+v;else if(k==='per'){ef.per[sub]=(ef.per[sub]||0)+v;if(cat)ef.fonte['per:'+sub]=nome}
    else if(k==='dadosPer')ef.dadosPer[sub]=(ef.dadosPer[sub]||0)+v;else if(k==='testesAttr')ef.testesAttr[sub]=(ef.testesAttr[sub]||0)+v;else if(k==='desloc')ef.desloc+=v;else if(k==='danoArma')ef.danoArma.push(v);
    else if(k==='rd')ef.rd.push(sub+' '+v);else if(k==='rdTxt')ef.rd.push(v)});
  ef.naoAcumula=naoAcumula;
  if(f.formaSuprema&&regraOn('mascaras')){ef.defesa+=10;ef.testes+=5;ef.dt+=5}
  r.ef=ef;r.mods=mods;r.flags=flags;
  // Efeitos automáticos de habilidades (definidos em build.js: HAB, HAB_CLASSE, POD)
  const somaF=k=>flags.reduce((s2,x)=>s2+(+x[k]||0),0),maxF=k=>flags.reduce((s2,x)=>Math.max(s2,+x[k]||0),0);
  r.margemTodos=somaF('margem');r.margemCorpo=somaF('margemCorpo');r.multTodos=somaF('mult');
  r.favorita=maxF('favorita');r.favoritaMargem=maxF('favoritaMargem');r.favoritaDado=maxF('favoritaDado');
  r.danoForma={};flags.forEach(x=>Object.entries(x.danoForma||{}).forEach(([k,v])=>r.danoForma[k]=(r.danoForma[k]||0)+v));
  r.danoAttrForma={};flags.forEach(x=>Object.assign(r.danoAttrForma,x.danoAttrForma||{}));
  r.danoAttrMunicao=flags.filter(x=>x.danoAttrMunicao).map(x=>x.danoAttrMunicao);
  r.dtElem={};flags.forEach(x=>{if(x.dtElem&&x.escolha)r.dtElem[x.escolha]=(r.dtElem[x.escolha]||0)+x.dtElem});
  r.ritDanoAttrs=flags.filter(x=>x.ritDanoAttr).map(x=>x.ritDanoAttr);
  r.imuneCond=new Set([...flags.flatMap(x=>x.imuneCond||[]),...imuneEf]);
  r.ritConcedidos=[...new Set(flags.flatMap(x=>x.ritConcedido||[]))];
  r.ataqueOcultismo=flags.some(x=>x.ataqueOcultismo);r.gladiador=maxF('gladiador');r.critMaxFogo=flags.some(x=>x.critMaxFogo);
  r.furtivo=flags.some(x=>x.furtivo);r.ataqueEspecial=flags.some(x=>x.ataqueEspecial);r.perito=flags.some(x=>x.perito);
  r.catRedGeral=maxF('catRedGeral');r.castExtra=flags.flatMap(x=>x.castExtra||[]);
  r.flagelo=flags.filter(x=>x.flagelo).reduce((a,x)=>Math.min(a,x.flagelo),99);if(r.flagelo===99)r.flagelo=0;
  r.resistParHab=somaF('resistPar');r.peLimAcao=maxF('peLimAcao');
  r.rdHab=flags.filter(x=>x.rdTexto).map(x=>x.rdTexto);
  const rdEl=flags.filter(x=>x.rdElem&&x.escolha).reduce((o2,x)=>(o2[x.escolha]=Math.max(o2[x.escolha]||0,x.rdElem),o2),{});
  Object.entries(rdEl).forEach(([k,v])=>r.rdHab.push(`${ELEM[k]} ${v}`));
  const m=k=>mods.filter(x=>x.alvo===k).reduce((s,x)=>s+x.valor,0);r.m=m;
  // atributos
  const el=t&&t.elementoEscolha?f.trilhaElemento:'';r.trilhaElemento=el;
  const Abase={...f.atributos};inv.forEach(it=>{if(it.equipado)modsDoItem(it).forEach(mm=>Object.entries((mm.efeitos||{}).attr||{}).forEach(([k,v])=>Abase[k]=(Abase[k]||0)+v))});flags.forEach(x=>{if(x.attrBonus)Object.entries(x.attrBonus).forEach(([k,v])=>Abase[k]=(Abase[k]||0)+v);
    if(el&&x.attrElem&&x.attrElem[el])Object.entries(x.attrElem[el]).forEach(([k,v])=>Abase[k]=(Abase[k]||0)+v)});
  const A={...Abase};Object.entries(ef.attr).forEach(([k,v])=>A[k]=(A[k]||0)+v);r.Abase=Abase;r.A=A;
  let peAttr=(flags.find(x=>x.peAttr)||{}).peAttr||'PRE',dtAttr='PRE';
  flags.forEach(x=>{if(el&&x.peAttrElem)peAttr=x.peAttrElem[el];if(el&&x.dtAttrElem)dtAttr=x.dtAttrElem[el]});r.peAttr=peAttr;r.dtAttr=dtAttr;
  // PV / PE / SAN / PD
  const ce=c&&D.extras.classesExtra[c.id]||{};const pIdx=patenteIdx(f);r.patIdx=pIdx;
  const por10=Math.floor((+f.nex||0)/10);
  const nTrans=pods.filter(x=>x.p.transcender&&!x.p.viaItem).length;r.nTrans=nTrans;
  if(c){
    if(M.pat&&ce.pat){r.pvMax=ce.pat.pv[0]+Abase.VIG+pIdx*(ce.pat.pv[1]+Abase.VIG)}
    else r.pvMax=+c.pvBase+Abase.VIG+(lv-1)*(+c.pvNex+Abase.VIG);
    r.pvMax+=m('pv')+m('pvBase')+m('pvNex')*lv+m('pvPor10')*por10;
    let pe=+c.peBase+Abase[peAttr]+(lv-1)*(+c.peNex+Abase[peAttr]);
    pe+=m('pe')+m('peNex')*lv+m('pePor10')*por10;
    if(flags.some(x=>x.peNexImpar))pe+=NEX_LIST.filter(n=>n<=f.nex&&n>5&&(n/5)%2===1).length;
    flags.forEach(x=>{if(x.peSomaAttr)pe+=Abase[x.peSomaAttr]||0});
    let san=+c.sanBase+(lv-1)*(+c.sanNex)+m('san')+m('sanNex')*lv;
    if(flags.some(x=>x.metadeSanInicial))san-=Math.floor(+c.sanBase/2);
    san-=nTrans*(+c.sanNex||0);san-=+f.sanPerm||0;
    if(det){
      let pd;
      if(M.pat&&ce.pat)pd=ce.pat.pd[0]+Abase.PRE+pIdx*(ce.pat.pd[1]+Abase.PRE);
      else pd=(ce.pdBase??(+c.peBase+2))+Abase[peAttr]+(lv-1)*((ce.pdNex??+c.peNex)+(ce.pdSemPre?0:Abase[peAttr]));
      pd+=m('pe')+m('peNex')*lv+m('pePor10')*por10;
      pd-=nTrans*(ce.pdNex??(+c.sanNex||0));pd-=+f.sanPerm||0;
      r.peMax=pd;r.sanMax=0;
    }else{r.peMax=pe;r.sanMax=san}
  }else{r.pvMax=r.peMax=r.sanMax=0}
  const retido=(f.retidos||[]).reduce((s,x)=>s+(+x.pe||0),0);r.retido=retido;r.peMax-=retido;
  if(f.formaSuprema&&regraOn('mascaras')){r.pvMax+=20;r.peMax+=10}
  ['pv','pe','san'].forEach(k=>{r[k+'Max']=Math.max(0,r[k+'Max']);r[k]=f[k]==null?r[k+'Max']:Math.min(f[k],r[k+'Max'])});
  r.pvTemp=+f.pvTemp||0;r.peTemp=+f.peTemp||0;
  // condições
  const conds=condicoesAtivas(f,r);r.conds=conds;
  const condEf={defesa:0,custoPE:0,desloc:null,dados:{}};
  conds.forEach(({c:cd})=>{const e=cd.efeitos||{};condEf.defesa+=+e.defesa||0;condEf.custoPE+=+e.custoPE||0;
    if(e.desloc!=null){if(e.desloc===0)condEf.desloc=0;else if(condEf.desloc!==0)condEf.desloc=e.desloc}
    Object.entries(e.dados||{}).forEach(([k,v])=>condEf.dados[k]=Math.min(condEf.dados[k]||0,v)) /* mesma penalidade não acumula */});
  (f.condicoes||[]).forEach(x=>{if(x.attr&&(x.id==='ferimento_debilitante'))condEf.dados[x.attr]=Math.min(condEf.dados[x.attr]||0,-1)});
  r.condEf=condEf;
  r.machucadoEf=[];
  if(conds.has('machucado')||conds.has('morrendo')){let attrV={};flags.forEach(x=>{const sm=x.seMachucado;if(!sm)return;
    if(sm.defesa){condEf.defesa+=sm.defesa;r.machucadoEf.push(`+${sm.defesa} Defesa (${x._fonte})`)}
    if(sm.rd)r.machucadoEf.push(sm.rd);
    if(sm.attrValor){const a=x.escolha||(x.escolheAttr||['FOR'])[0];attrV[a]=Math.max(attrV[a]||0,sm.attrValor)}});
    Object.entries(attrV).forEach(([a,v])=>{A[a]=(A[a]||0)+v;r.machucadoEf.push(`+${v} ${ATTR_NOME[a]} (enquanto machucado)`)})}
  // carga
  r.esp=inv.reduce((s,i)=>{let e=espItem(i);if(flags.some(x=>x.cargaInt)&&e===0.5)e=0.25;return s+e*(+i.qtd||1)},0);
  r.esp=Math.round(r.esp*100)/100;
  const forCarga=A.FOR+(flags.some(x=>x.cargaIntForca)?A.INT:0);
  r.carga=(forCarga>0?5*forCarga:2)+m('carga')+(flags.some(x=>x.cargaInt)?A.INT:0);
  r.sobrecarga=r.esp>r.carga;if(r.esp>2*r.carga)r.alertas.push('Carga acima do dobro do limite: o agente não consegue se mover.');
  const armad=inv.filter(i=>i.equipado&&i.tipo==='protecao');
  const prot=armad.reduce((s,i)=>s+(+i.defesa||0),0);
  // Defesa de equipamento × efeitos que não acumulam com equipamento: vale o maior.
  const defEquip=prot+mods.filter(x=>x.alvo==='defesa'&&x.equip).reduce((s,x)=>s+x.valor,0);
  const defSE=defSemEquip.reduce((s,x)=>s+x.v,0);let defEq=defEquip;r.defSemEquip=null;
  if(defSemEquip.length){defEq=Math.max(defEquip,defSE);r.defSemEquip={v:defSE,equip:defEquip,nomes:defSemEquip.map(x=>x.nome),vale:defSE>=defEquip?'ritual':'equipamento'}}
  r.defesa=10+A.AGI+defEq+m('defesa')-mods.filter(x=>x.alvo==='defesa'&&x.equip).reduce((s,x)=>s+x.valor,0)+condEf.defesa+ef.defesa-(r.sobrecarga?5:0);
  let desl=9+m('deslocamento')+ef.desloc-(r.sobrecarga?3:0);
  if(condEf.desloc===0)desl=0;else if(condEf.desloc==='metade')desl=Math.floor(desl/2/1.5)*1.5;else if(typeof condEf.desloc==='number')desl=Math.min(desl,condEf.desloc);
  r.desloc=desl;
  if(M.pat)r.peLim=LIM_PD_PATENTE[pIdx]+m('peLimite');else r.peLim=(c&&c.limitePE?+c.limitePE:lv)+m('peLimite');
  const plr=(flags.find(x=>x.peLimRitual)||{}).peLimRitual;r.peLimRit=r.peLim+(plr?A[plr]||0:0);
  r.dt=10+r.peLim+A[dtAttr]+m('dtRitual')+ef.dt;r.circ=M.est?1:circuloMax(f.nex);
  r.custoExtra=condEf.custoPE;
  r.rd=[...inv.filter(i=>i.equipado&&i.rd).map(i=>typeof i.rd==='number'?'RD '+i.rd+' ('+i.nome+')':i.rd+' ('+i.nome+')'),...ef.rd,...r.rdHab,...r.machucadoEf.filter(x=>/^RD/.test(x))];
  r.resistPar=r.resistParHab+(ef.resistPar||0);
  // perícias
  const auto={};og.per.forEach(id=>auto[id]='origem');(c&&c.periciasFixas||[]).forEach(id=>auto[id]=auto[id]||'classe');
  escolhasClasse(c).forEach((g,i)=>{const pick=f.escolhas[i];if(pick&&g.includes(pick))auto[pick]=auto[pick]||'classe'});
  aliados.forEach(({a,d})=>{const b=d.bonusEf||{};(b.treina||[]).forEach(id=>auto[id]=auto[id]||'aliado');(a.escolhas||[]).forEach(id=>auto[id]=auto[id]||'aliado')});
  const extra2={};
  flags.forEach(x=>{let id=x.treinaOu2;if(!id)return;if(id==='pericia')id=x.escolha;if(!id)return;
    if(auto[id]||(+f.pericias[id]||0)>=5)extra2[id]=(extra2[id]||0)+(x.treinaValor||2);else auto[id]=x.treinaOu2==='pericia'?'escolha':'habilidade'});
  r.auto=auto;r.per={};
  const perAttr={};flags.forEach(x=>{if(x.perAttr)Object.assign(perAttr,x.perAttr)});
  const somaAttr={};flags.forEach(x=>{if(x.somaAttrPer)Object.assign(somaAttr,x.somaAttrPer)});
  const itemPer={};inv.forEach(it=>{if(!it.equipado&&!['acessorio'].includes(it.tipo))return;if(it.tipo==='acessorio'&&!it.equipado)return;
    const ms=modsDoItem(it);const extra=ms.reduce((a,mm)=>a+(+(mm.efeitos||{}).bonusPericia||0),0);const soma=(k,v)=>itemPer[k]=Math.max(itemPer[k]||0,v);
    if(typeof it.bonusPericia==='number'&&it.pericia)soma(it.pericia,it.bonusPericia+extra);
    else if(it.bonusPericia&&typeof it.bonusPericia==='object')Object.entries(it.bonusPericia).forEach(([k,v])=>soma(k,v+extra));
    if(it.periciaExtra&&ms.some(mm=>mm.id==='mod_funcao_adicional_acessorio'))soma(it.periciaExtra,2)});
  const origemBonus={};if(o&&o.escolhePericiaBonus&&f.origemEscolha)origemBonus[f.origemEscolha]=o.escolhePericiaBonus.valor;
  const dadosFixos={};if(o&&o.dadosPer)Object.assign(dadosFixos,o.dadosPer);
  flags.forEach(x=>{if(x.escolheDadoPericia&&x.escolha)dadosFixos[x.escolha]=(dadosFixos[x.escolha]||0)+1});
  aliados.forEach(({d})=>{const b=d.bonusEf||{};Object.entries(b.dadosPer||{}).forEach(([k,v])=>dadosFixos[k]=(dadosFixos[k]||0)+v)});
  Object.entries(ef.dadosPer).forEach(([k,v])=>dadosFixos[k]=(dadosFixos[k]||0)+v);
  const dadosAtk=aliados.reduce((s,{d})=>s+((d.bonusEf||{}).dadosAtaque||0),0);r.dadosAtk=dadosAtk;
  const cargaPen=armad.reduce((s,i)=>s+(i.mods||[]).filter(mm=>mm.alvo==='carga_pen').reduce((a,mm)=>a+(+mm.valor),0),0);
  pericias().forEach(p=>{const manual=+f.pericias[p.id]||0;const grau=Math.max(manual,auto[p.id]?5:0);
    const attr=perAttr[p.id]||p.attr;
    let bonus=grau+(+f.outros[p.id]||0)+m('per:'+p.id)+(extra2[p.id]||0)+(itemPer[p.id]||0)+(origemBonus[p.id]||0)+ritPer(ef,p.id)+ef.testes+(ef.testesAttr[attr]||0);
    if(p.carga){if(r.sobrecarga)bonus-=5;bonus+=cargaPen}
    if(['fortitude','reflexos','vontade'].includes(p.id))bonus+=m('resist');
    if(somaAttr[p.id])bonus+=A[somaAttr[p.id]]||0;
    (f.condicoes||[]).forEach(x=>{if(x.id==='ferimento_investigacao'&&x.attr===attr)bonus-=2});
    const atk=p.id==='luta'||p.id==='pontaria';
    const dm=dadosMod(r,{per:p.id,attr,atk,corpo:p.id==='luta'})+(dadosFixos[p.id]||0)+(atk?dadosAtk:0);
    r.per[p.id]={rit:ritPer(ef,p.id),grau,manual,bonus,attr,base:A[attr]??1,dm,dados:(A[attr]??1)+dm,auto:auto[p.id],extra2:extra2[p.id],bloq:p.somenteTreinada&&!grau}});
  // contadores de escolhas
  const extraTrein=Object.entries(f.pericias).filter(([id,g])=>g>=5&&!auto[id]).length;
  r.trein={usado:extraTrein,max:c?(+c.periciasLivres+f.atributos.INT):0};
  r.vet={usado:Object.values(r.per).filter(x=>x.grau>=10).length,max:(f.nex>=35&&c)?(+c.grau+f.atributos.INT):0};
  r.exp={usado:Object.values(r.per).filter(x=>x.grau>=15).length,max:(f.nex>=70&&c)?(+c.grau+f.atributos.INT):0};
  const At=f.atributos;const pts=ATTR.reduce((s,a)=>s+(At[a]-1),0),zeros=ATTR.reduce((s,a)=>s+(At[a]<1?1-At[a]:0),0);
  const baseAttr=(c&&c.estagios)||regraOn('nex0')&&c&&c.regra==='nex0'?3:4;
  const aum=M.est?((+f.estagio||1)>=3?1:0):aumentosAttr(f.nex);
  r.attr={usado:pts+zeros,max:baseAttr+aum+zeros,zeros,teto:M.est?3:(f.nex>=5?5:3)};
  const contaPoder=pods.filter(x=>!x.p.extra).length;
  r.poderes={usado:contaPoder,max:(M.est?0:poderesPermitidos(f.nex))+(regraOn('idade')&&f.faixa==='adulto'?1:0)};
  let ritMax=0;if(c&&+c.ritInicial>0){const nexs=NEX_LIST.filter(n=>n>5&&n<=f.nex);
    ritMax=+c.ritInicial+(regraOn('aprendizado_campo')?0:regraOn('aprendizado_lento')?nexs.filter(n=>(n/5)%2===1).length:nexs.length*(+c.ritNex||0))}
  ritMax+=pods.filter(x=>x.d.aprendeRitual).length;flags.forEach(x=>{if(x.ritExtra)ritMax+=x.ritExtra==='saberAmpliado'?r.circ:(+x.ritExtra||1)});
  r.rit={usado:f.rituais.length,max:ritMax};
  r.patente=PATENTES[pIdx];
  r.catUso=[1,2,3,4].map(k=>inv.filter(i=>catItem(i,r)===k).reduce((s,i)=>s+(+i.qtd||1),0));
  // preço das maldições: atributos ligados aos itens amaldiçoados equipados
  const pm={};inv.forEach(it=>{if(!it.equipado&&it.tipo!=='arma')return;const els=[];if(it.tipo==='amaldicoado'&&it.elemento)els.push(it.elemento);
    modsDoItem(it).forEach(mm=>{if(mm.maldicao&&mm.elemento)els.push(mm.elemento)});
    els.forEach(e=>(D.extras.precoMaldicao[e]||[]).forEach(a=>{(pm[a]=pm[a]||[]).push(it.nome)}))});
  r.precoMaldicao=pm;
  return r;
}
/* Bônus de rituais numa perícia: "+X em todos os testes" e "+X nesta perícia" de rituais diferentes não somam. */
function ritPer(ef,id){const a=ef.per[id]||0,t=ef.pericias||0;if(!a||!t)return a+t;return ef.fonte['per:'+id]&&ef.fonte['per:'+id]===ef.fonte.pericias?a+t:Math.max(a,t)}
/* Alvo de um efeito de ritual: a arma (Arma Atroz, Amaldiçoar Arma) ou o próprio agente. */
function ritualDe(b){return b.ritual===false?null:(D.rituais||[]).find(x=>String(b.nome||'').startsWith(x.nome))}
function alvoEf(b){if(b.alvoEf)return b.alvoEf;const rit=(D.rituais||[]).find(x=>String(b.nome||'').startsWith(x.nome));return rit&&/arma|muni/i.test(rit.alvo||'')?'arma':'agente'}
/* Nome legível da estatística de um efeito, para os avisos de "não acumula". */
function nomeStat(stat){const cat=stat.includes('|')?stat.split('|')[0]:'';const [k,sub]=stat.replace(/^[a-z]+\|/,'').split(/:(.*)/);const em=cat?(cat==='arma'?' da arma':' do agente'):'';
  return nomeStat0(k,sub)+em}
function nomeStat0(k,sub){
  return {defesa:'Defesa',ataque:'testes de ataque',margem:'margem de ameaça',mult:'multiplicador de crítico',pericias:'todas as perícias',resistPar:'resistência a paranormal',danoArma:sub==='fixo'?'dano fixo da arma':'dano extra em dados da arma'}[k]
    ||(k==='testesAttr'?'testes de '+(ATTR_NOME[sub]||sub):k==='desloc'?'deslocamento':k==='attr'?ATTR_NOME[sub]||sub:k==='per'?perNome(sub):k==='dadosPer'?'dados em '+perNome(sub):k==='rd'?'RD '+sub:sub)}
const valStat=(stat,v)=>typeof v==='number'?(stat.replace(/^[a-z]+\|/,'').startsWith('dadosPer')?`+${v}d20`:sgn(v)):'+'+v;
/* Dados extras/penalidades de condições num teste. */
function dadosMod(r,{per,attr,atk,corpo}){
  const d=r.condEf.dados;let n=0;const pick=k=>{if(d[k])n+=d[k]};
  pick('todos');if(per)pick('pericias');if(per)pick('per:'+per);if(attr)pick(attr);if(atk){pick('ataque');if(corpo)pick('ataqueCorpo')}
  return n;
}

/* ============================== ARMAS ============================== */
/* Amaldiçoar Arma ativo (aba Bônus): a arma corpo a corpo empunhada conta como amaldiçoada. */
const amaldicoadaAtiva=f=>(f.bonus||[]).some(b=>b.tipo==='efeito'&&/^Amaldiçoar Arma/.test(b.nome||''));
function armaInfo(it,r,f){
  const ms=modsDoItem(it);const e=k=>ms.reduce((s,m)=>s+(+(m.efeitos||{})[k]||0),0);
  const corpo=it.forma==='corpo'||it.alcance==='corpo';const forma=corpo?'corpo':(it.forma||'fogo');
  let per=corpo&&!it._arremesso?'luta':'pontaria';
  // Lâmina Maldita: com a arma amaldiçoada pelo ritual, ataca com Ocultismo.
  const ocult=r.ataqueOcultismo&&corpo&&f&&amaldicoadaAtiva(f);if(ocult)per='ocultismo';
  const p=r.per[per]||{bonus:0,dados:1};
  const crit=String(it.critico||'20');const mg=crit.match(/(\d{2})/);const mu=crit.match(/x(\d)/i);
  let margem=mg?+mg[1]:20,mult=mu?+mu[1]:2;
  const fav=it.favorita&&r.favorita;
  margem-=e('margem')+r.ef.margem+r.margemTodos+(corpo?r.margemCorpo:0)+(fav?r.favoritaMargem:0);mult+=e('mult')+r.ef.mult+r.multTodos;
  if(ms.some(m=>(m.efeitos||{}).margemDobra)){const base=21-(mg?+mg[1]:20);margem=21-2*base}
  const ritAtk=r.ef.fonte.ataque&&r.ef.fonte.ataque===r.ef.fonte.pericias?r.ef.ataque:Math.max(0,r.ef.ataque-(p.rit||0));
  const atk=p.bonus+(+it.atkBonus||0)+e('atk')+ritAtk+r.ef.ataqueArma+(it.atk&&!isNaN(+it.atk)?+it.atk:0);
  const usaAgi=!ocult&&it.agil&&corpo&&r.A.AGI>r.A.FOR;
  let dadosAtk=(usaAgi?p.dados-r.A.FOR+r.A.AGI:p.dados)+(String(it.atk||'').includes('d20')?(parseInt(it.atk)||0):0);
  let dano=String(it.dano||'');const extraDados=e('dados')+(fav?r.favoritaDado:0);
  if(extraDados&&/^\d+d\d+/.test(dano))dano=dano.replace(/^(\d+)d(\d+)/,(x,q,fc)=>(+q+extraDados)+'d'+fc);
  const somaFor=corpo||it.arremesso||it.somaFor;let fixo=e('dano')+(somaFor?(usaAgi?r.A.AGI:r.A.FOR):0);
  const fontesDano=[];
  if(r.danoForma[forma]){fixo+=r.danoForma[forma];fontesDano.push(sgn(r.danoForma[forma]))}
  const af=r.danoAttrForma[forma];if(af){fixo+=r.A[af]||0;fontesDano.push(`+${af}`)}
  r.danoAttrMunicao.forEach(x=>{if(new RegExp(x.municao,'i').test(String(it.municao||'')+' '+String(it.desc||''))){fixo+=r.A[x.attr]||0;fontesDano.push(`+${x.attr}`)}});
  const extras=[];ms.forEach(m=>{if((m.efeitos||{}).danoExtra)extras.push(m.efeitos.danoExtra)});if(corpo)r.ef.danoArma.forEach(x=>extras.push(x));
  return {per,ocult,atk,dados:dadosAtk,dano,fixo,extras,margem:Math.max(2,margem),mult,corpo,forma,fav};
}
function danoExpr(ai,crit){
  let base=ai.dano;if(crit&&/^\d+d\d+/.test(base))base=base.replace(/^(\d+)d(\d+)/,(x,q,fc)=>(+q*ai.mult)+'d'+fc);
  return [base,ai.fixo?sgn(ai.fixo):'',...ai.extras.map(x=>'+'+x)].join('');
}

/* ============================== ROLAGENS ============================== */
function rollD20(dados){const n=dados<1?2-dados:dados;const rolls=Array.from({length:n},()=>rnd(20));const pick=dados<1?Math.min(...rolls):Math.max(...rolls);return {n,rolls,pick,pior:dados<1}}
function rollTest(label,dados,bonus,ctx={}){
  const x=rollD20(dados);
  const roll={t:label,v:x.pick+bonus,d:`${x.n}d20${x.pior?' (pior)':''} [${x.rolls.join(', ')}] ${bonus>=0?'+':'−'} ${Math.abs(bonus)}`,crit:x.pick>=(ctx.margem||20),nat:x.pick,acts:[]};
  const f=F();
  if(f&&ctx.attr){
    (f.bonus||[]).forEach(b=>{if(b.tipo==='dado'&&(+b.usos||0)>0&&(!b.attrs||b.attrs.includes(ctx.attr)||b.qualquer))roll.acts.push({l:`+${b.valor} ${b.nome} (${b.usos})`,a:'useBonus',id:b.uid})});
    if(S.cfg.auto.maldicao){const r=calc(f);const its=r.precoMaldicao[ctx.attr];if(its&&its.length)roll.acts.push({l:`Falhou? Preço da maldição (−${2*its.length} SAN)`,a:'precoMald',n:its.length})}
  }
  if(ctx.arma!=null)roll.acts.push({l:roll.crit?'Rolar dano crítico':'Rolar dano',a:'dmgFrom',i:ctx.arma,crit:roll.crit});
  if(ctx.arma!=null&&f)roll.acts.push(...acoesAtaque({arma:ctx.arma,origem:(f.inventario[ctx.arma]||{}).nome,autor:f.nome}));
  pushRoll(roll);return roll;
}
/* meta: {tipos, origem, autor, autorChave}. Em combate, a rolagem ganha botões para mandar o dano a um alvo. */
function rollDano(label,expr,A,meta={}){const s=String(expr||'').trim();if(!s){toast('Sem dano definido.');return null}
  const x=rollExpr(s,A);const tipos=meta.tipos||tiposDe(label+' '+s);
  pushRoll({t:label,v:x.total,d:x.txt,acts:acoesAlvo(x.total,{...meta,tipos})});return x.total}
function maxExpr(expr,A={}){let s2=String(expr||'').replace(/\s/g,'').toUpperCase().replace(/(AGI|FOR|INT|PRE|VIG)/g,m=>String(A[m]??0));
  return s2.replace(/(\d*)D(\d+)/g,(x,q,fc)=>String((+q||1)*(+fc))).split(/(?=[+-])/).reduce((t,v)=>t+(+v||0),0)}
function pushRoll(r){S.rolls.unshift(r);S.rolls=S.rolls.slice(0,3);renderRolls()}
function renderRolls(){const el=document.getElementById('dicelog');if(!el)return;const vis=S.rollsAbertos?S.rolls:S.rolls.slice(0,1);
  el.innerHTML=vis.map((r,i)=>`<div class="roll-card ${r.crit?'crit':''}" ${i?'style="opacity:.8"':''}><span class="t">${h(r.t)}</span><span class="d">${h(r.d)}</span><span class="v" ${typeof r.v==='string'?'style="font-size:24px"':''}>${h(r.v)}</span>
  ${i===0?`<div class="ra">${(r.acts||[]).map((a,k)=>`<button data-act="rollAct" data-k="${k}">${h(a.l)}</button>`).join('')}${S.rolls.length>1?`<button data-act="rollsTgl">${S.rollsAbertos?'Ocultar anteriores':'Anteriores ('+(S.rolls.length-1)+')'}</button>`:''}<button data-act="clearRolls" aria-label="Fechar rolagens">Fechar</button></div>`:''}</div>`).join('')}

/* ============================== AÇÕES SOBRE A FICHA ============================== */
/* Aplica "-15", "+8", "=20", "-2d6" a PV, PE (ou PD) e SAN. Pontos temporários absorvem perdas primeiro. */
function aplicarDelta(f,k,txt,opts={}){
  const s=String(txt||'').trim().replace(',','.');if(!s)return;
  const r=calc(f);let modo='-';let corpo=s;
  if(/^[=+\-]/.test(s)){modo=s[0];corpo=s.slice(1)}
  const x=rollExpr(corpo,r.A);if(!corpo||isNaN(x.total)){toast('Use algo como -15, +8, =20 ou -2d6.');return}
  const v=Math.max(0,x.total);const max=r[k+'Max'];let cur=r[k];const nome={pv:'PV',pe:r.det?'PD':'PE',san:'SAN'}[k];
  let msg='';
  if(modo==='='){f[k]=Math.min(max,v);msg=`${nome} = ${f[k]}`}
  else if(modo==='+'){f[k]=Math.min(max,cur+v);msg=`+${f[k]-cur} ${nome}${x.txt.includes('d')?' ('+x.txt+')':''}`}
  else{
    let dano=v;const tk=k+'Temp';
    if((k==='pv'||k==='pe')&&(+f[tk]||0)>0&&!opts.ignoraTemp){const abs=Math.min(+f[tk],dano);f[tk]=+f[tk]-abs;dano-=abs;if(k==='pv'&&abs){S._abs=S._abs||{};S._abs[f.id]=(S._abs[f.id]||0)+abs}if(abs)msg+=`${abs} absorvido(s) pelos ${nome} temporários. `}
    const novo=k==='pv'?Math.max(-r.pvMax,cur-dano):Math.max(0,cur-dano);f[k]=novo;
    msg+=`−${dano} ${nome}${x.txt.includes('d')?' ('+x.txt+')':''} → ${novo}/${max}`;
    if(k==='pv'&&S.cfg.auto.massivo&&v>=Math.ceil(r.pvMax/2)&&r.pvMax&&cur>0&&novo>0)msg+=' · Dano massivo: Fortitude DT 15 ou cai a 0 PV.';
    if(k==='pv'&&cur>0&&novo<=0)msg+=' · Morrendo.';
    if(k==='pe'&&r.det&&opts.mental){if(dano>cur)addCond(f,'enlouquecendo');else if(novo<r.peMax/2)addCond(f,'perturbado')}
    if(k==='san'&&cur>=r.sanMax/2&&novo<r.sanMax/2&&novo>0)msg+=' · Perturbado: role um efeito de insanidade.';
    if(k==='san'&&cur>0&&novo<=0)msg+=' · Enlouquecendo.';
  }
  if(k==='pv'&&f.pv>0)delete (f.contadores||{}).morrendo;
  saveF(f);toast(msg);
}
function addCond(f,id,extra={}){if(!(f.condicoes||[]).some(x=>x.id===id))(f.condicoes=f.condicoes||[]).push({id,...extra})}
function gastarPE(f,n,motivo,op={}){const r=calc(f);const lim=op.ritual?r.peLimRit:r.peLim;const total=n+(n>0?r.custoExtra:0);const disp=r.pe+r.peTemp;const nm=r.det?'PD':'PE';
  if(total>disp){toast(`${nm} insuficiente: ${motivo} custa ${total} ${nm}.`);return false}
  if(total>lim)toast(`Atenção: ${total} ${nm} passa do limite por turno (${lim}).`);
  let resto=total;const tmp=Math.min(+f.peTemp||0,resto);f.peTemp=(+f.peTemp||0)-tmp;resto-=tmp;f.pe=r.pe-resto;return total}
function perderSan(f,n,perm=0){const r=calc(f);if(r.det){f.pe=Math.max(0,r.pe-n-perm)}else f.san=Math.max(0,r.san-n);if(perm)f.sanPerm=(+f.sanPerm||0)+perm}
function fimDeCena(f){f.pvTemp=0;f.peTemp=0;f.contadores={};f.bonus=(f.bonus||[]).filter(b=>b.dur!=='cena'&&b.dur!=='sust'&&b.dur!=='rodadas');f.inventario=f.inventario.filter(i=>!i.temporario);f.formaSuprema=false;saveF(f)}
function fimDeMissao(f){fimDeCena(f);f.bonus=(f.bonus||[]).filter(b=>b.dur!=='missao'&&b.dur!=='interludio');saveF(f)}
/* Adiciona (ou acumula) um bônus em dado de interlúdio, como Ler e Exercitar. */
function addBonusDado(f,b,r){
  const ex=(f.bonus||[]).find(x=>x.tipo==='dado'&&x.chave===b.chave);const max=b.max?Math.max(1,r.A[b.max]||0):99;
  if(ex){if(ex.usos>=max){return `${b.nome}: já no máximo (${max}).`}ex.usos++;ex.valor=b.valor;return `${b.nome}: agora ${ex.usos}× ${b.valor}.`}
  (f.bonus=f.bonus||[]).push({uid:uid(),tipo:'dado',usos:1,...b});return `${b.nome}: +${b.valor} disponível.`;
}
