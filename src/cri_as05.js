// Criaturas do Arquivos Secretos #05 (Transmissão: os Alheios), resumidas com nossas palavras.
const {C,A,H}=require('./cri_util');
const GUINCHO=H('Padrão','Guincho gutural','Raio de 9m: 5d10 de dano (metade Conhecimento, metade Energia); hospedeiros e Alheios são imunes. Como reação, quem é atingido pode tapar os ouvidos (larga o que segura, sofre metade e fica surdo 1 rodada) ou não (dano inteiro e surdo 1d4+1 rodadas).');
const DOPPEL=[H('Passiva','Disfarce alheio','Em Enganação rola duas vezes e fica com o melhor.'),H('Passiva','Somos todos um','Sabe onde estão os outros doppelgangers e age pelo mesmo objetivo, mesmo que se sacrifique.'),
 H('Movimento','Assumir forma monstruosa','Revela a forma monstruosa: +10 PV máximos e atuais, +2 Defesa, +5 em testes, +5 no dano e +2 na DT das habilidades.')];
module.exports={criaturas:[
C({n:'Hospedeiro Parasitado',tipo:'pessoa',e:'conhecimento',e2:'energia',vd:20,t:'Médio',per:'1d20+5',ini:'1d20+5',def:15,fort:'1d20+5',ref:'1d20+5',von:'1d20+5',pv:10,at:'1 1 1 1 1',d:'9m'},[
 H('Passiva','Parasitado','Controlado por um interflorado no sistema nervoso. Sinais: sangue de plasma verde ácido, dificuldade com cores e piscar um olho de cada vez. Um choque térmico (aquecer e mergulhar em água gelada) expulsa o parasita sem ferir o hospedeiro, se ele não estiver nervoso ou consciente do que acontece.'),
 H('Passiva','Variações','Acólito: INT e PRE 2, Ocultismo/Percepção/Religião/Vontade 2d20+5 e dois rituais de 1º círculo sem custo (DT 15). Faz-tudo: +1 em dois atributos, +5 em quatro perícias. Guerrilheiro: AGI, FOR e VIG 2, 20 PV, pancada e pistola 2d20+10. Socorrista: INT e PRE 2, Medicina 2d20+5 e primeiros socorros (1d8+1 PV, uma vez por cena).'),
 A('Pancada','Corpo a corpo','1d20+5','1d4+5 impacto')]),
C({n:'Hospedeiro Aflorado',e:'conhecimento',e2:'energia',vd:60,t:'Médio',pp:'DT 19 · 3d6 mental · NEX 35%+ imune',per:'2d20',sen:'percepção às cegas, visão no escuro',ini:'2d20+5',def:25,fort:'3d20+10',ref:'2d20+5',von:'2d20',pv:100,res:'Balístico, corte, impacto e perfuração 5; Conhecimento, Energia e químico 10',vul:'Fogo, frio e Sangue',at:'2 2 1 2 3',d:'9m'},[
 H('Passiva','Aflorado','O interflorado tomou o corpo e matou o hospedeiro, saindo pelo pescoço. Matar um mata o outro.'),
 A('Pancada','Corpo a corpo ×2','2d20+10','1d6+5 impacto + 2d6 químico'),
 H('Movimento','Disparada errante','Anda o dobro, mas faz Acrobacia DT 20; falhando, cai no fim do movimento.'),
 GUINCHO]),
C({n:'Interflorado',e:'conhecimento',e2:'energia',vd:40,t:'Pequeno',pp:'DT 15 · 2d8 mental · NEX 30%+ imune',per:'1d20+5',sen:'visão no escuro',ini:'2d20+5',def:19,fort:'1d20',ref:'2d20+5',von:'1d20+5',pv:70,res:'Balístico, corte, impacto e perfuração 5; Conhecimento, Energia e químico 10',vul:'Fogo, frio e Sangue',at:'2 2 1 1 1',pe:'Acrobacia 2d20+5, Atletismo 2d20+5, Furtividade 2d20+10',d:'9m'},[
 H('Movimento','Contorcer perturbador','Corre se debatendo até uma pessoa ou animal: 2d8 mental, apavorado e trêmulo até o fim da cena (Vontade DT 15 metade e fica só abalado; quem passa fica imune por 1 dia).'),
 GUINCHO,
 H('Completa','Investida sufocante','Anda o dobro e salta na cabeça de alguém (agarrar, 2d20+10): agarrado, cego, surdo e asfixiado; a vítima tenta de novo com ação padrão. Se ela desmaiar, vira hospedeiro parasitado. Também parasita quem já está inconsciente sem acordar.'),
 H('Completa','Incubar','Deixa ovas no hospedeiro para gerar novos Alheios (detalhes no livro).')]),
C({n:'Fummu',e:'conhecimento',e2:'energia',vd:100,t:'Médio',pp:'DT 21 · 4d6 mental · NEX 45%+ imune',per:'2d20+5',sen:'visão no escuro',ini:'3d20+10',def:25,fort:'2d20',ref:'3d20+10',von:'2d20+5',pv:200,imu:'Fogo',res:'Balístico, corte, impacto e perfuração 10; Conhecimento, Energia e químico 20',vul:'Sangue',at:'3 2 2 2 2',pe:'Atletismo 2d20+10, Furtividade 3d20+10',d:'9m'},[
 H('Passiva','Invisível no ar limpo','Só fica visível com fumaça ou gás não respirável no ambiente. Deixa cheiro de queimado ou enxofre, plantas ressecadas e digitais estranhas.'),
 H('Passiva','Chamas ferventes','Quem o agarra sofre 2d10 de fogo, uma vez por rodada.'),
 A('Toque ácido','Corpo a corpo ×2','3d20+15','2d10+10 químico'),
 H('Movimento','Cintilação estelar','Uma vez por rodada, se não estiver agarrado, teleporta-se a um ponto livre a até 9m.'),
 H('Padrão','Acionar explosão','Faz explodir um objeto inflamável em alcance médio: Minúsculo, 2d6 de fogo e em chamas num raio de 3m (Reflexos DT 4d10 metade e evita); +2d6 e +1,5m por categoria de tamanho acima.'),
 H('Padrão','Chama viridente','Um ser em alcance médio sofre 4d10+20 de fogo e fica em chamas (Reflexos DT 21 metade e evita).')]),
C({n:'Doppelganger Civil',e:'conhecimento',e2:'energia',vd:20,t:'Médio',pp:'DT 15 · 1d6 mental · NEX 20%+ imune',per:'2d20+5',sen:'visão no escuro',ini:'1d20',def:14,fort:'1d20',ref:'1d20',von:'2d20+5',pv:14,res:'Balístico, corte, impacto e perfuração 5; Conhecimento e Energia 10',vul:'Sangue',at:'1 1 3 2 1',pe:'Atualidades, Ciências, Profissão, Sobrevivência e Tecnologia 3d20+5; Enganação e Religião 2d20+5; Crime, Furtividade e Pilotagem 1d20+5',d:'9m'},[
 ...DOPPEL,
 A('Pancada','Corpo a corpo','1d20+5','1d4+2 impacto'),
 A('Pistola de plasma','Distância, alcance curto, crítico 18','1d20+5','2d6+2 Energia')]),
C({n:'Doppelganger Combatente',e:'conhecimento',e2:'energia',vd:60,t:'Médio',pp:'DT 20 · 3d6 mental · NEX 35%+ imune',per:'2d20+5',sen:'visão no escuro',ini:'2d20+5',def:19,fort:'1d20+5',ref:'2d20+5',von:'2d20+5',pv:70,res:'Balístico, corte, impacto e perfuração 10; Conhecimento e Energia 20',vul:'Sangue',at:'2 2 3 2 1',pe:'Ciências, Sobrevivência e Tecnologia 3d20+5; Atletismo, Crime, Enganação, Furtividade, Pilotagem e Religião 2d20+5',d:'9m'},[
 ...DOPPEL,
 H('Passiva','Close quarter combat','+1d20 em ataques corpo a corpo (inclusive com armas de fogo) e em manobras; mira, recarrega, saca e guarda como ação livre (já somado).'),
 A('Pancada','Corpo a corpo ×2','2d20+10','1d10+5 impacto'),
 A('Pistola de plasma','Distância ×2, alcance curto, crítico 18','2d20+10','2d6+5 Energia'),
 H('Reação','Proteger','Uma vez por rodada, recebe no lugar de um aliado adjacente um dano ou efeito negativo.'),
 H('Livre','Especialista em manobras','Uma vez por rodada, ao acertar desarmado, tenta agarrar, derrubar ou desarmar (teste 2d20+12).')]),
C({n:'Doppelganger Cultista',e:'conhecimento',e2:'energia',vd:160,t:'Médio',pp:'DT 25 · 4d8 mental · NEX 55%+ imune',per:'4d20+10',sen:'visão no escuro',ini:'3d20+10',def:28,fort:'2d20+5',ref:'3d20+10',von:'4d20+10',pv:240,res:'Balístico, corte, impacto e perfuração 10; Conhecimento e Energia 20',vul:'Sangue',at:'3 2 3 4 2',pe:'Artes, Diplomacia, Enganação, Intimidação e Religião 4d20+10; Ciências, Crime, Furtividade, Ocultismo, Pilotagem, Sobrevivência e Tecnologia 3d20+10',d:'9m'},[
 ...DOPPEL,
 H('Passiva','Rituais (DT 23, até 6 PE, sem custo)','Enfeitiçar (normal ou discente); Invadir Mente (discente); Perturbação (discente); Tela de Ruído (discente, até três vezes por cena; também como reação, RD 30).'),
 A('Pancada','Corpo a corpo ×2','2d20+10','1d4+5 impacto'),
 A('Pistola de plasma','Distância ×2, alcance curto, crítico 18','3d20+10','2d6+10 Energia')]),
C({n:'Bilu',e:'conhecimento',e2:'energia',vd:42,t:'Médio',pp:'DT 15 · 1d4 mental · NEX 30%+ imune',per:'3d20+10',sen:'visão no escuro',ini:'3d20+10',def:12,fort:'1d20',ref:'3d20+10',von:'3d20+10',pv:42,res:'Balístico, corte, impacto e perfuração 5; Conhecimento, Energia e químico 10',vul:'Sangue',at:'3 2 3 4 2',pe:'Artes, Ciências, Furtividade, Ocultismo, Religião e Tecnologia 3d20+10',d:'9m'},[
 H('Passiva','Não hostil','Não procura briga, mas o que faz ainda machuca.'),
 H('Reação','Até breve','Machucado, some para um espaço extradimensional; o mestre decide quando volta.'),
 H('Reação','Embaralhamento mental','Se alguém o ameaça (atacando, por exemplo), sofre 4d10 mental e fica esmorecido até o fim da cena (Vontade DT 20 metade e só frustrado).'),
 H('Movimento','Comer cimento','Come cimento adjacente e recupera 10 PV.'),
 H('Movimento','Salto para a frente','Salta até 12m; se for a primeira vez que alguém o vê, a pessoa sofre 4d4 mental e fica abalada até o fim da cena (Vontade DT 15 metade e evita).'),
 H('Padrão','Fala enigmática','Uma pessoa em alcance curto sofre 3d6 mental e fica frustrada até o fim da cena (Vontade DT 15 metade e evita).'),
 H('Padrão','Luz própria','Liga ou desliga todos os eletrônicos num raio de 9m, ou emite luz verde na mesma área.')]),
C({n:'Rastropoda',e:'conhecimento',e2:'energia',vd:140,t:'Médio',pp:'DT 24 · 4d8 mental · NEX 50%+ imune',per:'3d20+10',sen:'visão no escuro',ini:'2d20+5',def:31,fort:'4d20+10',ref:'2d20+5',von:'3d20+10',pv:200,res:'Balístico, corte, impacto e perfuração 10; Conhecimento, Energia, fogo e químico 20',vul:'Sangue',at:'2 2 1 3 4',d:'12m'},[
 H('Passiva','Ácidos ferventes','Quem o agarra sofre 2d10 de dano químico, uma vez por rodada.'),
 H('Passiva','Imune a gases','Fumaça, gás e afins não o afetam.'),
 A('Toque ácido','Corpo a corpo ×2','2d20+15','5d8+15 químico'),
 A('Gosma plasmática','Distância ×2, alcance curto','2d20+15','4d10+15 Energia'),
 H('Livre','Agarrão corrosivo','Uma vez por rodada, ao acertar o toque ácido, tenta agarrar (teste 2d20+17); o agarrado sofre 2d10 químico por rodada.'),
 H('Livre','Rastro pestilento','Uma vez por rodada, ao se mover, deixa um rastro por 1 rodada: quem tocar sofre 2d10 químico (Reflexos DT 24 metade), uma vez por rodada.'),
 H('Movimento','Rastro deslizante','Desliza o dobro do deslocamento em linha reta.'),
 H('Padrão','Fumocinese','Absorve gás e fumaça num raio de até 9m e solta um gás alucinógeno na mesma área: perdem 4d8 SAN e ficam confusos (Fortitude DT 24 metade e evita).'),
 H('Padrão','Telecinese de plasma','Move um ser Médio ou menor ou objeto de até 10 espaços em alcance médio, até 6m por rodada, mantendo com ação padrão (Vontade DT 24 anula).')]),
C({n:'Memoflígico',e:'conhecimento',e2:'energia',vd:200,t:'Médio',pp:'DT 29 · 6d6 mental · NEX 65%+ imune',per:'4d20+15',sen:'percepção às cegas, visão no escuro',ini:'3d20+15',def:38,fort:'2d20+10',ref:'3d20+15',von:'4d20+15',pv:400,res:'Balístico, corte, impacto e perfuração 10; Conhecimento e Energia 20',vul:'Sangue',at:'3 - 3 4 2',d:'9m'},[
 H('Passiva','Incorporeidade alheia','Incorpóreo e invisível: só é afetado por itens amaldiçoados, rituais ou outros incorpóreos; atravessa objetos sem manipulá-los. Fica visível com ação livre.'),
 H('Passiva','Círculo de transmissão','Preso num círculo de eletrônicos funcionando com 10m de raio, perde invisibilidade e incorporeidade. Se 1 aparelho parar, volta a ficar invisível; se metade parar, volta a ser incorpóreo.'),
 A('Toque psicônico','Corpo a corpo ×2','3d20+25','6d6 mental'),
 A('Raio psicônico','Distância ×2, alcance curto','3d20+25','6d6 mental'),
 H('Movimento','Teletransporte psicônico','Incorpóreo e invisível, teleporta-se até 18m.'),
 H('Padrão','Manipulação psicônica','Uma pessoa em alcance médio sofre 6d6 mental (Vontade DT 29 metade) e um efeito à escolha até o fim da cena: alquebrada, cega e surda, apavorada, confusa, esmorecida, pasma ou –5 em Vontade contra os outros efeitos (passar abranda o efeito). Ou só 1d6 mental para tentar se comunicar por aparelhos.')]),
]};
