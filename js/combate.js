/* ============================== COMBATE ==============================
   Dano e cura durante a iniciativa da campanha. O servidor desconta resistências, imunidades e
   vulnerabilidades das criaturas e guarda um registro de tudo (quem causou, em quem, quanto,
   turnos e efeitos) para o resumo do fim do combate. */
const TIPOS_DANO=[['balistico','Balístico'],['corte','Corte'],['impacto','Impacto'],['perfuracao','Perfuração'],['eletricidade','Eletricidade'],['fogo','Fogo'],['frio','Frio'],['quimico','Químico'],['mental','Mental'],['sangue','Sangue'],['morte','Morte'],['conhecimento','Conhecimento'],['energia','Energia'],['medo','Medo']];
const TIPO_NOME=Object.fromEntries(TIPOS_DANO);
const TIPO_RAIZ={balistico:'balistic',corte:'corte',impacto:'impacto',perfuracao:'perfura',eletricidade:'eletric',fogo:'fogo',frio:'frio',quimico:'quimic',mental:'mental',sangue:'sangue',morte:'morte',conhecimento:'conhecimento',energia:'energia',medo:'medo'};
/* Acha os tipos de dano citados num texto ("Impacto + Fogo", "2d8+5 Sangue"). */
function tiposDe(txt){const s=slug(txt||'').replace(/_/g,' ');return TIPOS_DANO.map(([k])=>k).filter(k=>new RegExp('\\b'+TIPO_RAIZ[k]).test(s))}

/* Lê resistências, imunidades e vulnerabilidades escritas na ficha da criatura. */
function defesasCri(c){
  const d={res:{},resTudo:0,imu:[],imuTudo:false,imuExceto:[],vul:[]};if(!c)return d;
  String(c.resistencias||'').split(';').forEach(p=>{const n=+((p.match(/(\d+)\s*$/)||[])[1]||0);if(!n)return;const ts=tiposDe(p);
    if(!ts.length&&/^\s*dano\b/i.test(p))d.resTudo=Math.max(d.resTudo,n);ts.forEach(t=>d.res[t]=Math.max(d.res[t]||0,n))});
  String(c.imunidades||'').split(/[,;]/).forEach(p=>{const t=p.trim();
    const m=t.match(/^dano(\s*\(exceto ([^)]*)\))?(\s+e todas.*)?$/i);
    if(m){d.imuTudo=true;if(m[2])d.imuExceto.push(...tiposDe(m[2]));return}
    d.imu.push(...tiposDe(t))});
  d.vul=tiposDe(c.vulnerabilidades||'');
  return d;
}
function defesasTxt(d){if(!d)return '';const p=[];
  if(d.imuTudo)p.push('imune a dano'+(d.imuExceto.length?' (exceto '+d.imuExceto.map(t=>TIPO_NOME[t]).join(', ')+')':''));
  if(d.imu.length)p.push('imune: '+d.imu.map(t=>TIPO_NOME[t]).join(', '));
  if(d.resTudo)p.push('RD '+d.resTudo);
  const rs=Object.entries(d.res||{});if(rs.length)p.push('resiste: '+rs.map(([t,n])=>TIPO_NOME[t]+' '+n).join(', '));
  if(d.vul.length)p.push('vulnerável: '+d.vul.map(t=>TIPO_NOME[t]).join(', '));
  return p.join(' · ')}

/* ---------- quem pode ser alvo agora ---------- */
const chaveMinha=(d,f)=>{const e=(d.entradas||[]).find(x=>x.meu&&x.chave.endsWith(':'+f.id));return e&&e.chave};
function contextoCombate(){
  if(S.view==='escudo'&&S.ini&&(S.ini.entradas||[]).length&&souMestre())return {mesa:S.mesaAberta,mestre:true,es:ordenarIni(S.ini.entradas)};
  const f=F();if(!f||f._alheia||!f.mesa||!(S.conta&&S.conta.usuario))return null;
  const d=(S.iniJog||{})[f.mesa];if(!d||!d.pedido)return null;
  return {mesa:f.mesa,mestre:false,es:ordenarIni(d.entradas||[]).filter(e=>e.tipo!=='agente'),autor:f.nome||'Agente',ficha:f.id,autorChave:chaveMinha(d,f)};
}
/* Alvos de ritual: todos da iniciativa menos o próprio agente. */
function alvosRitual(f){if(!f||f._alheia||!f.mesa||!(S.conta&&S.conta.usuario))return [];const d=(S.iniJog||{})[f.mesa];if(!d||!d.pedido)return [];
  const eu=chaveMinha(d,f);return ordenarIni(d.entradas||[]).filter(e=>e.chave!==eu)}
