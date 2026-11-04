/* ============================== EFEITOS DE AFINIDADE ==============================
   Experimental. O fundo do site muda conforme a afinidade do agente aberto na aba Fichas:
   Sangue (oceano vermelho invertido no topo, o símbolo jorrando sangue para cima), Morte (rastros de
   lodo saindo dos cantos e formando a espiral), Conhecimento (frases da Ordem em sigilos subindo e o
   símbolo com sigilos que mudam) e Energia (chama roxa com o símbolo, tempestade de raios neon e as
   Peripécias do Anfitrião). Cada agente liga ou desliga os efeitos no Dossiê. Com "reduzir movimento"
   no sistema, desenha um quadro parado. */
const FX_ELEM=['sangue','morte','conhecimento','energia'];
/* Símbolos redesenhados em vetor (coordenadas das imagens de referência). */
const FX_SIMB={
  sangue:{vb:[0,0,2000,2000],fill:true,d:['M898 1640 L896 420 L905 340 L918 400 L935 315 L950 380 L968 320 L985 390 L1010 340 L1012 1640 Z','M330 1112 L505 1012 L1450 1004 L1655 1130 L1575 1146 L360 1158 Z','M335 1522 L1640 1466 L1452 1618 L1180 1660 L392 1652 Z'],ponta:[953,330]},
  morte:{vb:[0,0,2000,2000],w:40,d:['M1150 395 A465 465 0 1 0 1426 583','M1180 560 A335 335 0 1 0 1390 830','M1005 755 L1015 1300','M1012 762 C1180 735 1300 830 1295 960 C1290 1090 1170 1160 1018 1150','M955 880 C905 905 905 1010 960 1040','M1205 75 L1195 450','M395 385 L775 770','M890 1260 L595 1555','M1005 1300 L1035 1935','M1085 1335 L1300 1660'],centro:[1045,880]},
  energia:{vb:[0,0,447,447],w:12,d:['M246 48 L148 135 L204 197','M222 98 L229 192','M85 168 C140 205 172 268 215 385','M215 385 C256 292 292 215 345 168','M152 245 C122 266 102 300 74 304','M280 245 C310 266 330 300 358 304','M160 254 C185 203 247 203 270 254','M218 205 L218 330'],centro:[215,230]}};
