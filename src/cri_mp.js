// Criaturas dos marcadores de página.
const {C,A,H}=require('./cri_util');
module.exports={criaturas:[
C({n:'Cão de Lodo',e:'morte',vd:40,t:'Médio',pp:'DT 15 · 2d8 mental · NEX 30%+ imune',per:'1d20+5',sen:'faro, visão no escuro',ini:'3d20+5',def:19,fort:'2d20+5',ref:'3d20+5',von:'1d20',pv:70,at:'3 3 0 1 2',pe:'Furtividade 3d20+10, Sobrevivência 1d20+10',d:'12m'},[
 A('Mordida','Corpo a corpo','3d20+10','2d6+5 corte'),
 A('Garras','Corpo a corpo (crítico 19)','3d20+10','1d8+5 corte'),
 H('Livre','Saliva de Lodo','Um ser atingido pela mordida fica fraco (Fortitude DT 15 evita).'),
 H('Completa','Salto das Sombras','Investida que não precisa ser em linha reta e ignora terreno difícil, atacando com a mordida.')],
 {desc:'Um canídeo corrompido pelo Lodo: olhos vermelhos, saliva grotesca e pelagem preta em espirais.'}),
C({n:'Empecilho',e:'energia',vd:20,t:'Grande (enxame)',pp:'DT 14 · 2d6 mental · NEX 40%+ imune',per:'1d20+5',sen:'visão no escuro',ini:'3d20+10',def:14,fort:'1d20+5',ref:'3d20+5',von:'1d20',pv:50,vul:'Conhecimento',at:'3 1 2 1 1',d:'12m, escalar'},[
 H('Passiva','Enxame','Aglomeração de criaturinhas que agem juntas: pode entrar no espaço de outros seres e usa Desmantelar no fim do turno. Imune a manobras e a efeitos que afetam só uma criatura e não causam dano; sofre metade do dano de ataques com armas, mas 50% a mais de efeitos de área.'),
 H('Passiva','Desmantelar','Manobra desarmar (3d20+7) contra todos no seu espaço que empunham equipamento tecnológico (arma de fogo, acessório…). Vencendo, rouba o item e começa a desmontá-lo: 1d6 de dano automático ao objeto por turno (ignora RD). Dá para recuperar o objeto vencendo uma manobra desarmar contra o enxame.')],
 {desc:'Criaturinhas grotescas (imps, duendes, goblins, fadas…) que surgem quando um aparelho tecnológico vai falhar ou funcionar de forma inesperada.'}),
]};