/* Aplica o ritual em cada alvo marcado; o servidor rola o teste de resistência da criatura. */
async function ritualNosAlvos(f,o){
  const d=(S.iniJog||{})[f.mesa];const autorChave=d&&chaveMinha(d,f);const out=[];
  for(const ch of o.alvos){const e=(d.entradas||[]).find(x=>x.chave===ch);if(!e)continue;
    let cura=null;if(o.cura){const x=rollExpr(o.cura,o.A);cura=x.total;pushRoll({t:`${o.ritual}: cura em ${e.nome}`,v:'+'+cura,d:x.txt})}
    try{const r=await Api.req('POST',`/api/mesas/${encodeURIComponent(f.mesa)}/iniciativa`,{acao:'ritual',alvo:ch,ritual:o.ritual,dt:o.dt,resistencia:o.resistencia,dano:e.tipo==='agente'?null:o.dano,tipos:o.tipos,cura,efeito:o.efeito,autor:f.nome,autorChave,ficha:f.id});
      out.push(`${r.alvo}: ${r.valor!=null?r.valor+' de dano':r.cura?'+'+r.cura+' PV':r.efeito?'efeito marcado':'atingido'}${r.nota?' ('+r.nota+')':''}${r.caiu?' · caiu!':''}`)}
    catch(err){out.push(`${e.nome}: ${err.message}`)}}
  if(out.length)toast(out.join(' · '),8000);S._iniJogKey=null;atualizarIniJogador();
}
/* Botões "Dano em X" que aparecem na rolagem de dano quando há combate. */
function acoesAlvo(valor,meta={}){
  const c=contextoCombate();if(!c||!(valor>0))return [];
  const tipos=meta.tipos||[];
  return c.es.filter(e=>e.chave!==meta.autorChave).slice(0,10).map(e=>({l:`${valor} em ${e.nome}`,a:'danoAlvo',ch:e.chave,v:valor,tipos,autor:meta.autor||c.autor||null,autorChave:meta.autorChave||c.autorChave||null,origem:meta.origem||null,mesa:c.mesa,ficha:c.ficha||null}));
}
/* Botões "Atacar X" na rolagem de ataque com arma (jogador) ou de criatura (mestre). */
function acoesAtaque(extra){const c=contextoCombate();if(!c)return [];
  return c.es.filter(e=>e.chave!==extra.autorChave).slice(0,10).map(e=>({l:`Atacar ${e.nome}`,a:'ataqueAlvo',ch:e.chave,mesa:c.mesa,ficha:c.ficha||null,autor:extra.autor||c.autor||null,autorChave:extra.autorChave||c.autorChave||null,...extra}));
}
/* Mestre: a Defesa dos agentes vem da ficha ligada; a das criaturas, da ficha delas. */
function defesaDe(e){if(!e)return null;if(e.tipo==='agente'){const ag=agenteDe(e);return ag?ag.r.defesa:null}const d=(e.dados||{}).def;return d==null||d===''?null:+d}
async function enviarAtaque(ac,roll){
  const e=((S.view==='escudo'?S.ini:(S.iniJog||{})[ac.mesa])||{entradas:[]}).entradas.find(x=>x.chave===ac.ch);
  const corpo={acao:'ataque',alvo:ac.ch,valor:roll.v,critico:!!roll.crit,autor:ac.autor,autorChave:ac.autorChave,ficha:ac.ficha,origem:ac.origem||null};
  if(S.view==='escudo'&&e&&e.tipo==='agente'){const d=defesaDe(e);if(d!=null)corpo.acertou=roll.v>=d}
  const r=await Api.req('POST',`/api/mesas/${encodeURIComponent(ac.mesa)}/iniciativa`,corpo);
  const defTxt=S.view==='escudo'&&defesaDe(e)!=null?` (Defesa ${defesaDe(e)})`:'';
  toast(r.acertou===true?`Acertou ${r.alvo}!${defTxt}${roll.crit?' Crítico!':''}`:r.acertou===false?`Errou ${r.alvo}.${defTxt}`:`Ataque ${roll.v} contra ${r.alvo}: o mestre diz se acertou.`,5000);
  return r;
}
async function enviarDano(o){
  const r=await Api.req('POST',`/api/mesas/${encodeURIComponent(o.mesa)}/iniciativa`,{acao:o.cura?'cura':'dano',alvo:o.ch,valor:o.v,tipos:o.tipos||[],autor:o.autor,autorChave:o.autorChave,origem:o.origem,ficha:o.ficha,ignorar:o.ignorar});
  const tp=(r.tipos||[]).map(t=>TIPO_NOME[t]).join('+');
  toast(o.cura?`${r.alvo} recuperou ${r.valor} PV.`:`${r.alvo} sofreu ${r.valor}${tp?' ('+tp+')':''}${r.valor!==r.bruto||r.nota?` · de ${r.bruto}${r.nota?', '+r.nota:''}`:''}${r.caiu?' · caiu!':''}`,5000);
  return r;
}