/* Frases para os sigilos subindo (Conhecimento). Mais de 100, para nunca repetir na mesma tela. */
const FX_FRASES=['Saber tudo é perder tudo','O Outro Lado observa','A Ordem protege a realidade','Não leia em voz alta','O Paranormal não pode ser compreendido','Toda verdade tem um preço','A Membrana está fina aqui','Quem lembra sofre','O medo é a porta','Nada morre de verdade','O sangue lembra','A morte é só uma espiral','A energia não obedece','O conhecimento devora','Feche os olhos e conte até dez','Não olhe para trás','O ritual exige um custo','Cada sigilo é uma ferida','Ninguém volta igual','A realidade é frágil','O Outro Lado tem fome','Esqueça este nome','Proteja quem não sabe','A Ordem nunca dorme','Verdades queimam','O silêncio também ensina','Há algo atrás da porta','Não confie no reflexo','O tempo aqui é lodo','Toda chama quer mais','O caos sorri para você','A dor é uma língua','Leia uma vez e esqueça','A curiosidade cobra juros','Existem livros que leem você','A espiral sempre volta','O vazio também escuta','Cuidado com o que você sabe','Um agente nunca está sozinho','A memória mente','O papel guarda segredos','Quem entende enlouquece','Não aceite o convite','O sangue chama sangue','A lâmpada vai piscar','Nem todo grito é humano','A Ordem lembra por você','Há sigilos na sua pele','O desconhecido tem nome','Não diga o nome dele','A morte tem paciência','O que foi visto não volta','O medo alimenta a Membrana','Todo arquivo é uma ameaça','Queime depois de ler','A verdade não cabe aqui','O conhecimento tem dono','Cada pergunta abre uma fresta','A energia muda de ideia','Nada é por acaso','Tudo é por acaso','O Anfitrião está rindo','O relógio parou de novo','Sobreviva primeiro entenda depois','A sala tem uma porta a mais','Alguém escreveu isso antes','A tinta ainda está fresca','Os olhos do quadro se moveram','A criatura aprende','O ocultista paga sempre','A Ordem precisa de você','Seja discreto','Não existem coincidências','O lodo cobre tudo','O coração bate fora do peito','A pele lembra das marcas','Ouça a estática','Siga o sigilo','O livro está aberto','Não durma nesta casa','A cidade esconde portas','Toda missão deixa cicatrizes','Seu nome está na lista','Quem procura encontra','Quem encontra se perde','O que você leu leu você','A realidade pede socorro','A sombra chegou primeiro','O som veio de dentro','O espelho não reflete você','Sangue derramado não volta','A luz está mentindo','O elemento escolhe você','O Medo é absoluto','Ninguém sai do Outro Lado','A cada ritual um pouco menos de você','O ar ficou pesado','Desligue o rádio','Os sigilos estão mudando','Isso não estava aqui antes','Mantenha a calma agente','Conhecer é ser conhecido','A Ordem exige silêncio','O que é escrito acontece','Cuidado com a próxima página','A resposta está no ritual','O arquivo foi selado','Respire e lembre do protocolo','Você já esteve aqui','O fim é uma ilusão','A porta está aberta agora'];
const FX={atual:null,raf:0,cv:null,ctx:null,raiz:null,W:0,H:0,dpr:1,t0:0,est:null,parado:false,sprite:null,spriteCor:null};
const fxReduzido=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function fxElemento(){if(S.view!=='ficha')return null;const f=F();if(!f||f.fxOff)return null;return FX_ELEM.includes(f.afinidade)?f.afinidade:null}
function fxCorEnergia(){const f=F();return (f&&/^#[0-9a-f]{6}$/i.test(f.corEnergia||''))?f.corEnergia:'#a855f7'}

/* Chamado depois de cada render: tema, camada do fundo, peripécias e notas. */
function fxDepoisRender(){
  const e=fxElemento();const b=document.body;
  if((b.dataset.elem||'')!==(e||''))b.dataset.elem=e||'';
  if(e==='energia')b.style.setProperty('--fx-energia',fxCorEnergia());else b.style.removeProperty('--fx-energia');
  if(e!==FX.atual){fxParar();if(e)fxIniciar(e)}
  periAplicar();
}
function fxCamada(){
  if(FX.raiz)return;const d=document.createElement('div');d.id='fx';d.setAttribute('aria-hidden','true');
  const cv=document.createElement('canvas');d.appendChild(cv);document.body.prepend(d);
  FX.raiz=d;FX.cv=cv;FX.ctx=cv.getContext('2d');
  window.addEventListener('resize',()=>{if(FX.atual){fxTamanho();if(FX.parado)fxQuadro(performance.now())}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&FX.atual&&!FX.parado&&!FX.raf)FX.raf=requestAnimationFrame(fxLoop)});
}
function fxTamanho(){FX.dpr=Math.min(1.5,window.devicePixelRatio||1);FX.W=innerWidth;FX.H=innerHeight;FX.cv.width=Math.round(FX.W*FX.dpr);FX.cv.height=Math.round(FX.H*FX.dpr);FX.cv.style.width=FX.W+'px';FX.cv.style.height=FX.H+'px';FX.ctx.setTransform(FX.dpr,0,0,FX.dpr,0,0)}
function fxIniciar(e){fxCamada();FX.atual=e;FX.raiz.style.display='';fxTamanho();FX.t0=performance.now();FX.est={};FX.parado=fxReduzido();
  const ini={sangue:sgIni,morte:mtIni,conhecimento:cnIni,energia:enIni}[e];ini&&ini(FX.est);
  if(FX.parado){for(let i=0;i<90;i++)fxQuadro(FX.t0+i*33)}else FX.raf=requestAnimationFrame(fxLoop)}
function fxParar(){cancelAnimationFrame(FX.raf);FX.raf=0;FX.atual=null;FX.est=null;if(FX.raiz){FX.ctx.clearRect(0,0,FX.W,FX.H);FX.raiz.style.display='none'}}
function fxLoop(now){FX.raf=0;if(!FX.atual)return;if(document.hidden)return;fxQuadro(now);FX.raf=requestAnimationFrame(fxLoop)}
function fxQuadro(now){const t=(now-FX.t0)/1000;const dt=Math.min(.05,t-(FX.est._t??t));FX.est._t=t;
  ({sangue:sgQuadro,morte:mtQuadro,conhecimento:cnQuadro,energia:enQuadro})[FX.atual](FX.ctx,FX.W,FX.H,t,dt,FX.est)}
/* Desenha um símbolo vetorial centrado em (cx,cy) com altura h. */
function fxSimbolo(ctx,nome,cx,cy,h,estilo){const s=FX_SIMB[nome];const [x0,y0,w0,h0]=s.vb;const k=h/h0;
  ctx.save();ctx.translate(cx-w0*k/2,cy-h0*k/2);ctx.scale(k,k);
  s.d.forEach(d=>{const p=new Path2D(d);if(s.fill){ctx.fillStyle=estilo.fill;ctx.fill(p);if(estilo.stroke){ctx.strokeStyle=estilo.stroke;ctx.lineWidth=estilo.lw/k;ctx.stroke(p)}}
    else{ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=estilo.stroke;ctx.lineWidth=(estilo.lw||s.w);ctx.stroke(p)}});
  ctx.restore();return {x:cx-w0*k/2,y:cy-h0*k/2,k}}
const rnd2=(a,b)=>a+Math.random()*(b-a);

/* ---------------- Sangue ---------------- */
function sgIni(E){E.gotas=[];E.respingos=[]}
function sgSuperficie(x,t,H){const L=H*.22;return L+24*Math.sin(x*.011+t*1.9)+14*Math.sin(x*.029-t*3.1)+7*Math.sin(x*.07+t*5.3)+26*Math.pow(Math.abs(Math.sin(x*.017+t*1.4)),3)}
function sgQuadro(ctx,W,H,t,dt,E){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a0204');g.addColorStop(1,'#0c0102');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  /* símbolo embaixo, ponta para cima */
  const hS=Math.min(H*.42,W*.55);const cy=H-hS*.42;const sb=fxSimbolo(ctx,'sangue',W/2,cy,hS,{fill:'#4a070d',stroke:'#a3111e',lw:2});
  const px=sb.x+FX_SIMB.sangue.ponta[0]*sb.k,py=sb.y+FX_SIMB.sangue.ponta[1]*sb.k;
  /* jorro: gotas sobem acelerando em direção ao oceano */
  const pulso=1+Math.max(0,Math.sin(t*3.2))*1.6;const n=Math.round(dt*150*pulso);for(let i=0;i<n;i++)E.gotas.push({x:px+rnd2(-5,5),y:py,vx:rnd2(-70,70),vy:rnd2(-520,-300)*pulso*.8,r:rnd2(1.8,5.5)});
  ctx.strokeStyle='rgba(150,10,22,.55)';ctx.lineWidth=6+3*pulso;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+Math.sin(t*7)*3,py-60*pulso);ctx.stroke();
  ctx.fillStyle='#b3121f';
  E.gotas=E.gotas.filter(p=>{p.vy-=220*dt;p.vx*=.995;p.x+=p.vx*dt;p.y+=p.vy*dt;const s=sgSuperficie(p.x,t,H);
    if(p.y<=s){if(Math.random()<.35)E.respingos.push({x:p.x,y:s,r:2,v:1});return false}
    ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*.8,p.r*1.6,0,0,7);ctx.fill();return true});
  /* oceano invertido: três camadas de ondas violentas penduradas no topo */
  [[.55,'#3d0309',0,1],[.75,'#6b0711',22,1.35],[.95,'#8f0c18',40,1.8]].forEach(([a,cor,off,vel])=>{ctx.globalAlpha=a;ctx.fillStyle=cor;ctx.beginPath();ctx.moveTo(0,0);
    for(let x=0;x<=W+8;x+=8)ctx.lineTo(x,sgSuperficie(x+off*7,t*vel,H)-off);ctx.lineTo(W,0);ctx.closePath();ctx.fill()});
  ctx.globalAlpha=1;
  ctx.strokeStyle='rgba(255,90,100,.35)';ctx.lineWidth=2;
  E.respingos=E.respingos.filter(r=>{r.r+=60*dt;r.v-=1.6*dt;if(r.v<=0)return false;ctx.globalAlpha=r.v;ctx.beginPath();ctx.ellipse(r.x,r.y,r.r,r.r*.3,0,0,7);ctx.stroke();return true});
  ctx.globalAlpha=1;
  const v=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.6)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
}

