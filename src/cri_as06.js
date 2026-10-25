// NPCs e criaturas do Arquivos Secretos #06 (Indústrias Panacea), resumidos com nossas palavras.
const {C,A,H}=require('./cri_util');
module.exports={criaturas:[
C({n:'Alice Cruzes',tipo:'pessoa',vd:40,t:'Médio',per:'2d20+5',ini:'2d20',def:18,fort:'1d20',ref:'2d20+5',von:'2d20+10',pv:30,at:'2 1 4 2 1',pe:'Tática 4d20+10, Medicina 4d20+5, Diplomacia e Enganação 2d20+10, Intimidação e Intuição 2d20+5',d:'9m'},[
 H('Passiva','Diretora','Nunca se expõe; anda sempre com dois seguranças da Panacea.'),
 A('Pistola','Distância, alcance curto, crítico 18','2d20+5','1d12+5 balístico'),
 H('Reação','Reencontro','Ao chegar a 0 PV, detona um explosivo que carrega: 8d6 de perfuração num raio de 6m (Reflexos DT 15 metade).'),
 H('Movimento','Coordenar equipe','Um aliado em alcance curto que siga as instruções no turno dele recebe +5 no teste resultante.'),
 H('Padrão','Recursos humanos','Detona o explosivo implantado num segurança aliado em alcance longo: ele morre e todos num raio de 6m sofrem 6d6 de perfuração (Reflexos DT 15 metade).')]),
C({n:'Ketan Arjuna',tipo:'pessoa',vd:100,t:'Médio',per:'2d20+5',ini:'4d20+10',def:20,fort:'1d20+5',ref:'4d20+10',von:'2d20+5',pv:90,at:'4 3 2 2 1',pe:'Atletismo 3d20+10; Intimidação, Tática e Tecnologia 2d20+10',d:'9m'},[
 H('Passiva','Armado e preparado','Uma ação padrão extra por rodada; ataques com arma causam +1 dado de dano.'),
 H('Passiva','Prótese robótica','Pode ser atacada à parte (Defesa 25, RD 5, 45 PV). Destruída, ele perde a ação extra, Punho de Aço, Reparo na Hora, Atirar e Fatiar e Defesa Improvisada.'),
 A('Revólver','Distância, alcance curto, crítico ×3','4d20+10','3d6+10 balístico'),
 A('Machadinha','Corpo a corpo, crítico ×3','3d20+10','2d6+10 corte'),
 A('Punhalada','Corpo a corpo, crítico ×3','3d20+10','2d4+10 perfuração'),
 A('Punho de aço','Corpo a corpo, crítico 18','3d20+10','2d10+10 impacto + 2d4 eletricidade'),
 H('Reação','Atirar e fatiar','Acertando corpo a corpo um alvo que já atingiu à distância na rodada, +1 dado de dano.'),
 H('Reação','Coice','Ao usar o Punho de Aço, a prótese sofre metade do dano causado.'),
 H('Reação','Defesa improvisada','Uma vez por rodada, a prótese recebe todo o dano de um ataque no lugar dele; se ela quebrar assim, ele sofre 2d10 de eletricidade.'),
 H('Padrão','Reparo na hora','A prótese recupera 10 PV.')]),
C({n:'Laila Verdante',tipo:'pessoa',vd:80,t:'Médio',per:'4d20+10',ini:'2d20+5',def:19,fort:'1d20',ref:'2d20+5',von:'4d20+10',pv:70,at:'2 1 3 4 1',pe:'Enganação e Intuição 4d20+10; Ocultismo e Tecnologia 3d20+10; Furtividade 2d20+10',d:'9m'},[
 H('Passiva','Rituais (DT 22, sem custo)','Aurora da Verdade; Enfeitiçar (discente); Hesitação Forçada (discente); Invadir Mente.'),
 H('Passiva','Arruinar mentes','Quem está com alguma condição mental é vulnerável ao dano de Conhecimento dos rituais dela.'),
 A('Arremesso de agulha','Distância ×2, alcance curto','2d20+10','1d4+5 perfuração'),
 H('Reação','Sedar','Quem é atingido pela agulha fica esmorecido até o fim da cena (Fortitude DT 22 muda para frustrado).')]),
C({n:'Dr. Neruda',tipo:'pessoa',vd:20,t:'Médio',per:'2d20+5',ini:'2d20+5',def:14,fort:'1d20',ref:'2d20+5',von:'2d20+5',pv:15,at:'2 0 3 2 1',pe:'Ciências, Medicina e Tecnologia 3d20+10; Intuição 2d20+5',d:'9m'},[
 H('Passiva','Veneno sádico','Em alvos machucados, o veneno também causa 1d4 de dano mental, ignorando RD.'),
 A('Seringa','Corpo a corpo','2d20+5','1d4+5 perfuração'),
 H('Reação','Veneno na seringa','Quem é atingido pela seringa perde 2d4 PV por rodada por 3 rodadas (Fortitude DT 15 reduz a 1 rodada). Ele leva o antídoto e pode ser convencido a entregá-lo.'),
 H('Padrão','Dose experimental','Frasco em alcance curto: todos num raio de 6m ficam enjoados 1 rodada e fracos até o fim da cena (Fortitude DT 15 evita; enjoado uma vez por cena por alvo).')]),
C({n:'Cientista da Panacea',tipo:'pessoa',vd:40,t:'Médio',per:'1d20+5',ini:'2d20+5',def:16,fort:'1d20+5',ref:'2d20+5',von:'1d20+5',pv:20,res:'Perfuração e químico 10',at:'2 1 4 1 1',pe:'Ciências 4d20+10; Investigação, Medicina, Sobrevivência e Tecnologia 4d20+5',d:'9m'},[
 H('Passiva','Seringas com venenos','Escolha um veneno com DT até 25; acertar Injetar envenena o alvo.'),
 H('Passiva','Submissão','Com um manda-chuva da Panacea na cena, +5 nos testes.'),
 H('Passiva','Traje de proteção','Hazmat: +10 em resistências contra efeitos ambientais e infecções e RD 10 contra perfuração e químico.'),
 A('Pancada','Corpo a corpo','1d20+5','1d4+5 impacto'),
 A('Injetar','Corpo a corpo','1d20+5','veneno escolhido')]),
C({n:'Manda-Chuva da Panacea',tipo:'pessoa',vd:120,t:'Médio',per:'3d20+10',ini:'2d20',def:23,fort:'3d20+5',ref:'2d20',von:'3d20+10',pv:120,at:'2 1 3 3 3',pe:'Diplomacia, Enganação, Intimidação e Intuição 3d20+10; Atualidades e Ocultismo 3d20+5',d:'9m'},[
 H('Passiva','Negociador','Em testes de Presença rola de novo e fica com o melhor.'),
 H('Passiva','Objeto de pesquisa','Carrega e sabe usar um item amaldiçoado definido pelo mestre.'),
 A('Pancada','Corpo a corpo','1d20+10','1d6+5 impacto'),
 A('Pistola','Distância ×2, alcance curto, crítico 18','2d20+10','2d12+10 balístico'),
 H('Reação','Sou mais importante','Uma vez por rodada, desvia um efeito negativo para um subalterno em alcance médio.'),
 H('Padrão','Chamar reforços','Uma vez por cena, 1d4+1 seguranças da Panacea chegam e agem logo depois dele.')]),
C({n:'Segurança da Panacea',tipo:'pessoa',vd:80,t:'Médio',per:'2d20',ini:'3d20+10',def:21,fort:'2d20+5',ref:'3d20+5',von:'2d20+5',pv:80,res:'Dano 5',at:'3 3 1 2 2',pe:'Atletismo 3d20+10, Intimidação 2d20+5',d:'9m'},[
 H('Passiva','Munição não letal','Usa balas de borracha ou dardos tranquilizantes, a menos que mandem atirar para matar.'),
 H('Passiva','Traje de campo','RD 5 e máscara de gás (+10 em Fortitude contra efeitos de respiração).'),
 A('Pancada','Corpo a corpo ×2','3d20+10','2d6+10 impacto'),
 A('Pistola','Distância ×2, alcance curto, crítico 18','3d20+10','1d12+10 balístico'),
 A('Submetralhadora','Distância ×2, alcance curto, crítico 19/×3','3d20+10','3d6+10 balístico'),
 H('Livre','Agarrar','Ao acertar a pancada, pode agarrar (teste 3d20+10).'),
 H('Movimento','Derrubar e imobilizar','Agarrando, tenta derrubar (3d20+10); com o alvo caído e agarrado, tenta imobilizá-lo (paralisado até ser solto; o segurança fica indefeso, mas pode soltar como reação).'),
 H('Padrão','Granadas (uma de cada por cena)','Raio de 6m em alcance curto. Flashbang: atordoado 1 rodada (Fortitude DT 20 reduz a ofuscado e surdo). Fragmentação: 8d6 de perfuração (Reflexos DT 20 metade). Lacrimogêneo: 4d6 químico, enjoado e asfixiado, que continua 1d4 rodadas fora da área (Fortitude DT 20 metade e evita o enjoo). Incendiária: 6d6 de fogo e em chamas (Reflexos DT 20 metade e evita).'),
 H('Padrão','Rajadas','Dois ataques de submetralhadora a 2d20+10, cada um causando 4d6+10.')]),
C({n:'Hikikomori',e:'energia',e2:'sangue',vd:20,t:'Médio',pp:'DT 14 · 2d6 mental · NEX 25%+ imune',per:'1d20',ini:'2d20+5',def:16,fort:'1d20',ref:'2d20+5',von:'1d20',pv:35,res:'Energia 5',vul:'Conhecimento',at:'2 1 1 1 1',d:'9m'},[
 H('Passiva','Casulo voltaico','Sem estar machucado: cura acelerada 5 e quem o ataca corpo a corpo sofre 2d4 de Energia.'),
 A('Disparo infectado','Distância, alcance curto','2d20+5','2d12 eletricidade'),
 A('Esbarrão infectado','Corpo a corpo','2d20+5','2d12 eletricidade'),
 H('Livre','Infecção','Quem sofre dano dele contrai o vírus do infecticídio (Fortitude DT 14 evita e dá imunidade na cena).'),
 H('Livre','Ricochete','Ao acertar o esbarrão, faz uma ação de movimento para se deslocar.')]),
C({n:'Marca-Passo',e:'energia',e2:'sangue',vd:80,t:'Médio',pp:'DT 20 · 3d8 mental · NEX 40%+ imune',per:'2d20',ini:'3d20+10',def:23,fort:'2d20+5',ref:'3d20+10',von:'2d20',pv:140,res:'Balístico, corte e perfuração 10; Energia 20',vul:'Conhecimento',at:'3 3 1 2 2',d:'9m'},[
 H('Passiva','Trilha digital','Percebe em alcance extremo quem carrega eletrônicos ou itens de Energia: não pode ser surpreendido por eles, e eles ficam vulneráveis contra ele até se livrarem de tudo.'),
 A('Golpe infectado','Corpo a corpo ×2','3d20+10','2d12+5 impacto'),
 H('Reação','Frenesi eletrônico','Quando alguém em alcance curto usa poder, ritual, eletrônico ou item de Energia, corre até ele e explode: 4d6+5 de Energia num raio de 6m (Reflexos DT 20 metade).'),
 H('Livre','Infecção de equipamento','Quem sofre dano rola 1d100: 51+, um equipamento vira item amaldiçoado de Energia; 50 ou menos, um equipamento passa a transmitir o infecticídio a quem tocá-lo (Fortitude DT 20 evita).')]),
C({n:'Estímulo',e:'energia',e2:'sangue',vd:320,t:'Grande',pp:'DT 8d10 · 9d6 mental · NEX 95%+ imune',per:'5d20+20',ini:'5d20+20',def:50,fort:'4d20+15',ref:'5d20+25',von:'5d20+20',pv:800,imu:'Dano (exceto Conhecimento) e todas as condições',vul:'Conhecimento',at:'5 0 5 5 4',d:'12m'},[
 H('Passiva','Cogito ergo sum','Quem falha contra a presença perturbadora dele, ou o toca, contrai o infecticídio.'),
 H('Movimento','Sequestrar sinal','Teleporta-se em alcance médio para ficar ao lado de um aparelho eletrônico.'),
 H('Padrão','Glitch','Some e reaparece: todos num raio de 9m testam de novo contra a presença perturbadora.'),
 H('Padrão','Rodar simulação','Um ser em alcance curto troca o maior atributo com o menor, só para testes, até o fim da cena (Vontade DT 8d10 evita).'),
 H('Completa','Imergir','Um infectado em alcance curto avança um estágio na doença e sofre 10d12 de Energia (Fortitude DT 8d10 metade e evita o avanço); se morrer infectado, vira o começo de uma horda de infecticídio.'),
 H('Completa','Sequestro de atenção','Infectados num raio de 30m fazem Vontade DT 35 ou passam o próximo turno indo tocá-lo.')]),
C({n:'Experimento Ssabáka',e:'morte',e2:'sangue',vd:180,t:'Médio',pp:'DT 28 · 6d6 mental · NEX 60%+ imune',per:'2d20+10',ini:'3d20+15',def:36,fort:'4d20+15',ref:'3d20+15',von:'2d20+10',pv:360,res:'Balístico, impacto e perfuração 10; Sangue 20',vul:'Energia',at:'3 3 0 2 4',d:'12m'},[
 H('Passiva','Fugitivo do tempo','Imune a efeitos negativos ligados ao tempo, como envelhecimento, Decadência ou Paradoxo.'),
 A('Mordida','Corpo a corpo','3d20+20','4d12+20 perfuração'),
 A('Garras','Corpo a corpo ×2','3d20+20','4d12+10 corte'),
 H('Livre','Mastigar','Ao acertar a mordida num alvo Grande ou menor, agarra com os dentes (teste 3d20+20) e o leva junto ao se mover. Um por vez; solta ao morder outro.'),
 H('Movimento','Sofrimento duradouro','Despeja Lodo num agarrado: recupera 3d8+3 PV atuais, mas perde 1d8+1 PV máximos para sempre.'),
 H('Completa','Giro de cauda','Todos os adjacentes sofrem 4d10+10 de impacto e caem (Reflexos DT 28 metade e evita a queda).')]),
]};
