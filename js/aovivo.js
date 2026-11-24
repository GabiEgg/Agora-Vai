/* ============================== AO VIVO ==============================
   Uma conexão fica aberta em /api/mudancas; o servidor responde assim que algo muda numa campanha
   (iniciativa, ping, ficha, regras, avisos) e o app busca só aquilo. As consultas periódicas viram reserva. */
S.mudV={};S._mudOkT=0;
const aoVivo=()=>Date.now()-S._mudOkT<40000;
const mudEsperar=ms=>new Promise(r=>setTimeout(r,ms));
function mudAplicar(mid,tipos){const t=new Set(tipos);const tudo=t.has('tudo');
  const f=F();const fichaNaMesa=f&&f.mesa===mid&&!f._alheia;const escudoNaMesa=S.view==='escudo'&&S.mesaAberta===mid;
  if(tudo||t.has('ping'))typeof pingBuscar==='function'&&pingBuscar();
  if(tudo||t.has('ini')){if(escudoNaMesa&&typeof atualizarIni==='function')atualizarIni();if(fichaNaMesa&&typeof atualizarIniJogador==='function')atualizarIniJogador()}
  if(tudo||t.has('ficha')||t.has('aviso')){if(escudoNaMesa&&typeof atualizarMesa==='function')atualizarMesa(true)}
  if(tudo||t.has('ficha')||t.has('cfg')){if((fichaNaMesa||escudoNaMesa||window.janAtualizar)&&typeof grupoBuscar==='function')grupoBuscar(mid,true);if(window.janAtualizar)window.janAtualizar()}
  if((tudo||t.has('cfg'))&&typeof mesaSincronizada==='function'&&mesaSincronizada()&&typeof sincronizarRegras==='function')sincronizarRegras(S.cfg.syncMesa,true);
}
(async function mudLoop(){
  await mudEsperar(1200);let primeira=true;
  for(;;){
    const ms=(S.mesas||[]).map(m=>m.id);
    if(!(S.conta&&S.conta.usuario)||!ms.length){S._mudOkT=0;await mudEsperar(3000);primeira=true;continue}
    try{const r=await Api.req('GET','/api/mudancas?m='+ms.join(',')+'&v='+ms.map(id=>S.mudV[id]||0).join(','));
      S._mudOkT=Date.now();Object.assign(S.mudV,r.v||{});
      if(!primeira)Object.entries(r.tipos||{}).forEach(([mid,t])=>mudAplicar(mid,t));primeira=false}
    catch(e){S._mudOkT=0;await mudEsperar(e.status===401?15000:4000)}
  }})();