/* ---------------- Morte ---------------- */
function mtIni(E){E.rastros=[];for(let i=0;i<6;i++)E.rastros.push(mtNovo(i,-i*1.6))}
function mtNovo(i,atraso){const cantos=[[0,0],[1,0],[1,1],[0,1],[.5,0],[.5,1]];const c=cantos[i%cantos.length];
  return {i,cx:c[0],cy:c[1],p:0,atraso:atraso||0,vel:rnd2(.055,.085),larg:rnd2(14,26),fase:Math.random()*10,giro:rnd2(1.6,2.4)*Math.PI,vida:1}}
function mtPonto(r,s,W,H,t){const cx=W/2,cy=H/2;const x0=r.cx*W,y0=r.cy*H;const a0=Math.atan2(y0-cy,x0-cx);const R0=Math.hypot(x0-cx,y0-cy);
  const R=R0*Math.pow(1-s,1.15)+Math.min(W,H)*.06;const a=a0+s*r.giro;const w=Math.sin(s*14+r.fase+t*.8)*8*(1-s);
  return [cx+Math.cos(a)*(R+w),cy+Math.sin(a)*(R+w)]}
function mtQuadro(ctx,W,H,t,dt,E){
  const g=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.7);g.addColorStop(0,'#2a2a2a');g.addColorStop(1,'#060606');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  E.rastros.forEach((r,k)=>{if(r.atraso<0){r.atraso+=dt;return}
    if(r.p<1)r.p=Math.min(1,r.p+r.vel*dt);else{r.vida-=dt*.25;if(r.vida<=0){E.rastros[k]=mtNovo(r.i);return}}
    const N=Math.max(2,Math.round(r.p*120));ctx.globalAlpha=Math.max(0,r.vida);
    for(let pass=0;pass<2;pass++){ctx.beginPath();for(let j=0;j<=N;j++){const s=j/120;const [x,y]=mtPonto(r,s,W,H,t);if(j)ctx.lineTo(x,y);else ctx.moveTo(x,y)}
      ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=pass?'rgba(90,90,90,.35)':'#000';ctx.lineWidth=pass?r.larg*.18:r.larg;if(pass)ctx.setLineDash([2,14]);ctx.stroke();ctx.setLineDash([])}
    /* gotas de lodo escorrendo da cabeça do rastro */
    if(r.p<1){const [hx,hy]=mtPonto(r,r.p,W,H,t);ctx.fillStyle='#000';ctx.beginPath();ctx.arc(hx,hy,r.larg*.75,0,7);ctx.fill();
      for(let d=1;d<4;d++){const [x,y]=mtPonto(r,Math.max(0,r.p-d*.04),W,H,t);ctx.beginPath();ctx.ellipse(x,y+r.larg*.6+Math.sin(t*2+d)*4,r.larg*.18,r.larg*.4,0,0,7);ctx.fill()}}
    ctx.globalAlpha=1});
  const hS=Math.min(W,H)*.5;ctx.save();ctx.translate(W/2,H/2);ctx.rotate(Math.sin(t*.25)*.06);ctx.translate(-W/2,-H/2);
  ctx.shadowColor='rgba(0,0,0,.9)';ctx.shadowBlur=18;fxSimbolo(ctx,'morte',W/2,H/2,hS,{stroke:'#000',lw:58});ctx.shadowBlur=0;fxSimbolo(ctx,'morte',W/2,H/2,hS,{stroke:'#5a5a5a',lw:12});ctx.restore();
}