/* ---------- registro do combate ---------- */
S.logs={}; /* mesaId → {itens:[], ultimo} */
async function buscarLog(mesaId,tudo){
  const L=S.logs[mesaId]=(!tudo&&S.logs[mesaId])||{itens:[],ultimo:0};
  const d=await Api.req('GET',`/api/mesas/${encodeURIComponent(mesaId)}/iniciativa?log=1&depois=${L.ultimo}`);
  if(d.nLog<L.itens.length){L.itens=[];L.ultimo=0;return buscarLog(mesaId,true)}
  if(d.log&&d.log.length){L.itens=L.itens.concat(d.log);L.ultimo=d.log[d.log.length-1].id}
  return {d,L};
}
/* Início do turno de alguém: guarda os efeitos ativos para contar "turnos sob efeito". */
function efeitosDe(e){
  if(e.tipo==='agente'){const x=((S.mesaDados&&S.mesaDados.fichas)||[]).find(y=>e.chave.endsWith(':'+y.ficha.id)&&y.usuario===e.usuario);if(!x)return [];
    const f=x.ficha;const cs=(f.condicoes||[]).map(c=>{const cd=byId('condicoes',c.id);return cd?cd.nome:c.id});
    const bs=(f.bonus||[]).filter(b=>b.nome&&b.dur&&b.dur!=='perm').map(b=>b.nome.replace(/ → .*/,''));
    return [...new Set(cs.concat(bs))].slice(0,20)}
  return ((e.dados||{}).conds||[]).slice(0,20);
}
function registrarTurno(e,mesaId){return iniPost({acao:'registro',t:'turno',alvo:e.nome,alvoChave:e.chave,efeitos:efeitosDe(e)},mesaId).catch(()=>{})}
/* Qualquer mudança nos PV da ficha durante o combate entra no registro: dano digitado, cura de item
   ou ritual, edição direta e dano absorvido por PV temporários. O que veio de um aviso do mestre já
   está registrado por ele, então passa em silêncio (S._pvSilencio). */
S._pvSnap={};
function monitorPV(f){
  if(!f||!f.mesa||!(S.conta&&S.conta.usuario))return;const d=(S.iniJog||{})[f.mesa];
  let pv;try{pv=calc(f).pv}catch(e){return}
  const ant=S._pvSnap[f.id];S._pvSnap[f.id]=pv;
  const abs=(S._abs||{})[f.id]||0;if(S._abs)delete S._abs[f.id];
  const origem=S._pvOrigem||null;S._pvOrigem=null;
  if(!d||!d.pedido||ant==null||S._pvSilencio)return;
  const delta=pv-ant;
  if(delta<0||abs)relatarPV(f,-(Math.max(0,-delta)+abs),origem);else if(delta>0)relatarPV(f,delta,origem);
}
function relatarPV(f,delta,origem){
  if(!delta)return;
  Api.req('POST',`/api/mesas/${encodeURIComponent(f.mesa)}/iniciativa`,{acao:'registro',t:delta<0?'recebido':'curado',alvo:f.nome,ficha:f.id,valor:Math.abs(delta),texto:origem||undefined}).catch(()=>{});
}

