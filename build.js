// Junta os módulos de src/ em data/dados.json, marcando a fonte de cada entrada.
const fs=require('fs'),path=require('path');
const R=f=>require('./src/'+f);
const FONTES=[
 {id:'core',sigla:'OPRPG',nome:'Ordem Paranormal RPG — Livro de Regras',desc:'Livro básico (v1.3). Sempre ativo.',fixa:true,arquivos:['core1','core2','core3','core4','core5','core6','core7','core8']},
 {id:'sah',sigla:'SaH',nome:'Sobrevivendo ao Horror',desc:'Origens, trilhas, classe Sobrevivente, equipamentos, rituais e regras opcionais (Determinação, medo, patentes…).',arquivos:['sah1','sah2','sah3','sah4','sah5','sah6']},
 {id:'as01',sigla:'AS#01',nome:'Arquivos Secretos #01 — Agatha e os Transtornados',desc:'Ritos & Maldições: origens, Maledictólogo, Transcender com Itens, Reter Ritual.',arquivos:['as01']},
 {id:'as02',sigla:'AS#02',nome:'Arquivos Secretos #02 — Hexatombe: os Mascarados',desc:'Poderes e itens dos Mascarados e agentes, aliados, As Máscaras.',arquivos:['as02']},
 {id:'as03',sigla:'AS#03',nome:'Arquivos Secretos #03 — Hexatombe: o fim',desc:'Poderes de sacrifício, trilha Performático, aliados, veículos operacionais, animais.',arquivos:['as03']},
 {id:'as04',sigla:'AS#04',nome:'Arquivos Secretos #04 — Complexo 0413',desc:'Origens, Granadeiro Blaster, ritual Backup, granadas e hacking.',arquivos:['as04']},
 {id:'as05',sigla:'AS#05',nome:'Arquivos Secretos #05 — Transmissão',desc:'Origens, Criptologista do Oculto, poderes de Transmissão, novas regalias.',arquivos:['as05']},
 {id:'as06',sigla:'AS#06',nome:'Arquivos Secretos #06 — Indústrias Panacea',desc:'Origens Panacea, medicamentos, doenças, venenos, evolução modular.',arquivos:['as06']},
 {id:'as07',sigla:'AS#07',nome:'Arquivos Secretos #07 — Ritos Fúnebres',desc:'Origens, Vampirismo, Monstruoso para especialista e ocultista, regras debaixo d’água.',arquivos:['as07']},
 {id:'as09',sigla:'AS#09',nome:'Arquivos Secretos #09 — Hell Hunters',desc:'Origens, Incursor, Piloto de Drone, armamento e regras de perigo.',arquivos:['as09']},
];
const PERICIAS=[
 ['acrobacia','Acrobacia','AGI',0,1],['adestramento','Adestramento','PRE',1,0],['artes','Artes','PRE',1,0],['atletismo','Atletismo','FOR',0,0],
 ['atualidades','Atualidades','INT',0,0],['ciencias','Ciências','INT',1,0],['crime','Crime','AGI',1,1],['diplomacia','Diplomacia','PRE',0,0],
 ['enganacao','Enganação','PRE',0,0],['fortitude','Fortitude','VIG',0,0],['furtividade','Furtividade','AGI',0,1],['iniciativa','Iniciativa','AGI',0,0],
 ['intimidacao','Intimidação','PRE',0,0],['intuicao','Intuição','PRE',0,0],['investigacao','Investigação','INT',0,0],['luta','Luta','FOR',0,0],
 ['medicina','Medicina','INT',0,0],['ocultismo','Ocultismo','INT',1,0],['percepcao','Percepção','PRE',0,0],['pilotagem','Pilotagem','AGI',1,0],
 ['pontaria','Pontaria','AGI',0,0],['profissao','Profissão','INT',1,0],['reflexos','Reflexos','AGI',0,0],['religiao','Religião','PRE',1,0],
 ['sobrevivencia','Sobrevivência','INT',0,0],['tatica','Tática','INT',1,0],['tecnologia','Tecnologia','INT',1,0],['vontade','Vontade','PRE',0,0]
].map(([id,nome,attr,t,c])=>({id,nome,attr,somenteTreinada:!!t,carga:!!c,fonte:'core'}));