/* ---------------- Conhecimento ---------------- */
const SIG_ORD='ABCDEFGHIJKLMNOPQRSTUVWXYZ.,?!:;';
function sigSprite(cor){if(FX.sprite&&FX.spriteCor===cor)return FX.sprite;const img=FX._img;if(!img||!img.complete||!img.naturalWidth)return null;
  const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='source-in';x.fillStyle=cor;x.fillRect(0,0,c.width,c.height);
  FX.sprite=c;FX.spriteCor=cor;return c}
function sigDesenhar(ctx,sp,i,x,y,s){if(i<0||!sp)return;const C=sp.height;ctx.drawImage(sp,i*C,0,C,C,x-s/2,y-s/2,s,s)}
function sigIndices(txt){return [...String(txt).normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase()].map(ch=>ch===' '?-2:SIG_ORD.indexOf(ch)).filter(i=>i!==-1)}
function cnIni(E){if(!FX._img){FX._img=new Image();FX._img.src='img/sigilos.png'}E.frases=[];E.prox=0;
  E.aneis=[[10,.2],[16,.32],[22,.44]].map(([n,r],k)=>({r,dir:k%2?-1:1,cel:Array.from({length:n},()=>({g:Math.floor(Math.random()*26),fade:1}))}));E.troca=0}
