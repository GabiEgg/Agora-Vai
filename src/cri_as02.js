// NPCs e criaturas do Arquivos Secretos #02 (Hexatombe: os Mascarados), resumidos com nossas palavras.
// Os Mascarados têm duas fichas: a pessoa e a forma da intenção assassina.
const {C,A,H}=require('./cri_util');
const INT_ON=(outra)=>H('Padrão','Intenção assassina','Desperta a intenção assassina e passa a usar a ficha de '+outra+'.');
const INT_OFF=(outra)=>H('Padrão','Intenção assassina','Adormece a intenção assassina e volta à ficha de '+outra+'; não pode despertá-la de novo até dormir.');
const PODER_INT=(n)=>H('Reação','Poder de intenção','Depois de ser ferido três vezes (5+ de dano cada), ativa RD 25, mas perde 5 PV no início de cada turno.');
module.exports={criaturas:[
C({n:'Arara-Vermelha',tipo:'animal',vd:10,t:'Pequeno',per:'2d20+5',ini:'2d20+5',def:12,fort:'1d20',ref:'2d20+5',von:'2d20',pv:8,at:'2 1 0 2 1',d:'3m (voo 9m)'},[
 H('Passiva','E do nada','Na primeira rodada, quem age depois dela na iniciativa fica desprevenido contra ela.'),
 A('Bicada','Corpo a corpo','2d20+5','1d6+2 perfuração'),
 A('Arranhão','Corpo a corpo ×2 (mesma ação)','2d20+5','1d4+2 corte')]),
C({n:'Arara-Devorada',e:'sangue',vd:80,t:'Médio',pp:'DT 20 · 3d8 mental · NEX 40%+ imune',per:'2d20+5',ini:'3d20+10',def:21,fort:'2d20+5',ref:'3d20+10',von:'2d20',pv:120,res:'Balístico, impacto e perfuração 5; Sangue 10',vul:'Morte',at:'3 2 0 2 2',d:'9m (voo 12m)'},[
 H('Passiva','E do nada','Na primeira rodada, quem age depois dela na iniciativa fica desprevenido contra ela.'),
 A('Bicada','Corpo a corpo','3d20+5','1d8+5 perfuração + 1d8 Sangue'),
 A('Garras','Corpo a corpo ×2 (mesma ação)','3d20+5','1d6+5 corte'),
 H('Livre','Agarrão','Ao acertar as garras, agarra com os braços extras (teste 3d20+7).'),
 H('Completa','Penas afiadas','Todos num raio de 9m (Reflexos DT 20 evita) rolam 1d6: 1–2, sangrando; 3–4, lento até recuperar PV; 5–6, fraco até o fim da cena ou até removerem o veneno.')]),
C({n:'Arara-Infernal',e:'sangue',vd:120,t:'Grande',pp:'DT 23 · 4d6 mental · NEX 50%+ imune',per:'2d20+5',ini:'4d20+10',def:26,fort:'3d20+10',ref:'4d20+10',von:'2d20+5',pv:220,res:'Balístico, impacto e perfuração 10; Sangue 20',vul:'Morte',at:'4 2 0 2 3',d:'12m (voo 15m)'},[
 H('Passiva','E do nada','Na primeira rodada, quem age depois dela na iniciativa fica desprevenido contra ela.'),
 A('Bicada','Corpo a corpo','4d20+10','1d10+10 perfuração + 1d10 Sangue'),
 A('Garras','Corpo a corpo ×4 (mesma ação)','4d20+10','1d8+10 corte'),
 H('Livre','Agarrão','Ao acertar as garras, agarra com os braços extras (teste 4d20+12).'),
 H('Movimento','Mastigar','Um agarrado sofre 6d10 de Sangue na boca do abdome (Fortitude DT 23 metade); quem fica morrendo é engolido e ela recupera 2d10 PV.'),
 H('Completa','Penas afiadas','Todos num raio de 9m (Reflexos DT 23 evita) perdem 2d6 PV e rolam 1d6: 1–2, sangrando; 3–4, lento até recuperar PV; 5–6, fraco até o fim da cena ou até removerem o veneno.')]),
C({n:'Jaguatirica',tipo:'animal',vd:10,t:'Pequeno',per:'1d20+5',ini:'2d20+5',def:13,fort:'1d20',ref:'2d20+5',von:'1d20',pv:16,at:'2 1 0 1 1',d:'12m'},[
 A('Mordida','Corpo a corpo','2d20+5','1d6+2 perfuração'),
 A('Arranhar','Corpo a corpo ×2 (mesma ação)','2d20+5','1d4+2 corte'),
 H('Movimento','Pulo do gato','Salta até um alvo em alcance curto; se agredir no mesmo turno, +1d4 de dano. Contra desprevenido, vira ação livre uma vez por rodada.')]),
C({n:'Felino-Devorado',e:'sangue',vd:80,t:'Médio',pp:'DT 20 · 3d8 mental · NEX 40%+ imune',per:'2d20+10',ini:'3d20+10',def:23,fort:'2d20+5',ref:'3d20+10',von:'2d20',pv:140,res:'Balístico, impacto e perfuração 5; Sangue 10',vul:'Morte',at:'3 2 0 2 2',d:'12m'},[
 H('Passiva','Camuflagem perversa','Sempre com camuflagem leve; uma vez por cena transforma um crítico sofrido em acerto comum; –2d20 para percebê-lo ou seguir seus rastros.'),
 A('Mordidas','Corpo a corpo ×2','3d20+10','1d8+5 perfuração + 1d8 Sangue'),
 A('Garras','Corpo a corpo ×2 (mesma ação)','3d20+10','1d6+5 corte'),
 H('Movimento','Pulo do felino','Salta até um alvo em alcance curto; se agredir no mesmo turno, +1d8 de dano. Contra desprevenido, ação livre uma vez por rodada.'),
 H('Padrão','Chicotada perfurante','A cauda fura e puxa um ser em alcance curto: 4d8 de Sangue, caído e movido para outro ponto em alcance curto (Reflexos DT 20 metade e evita o resto).')]),
C({n:'Felino-Infernal',e:'sangue',vd:120,t:'Grande',pp:'DT 23 · 4d6 mental · NEX 50%+ imune',per:'2d20+10',ini:'4d20+10',def:28,fort:'3d20+10',ref:'4d20+10',von:'2d20+5',pv:230,res:'Balístico, impacto e perfuração 10; Sangue 20',vul:'Morte',at:'4 2 0 2 3',d:'12m'},[
 H('Passiva','Camuflagem perversa','Sempre com camuflagem leve; uma vez por cena transforma um crítico sofrido em acerto comum; –2d20 para percebê-lo ou seguir seus rastros.'),
 A('Mordidas','Corpo a corpo ×2','4d20+10','2d8+5 perfuração + 2d8 Sangue'),
 A('Garras','Corpo a corpo ×2 (mesma ação)','4d20+10','2d6+5 corte'),
 H('Movimento','Pulo do felino','Salta até um alvo em alcance curto; se agredir no mesmo turno, +2d8 de dano. Contra desprevenido, ação livre uma vez por rodada.'),
 H('Padrão','Boca da loucura','Envolve a cabeça de um adjacente (Reflexos DT 23 evita): agarrado, 4d6 de Sangue e 4d6 mental agora e no início de cada turno do felino. Soltar: ação e Acrobacia, Atletismo ou Luta DT 23. Enquanto agarra, não morde.'),
 H('Padrão','Chicotada perfurante','Puxa um ser em alcance curto: 6d8 de Sangue, caído, sangrando e movido (Reflexos DT 23 metade e evita o resto).')]),
C({n:'Jonas Aguiar',tipo:'pessoa',e:'sangue',vd:80,t:'Médio',per:'1d20+5',ini:'2d20+5',def:21,fort:'2d20+5',ref:'2d20+5',von:'1d20+5',pv:80,at:'2 3 1 2 2',pe:'Atletismo 3d20+10; Adestramento, Crime, Enganação, Furtividade e Pilotagem 2d20+5; Investigação e Sobrevivência 1d20+5',d:'9m'},[
 A('Revólver','Distância ×2, alcance curto, crítico 19/×3','2d20+10','2d6+10 balístico'),
 A('Machado','Corpo a corpo ×2, crítico ×3','3d20+10','1d8+10 corte + 1d8 Sangue e sangrando'),
 H('Reação','Revidar','Uma vez por rodada, quando um ataque contra ele erra, ataca o atacante corpo a corpo.'),
 H('Livre','Golpe cruel','Uma vez por rodada, +5 no ataque e no dano.'),
 H('Padrão','Predador de Sangue','Memoriza o odor de uma vítima (precisa de algo com o cheiro): +1d20 para rastreá-la, percebê-la e atacá-la. Uma por vez.'),
 PODER_INT(),INT_ON('Mutilador Noturno')]),
C({n:'Mutilador Noturno',tipo:'pessoa',e:'sangue',vd:140,t:'Médio',per:'1d20+10',ini:'2d20+10',def:31,fort:'2d20+10',ref:'2d20+10',von:'1d20+10',pv:100,at:'2 3 1 2 2',pe:'Atletismo 3d20+15; Adestramento, Crime, Enganação, Furtividade e Pilotagem 2d20+10; Investigação e Sobrevivência 1d20+10',d:'9m'},[
 H('Passiva','Predador perfeito','Uma ação padrão adicional por rodada.'),
 A('Machado','Corpo a corpo ×2, crítico ×3','3d20+15','1d8+20 corte + 2d8 Sangue e sangrando'),
 A('Revólver','Distância ×2, alcance curto, crítico 19/×3','2d20+15','3d6+20 balístico'),
 H('Reação','Revidar violento','Duas vezes por rodada, quando um ataque corpo a corpo contra ele erra, ataca o atacante.'),
 H('Livre','Golpe mutilador','Uma vez por rodada, +5 no ataque e +10 no dano.'),
 H('Padrão','Predador sanguinário','Memoriza o odor de uma vítima: +1d20 para rastreá-la, percebê-la e atacá-la.'),
 PODER_INT(),INT_OFF('Jonas Aguiar')]),
C({n:'Dalmo Magno',tipo:'pessoa',e:'energia',vd:80,t:'Médio',per:'1d20+5',ini:'1d20+5',def:23,fort:'3d20+10',ref:'1d20+5',von:'1d20+5',pv:90,at:'1 4 1 1 3',pe:'Atletismo 4d20+10, Intimidação 1d20+10, Pilotagem 1d20+10',d:'9m'},[
 H('Passiva','Lutador de arena','+5 em manobras de combate, inclusive para resistir.'),
 A('Pancada','Corpo a corpo ×2','4d20+10','2d6+10 impacto + 1d10 Energia'),
 H('Reação','Corpo fechado','Uma vez por rodada, ao sofrer dano, RD 10 contra ele.'),
 H('Reação','Pressão atmosférica','Uma vez por rodada, ao acertar corpo a corpo um alvo agarrado: +1d10 de Energia e atordoado 1 rodada (Fortitude DT 20 evita; uma vez por cena por ser).'),
 H('Livre','Golpes de arena','Uma vez por rodada, ao acertar corpo a corpo, faz uma pancada extra ou uma manobra contra o mesmo alvo.'),
 INT_ON('Colosso')]),
C({n:'Colosso',tipo:'pessoa',e:'energia',vd:140,t:'Médio',per:'1d20+10',ini:'1d20+10',def:33,fort:'3d20+15',ref:'1d20+10',von:'1d20+10',pv:110,res:'Dano 10',at:'1 4 1 1 3',pe:'Atletismo 4d20+15, Intimidação 1d20+15, Pilotagem 1d20+15',d:'9m'},[
 H('Passiva','Campeão de arena','+10 em manobras de combate, inclusive para resistir, e RD 10.'),
 A('Pancada','Corpo a corpo ×2','4d20+15','4d6+20 impacto'),
 H('Reação','Campo de pressão','Duas vezes por rodada, ao sofrer dano, RD 15 contra ele.'),
 H('Reação','Implosão atmosférica','Uma vez por rodada, ao acertar corpo a corpo um alvo agarrado: +1d10 de Energia, atordoado 1 rodada (Fortitude DT 24 evita), caído e sangrando. Atordoa cada ser uma vez por cena.'),
 H('Livre','Golpes de jaula','Uma vez por rodada, ao acertar corpo a corpo, faz uma pancada extra ou manobra contra o mesmo alvo; acertando, +1d10 de impacto.'),
 INT_OFF('Dalmo Magno')]),
C({n:'Park Jae-Yoon',tipo:'pessoa',e:'conhecimento',vd:80,t:'Médio',per:'1d20+5',ini:'3d20+10',def:22,fort:'1d20+5',ref:'3d20+10',von:'1d20+5',pv:70,at:'3 2 3 1 1',pe:'Crime, Furtividade e Investigação 3d20+10; Acrobacia e Tecnologia 3d20+5; Atletismo 2d20+5; Enganação 1d20+10',d:'9m'},[
 A('Punhal','Corpo a corpo ×2, crítico 19','3d20+10','2d4+10 perfuração + 1d6 Conhecimento'),
 H('Reação','Esquiva tática','Uma vez por rodada, ao sofrer um ataque, +10 na Defesa.'),
 H('Reação','Perito','Uma vez por rodada, +1d8 num teste de perícia treinada.'),
 H('Livre','Assassinato furtivo','Uma vez por rodada, +3d8 contra alvo desprevenido ou flanqueado.'),
 H('Livre','Punhal X','Uma vez por rodada, ao atacar, deixa o alvo desprevenido; ferindo, ele fica cego 1 rodada (uma vez por cena por alvo).'),
 H('Completa','Zona dos sussurros','Marca um cômodo com “X”: lá dentro, +5 no ataque e sem penalidade de Furtividade por ações chamativas. Até três áreas.'),
 H('Reação','Poder de intenção','Prova o sangue de alguém adjacente machucado: até o fim da cena, +1d8 de dano e +2 na margem; num crítico, corta um “X” na boca do alvo, que não fala nem usa poderes ou rituais por 1d4 rodadas.'),
 INT_ON('X')]),
C({n:'X',tipo:'pessoa',e:'conhecimento',vd:140,t:'Médio',per:'1d20+10',ini:'3d20+15',def:32,fort:'1d20+10',ref:'3d20+15',von:'1d20+10',pv:90,at:'3 2 3 1 1',pe:'Crime, Furtividade e Investigação 3d20+15; Acrobacia e Tecnologia 3d20+10; Atletismo 2d20+10; Enganação 1d20+15',d:'9m'},[
 A('Punhal','Corpo a corpo ×2, crítico 19','3d20+15','4d4+20 perfuração + 2d6 Conhecimento'),
 H('Reação','Analítico','Uma vez por rodada, +1d12 num teste de perícia treinada.'),
 H('Reação','Esquiva sombria','Duas vezes por rodada, ao sofrer um ataque, +10 na Defesa.'),
 H('Livre','Assassinato cruel','Uma vez por rodada, +6d8 contra alvo desprevenido ou flanqueado.'),
 H('Livre','Punhal X','Uma vez por rodada, deixa o alvo desprevenido; ferindo, ele fica cego 2 rodadas (uma vez por cena por alvo).'),
 H('Completa','Zona das sombras','Como a Zona dos Sussurros (+5 no ataque, sem penalidade de Furtividade, até três áreas); lá dentro, no Assassinato Cruel rola de novo os 7 e 8 e soma.'),
 H('Reação','Poder de intenção','Prova o sangue de alguém adjacente machucado: até o fim da cena, +1d8 de dano e +2 na margem; num crítico, silencia o alvo (sem falar, poderes ou rituais) por 1d4 rodadas.'),
 INT_OFF('Park Jae-Yoon')]),
C({n:'Kemi',tipo:'pessoa',e:'morte',vd:80,t:'Médio',per:'2d20+5',ini:'3d20+10',def:23,fort:'1d20+5',ref:'3d20+10',von:'2d20+5',pv:60,at:'3 1 3 2 1',d:'9m'},[
 H('Passiva','Sniper da morte','Quem cai a 0 PV pelo fuzil dela morre ao iniciar 2 turnos morrendo (em vez de 3).'),
 A('Facada','Corpo a corpo ×2, crítico 19','3d20+10','2d4+10 perfuração'),
 A('Fuzil de precisão','Distância, alcance longo, crítico 17/×3','3d20+10','2d10+20 balístico + 2d4 Morte'),
 H('Reação','Esquiva tática','Uma vez por rodada, ao sofrer um ataque, +10 na Defesa.'),
 H('Reação','Perito','Uma vez por rodada, +1d8 num teste de perícia treinada.'),
 H('Livre','Disparo da morte','Uma vez por rodada, com arma de fogo, +2 na margem de ameaça.'),
 H('Reação','Poder de intenção','Uma vez por rodada, quando ouve o grito de morte de alguém que tentou proteger, ataca quem deixou o aliado morrendo (ou quem a deixou morrendo).'),
 INT_ON('Fantasma')]),
C({n:'Fantasma',tipo:'pessoa',e:'morte',vd:140,t:'Médio',per:'2d20+10',ini:'3d20+15',def:33,fort:'1d20+10',ref:'3d20+15',von:'2d20+10',pv:80,at:'3 1 3 2 1',pe:'Acrobacia, Crime, Furtividade e Investigação 3d20+15; Medicina e Ocultismo 3d20+10; Sobrevivência 2d20+10; Atletismo 1d20+10',d:'9m'},[
 H('Passiva','Sniper da morte','Quem cai a 0 PV pelo fuzil dela morre ao iniciar 2 turnos morrendo.'),
 A('Facada','Corpo a corpo ×2, crítico 19','3d20+15','4d4+20 perfuração'),
 A('Fuzil de precisão','Distância, alcance longo, crítico 17/×3','3d20+15','4d10+40 balístico + 4d4 Morte'),
 H('Reação','Analítica','Uma vez por rodada, +1d12 num teste de perícia treinada.'),
 H('Reação','Esquiva fantasma','Duas vezes por rodada, ao sofrer um ataque, +10 na Defesa.'),
 H('Livre','Disparo espiral','Uma vez por rodada, com arma de fogo, +2 na margem, ignora cobertura leve e 10 de RD.'),
 H('Reação','Poder de intenção','Uma vez por rodada, quando ouve o grito de morte de alguém que tentou proteger, ataca quem o deixou morrendo.'),
 INT_OFF('Kemi')]),
C({n:'Labirinto',tipo:'pessoa',e:'conhecimento',vd:80,t:'Médio',per:'3d20+5',ini:'1d20+5',def:20,fort:'1d20+5',ref:'1d20+5',von:'3d20+10',pv:80,at:'1 0 3 3 1',pe:'Ocultismo 3d20+15; Ciências, Investigação, Medicina e Tecnologia 3d20+10; Intuição e Sobrevivência 3d20+5',d:'9m'},[
 H('Passiva','Rituais (DT 20, até 10 PE, sem custo)','Capturar Momento; Labirinto Mental; Mapa Sanguíneo; Rajada Caótica.'),
 H('Passiva','Antena do medo','Pode conjurar um ritual “guardado” na antena e liberá-lo depois com uma ação padrão, sem custo. Um por vez.'),
 A('Pancada com antena','Corpo a corpo ×2','–2d20+5','1d8+10 impacto'),
 H('Padrão','Poder de intenção','Depois de testemunhar uma morte, absorve as intenções do morto em alcance curto e cura um ser em alcance curto em metade dos PV máximos do cadáver.'),
 INT_ON('???')]),
C({n:'??? (Labirinto desperto)',tipo:'pessoa',e:'conhecimento',vd:140,t:'Médio',per:'3d20+10',ini:'1d20+10',def:30,fort:'1d20+10',ref:'1d20+10',von:'3d20+15',pv:100,at:'1 1 3 3 1',pe:'Ocultismo 3d20+20; Ciências, Investigação, Medicina e Tecnologia 3d20+15; Intuição e Sobrevivência 3d20+10',d:'9m'},[
 H('Passiva','Rituais (DT 25, até 10 PE, sem custo)','Consumir Momento (símbolo de Morte que vê e ouve em alcance médio, até três; pode explodir: 8d8 de Morte, Fortitude metade); Labirinto Abissal (alvo se move ao acaso até o fim da cena, Vontade a cada turno); Revelação Sanguínea (mapa de 1 km com a saúde dos seres); Tempestade Caótica (raio de 8d10 de Energia, Reflexos metade, repetível com ação padrão na cena).'),
 H('Passiva','Antena do medo','Guarda um ritual na antena e o libera depois com ação padrão, sem custo. Um por vez.'),
 A('Pancada com antena','Corpo a corpo ×2','1d20+10','2d8+20 impacto'),
 H('Padrão','Poder de intenção','Depois de testemunhar uma morte, cura um ser em alcance curto em metade dos PV máximos do cadáver.'),
 INT_OFF('Labirinto')]),
C({n:'Jasper',tipo:'pessoa',vd:80,t:'Médio',per:'2d20',ini:'3d20+5',def:23,fort:'2d20+5',ref:'3d20+10',von:'2d20',pv:80,at:'3 3 1 1 2',pe:'Atletismo 3d20+10, Religião 1d20+5',d:'9m'},[
 H('Passiva','Correntes acopladas','As foices presas por correntes não podem ser desarmadas, alcançam 4,5m e dão +5 em manobras.'),
 A('Foices acorrentadas','Corpo a corpo (4,5m) ×2, crítico 19','3d20+10','3d4+10 corte'),
 A('Foices acopladas','Corpo a corpo, crítico ×4','3d20+10','6d4+10 corte'),
 H('Livre','Puxar pra briga','Ao acertar as foices acorrentadas, puxa o alvo para o lado dele; se o alvo se afastar, –1d20 em ataques contra outros por 1 rodada.'),
 H('Movimento','Acoplar foices','Une as foices numa arma só.'),
 H('Completa','Ceifar','Com as foices acopladas, um teste de ataque contra todos os adjacentes escolhidos: +4d4 de corte e sangrando.')]),
C({n:'Lena Viegas',tipo:'pessoa',vd:80,t:'Médio',per:'3d20',ini:'2d20+5',def:22,fort:'1d20',ref:'2d20+5',von:'3d20+10',pv:60,at:'2 1 3 3 1',pe:'Ocultismo 3d20+10, Diplomacia 3d20+5, Investigação 3d20+5',d:'9m'},[
 H('Passiva','Rituais (DT 20, até 6 PE, sem custo)','Cicatrização (discente); Eletrocussão (discente); Esconder dos Olhos; Flagelo de Sangue.'),
 H('Passiva','Catalisador sofisticado','Ao conjurar, pode somar +1d6 ao dano, à cura ou à DT do ritual.'),
 A('Pistola','Distância ×2, alcance curto, crítico 18','2d20+10','1d12+10 balístico')]),
C({n:'Maria (Maria Helena Rodrigues)',tipo:'pessoa',vd:80,t:'Médio',per:'2d20+5',ini:'3d20+5',def:21,fort:'1d20+5',ref:'3d20+10',von:'2d20+5',pv:60,at:'3 1 3 2 1',pe:'Enganação 2d20+10, Medicina 3d20+5, Ocultismo 3d20+5',d:'9m'},[
 H('Passiva','Rituais (DT 20, até 6 PE, sem custo)','Hemofagia.'),
 H('Passiva','Fim precoce','Ao causar a morte de alguém, +1d20 em todos os testes até o fim da cena.'),
 A('Pistola','Distância ×2, alcance curto, crítico 18','2d20+10','1d12+10 balístico'),
 H('Padrão','Tratamento de emergência','Dá 2d10+10 PV temporários a um ser em alcance de toque; quando acabam, ele fica fraco até o fim da cena. Uma vez por cena por alvo.')]),
C({n:'Remi',tipo:'pessoa',vd:80,t:'Médio',per:'2d20+5',ini:'3d20+5',def:21,fort:'2d20',ref:'2d20+5',von:'2d20+10',pv:80,at:'2 1 3 2 2',pe:'Artes 2d20+10, Ocultismo 3d20+5',d:'9m'},[
 H('Passiva','Rituais (DT 20, até 6 PE, sem custo)','Amaldiçoar Arma (discente); Desfazer Sinapses (discente); Distorcer Aparência.'),
 A('Espada enferrujada','Corpo a corpo ×2, crítico 19','3d20+10','2d8+10 corte'),
 H('Movimento','Dedilhar harpa','Até o início do próximo turno, a espada ganha um efeito: +5 no ataque, +5 de dano, +2 na margem ou alcance corpo a corpo de 9m.')]),
C({n:'Tuco Belez',tipo:'pessoa',vd:80,t:'Médio',per:'1d20+5',ini:'1d20+10',def:24,fort:'3d20+5',ref:'1d20+10',von:'2d20+5',pv:90,at:'1 3 1 2 3',pe:'Atletismo 3d20+10, Furtividade 1d20+10',d:'9m'},[
 H('Passiva','Aí sim, neném','+1d20 no ataque contra alvos que não estão engajados em combate.'),
 A('Porrada','Corpo a corpo ×2, crítico 19','3d20+10','2d6+10 impacto'),
 A('Pistola','Distância ×2, alcance curto, crítico 18','1d20+10','1d12+10 balístico'),
 H('Livre','Imobilização militar','Uma vez por rodada, ao acertar a porrada, tenta agarrar (teste 3d20+12).'),
 H('Movimento','Movimentação tática','Indo para uma cobertura ou um inimigo, anda o dobro.'),
 H('Completa','Marteladas','Um adjacente sofre 6d6+20 de impacto (Fortitude DT 20 metade).')]),
C({n:'Juan Davo',tipo:'pessoa',e:'sangue',vd:80,t:'Médio',per:'3d20+5',ini:'3d20+10',def:20,fort:'1d20+5',ref:'2d20+10',von:'3d20+10',pv:70,at:'2 2 2 3 1',pe:'Intimidação 3d20+10, Ocultismo 2d20+10, Enganação 3d20+5, Atletismo 2d20+5',d:'9m'},[
 H('Passiva','Rituais (DT 20, até 10 PE, sem custo)','Descarnar (discente); Perturbação (discente); Vínculo de Sangue.'),
 A('Facada','Corpo a corpo ×2, crítico 19','2d20+10','2d4+10 perfuração + 2d10 Sangue'),
 H('Reação','Faca predadora','Uma vez por rodada, ao acertar, recupera 2d10 PV (o excesso vira PV temporário).'),
 H('Reação','Poder de intenção','Se obedeceu à vontade d’Ele na cena, uma vez por cena transforma um teste em sucesso automático (como 20 natural).'),
 H('Padrão','Armadura de Sangue Diabólica','Assume a forma diabólica: passa a usar a ficha de Juan Diabólico.')]),
C({n:'Juan Diabólico',tipo:'pessoa',e:'sangue',vd:140,t:'Médio',per:'3d20+10',ini:'3d20+15',def:30,fort:'1d20+10',ref:'2d20+15',von:'3d20+15',pv:90,at:'2 2 2 3 1',pe:'Intimidação 3d20+15, Ocultismo 2d20+15, Enganação 3d20+10, Atletismo 2d20+10',d:'9m'},[
 H('Passiva','Rituais diabólicos (DT 25, sem custo)','Descarnar diabólico (alcance curto, 12d8 e hemorragia de 5d8); Perturbação diabólica (alcance médio, “Sofra” causa 5d8); Vínculo de Sangue diabólico.'),
 A('Facada','Corpo a corpo ×2, crítico 19','2d20+15','4d4+20 perfuração + 4d10 Sangue'),
 H('Reação','Faca predadora','Uma vez por rodada, ao acertar, recupera 4d10 PV (o excesso vira PV temporário).'),
 H('Reação','Poder de intenção','Se obedeceu à vontade d’Ele na cena, uma vez por cena transforma um teste em sucesso automático.'),
 H('Padrão','Abandonar a forma','Volta à ficha de Juan Davo e não pode voltar a esta forma até dormir.')]),
]};