/* ---------- resumo ---------- */
function resumoCombate(itens){
  const P={};const p=(nome,chave)=>{const k=nome||'(sem autor)';return P[k]=P[k]||{nome:k,chave,causado:0,sofrido:0,curou:0,curado:0,abates:0,caiu:false,turnos:0,efeitos:{},maior:0,golpes:0,ataques:0,acertos:0}};
  let rodadas=0,total=0,totalCura=0,maior=null;
  itens.forEach(x=>{rodadas=Math.max(rodadas,x.rodada||0);
    if(x.t==='dano'){const a=x.autor?p(x.autor,x.autorChave):null;const b=p(x.alvo,x.alvoChave);b.sofrido+=x.valor;total+=x.valor;
      if(a){a.causado+=x.valor;a.golpes++;a.maior=Math.max(a.maior,x.valor);if(x.caiu)a.abates++}
      if(x.caiu)b.caiu=true;if(!maior||x.valor>maior.valor)maior=x}
    else if(x.t==='cura'){const b=p(x.alvo,x.alvoChave);b.curado+=x.valor;totalCura+=x.valor;if(x.autor)p(x.autor,x.autorChave).curou+=x.valor}
    else if(x.t==='recebido'){p(x.alvo,x.alvoChave).sofrido+=x.valor;total+=x.valor}
    else if(x.t==='curado'){p(x.alvo,x.alvoChave).curado+=x.valor;totalCura+=x.valor}
    else if(x.t==='ataque'){if(x.autor){const a=p(x.autor,x.autorChave);a.ataques++;if(x.acertou)a.acertos++}}
    else if(x.t==='turno'){const b=p(x.alvo,x.alvoChave);b.turnos++;(x.efeitos||[]).forEach(ef=>b.efeitos[ef]=(b.efeitos[ef]||0)+1)}});
  return {P:Object.values(P).filter(x=>x.nome!=='(sem autor)'||x.causado),rodadas,total,totalCura,maior};
}
function resumoHtml(itens){
  if(!itens.length)return '<p class="hint">Nada foi registrado neste combate.</p>';
  const r=resumoCombate(itens);const ps=r.P.sort((a,b)=>b.causado-a.causado||b.sofrido-a.sofrido);
  const mvp=ps.find(x=>x.causado>0);const tank=ps.slice().sort((a,b)=>b.sofrido-a.sofrido)[0];const med=ps.slice().sort((a,b)=>b.curou-a.curou)[0];
  const linhaTempo=itens.map(x=>{const tp=(x.tipos||[]).map(t=>TIPO_NOME[t]).join('+');
    const txt=x.t==='dano'?`${x.autor||'Alguém'} → ${x.alvo}: ${x.valor} de dano${tp?' ('+tp+')':''}${x.origem?' com '+x.origem:''}${x.nota?' · '+x.nota:''}${x.caiu?' · caiu':''}`
      :x.t==='cura'?`${x.autor||'Alguém'} curou ${x.alvo}: +${x.valor} PV`:x.t==='recebido'?`${x.alvo} sofreu ${x.valor}${x.texto?' ('+x.texto+')':' (anotado na ficha)'}`:x.t==='curado'?`${x.alvo} recuperou ${x.valor} PV${x.texto?' com '+x.texto:' (anotado na ficha)'}`
      :x.t==='efeito'?`${x.autor||'Alguém'} usou ${x.origem||'um ritual'} em ${x.alvo}${x.nota?' · '+x.nota:''}${x.efeito?' · efeito marcado':''}`
      :x.t==='ataque'?`${x.autor||'Alguém'} atacou ${x.alvo}${x.origem?' com '+x.origem:''}: ${x.valor} · ${x.acertou===true?'acertou':x.acertou===false?'errou':'mestre decide'}${x.critico?' · crítico':''}`
      :x.t==='turno'?`Turno de ${x.alvo}${(x.efeitos||[]).length?' · sob '+x.efeitos.join(', '):''}`:x.texto||'';
    return `<li><span class="hint">R${x.rodada||0}</span> ${h(txt)}</li>`}).join('');
  return `<div class="chips"><span class="chip">${r.rodadas} rodada${r.rodadas===1?'':'s'}</span><span class="chip">${r.total} de dano</span><span class="chip">${r.totalCura} de cura</span></div>
   <div class="chips">${mvp?`<span class="chip ok">Mais dano: <b>${h(mvp.nome)}</b> (${mvp.causado})</span>`:''}${r.maior?`<span class="chip">Maior golpe: <b>${h(r.maior.autor||'?')}</b> ${r.maior.valor} em ${h(r.maior.alvo)}</span>`:''}${tank&&tank.sofrido?`<span class="chip">Mais apanhou: <b>${h(tank.nome)}</b> (${tank.sofrido})</span>`:''}${med&&med.curou?`<span class="chip">Mais curou: <b>${h(med.nome)}</b> (${med.curou})</span>`:''}</div>
   <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Participante</th><th>Dano causado</th><th>Dano sofrido</th><th>Cura feita</th><th>Cura recebida</th><th>Ataques</th><th>Abates</th><th>Turnos</th><th>Turnos sob efeitos</th></tr></thead>
   <tbody>${ps.map(x=>`<tr><td><b>${h(x.nome)}</b>${x.caiu?' <span class="badge">caiu</span>':''}</td><td>${x.causado}${x.golpes?` <span class="hint">(${x.golpes}× · maior ${x.maior})</span>`:''}</td><td>${x.sofrido}</td><td>${x.curou}</td><td>${x.curado}</td><td>${x.ataques?`${x.acertos}/${x.ataques} acertos`:'—'}</td><td>${x.abates}</td><td>${x.turnos}</td>
     <td>${Object.entries(x.efeitos).map(([k,n])=>`${h(k)} ×${n}`).join(', ')||'—'}</td></tr>`).join('')}</tbody></table></div>
   <details><summary class="hint">Tudo o que aconteceu (${itens.length})</summary><ol class="linha-tempo">${linhaTempo}</ol></details>`;
}
async function mostrarResumo(mesaId,titulo){
  try{const {L}=await buscarLog(mesaId,true);modal(titulo||'Resumo do combate',`<div class="modal-b resumo">${resumoHtml(L.itens)}</div>`)}catch(e){toast('Não foi possível carregar o resumo.')}
}