function cnQuadro(ctx,W,H,t,dt,E){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0f0b02');g.addColorStop(1,'#1d1604');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const sp=sigSprite('#e9b93a');if(!sp)return;
  /* frases subindo em grupos, sem repetir na tela */
  E.prox-=dt;if(E.prox<=0&&E.frases.length<Math.max(6,Math.round(H/70))){E.prox=rnd2(.9,2.2);
    const ativas=new Set(E.frases.map(f=>f.txt));const livres=FX_FRASES.filter(f=>!ativas.has(f));const txt=livres[Math.floor(Math.random()*livres.length)];
    const s=rnd2(16,26)*(W<600?.75:1);const idx=sigIndices(txt);const largura=idx.length*s*.78;
    E.frases.push({txt,idx,s,x:rnd2(10,Math.max(12,W-largura-10)),y:H+s,v:rnd2(22,42),a:0})}
  E.frases=E.frases.filter(f=>{f.y-=f.v*dt;f.a=Math.min(1,f.a+dt*.8);const fim=Math.min(1,(f.y+f.s)/(H*.25));ctx.globalAlpha=.55*f.a*Math.max(0,fim);
    let x=f.x;f.idx.forEach(i=>{if(i===-2){x+=f.s*.55;return}sigDesenhar(ctx,sp,i,x+f.s/2,f.y,f.s);x+=f.s*.78});return f.y>-f.s*2});
  ctx.globalAlpha=1;
  /* símbolo central: anéis de sigilos que trocam sozinhos e o "8" no meio */
  const R=Math.min(W,H);E.troca-=dt;if(E.troca<=0){E.troca=.09;const a=E.aneis[Math.floor(Math.random()*3)];const c=a.cel[Math.floor(Math.random()*a.cel.length)];c.g=Math.floor(Math.random()*32);c.fade=0}
  ctx.save();ctx.shadowColor='rgba(233,185,58,.6)';ctx.shadowBlur=10;
  E.aneis.forEach((a,k)=>{const n=a.cel.length;const s=R*(.05+k*.012);a.cel.forEach((c,j)=>{c.fade=Math.min(1,c.fade+dt*2.5);const ang=j/n*Math.PI*2+t*.12*a.dir;
    ctx.globalAlpha=.35+.6*c.fade;sigDesenhar(ctx,sp,c.g,W/2+Math.cos(ang)*a.r*R,H/2+Math.sin(ang)*a.r*R,s)})});
  ctx.globalAlpha=1;sigDesenhar(ctx,sp,1,W/2,H/2,R*.16+Math.sin(t*1.5)*R*.006);ctx.restore();
}