const USOS=require('./src/pericias.js');PERICIAS.forEach(p=>{const u=USOS[p.id];if(u){p.desc=u.desc;p.usos=u.usos}});
const out={versao:2,periciasGeral:USOS.geral,fontes:FONTES.map(({arquivos,...f})=>f),pericias:PERICIAS};
const LISTAS=['origens','classes','trilhas','poderes','rituais','itens','modificacoes','aliados','condicoes','regras','interludio','insanidade','efeitosMedo','visoesMedo','desvantagensIdade','doencas','venenos'];
LISTAS.forEach(k=>out[k]=[]);
out.extras={};
const ids={};let dup=0;
for(const F of FONTES){
 for(const arq of F.arquivos){
  const m=R(arq);
  for(const [k,v] of Object.entries(m)){
   if(Array.isArray(v)){
    if(!out[k])out[k]=[];
    v.forEach(x=>{
     if(x&&typeof x==='object'&&!Array.isArray(x)){
      const e={...x,fonte:F.id};
      if(e.id){const key=k+':'+e.id;if(ids[key]){e.id=e.id+'__'+F.id;dup++}ids[k+':'+e.id]=1}
      out[k].push(e);
     }else out[k].push(x);
    });
   }else{out.extras[k]={...(out.extras[k]||{}),...v}}
  }
 }
}
// Trilhas Monstruoso: o elemento escolhido troca o atributo de PE (e de DT, no ocultista) e altera atributos.
const EL4=(a,b,c,d)=>({sangue:a,morte:b,conhecimento:c,energia:d});
const PE_EL=EL4('FOR','VIG','INT','AGI');
const UM=EL4({FOR:1},{VIG:1},{INT:1},{AGI:1});
const AJUSTES={
 monstruoso:[{},{peAttrElem:PE_EL,attrElem:EL4({},{},{INT:1},{})},{attrBonus:{PRE:-1}},{attrElem:EL4({INT:-1,FOR:1},{PRE:-1,VIG:1},{FOR:-1,INT:1},{FOR:-1,AGI:1})}],
 monstruoso_especialista:[{peAttrElem:PE_EL},{},{attrBonus:{PRE:-1},attrElem:UM},{attrBonus:{PRE:-1},attrElem:UM}],
 monstruoso_ocultista:[{peAttrElem:PE_EL,dtAttrElem:PE_EL,attrElem:UM},{},{attrBonus:{PRE:-1}},{attrBonus:{PRE:-1},attrElem:UM}],
};
out.trilhas.forEach(t=>{const aj=AJUSTES[t.id];if(!aj)return;t.elementoEscolha=true;t.habilidades.forEach((h,i)=>Object.assign(h,aj[i]||{}))});
// Efeitos automáticos de habilidades de trilha, classe e poderes (lidos por js/calc.js).
// Cada chave é um "efeito" que o cálculo entende; o texto da habilidade continua o mesmo.
const HAB={
 aniquilador:[{favorita:1},{favorita:2},{},{favorita:3,favoritaMargem:2,favoritaDado:1}],
 guerreiro:[{margemCorpo:2}],
 tropa:[{},{},{},{seMachucado:{defesa:5,rd:'RD 5 (Inquebrável)'}}],
 atirador:[{danoAttrMunicao:{attr:'INT',municao:'balas longas'}},{},{},{critMaxFogo:true}],
 infiltrador:[{furtivo:true}],
 medico:[{acao:{nome:'Paramédico',pe:[2,3,4,5],cura:['2d10','3d10','4d10','5d10'],alvoLivre:true}}],
 tecnico:[{cargaInt:false,cargaIntForca:true},{catRedGeral:1}],
 conduite:[{castExtra:[{id:'ampliar',nome:'Ampliar Ritual (alcance +1 passo ou área dobrada)',pe:2}]},{castExtra:[{id:'acelerar',nome:'Acelerar Ritual (ação livre)',pe:4}]},{},{ritConcedido:['rit_canalizar_o_medo']}],
 flagelador:[{flagelo:2},{},{},{ritConcedido:['rit_medo_tangivel']}],
 graduado:[{ritExtra:'saberAmpliado'},{},{},{ritConcedido:['rit_conhecendo_o_medo']}],
 intuitivo:[{resistPar:5},{peLimRitual:'PRE'},{rdTexto:'Mental e paranormal 10 (Inabalável)'},{ritConcedido:['rit_presenca_do_medo']}],
 lamina:[{ritConcedido:['rit_amaldicoar_arma'],ataqueOcultismo:true},{gladiador:2},{},{ritConcedido:['rit_lamina_do_medo']}],
 agente_secreto:[{treinaOu2:'pericia',escolhaPericias:['diplomacia','enganacao']}],
 cacador:[{treinaOu2:'sobrevivencia'}],
 monstruoso:[{treinaOu2:'ocultismo'}],
 exorcista:[{treinaOu2:'religiao'}],
 esperto:[{treinaOu2:'pericia'}],
 esoterico:[{},{ritExtra:1}],
 muambeiro:[{},{},{treinaOu2:'profissao',treinaValor:5}],
 granadeiro_blaster:[{treinaOu2:'profissao',treinaValor:5}],
 incursor:[{treinaOu2:'pontaria'}],
};
out.trilhas.forEach(t=>{const aj=HAB[t.id];if(aj)t.habilidades.forEach((h,i)=>Object.assign(h,aj[i]||{}))});
const HAB_CLASSE={combatente:{'Ataque Especial':{ataqueEspecial:true}},especialista:{'Perito':{perito:true}}};
out.classes.forEach(c=>{const aj=HAB_CLASSE[c.id];if(aj)c.habilidades.forEach(h=>Object.assign(h,aj[h.nome]||{}))});
const POD={
 com_tiro_certeiro:{danoAttrForma:{disparo:'AGI'}},
 esp_balistica_avancada:{danoForma:{fogo:2}},
 esp_ninja_urbano:{danoForma:{corpo:2,disparo:2}},
 ocu_especialista_em_elemento:{escolheElemento:true,dtElem:2},
 ocu_ritual_potente:{ritDanoAttr:'INT'},
 ocu_ritual_intenso:{ritDanoAttr:'PRE'},
 ocu_flagelo_bem_aproveitado:{flagelo:1},
 com_valentao:{perAttr:{intimidacao:'FOR'}},
 ocu_olhar_sinistro:{perAttr:{ocultismo:'PRE'}},
 par_sangue_fervente:{escolheAttr:['AGI','FOR'],seMachucado:{attrValor:1},afin:{seMachucado:{attrValor:2}}},
 par_sangue_prazeroso:{seMachucado:{rd:'RD 5 (Sangue Prazeroso)'}},
 par_precognicao:{afin:{imuneCond:['desprevenido']}},
 par_instintos_sanguinarios:{afin:{imuneCond:['desprevenido']}},
 par_golpe_de_sorte:{afin:{mult:1}},
 par_resistir_a_elemento:{rdElem:10,afin:{rdElem:20}},
 par_encarar_a_morte:{peLimAcao:1,afin:{peLimAcao:3}},
 par_arma_de_sangue:{acao:{pe:2,item:'arma_sangue'}},
};
out.poderes.forEach(p=>{if(POD[p.id])Object.assign(p,POD[p.id])});
// Itens: resistências quando equipados e efeitos de cena ao usar consumíveis.
const ITEM={
 it_traje_hazmat:{rd:'Químico 10',equipavel:true},it_traje_de_mergulho:{rd:'Químico 5',equipavel:true},it_traje_espacial:{rd:'Químico 20',equipavel:true},
 it_joias_da_mente:{rd:'Mental 10'},
 it_perola_de_sangue:{efUso:{testesAttr:{FOR:5,AGI:5,VIG:5}}},
 it_rubra:{efUso:{testesAttr:{FOR:5,AGI:5,VIG:5}}},
 it_larva_da_furia:{efUso:{ataque:4,danoArma:'4'}},
 it_aplicador_de_adrenalina:{efUso:{testesAttr:{FOR:2,AGI:2,VIG:2},deslocamento:3}},
};
out.itens.forEach(i=>{if(ITEM[i.id])Object.assign(i,ITEM[i.id])});
// Rituais: efeitos extras na aba Bônus, lembretes do conjurador e uso como reação (lidos por js/calc.js e js/eventos.js).
// ef/efD/efV: chaves extras somadas ao efeito em você (nota, imune, pericias, cont, dadosRit, dt).
// lembrete/lembreteD/lembreteV: vai para a aba Bônus mesmo quando o alvo é outro (ações por turno, áreas).
// reacao: {sempre} = o ritual é sempre reação; {formas} = formas que podem ser usadas como reação.
const RIT={
 rit_alterar_destino:{reacao:{sempre:true,defesa:15,rolar:['fortitude','reflexos','vontade'],bonusRolar:15,texto:'+15 em um teste de resistência ou na Defesa contra um ataque.'}},
 rit_desacelerar_impacto:{reacao:{sempre:true,texto:'Queda lenta (18m por rodada, sem dano); projéteis causam metade do dano.'}},
 rit_sede_de_adrenalina:{reacao:{sempre:true,rd:{n:20,d:40,v:70},rdTipo:'impacto',rdNota:'e fica atordoado por 1 rodada',rolar:['acrobacia','atletismo'],attrRolar:'PRE',texto:'Ao falhar em Acrobacia ou Atletismo, repete o teste usando Presença; ou, ao sofrer dano de impacto, reduz o dano (e fica atordoado 1 rodada). Uma vez por rodada.'}},
 rit_overclock:{reacao:{sempre:true,texto:'Depois de um teste de Tecnologia: jogo de “estátua” com o mestre; vencendo, obtém a informação e o aparelho fica inutilizado.'}},
 rit_tela_de_ruido:{reacao:{formas:['n','d'],rd:{n:15,d:30},texto:'Ao sofrer dano balístico, de corte, impacto ou perfuração, recebe RD contra esse dano.'},efV:{nota:'Esfera imóvel ao redor de um ser ou objeto Enorme ou menor; nada a atravessa (Reflexos evita ficar preso).'}},
 rit_salto_fantasma:{reacao:{formas:['d'],defesa:10,rolar:['reflexos'],bonusRolar:10,texto:'Salta 1,5m e recebe +10 na Defesa e em Reflexos contra um ataque ou efeito.'}},
 rit_backup:{lembrete:{nota:'Cópia de Energia a até 5 km. Reação: trocar de lugar com ela (perde 2d4 SAN).',acoes:[{nome:'Trocar de lugar',san:'2d4'}]},lembreteV:{nota:'Cópia de Energia a até 5 km. Reação: trocar de lugar (perde 2d4 SAN); ao trocar pode dissipar causando 6d6 de Energia (Reflexos metade) perto dos dois pontos.',acoes:[{nome:'Trocar de lugar',san:'2d4'},{nome:'Dissipar: 6d6 Energia',dano:'6d6'}]}},
 rit_contato_paranormal:{ef:{dadosRit:{qtd:6,dado:'1d6',san:2}},efD:{dadosRit:{qtd:6,dado:'1d8',san:3}},efV:{dadosRit:{qtd:6,dado:'1d12',san:5}}},
 rit_embaralhar:{ef:{cont:{nome:'cópias',max:3,por:{defesa:2}}},efD:{cont:{nome:'cópias',max:5,por:{defesa:2}}},efV:{cont:{nome:'cópias',max:8,por:{defesa:2}},nota:'Cada cópia destruída ofusca quem a destruiu.'}},
 rit_forma_monstruosa:{ef:{danoArma:'5',nota:'Criatura Grande em fúria: não fala nem conjura e ataca o ser mais próximo (contra aliado, Vontade para escolher outro alvo).'},efD:{danoArma:'5',imune:['atordoado','fatigado','exausto','sangrando','envenenado'],nota:'Criatura Grande em fúria (imune a atordoamento, fadiga, sangramento, sono e veneno).'},efV:{danoArma:'10',nota:'Criatura Grande em fúria: não fala nem conjura e ataca o ser mais próximo.'}},
 rit_martirio_de_sangue:{ef:{danoArma:'10',dadosPer:{diplomacia:-3,enganacao:-3,intimidacao:-3},nota:'Faro, visão no escuro, cura acelerada 10, desarmado letal com +1 dado. Não pode se concentrar. Ao fim da cena vira uma criatura de Sangue.'},efD:{danoArma:'20',dadosPer:{diplomacia:-3,enganacao:-3,intimidacao:-3},nota:'Faro, visão no escuro, cura acelerada 10, desarmado letal com +1 dado. Não pode se concentrar. Ao fim da cena vira uma criatura de Sangue.'}},
 rit_medo_tangivel:{ef:{imune:['atordoado','cego','debilitado','enjoado','envenenado','exausto','fatigado','fraco','lento','ofuscado','paralisado','doente'],nota:'Imune a doenças, venenos e dano extra de críticos e ataques furtivos. Dano balístico, de corte, impacto ou perfuração não o deixa abaixo de 1 PV.'}},
 rit_odio_incontrolavel:{ef:{nota:'Não pode fazer ações que exijam calma (Furtividade, rituais) e deve atacar todo turno.'},efD:{nota:'Ao agredir, faz um ataque corpo a corpo adicional contra o mesmo alvo. Não pode fazer ações que exijam calma e deve atacar todo turno.'},efV:{rd:'Físico: metade do dano',nota:'Não pode fazer ações que exijam calma e deve atacar todo turno.'}},
 rit_fortalecimento_sensorial:{efD:{nota:'Inimigos sofrem –1d20 em ataques contra você.'},efV:{imune:['surpreendido','desprevenido'],nota:'Inimigos sofrem –1d20 em ataques contra você.'}},
 rit_descarnar:{efV:{danoArma:'4d8',nota:'Seus ataques corpo a corpo causam hemorragia (Fortitude no início de cada turno ou 2d8 de Sangue; passar dois seguidos estanca).'}},
 rit_hemofagia:{lembreteV:{nota:'Uma vez por rodada, ação padrão: toca um ser, 4d6 de Sangue e cura metade.',acoes:[{nome:'Tocar: 4d6 Sangue',dano:'4d6',curaMetade:true}]}},
 rit_rajada_caotica:{lembreteV:{nota:'Nos turnos seguintes, ação padrão para outro raio.',acoes:[{nome:'Raio: 8d10 Energia',dano:'8d10'}]}},
 rit_chamas_do_caos:{lembrete:{nota:'Chamejar (arma +1d6 de fogo), Esquentar (1d6 de fogo por rodada), Extinguir ou Modelar (3d6 de fogo em quem atravessar).',acoes:[{nome:'Chamejar: +1d6 fogo',dano:'1d6'},{nome:'Modelar: 3d6 fogo',dano:'3d6'}]},lembreteD:{nota:'Uma vez por rodada, ação de movimento: labareda em alcance curto (Reflexos reduz à metade).',acoes:[{nome:'Labareda: 4d6 Energia',dano:'4d6'}]},lembreteV:{nota:'Uma vez por rodada, ação de movimento: labareda em alcance curto (Reflexos reduz à metade).',acoes:[{nome:'Labareda: 8d6 Energia',dano:'8d6'}]}},
 rit_paradoxo:{lembreteD:{nota:'Esfera de 1,5m pela cena: 4d6 de Morte em quem estiver nela. Ação de movimento para mover 9m.',acoes:[{nome:'Esfera: 4d6 Morte',dano:'4d6'}]}},
 rit_capturar_momento:{lembrete:{nota:'Símbolo invisível que capta imagem e som a 18m; ação padrão para ver e ouvir.'},lembreteD:{nota:'Ação padrão para ver e ouvir, ou para explodir o símbolo (Fortitude reduz à metade).',acoes:[{nome:'Explodir: 4d8 Morte',dano:'4d8'}]},lembreteV:{nota:'Ação padrão para ver e ouvir, ou para explodir o símbolo (Fortitude reduz à metade).',acoes:[{nome:'Explodir: 8d8 Morte',dano:'8d8'}]}},
 rit_eco_espiral:{lembrete:{nota:'Próximo turno: concentre-se (ação padrão). No seguinte: descarregue, causando dano de Morte igual ao que o alvo sofreu na rodada da concentração.'},lembreteV:{nota:'Concentre-se por duas rodadas e descarregue na terceira: dano de Morte igual ao sofrido pelo alvo nas rodadas de concentração.'}},
 rit_tentaculos_de_lodo:{lembrete:{nota:'No início de cada turno seu: agarrar (Ocultismo) cada ser na área; quem já estava agarrado sofre o dano.',acoes:[{nome:'Agarrar (Ocultismo)',per:'ocultismo'},{nome:'Dano: 4d6',dano:'4d6'}]},lembreteV:{nota:'Raio 9m. No início de cada turno seu: agarrar (Ocultismo) cada ser; quem já estava agarrado sofre o dano.',acoes:[{nome:'Agarrar (Ocultismo)',per:'ocultismo'},{nome:'Dano: 6d6',dano:'6d6'}]}},
 rit_poeira_da_podridao:{lembrete:{nota:'No início de cada turno seu: dano a seres e objetos na área (Fortitude metade).',acoes:[{nome:'Dano: 4d8 Morte',dano:'4d8'}]},lembreteV:{nota:'No início de cada turno seu: dano na área (Fortitude metade).',acoes:[{nome:'Dano: 4d8+16 Morte',dano:'4d8+16'}]}},
 rit_ferver_sangue:{lembrete:{nota:'No início de cada turno do alvo: Fortitude ou dano e fraco (metade se passar). Dois sucessos seguidos encerram.',acoes:[{nome:'Dano: 4d8 Sangue',dano:'4d8'}]}},
 rit_presenca_do_medo:{lembrete:{nota:'No início de cada turno: dano mental e de Medo em quem está na área.',acoes:[{nome:'5d8 mental',dano:'5d8'},{nome:'5d8 Medo',dano:'5d8'}]}},
 rit_vomitar_pestes:{lembrete:{nota:'No fim dos seus turnos, quem estiver no espaço do enxame sofre o dano. Ação de movimento para mover 12m.',acoes:[{nome:'Enxame: 5d12 Sangue',dano:'5d12'}]}},
 rit_contencao_fantasmagorica:{lembrete:{nota:'Laços: Defesa 10, 10 PV, RD 5 cada. Atletismo (DT do ritual) destrói um laço.'},lembreteV:{nota:'Laços: Defesa 10, 10 PV, RD 5 cada. Cada laço destruído causa dano no alvo.',acoes:[{nome:'Laço destruído: 2d6+2',dano:'2d6+2'}]}},
 rit_miasma_entropico:{lembreteV:{nota:'Dura 3 rodadas: quem começa o turno na nuvem sofre de novo.',acoes:[{nome:'Nuvem: 6d8 Morte',dano:'6d8'}]}},
 rit_tecer_ilusao:{lembreteV:{nota:'Ilusão de perigo mortal: Vontade a cada turno ou dano; passar duas seguidas anula.',acoes:[{nome:'Ilusão: 6d6 Conhecimento',dano:'6d6'}]}},
 rit_convocar_o_algoz:{lembrete:{nota:'A imagem flutua 12m por turno até o alvo. Alcance curto: Vontade ou abalado. Adjacente: Fortitude ou 0 PV; se passar, sofre o dano (não abaixo de 1).',acoes:[{nome:'Algoz: 6d6 Morte',dano:'6d6'}]}},
 rit_vinculo_de_sangue:{lembrete:{nota:'Quando você sofre dano, o alvo faz Fortitude; se falhar, cada um sofre metade. Pode inverter, recebendo metade do dano dele.'}},
 rit_cineraria:{lembrete:{dt:5,nota:'Rituais conjurados na névoa têm +5 na DT (já somado; remova ao sair dela).'},lembreteD:{dt:5,nota:'Rituais na névoa: +5 na DT (já somado) e custam –2 PE.'},lembreteV:{dt:5,nota:'Rituais na névoa: +5 na DT (já somado) e causam dano maximizado.'}},
 rit_rejeitar_nevoa:{lembrete:{nota:'Rituais na área custam +2 PE por círculo e a execução sobe um passo.'},lembreteD:{nota:'Rituais na área custam +2 PE por círculo, execução um passo acima e DT –5.'},lembreteV:{nota:'Rituais na área: +2 PE por círculo, execução um passo acima, DT –5 e dano mínimo.'}},
 rit_fim_inevitavel:{lembrete:{nota:'No início dos seus próximos turnos, todos a até 90m fazem Fortitude ou ficam caídos e são puxados 30m. Tocar o vácuo no início do turno: 100 de dano de Morte.'}},
 rit_distorcao_temporal:{ef:{nota:'Por 3 rodadas você age, mas não se desloca nem interage com seres e objetos; efeitos contínuos não o afetam.'}},
 rit_velocidade_mortal:{ef:{nota:'Uma ação de movimento adicional por turno (não serve para rituais).'},efD:{nota:'Uma ação padrão adicional por turno.'},efV:{nota:'Uma ação padrão adicional por turno.'}},
 rit_corpo_adaptado:{ef:{nota:'Imune a calor e frio extremos, respira na água e não sufoca em fumaça.'}},
 rit_terceiro_olho:{ef:{nota:'Vê auras paranormais em alcance longo. Ação de movimento para saber se um ser em alcance médio tem poderes ou conjura rituais.'},efV:{nota:'Vê auras paranormais e também seres e objetos invisíveis.'}},
 rit_apagar_as_luzes:{ef:{nota:'Visão no escuro até o fim da cena; as luzes ficam apagadas.'}},
 rit_compreensao_paranormal:{ef:{nota:'Entende idiomas humanos pelo toque, conversa com quem tocar ou sente emoções de animais.'},efV:{nota:'Fala, entende e escreve qualquer idioma humano.'}},
 rit_deteccao_de_ameacas:{ef:{nota:'Sente perigo quando um ser hostil ou armadilha entra na esfera de 18m. Ação de movimento e Percepção DT 20 para saber direção e distância.'},efD:{nota:'Sente perigo na esfera de 18m; não fica desprevenido contra perigos detectados e tem +5 em resistência contra armadilhas.'},efV:{nota:'Dura 1 dia: sente perigo na esfera de 18m; não fica desprevenido contra perigos detectados e tem +5 em resistência contra armadilhas.'}},
 rit_esconder_dos_olhos:{ef:{nota:'Invisível (camuflagem total). Termina se atacar ou usar habilidade hostil.'},efD:{pericia:{id:'furtividade',valor:15},nota:'Esfera de invisibilidade para você e aliados a até 3m.'},efV:{pericia:{id:'furtividade',valor:15},nota:'Invisível; não termina com ataques.'}},
 rit_odor_da_cacada:{ef:{nota:'Faro. Em perseguições contra quem emite odor: +5 em Atletismo e esforço extra não custa PV. Na cena seguinte, fome e sede.'}},
 rit_fedor_putrido:{ef:{dadosPer:{diplomacia:-3},pericia:{id:'furtividade',valor:5},nota:'+10 em Enganação para se fingir de morto; animais se afastam.'},lembrete:{acoes:[{nome:'1d4 Morte em você',danoEu:'1d4'}]}},
 rit_tremeluzir:{ef:{nota:'Atravessa objetos sólidos (ação de movimento por objeto, 25% de falha). +1d4 se terminar dentro de algo.'},lembrete:{acoes:[{nome:'1d4 Energia em você',danoEu:'1d4'}]}},
 rit_mutar:{ef:{nota:'Não emite nem ouve sons. Só fala na mesa com permissão do mestre.'}},
 rit_polarizacao_caotica:{ef:{nota:'Repelir (RD 5 física). Ou Atrair: ação de movimento para puxar um objeto metálico de até 2 espaços.'}},
 rit_luz:{lembreteV:{nota:'Luz solar: aliados recebem +1d20 em Vontade e inimigos ficam ofuscados.'}},
};
out.rituais.forEach(x=>{const a=RIT[x.id];if(!a)return;
 ['ef','efD','efV'].forEach(k=>{if(a[k]){const base=k==='ef'?x.ef:(x[k]||x.ef);x[k]={...(base||{}),...a[k]}}});
 ['lembrete','lembreteD','lembreteV','reacao'].forEach(k=>{if(a[k])x[k]=a[k]})});
// tornarGeral é lista de ids (SaH): guarda como extra
out.extras.tornarGeral=out.tornarGeral;delete out.tornarGeral;
fs.mkdirSync(path.join(__dirname,'data'),{recursive:true});
const txt=JSON.stringify(out);
fs.writeFileSync(path.join(__dirname,'data','dados.json'),txt);
console.log('ok',(txt.length/1024).toFixed(0)+'KB','dups',dup,Object.fromEntries(Object.entries(out).filter(([k,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length])));