/* ---------- jogador: avisos de dano/cura do mestre ---------- */
const FEITOS_KEY='cristopher-log-feitos';
function logFeitos(){try{return JSON.parse(localStorage.getItem(FEITOS_KEY)||'{}')}catch(e){return {}}}
function marcarFeito(id){const o=logFeitos();o[id]=Date.now();const ks=Object.keys(o);if(ks.length>300)ks.slice(0,ks.length-300).forEach(k=>delete o[k]);try{localStorage.setItem(FEITOS_KEY,JSON.stringify(o))}catch(e){}S._feitos=o}
function avisosDano(f){
  const d=(S.iniJog||{})[f.mesa];const L=S.logs[f.mesa];if(!d||!L)return [];const minha=chaveMinha(d,f);if(!minha)return [];
  const feitos=S._feitos||(S._feitos=logFeitos());
  return L.itens.filter(x=>(x.t==='dano'||x.t==='cura')&&x.alvoChave===minha&&x.autorChave!==minha&&!feitos[x.id]);
}
function avisosDanoHtml(f){
  const av=avisosDano(f);if(!av.length)return '';
  return av.slice(-4).map(x=>{const tp=(x.tipos||[]).map(t=>TIPO_NOME[t]).join('+');
    return `<div class="ini-aviso dano" role="alert"><span>${x.t==='dano'?`<b>${h(x.autor||'O mestre')}</b> causou <b>${x.valor}</b> de dano${tp?' ('+h(tp)+')':''} em você${x.origem?' com '+h(x.origem):''}.`:`<b>${h(x.autor||'O mestre')}</b> curou <b>${x.valor}</b> PV seus.`}</span>
     <button class="btn sm acc" data-act="logAplicar" data-id="${x.id}">${x.t==='dano'?'Aplicar −'+x.valor+' PV':'Aplicar +'+x.valor+' PV'}</button><button class="btn sm" data-act="logIgnorar" data-id="${x.id}">Já anotei</button></div>`}).join('');
}
function resumoJogadorHtml(f){
  const d=(S.iniJog||{})[f.mesa];if(!d||d.pedido||!d.nLog)return '';
  if((S.resumoVisto||{})[f.mesa]===d.nLog)return '';
  return `<div class="ini-aviso ok" role="status"><span>Combate encerrado.</span><button class="btn sm acc" data-act="resumoVer" data-m="${h(f.mesa)}">Ver resumo</button><button class="btn sm" data-act="resumoFechar" data-m="${h(f.mesa)}" data-n="${d.nLog}">Fechar</button></div>`;
}

document.addEventListener('click',async e=>{
  const t=e.target.closest('[data-act]');if(!t)return;const ds=t.dataset;
  switch(ds.act){
   case 'logAplicar':{const f=F();const L=f&&S.logs[f.mesa];const x=L&&L.itens.find(y=>String(y.id)===ds.id);if(!x)return;
     S._pvSilencio=true;try{aplicarDelta(f,'pv',(x.t==='dano'?'-':'+')+x.valor)}finally{S._pvSilencio=false}marcarFeito(x.id);render();return}
   case 'logIgnorar':marcarFeito(ds.id);render();return;
   case 'resumoVer':mostrarResumo(ds.m);return;
   case 'resumoFechar':S.resumoVisto=S.resumoVisto||{};S.resumoVisto[ds.m]=+ds.n;render();return;
  }
});