/* ---------------- Energia ---------------- */
function enIni(E){E.chamas=[];E.raios=[];E.prox=rnd2(.8,2);E.flash=0}
function enHexRgb(h){const n=parseInt(h.slice(1),16);return [(n>>16)&255,(n>>8)&255,n&255]}
function enRaio(x0,y0,x1,y1,desvio,prof,out){if(prof<=0){out.push([x0,y0,x1,y1]);return}const mx=(x0+x1)/2+rnd2(-desvio,desvio),my=(y0+y1)/2+rnd2(-desvio,desvio);
  enRaio(x0,y0,mx,my,desvio/2,prof-1,out);enRaio(mx,my,x1,y1,desvio/2,prof-1,out);if(Math.random()<.18&&prof>2)enRaio(mx,my,mx+rnd2(-120,120),my+rnd2(40,160),desvio/2,prof-2,out)}
function enQuadro(ctx,W,H,t,dt,E){
  const cor=fxCorEnergia();const [r,g,b]=enHexRgb(cor);
  ctx.fillStyle='#08040f';ctx.fillRect(0,0,W,H);
  const cx=W/2,cy=H*.56,R=Math.min(W,H);
  /* chama: partículas subindo com turbulência, mistura aditiva */
  const n=Math.round(dt*260);for(let i=0;i<n;i++){const off=rnd2(-1,1);E.chamas.push({x:cx+off*R*.13,y:cy+R*.13,vx:-off*12,vy:rnd2(-R*.42,-R*.26),vida:1,dec:rnd2(.55,.95),tam:rnd2(R*.035,R*.06)*(1-Math.abs(off)*.5)})}
  ctx.globalCompositeOperation='lighter';
  E.chamas=E.chamas.filter(p=>{p.vida-=dt*p.dec;if(p.vida<=0)return false;p.vx+=Math.sin(p.y*.025+t*5+p.tam)*60*dt+(cx-p.x)*1.6*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    const s=p.tam*(.35+p.vida*.75);const gr=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,s);const br=p.vida>.85?.45:0;
    gr.addColorStop(0,`rgba(${Math.round(r+(255-r)*br)},${Math.round(g+(255-g)*br)},${Math.round(b+(255-b)*br)},${.13*p.vida})`);gr.addColorStop(1,`rgba(${r},${g},${b},0)`);
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(p.x,p.y,s,0,7);ctx.fill();return true});
  ctx.globalCompositeOperation='source-over';
  ctx.save();ctx.shadowColor=cor;ctx.shadowBlur=24;fxSimbolo(ctx,'energia',cx,cy-R*.06,R*.34,{stroke:cor,lw:10});ctx.shadowBlur=8;fxSimbolo(ctx,'energia',cx,cy-R*.06,R*.34,{stroke:'#fff',lw:3.5});ctx.restore();
  /* tempestade: raios neon de tempos em tempos */
  E.prox-=dt;if(E.prox<=0){E.prox=rnd2(1.1,4.2);const seg=[];const x0=rnd2(0,W);enRaio(x0,-10,x0+rnd2(-W*.3,W*.3),rnd2(H*.35,H*.95),W*.12,7,seg);
    E.raios.push({seg,cor:`hsl(${Math.floor(Math.random()*360)},100%,62%)`,vida:.45});E.flash=.18}
  E.raios=E.raios.filter(z=>{z.vida-=dt;if(z.vida<=0)return false;const a=Math.min(1,z.vida*4)*(Math.random()<.25?.4:1);ctx.globalAlpha=a;ctx.strokeStyle=z.cor;ctx.shadowColor=z.cor;ctx.shadowBlur=18;ctx.lineWidth=2.5;ctx.beginPath();
    z.seg.forEach(([a1,b1,a2,b2])=>{ctx.moveTo(a1,b1);ctx.lineTo(a2,b2)});ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='#fff';ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;return true});
  if(E.flash>0){ctx.fillStyle=`rgba(255,255,255,${E.flash*.35})`;ctx.fillRect(0,0,W,H);E.flash-=dt}
}

/* ---------------- Peripécias do Anfitrião ----------------
   Com a opção ligada (só para afinidade com Energia), de tempos em tempos um texto da ficha ganha
   outro nome. Só muda o que aparece na tela, nunca o valor ou a regra. */
