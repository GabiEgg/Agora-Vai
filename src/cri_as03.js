// NPCs e criaturas do Arquivos Secretos #03 (Hexatombe: o fim), resumidos com nossas palavras.
const {C,A,H}=require('./cri_util');
// PSIKOLERA: todos têm Hora do Show (máscara) e Música do Diabo.
const SHOW=(def,pv,teste)=>H('Padrão','Hora do Show','Põe a máscara: +5 no ataque, Defesa '+def+', '+pv+' PV, +5 na DT das habilidades, +2 dados de dano do mesmo tipo e libera Música do Diabo. Arrancar a máscara (vencer uma manobra de desarmar contra '+teste+') tira a habilidade; quebrá-la (manobra de quebrar contra '+teste+'; RD 10, 5 PV) também.');
const MUSICA=H('Livre','Música do Diabo','Mascarado, começa a tocar: todos os membros do PSIKOLERA causam dano extra do mesmo tipo conforme quantos estão tocando (1: +1d4; 2: +1d6; 3: +1d8; 4: +1d10).');
module.exports={criaturas:[
C({n:'Alê (PSIKOLERA)',tipo:'pessoa',e:'sangue',vd:80,t:'Médio',per:'3d20+10',ini:'3d20+5',def:18,fort:'1d20',ref:'3d20+5',von:'3d20+10',pv:45,at:'3 1 3 3 1',pe:'Artes 3d20+10, Ocultismo 3d20+10',d:'9m'},[
 H('Passiva','Rituais (DT 20, até 6 PE, sem custo)','Cicatrização (discente); Proteção Sigilosa (Conhecimento 2: área de 3m de raio, ele e aliados dentro recebem +5 na Defesa, resistências e Furtividade até o fim da cena).'),
 A('Cortar com teclado','Corpo a corpo ×2, crítico 19','1d20+10','2d6+10 corte'),
 H('Padrão','Desfazer sinapses','Um ser em alcance médio sofre 3d10+10 de Conhecimento e fica confuso 1 rodada (Vontade DT 20 metade e evita).'),
 SHOW(28,65,'1d20+10'),MUSICA]),
C({n:'Caio (PSIKOLERA)',tipo:'pessoa',e:'sangue',vd:80,t:'Médio',per:'2d20',ini:'2d20+5',def:17,fort:'2d20+10',ref:'2d20+5',von:'2d20',pv:60,at:'2 2 1 2 2',pe:'Artes 2d20+10, Atletismo 2d20+10',d:'9m'},[
 A('Espada','Corpo a corpo ×2, crítico 19','2d20+10','2d8+10 corte'),
 H('Padrão','Berrão','Grita no ouvido de um alvo adjacente: 4d8 de impacto, surdo 1 rodada e solta o que segura. Se largar tudo para tapar os ouvidos, sofre metade e evita a surdez.'),
 H('Padrão','Corte na jugular','Um adjacente sofre 2d8+10 de corte e fica sangrando (Reflexos DT 20 metade e evita).'),
 SHOW(27,80,'2d20+10'),MUSICA]),
C({n:'Eloy Furtado (PSIKOLERA)',tipo:'pessoa',e:'sangue',vd:80,t:'Médio',per:'1d20',ini:'2d20+5',def:16,fort:'3d20+10',ref:'2d20+5',von:'1d20',pv:70,at:'1 3 1 1 3',pe:'Atletismo 3d20+10, Artes 1d20+10',d:'9m'},[
 A('Pancada','Corpo a corpo ×2, crítico 19','3d20+10','4d4+10 impacto'),
 H('Padrão','Moeller method','Espanca um adjacente como bateria: Fortitude DT 20; passa, 2d4+5 de impacto e acaba; falha, 4d4+10 e testa de novo, repetindo até passar ou falhar três vezes seguidas.'),
 SHOW(26,90,'3d20+10'),MUSICA]),
C({n:'Franco (PSIKOLERA)',tipo:'pessoa',e:'sangue',vd:80,t:'Médio',per:'1d20',ini:'2d20+5',def:16,fort:'2d20+5',ref:'2d20+10',von:'1d20',pv:55,at:'2 2 1 1 2',pe:'Acrobacia 2d20+10, Artes 1d20+10',d:'9m'},[
 A('Bater com guitarra','Corpo a corpo ×2','2d20+5','1d10+5 impacto'),
 H('Padrão','Incinerar','Chamas da guitarra num ser em alcance curto: 6d6+5 de fogo e em chamas (Reflexos DT 20 metade e evita).'),
 H('Padrão','Imolar','Força o lança-chamas num ser em alcance curto e rola 1d20: 10+, 8d6+10 de fogo e em chamas (Reflexos DT 20 metade e evita); 9 ou menos, vaza combustível nele mesmo: 4d6 de fogo e em chamas.'),
 SHOW(26,75,'2d20+5'),MUSICA]),
C({n:'Cindy Lopes (PSIKOLERA)',tipo:'pessoa',e:'sangue',vd:80,t:'Médio',per:'3d20+5',ini:'3d20+10',def:17,fort:'1d20',ref:'3d20+10',von:'3d20+5',pv:50,at:'3 1 2 3 1',pe:'Artes 3d20+10, Enganação 3d20+10',d:'9m'},[
 A('Pancada com baixo','Corpo a corpo ×2','1d20+10','1d6+10 impacto'),
 A('Disparo com baixo','Distância ×2, alcance médio, crítico 19/×3','3d20+10','2d8+10 balístico'),
 H('Padrão','Silenciar','Um ser em alcance médio sofre 2d6 mental e fica trêmulo 3 rodadas (Vontade DT 20 metade e só 1 rodada).'),
 SHOW(27,70,'1d20+10'),MUSICA]),
C({n:'Caíto',tipo:'pessoa',e:'sangue',vd:20,t:'Médio',per:'1d20+5',ini:'2d20+5',def:17,fort:'1d20',ref:'2d20+5',von:'1d20+5',pv:20,at:'2 1 2 1 1',pe:'Furtividade 2d20+5',d:'9m'},[
 A('Disparo de pistola','Distância ×2, alcance curto, crítico 18','2d20+5','1d12+5 balístico'),
 H('Completa','Ódio suprimido','Explode de raiva: cada ser em alcance curto faz Fortitude e Reflexos DT 20. Falhou Fortitude: caído e 1d4+6 de impacto. Falhou Reflexos: 1d12+5 balístico. Depois ele fica exausto até o fim da cena.')]),
C({n:'Ana (Couraças)',tipo:'pessoa',e:'sangue',vd:100,t:'Médio',per:'1d20+5',ini:'2d20+5',def:27,fort:'3d20+10',ref:'2d20+5',von:'1d20+5',pv:90,res:'Balístico, impacto e perfuração 5; Sangue 10',vul:'Morte',at:'2 3 1 1 3',pe:'Atletismo 3d20+10',d:'9m'},[
 H('Passiva','Rituais (DT 20, sem custo)','Hemofagia.'),
 H('Passiva','Paixão servil','Em alcance curto de Escarlata: +1d6 em todos os testes e rolagens (+1d10 se Escarlata foi atacada desde a última rodada).'),
 A('Maça','Corpo a corpo, crítico ×3','3d20+15','6d4+10 perfuração'),
 A('Espada','Corpo a corpo, crítico 19','3d20+15','4d6+10 corte')]),
C({n:'Argano (Couraças)',tipo:'pessoa',e:'sangue',vd:100,t:'Médio',per:'–2d20',ini:'1d20+5',def:26,fort:'4d20+10',ref:'1d20+5',von:'–2d20',pv:120,res:'Balístico, impacto e perfuração 5; Sangue 10',vul:'Morte',at:'1 4 1 0 4',pe:'Atletismo 4d20+10',d:'9m'},[
 A('Maça pesada','Corpo a corpo, crítico ×3','4d20+15','4d8+20 perfuração'),
 H('Reação','Guardião','Uma vez por rodada, em alcance curto de Escarlata, sofre no lugar dela um dano dirigido a ela.'),
 H('Padrão','Erguer maça','Prepara o Golpe Arrasador.'),
 H('Padrão','Golpe arrasador','Depois de erguer a maça, um adjacente sofre 4d12+20 de perfuração (Fortitude DT 21 metade).'),
 H('Completa','Esmagar ossos','Passa por cima de alguém caído ou atordoado em alcance curto: 4d10+20 de perfuração e fraco por um dia (Reflexos DT 21 metade e evita).')]),
C({n:'Chispa (Couraças)',tipo:'pessoa',e:'sangue',vd:100,t:'Médio',per:'1d20+10',ini:'3d20+5',def:26,fort:'1d20+5',ref:'3d20+10',von:'1d20+10',pv:90,res:'Balístico, impacto e perfuração 5; Sangue 10',vul:'Morte',at:'3 1 4 1 1',pe:'Pilotagem 3d20+10, Tecnologia 4d20+10',d:'15m (triciclo)'},[
 H('Passiva','Motor frágil','Atacar o motor do triciclo: –1d20, Defesa 26, RD 5, 20 PV. Destruído, explode (4d6, metade perfuração e metade fogo, em Chispa), que fica imóvel, desprevenido e sem Acelerar e Investida com Lança até consertar (1d4+1 horas).'),
 A('Tiro de escopeta','Distância, alcance curto, crítico ×3','3d20+15','6d6+20 balístico'),
 H('Reação','Acelerar','Uma vez por rodada, +5 na Defesa e em resistências contra um ataque ou efeito.'),
 H('Padrão','Granada flamejante','Explosão de 3m em alcance curto: 6d6 de fogo e em chamas (Reflexos DT 21 metade e evita).'),
 H('Completa','Investida com lança','Avança em alguém em alcance médio: se o alvo tentar saltar, Reflexos DT 21 ou sofre 6d8+20 de perfuração; se tentar outra coisa, teste de perícia DT 21 ou falha e sofre o mesmo dano.')]),
C({n:'Torvo (Couraças)',tipo:'pessoa',e:'sangue',vd:20,t:'Médio',per:'1d20',ini:'1d20',def:21,fort:'2d20+5',ref:'1d20',von:'1d20+10',pv:30,res:'Balístico, impacto e perfuração 5; Sangue 10',vul:'Morte',at:'1 1 1 1 2',d:'0m'},[
 H('Passiva','Fonte de rituais','Em alcance curto de Escarlata, quando ela causa dano com ritual pode drenar Torvo: +2d6 de dano do mesmo tipo e Torvo perde 2d6 PV.'),
 A('Manopla espinhenta','Corpo a corpo','1d20+10','1d6+5 perfuração')]),
C({n:'Escarlata (Couraças)',tipo:'pessoa',e:'sangue',vd:120,t:'Médio',per:'4d20+10',ini:'3d20+10',def:28,fort:'2d20+5',ref:'3d20+5',von:'4d20+10',pv:100,res:'Balístico, impacto e perfuração 5; Sangue 10',vul:'Morte',at:'3 2 3 4 2',pe:'Enganação 4d20+10, Ocultismo 3d20+10, Atletismo 2d20+5',d:'9m'},[
 H('Passiva','Rituais (DT 23, sem custo)','Descarnar (discente); Flagelo de Sangue (discente); Hemofagia (discente: ataca com as garras somando +6d6 de Sangue e cura metade).'),
 A('Rasgar com garras','Corpo a corpo ×2, crítico 19','3d20+15','4d10+10 corte'),
 H('Padrão','Sedução','Flerta com um personagem; o jogador decide como ele se sente. Não ficou a fim: nada. Um pouco: +1d8 PE temporários e fica suscetível à Dominação (–1d8 nos testes). Muito: +2d8 PE temporários e –2d8 nos testes.'),
 H('Padrão','Dominação','Ordem a alguém seduzido: Vontade DT 23 (menos a penalidade da Sedução) ou obedece; ordens longas permitem novo teste a cada rodada com +1 cumulativo.'),
 H('Passiva','Dar o fora','Quem se envolveu com ela pode tentar terminar: Vontade DT 23 + a penalidade da Sedução.')]),
C({n:'Miasma',tipo:'pessoa',e:'sangue',vd:40,t:'Médio',per:'1d20',ini:'2d20+5',def:18,fort:'2d20+5',ref:'2d20',von:'1d20',pv:30,at:'2 2 1 1 2',d:'9m'},[
 A('Golpe com correntes','Corpo a corpo','2d20+5','2d8+5 impacto'),
 H('Padrão','Despertar obsessão','Encara uma pessoa em alcance curto. Se ela desviar o olhar, leva uma correntada à distância (2d8+5 de impacto). Se encarar, Vontade DT 25 ou passa 1 rodada indo adorar Escarlata; se recusar, ataca a si mesma e o efeito acaba.')]),
C({n:'Coruja (Cecília Clemm)',tipo:'pessoa',vd:40,t:'Médio',per:'2d20+10',ini:'3d20+10',def:19,fort:'1d20',ref:'3d20+10',von:'2d20+5',pv:50,at:'3 1 3 2 1',pe:'Atualidades, Ciências, Furtividade e Sobrevivência 3d20+10; Adestramento 2d20+10',d:'9m'},[
 H('Passiva','Rituais (DT 20, até 4 PE, sem custo)','Aprimorar Físico; Aprimorar Mente.'),
 H('Passiva','Dardos sedativos','Atingido por um dardo, o alvo fica inconsciente até ser acordado ou o fim da cena (Fortitude DT 20 evita).'),
 H('Passiva','Validação de hipótese','Num crítico, +1d20 em testes contra o mesmo alvo.'),
 A('Tiro de zarabatana','Distância, alcance curto, crítico 19','3d20+10','1d4+1 perfuração + sedativo')]),
C({n:'Corvo (Edgar)',tipo:'pessoa',vd:40,t:'Médio',per:'2d20+10',ini:'3d20+10',def:18,fort:'1d20+5',ref:'2d20+5',von:'3d20+10',pv:60,at:'2 1 3 3 1',pe:'Adestramento, Atualidades, Furtividade, Ocultismo e Sobrevivência 3d20+10',d:'9m'},[
 H('Passiva','Rituais (DT 20, até 4 PE, sem custo)','Cicatrização (discente); Definhar (discente); Esconder dos Olhos (como ação livre); Tecer Ilusão (discente).'),
 H('Passiva','Silêncio fúnebre','Morto, o corpo ganha 30 PV temporários e vira mau agouro: testes contra os aliados dele num raio de 30m sofrem –2d20 até o fim da cena ou até os PV acabarem.'),
 A('Pancada','Corpo a corpo','1d20+5','1d4+5 impacto')]),
C({n:'Papagaio (Rogério)',tipo:'pessoa',vd:40,t:'Médio',per:'3d20+10',ini:'2d20+10',def:21,fort:'1d20+5',ref:'2d20+5',von:'3d20+10',pv:60,at:'2 2 1 3 2',pe:'Adestramento, Diplomacia e Enganação 3d20+10; Artes 3d20+5; Crime 2d20+10',d:'9m'},[
 A('Garrafada','Corpo a corpo ×2','2d20+10','1d4+10 impacto'),
 H('Livre','Desarmar','Ao acertar a garrafada, tenta desarmar (teste 2d20+15).'),
 H('Padrão','Cachimbo do capeta','Sopra fumaça num adjacente: asfixiado até gastar uma ação padrão para recuperar o fôlego (Fortitude DT 20 evita).')]),
C({n:'Pomba',tipo:'pessoa',vd:40,t:'Médio',per:'2d20+10',ini:'2d20+5',def:20,fort:'2d20+5',ref:'2d20+5',von:'2d20+10',pv:50,at:'2 1 3 3 1',pe:'Ciências, Intuição, Investigação e Percepção 2d20+10; Atletismo 1d20+15; Furtividade, Pilotagem e Sobrevivência 2d20+5',d:'9m'},[
 H('Passiva','Ensinamentos do ninho','Depois de ver um aliado morrer, pode usar uma vez, até o fim da cena, qualquer habilidade que ele tinha.'),
 H('Passiva','Voe para longe','Na primeira rodada de combate, anda o dobro com uma ação de movimento.'),
 A('Canivete','Corpo a corpo ×2','2d20+10','1d4+5 corte')]),
C({n:'Harpia (Santiago Luis Borges)',tipo:'pessoa',vd:80,t:'Médio',per:'2d20+10',ini:'3d20+10',def:22,fort:'3d20+10',ref:'3d20+10',von:'2d20+5',pv:100,at:'3 3 2 2 3',pe:'Atletismo e Furtividade 3d20+10; Adestramento, Sobrevivência e Tática 2d20+10',d:'9m'},[
 A('Garra do Harpia','Corpo a corpo ×2, crítico 19','3d20+10','2d8+10 corte'),
 A('Pistola','Distância ×2, alcance curto, crítico 18','3d20+10','1d12+10 balístico'),
 H('Livre','Agarrar','Ao acertar a garra, tenta agarrar (teste 3d20+15).'),
 H('Livre','Assobio do Harpia','Uma vez por rodada, as aves atacam um alvo em alcance longo: Cegar (3d6 de perfuração e cego 1 rodada; Reflexos DT 20 metade e evita), Distrair (pasmo 1 rodada; Vontade DT 20 evita; uma vez por cena por alvo) ou Sangrar (5d6 de perfuração e sangrando; Fortitude DT 20 metade e evita).')]),
C({n:'Suellen',tipo:'pessoa',vd:20,t:'Médio',per:'2d20+5',ini:'1d20+5',def:15,fort:'2d20+5',ref:'2d20+5',von:'2d20+5',pv:30,at:'1 2 2 2 2',pe:'Adestramento, Atualidades e Enganação 2d20+10',d:'9m'},[
 A('Golpe com cutelo','Corpo a corpo','2d20+5','1d8+5 corte'),
 H('Padrão','Estimular hedonismo','Uma pessoa em alcance curto é tomada por prazer insano e fica indefesa 1 rodada (Vontade DT 20 evita).')]),
]};
