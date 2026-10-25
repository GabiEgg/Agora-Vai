// NPCs do Arquivos Secretos #09 (Hell Hunters), resumidos com nossas palavras.
const {C,A,H}=require('./cri_util');
const TATICO=H('Passiva','Treinamento tático','+5 em ataque, resistências, dano e Defesa (já somado) e faz duas ações agredir pelo custo de uma ação padrão.');
const LUTA=H('Livre','Luta tática','Uma vez por rodada, faz uma manobra de combate como ação livre.');
const GRANADA=(dt)=>H('Padrão','Fragmentação','Uma vez por cena, granada em alcance curto: 8d6 de perfuração num raio de 6m (Reflexos DT '+dt+' metade).');
module.exports={criaturas:[
C({n:'Jason Bloom',tipo:'pessoa',vd:140,t:'Médio',per:'2d20',ini:'2d20+5',def:30,fort:'3d20+15',ref:'2d20+10',von:'2d20+5',pv:200,at:'2 3 1 2 3',pe:'Atletismo 3d20+10, Pilotagem 2d20+10, Intimidação 2d20+5, Tática 1d20+5',d:'9m'},[
 TATICO,
 A('Escudada','Corpo a corpo','3d20+20','2d8+15 impacto'),
 A('Pistola modificada','Distância, alcance curto, crítico 16','2d20+20','2d10+17 balístico'),
 H('Reação','Proteger','Uma vez por rodada, puxa para si um dano ou efeito negativo dirigido a um aliado adjacente.'),
 LUTA,
 H('Padrão','Atrás de mim!','Até o próximo turno dele, aliados adjacentes têm RD 10 e cobertura (+5 Defesa) atrás dele.'),
 H('Completa','Empurrar e atirar','Avança com o escudo empurrando um adjacente pelo deslocamento dele e atirando: 4d12+24 balístico (Fortitude ou Reflexos DT 22 metade e evita o empurrão).')]),
C({n:'Karen Brown',tipo:'pessoa',vd:160,t:'Médio',per:'3d20+15',ini:'4d20+10',def:33,fort:'2d20+10',ref:'4d20+15',von:'3d20+15',pv:240,at:'4 2 2 3 2',pe:'Acrobacia, Furtividade e Pilotagem 4d20+10; Intimidação 3d20+15; Atletismo e Tática 2d20+10',d:'9m'},[
 TATICO,
 A('Pistola modificada','Distância, alcance curto, crítico 14','4d20+20','2d12+17 balístico'),
 A('Fuzil de precisão modificado','Distância, alcance longo, crítico 15/×3','4d20+20','3d12+17 balístico'),
 LUTA,
 H('Movimento','Buscar cobertura','Com cobertura à vista, anda o dobro na direção dela.'),
 H('Completa','Fogo de supressão','Cobre um cone (alcance da arma) e atira como reação em quem fizer algo, até 4 tiros (um por alvo). Acertando ou não, o alvo faz Vontade DT 25 (30 se atingido) ou perde a ação. Dura até o próximo turno dela.')]),
C({n:'Troy Walker',tipo:'pessoa',vd:140,t:'Médio',per:'2d20',ini:'2d20+5',def:29,fort:'3d20+15',ref:'2d20+10',von:'2d20+5',pv:180,at:'2 3 1 2 3',pe:'Atletismo 3d20+10, Intimidação e Pilotagem 2d20+10, Tática 1d20+5',d:'9m'},[
 TATICO,
 H('Passiva','Adrenalina de pancadaria','Com 135 a 90 PV: RD 5 e +5 de dano. 90 a 45: RD 10 e +10. 45 a 0: RD 15 e +15.'),
 H('Passiva','Pé na porta','+4d8 de dano contra objetos.'),
 A('Coronhada','Corpo a corpo','3d20+20','3d6+15 impacto'),
 A('Espingarda modificada','Distância, alcance curto, crítico 18/×3','2d20+20','4d6+17 balístico'),
 H('Reação','Revidar','Uma vez por rodada, contra um ataque corpo a corpo, faz um teste de ataque oposto; vencendo, evita e causa seu dano corpo a corpo no atacante.'),
 LUTA,
 H('Padrão','Pra cima deles!','Um ataque ousado: acertando, dano máximo; errando, –10 na Defesa por 1 rodada.')]),
C({n:'Roy Stevens',tipo:'pessoa',vd:160,t:'Médio',per:'4d20+10',ini:'2d20+10',def:32,fort:'3d20+15',ref:'2d20+10',von:'4d20+15',pv:250,at:'2 3 3 4 3',pe:'Medicina 3d20+15; Diplomacia e Intimidação 4d20+10; Tática 3d20+10; Atletismo e Pilotagem 2d20+10',d:'9m'},[
 TATICO,
 A('Pistola modificada','Distância, alcance curto, crítico 14','2d20+20','2d8+17 balístico'),
 A('Submetralhadora modificada','Distância, alcance curto, crítico 17/×3','2d20+20','3d6+17 balístico'),
 LUTA,
 H('Movimento','Ao resgate','Com um aliado ferido à vista, anda o dobro até ele.'),
 H('Padrão','Prestar socorro','Cura 3d10 PV ou remove uma condição negativa (exceto morrendo) de si ou de um aliado adjacente.')]),
C({n:'Stella Green',tipo:'pessoa',vd:140,t:'Médio',per:'2d20+5',ini:'3d20+10',def:29,fort:'2d20+5',ref:'3d20+15',von:'2d20+10',pv:190,at:'3 2 3 2 2',pe:'Pilotagem e Profissão (engenheira mecânica) 3d20+15; Atletismo e Intimidação 2d20+10; Tática 3d20+5',d:'9m'},[
 TATICO,
 H('Passiva','Por água, céu e terra','Pilota qualquer veículo humano, exceto os muito exóticos.'),
 A('Pistola modificada','Distância, alcance curto, crítico 16','3d20+20','2d10+17 balístico'),
 A('Fuzil de assalto modificado','Distância, alcance médio, crítico 17/×3','3d20+20','2d12+17 balístico'),
 H('Reação','Direção defensiva','Uma vez por rodada, +1d20+5 num teste para proteger o veículo ou os ocupantes.'),
 H('Livre','Direção ofensiva','Uma vez por rodada, +1d20+5 num teste para atacar algo com o veículo.'),
 LUTA,
 H('Padrão','Conserto de campo','Faz um objeto danificado adjacente funcionar até o fim da cena (uma vez por objeto).')]),
C({n:'Arnold Strolley',tipo:'pessoa',vd:140,t:'Médio',per:'2d20+5',ini:'2d20',def:30,fort:'3d20+15',ref:'2d20+5',von:'2d20+10',pv:200,res:'Eletricidade, fogo, frio e químico 5',at:'2 2 4 2 3',pe:'Profissão (engenheiro químico) 4d20+15, Tática 4d20+10; Atletismo, Intimidação e Pilotagem 2d20+10',d:'9m'},[
 TATICO,
 A('Pistola modificada','Distância, alcance curto, crítico 16','2d20+20','2d10+17 balístico'),
 A('Metralhadora modificada','Distância, alcance médio, crítico 17/×3','2d20+20','3d12+17 balístico'),
 LUTA,
 H('Padrão','Granadas (uma de cada por cena)','Raio de 6m em alcance curto. Flashbang: atordoado 1 rodada (Fortitude DT 23 reduz a ofuscado e surdo). Fragmentação: 8d6 de perfuração (Reflexos DT 23 metade). Lacrimogêneo: 4d6 químico, enjoado e asfixiado, que continua 1d4 rodadas fora da área (Fortitude DT 23 metade e evita o enjoo). Incendiária: 6d6 de fogo e em chamas (Reflexos DT 23 metade e evita).')]),
C({n:'Chloe Grey',tipo:'pessoa',e:'morte',vd:140,t:'Médio',per:'3d20+5',ini:'3d20+10',def:29,fort:'2d20+5',ref:'3d20+15',von:'3d20+10',pv:170,at:'3 2 3 3 2',pe:'Investigação 3d20+15; Diplomacia, Enganação, Furtividade, Intuição, Pilotagem e Tática 3d20+10; Atletismo 2d20+10',d:'9m'},[
 TATICO,
 H('Passiva','Braço amputado','–1d20 quando a falta do braço atrapalha, exceto em ataques e resistências.'),
 H('Passiva','Tocada pela Morte','Conjura Nuvem de Cinzas sem custo (até 6 PE), DT 21.'),
 A('Combate desarmado','Corpo a corpo','3d20+20','2d6+15 impacto'),
 A('Pistola modificada','Distância, alcance curto, crítico 16','3d20+20','2d10+17 balístico'),
 H('Reação','Olhos para documentos','Uma vez por rodada, ao procurar pistas em documentos, rola duas vezes e fica com o melhor.'),
 LUTA]),
C({n:'Ryder Staten',tipo:'pessoa',vd:200,t:'Médio',per:'2d20+10',ini:'4d20+10',def:34,fort:'3d20+15',ref:'4d20+15',von:'2d20+10',pv:320,at:'4 3 2 2 3',pe:'Atletismo 3d20+15; Intimidação e Tática 2d20+15; Furtividade e Pilotagem 4d20+10; Intuição 2d20+10',d:'9m'},[
 A('Pistola modificada','Distância, alcance curto, crítico 14','4d20+25','2d10+22 balístico'),
 A('Fuzil de assalto modificado','Distância, alcance médio, crítico 17/×3','4d20+25','3d10+22 balístico'),
 H('Reação','Cuidado!','Uma vez por rodada, quando um aliado em alcance médio falha, Ryder faz o mesmo teste; passando, troca a falha por sucesso.'),
 LUTA,
 H('Movimento','Formação!','Até o próximo turno dele, ele e aliados em alcance médio que ouvem: Cunha (+5 ataque e Defesa), Coluna (+3m e +5 Furtividade) ou Linha (+5 ataque e dano).'),
 GRANADA(23),
 H('Padrão','Vai, vai, vai!','Ele e aliados em alcance médio podem se mover 9m na direção que ele apontar.')]),
]};