const PERI_A=['Ataque','Perícia','Ritual','Habilidade','Técnica','Poder','Golpe','Dança','Grito','Plano','Arte','Manobra','Protocolo','Teoria','Sabedoria'];
const PERI_B=['do Pão de Queijo','de Fingir Demência','Proibido(a) em 3 Estados','do Bode','de Quem Esqueceu o Gás Ligado','Sem Wi-Fi','da Vó','de Pisar no Lego','do Fiscal da Natureza','Inútil Porém Charmoso(a)','que Ninguém Pediu','de Segunda-feira','do Estagiário','do Cara do Churrasco','Sem Moral Nenhuma','de Chorar no Banho','do Caos Gratuito','de Rodar o Dado no Chão','com Cheiro de Queimado','que o Mestre Odeia'];
const PERI_INTEIRO=['Perder a Dignidade','Abraçar a Estática','Ser o Bode','Grito Primal de Segunda','Correr em Círculos','Lamber Tomada','Esquecer o Nome do Mestre','Fingir que Entendeu','Rir em Velório','Carisma Negativo','Rolar 1 com Estilo','Atirar no Próprio Pé','Ofender o Anfitrião','Chorar Elétrico','Dormir em Serviço','Comprar Briga com Pombo','Tecnologia (de 1998)','Ocultismo de Almanaque','Luta (contra o espelho)','Sanidade? Nunca Vi','PV de Isopor','Defesa de Papelão','Cérebro em Manutenção','Bater no Ar com Confiança','Dar Ré na Realidade','Medo de Botão','O Anfitrião Esteve Aqui','Ritual de Pedir Desculpa','Pontaria de Stormtrooper','Furtividade de Elefante'];
function periNome(){return Math.random()<.45?PERI_INTEIRO[Math.floor(Math.random()*PERI_INTEIRO.length)]:`${PERI_A[Math.floor(Math.random()*PERI_A.length)]} ${PERI_B[Math.floor(Math.random()*PERI_B.length)]}`}
S.peri={};
function periAtiva(){const f=F();return S.view==='ficha'&&f&&!f._alheia&&f.afinidade==='energia'&&!!f.peripecias}
function periNos(){const raiz=document.querySelector('#app .sheet');if(!raiz)return [];const w=document.createTreeWalker(raiz,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;
  if(!p||p.closest('input,textarea,select,option,script,style,.peri-bar,[contenteditable]'))return NodeFilter.FILTER_REJECT;const v=n.nodeValue.trim();
  return v.length>=4&&v.length<=40&&/[A-Za-zÀ-ú]{3}/.test(v)&&!/^[\d\s+\-−/%()]+$/.test(v)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});const out=[];let n;while((n=w.nextNode()))out.push(n);return out}
/* Reaplica as trocas depois de cada redesenho. */
function periAplicar(){const f=F();if(!periAtiva()){return}const lista=S.peri[f.id]||[];if(!lista.length)return;const mapa=new Map(lista.map(x=>[x.orig,x.fake]));
  periNos().forEach(n=>{const v=n.nodeValue.trim();if(mapa.has(v))n.nodeValue=n.nodeValue.replace(v,mapa.get(v))})}
function periTrocar(){if(!periAtiva())return;const f=F();const fakes=new Set((S.peri[f.id]||[]).map(x=>x.fake));const nos=periNos().filter(n=>!fakes.has(n.nodeValue.trim()));if(!nos.length)return;const n=nos[Math.floor(Math.random()*nos.length)];const orig=n.nodeValue.trim();
  const fake=periNome();const lista=S.peri[f.id]=(S.peri[f.id]||[]).filter(x=>x.orig!==orig);lista.push({orig,fake});if(lista.length>14)lista.shift();
  n.nodeValue=n.nodeValue.replace(orig,fake);const el=n.parentElement;if(el){el.classList.add('peri-glitch');setTimeout(()=>el.classList.remove('peri-glitch'),900)}}
(function periRelogio(){setTimeout(()=>{if(document.visibilityState==='visible')periTrocar();periRelogio()},rnd2(8000,18000))})();

/* ---------------- Interface ---------------- */
/* Barra acima de PV/PE/NEX para agentes com afinidade: efeitos ligados/desligados; Energia ganha as Peripécias e a cor. */
function fxBarra(f){if(!f||f._alheia||!FX_ELEM.includes(f.afinidade))return '';const en=f.afinidade==='energia';
  return `<div class="peri-bar"><label class="chk"><input type="checkbox" data-fx-on ${f.fxOff?'':'checked'}> Efeitos de ${h(ELEM[f.afinidade])}</label>
    ${en?`<label class="chk"><input type="checkbox" data-peri ${f.peripecias?'checked':''}> Peripécias do Anfitrião</label>
     <label class="chk">Cor <input type="color" data-cor-energia value="${h(fxCorEnergia())}" aria-label="Cor da Energia"></label>
     ${f.peripecias&&(S.peri[f.id]||[]).length?`<button class="btn sm ghost" data-act="periDesfazer">Desfazer peripécias</button>`:''}`:''}</div>`}
function fxNotasExtra(f){if(!f||f.afinidade!=='energia')return '';
  return `<figure class="anfitriao"><img src="img/anfitriao.webp" alt="O Anfitrião, figura de Energia de roupa listrada com luzes neon, agachado entre chamas roxas" onerror="this.closest('figure').classList.add('sem-img')"><figcaption>Pode-se dizer que eu sou o bode</figcaption></figure>`}
document.addEventListener('change',e=>{const t=e.target;const f=F();if(!f||f._alheia)return;
  if(t.hasAttribute('data-fx-on')){f.fxOff=!t.checked;saveF(f);render()}
  else if(t.hasAttribute('data-peri')){f.peripecias=t.checked;if(!t.checked)delete S.peri[f.id];saveF(f);render();if(t.checked)setTimeout(periTrocar,600)}
  else if(t.hasAttribute('data-cor-energia')){f.corEnergia=t.value;saveF(f);render()}});
document.addEventListener('input',e=>{const t=e.target;if(t.hasAttribute('data-cor-energia')){document.body.style.setProperty('--fx-energia',t.value);const f=F();if(f&&!f._alheia)f.corEnergia=t.value}});
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="periDesfazer"]');if(!t)return;const f=F();if(f)delete S.peri[f.id];render()});

/* Clicar num texto trocado pelo Anfitrião desfaz a troca e solta risadas flutuando.
   Nesse clique o botão ou campo não é acionado (é só a peça sendo desfeita). */
const RISOS=['HAHAHA','hehehe','KKKKKK','HA!','hihihi','HAHA','kkk','hehe','HAHAHAHA','HUAHUA'];
function risada(x,y){const n=3+Math.floor(Math.random()*3);
  for(let i=0;i<n;i++){const s=document.createElement('span');s.className='riso';s.setAttribute('aria-hidden','true');s.textContent=RISOS[Math.floor(Math.random()*RISOS.length)];
    s.style.left=(x+rnd2(-40,40))+'px';s.style.top=(y+rnd2(-10,10))+'px';s.style.setProperty('--dx',rnd2(-50,50)+'px');s.style.setProperty('--rot',rnd2(-18,18)+'deg');
    s.style.animationDelay=(i*.12)+'s';s.style.fontSize=rnd2(14,26)+'px';document.body.appendChild(s);setTimeout(()=>s.remove(),2600+i*120)}}
document.addEventListener('click',e=>{
  if(!periAtiva())return;const f=F();const lista=S.peri[f.id]||[];if(!lista.length)return;
  const el=e.target.closest('#app .sheet *');if(!el||el.closest('.peri-bar'))return;
  /* procura um texto trocado dentro do elemento clicado (ou do botão/rótulo que o contém) */
  const alvo=el.closest('button,label,a,h4,.tab,td,.chip,.badge')||el;
  const w=document.createTreeWalker(alvo,NodeFilter.SHOW_TEXT);let n,achou=null;
  while((n=w.nextNode())){const v=n.nodeValue.trim();const x=lista.find(z=>z.fake===v);if(x){achou=x;break}}
  if(!achou)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  S.peri[f.id]=lista.filter(z=>z!==achou);
  const w2=document.createTreeWalker(document.querySelector('#app .sheet'),NodeFilter.SHOW_TEXT);
  while((n=w2.nextNode())){if(n.nodeValue.trim()===achou.fake)n.nodeValue=n.nodeValue.replace(achou.fake,achou.orig)}
  risada(e.clientX,e.clientY);
},true);
