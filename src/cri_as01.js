// NPCs e criaturas do Arquivos Secretos #01 (Transtornados), resumidos com nossas palavras.
// Rituais de NPCs são listados pelo nome; o texto de cada um está na aba Rituais do app.
const {C,A,H}=require('./cri_util');
module.exports={criaturas:[
C({n:'Assecla Transtornado',tipo:'pessoa',e:'sangue',vd:40,t:'Médio',per:'1d20+5',ini:'1d20+5',def:18,fort:'2d20+5',ref:'1d20+5',von:'1d20+5',pv:30,at:'1 2 2 1 2',pe:'Atletismo 2d20+5, Intimidação 1d20+5, Ocultismo 2d20+5',d:'9m'},[
 H('Passiva','Rituais (DT 15, até 3 PE, sem custo)','Armadura de Sangue; Esfolar (discente).'),
 H('Passiva','Corrente farpada','Alcança 3m e dá +2 para desarmar e derrubar.'),
 A('Corrente farpada','Corpo a corpo (3m), crítico 19','2d20+5','1d8+10 corte')]),
C({n:'Investido Transtornado',tipo:'pessoa',e:'sangue',vd:80,t:'Médio',per:'2d20+10',ini:'3d20+5',def:23,fort:'2d20+10',ref:'1d20+5',von:'2d20+10',pv:90,at:'1 3 2 2 2',pe:'Atletismo 3d20+10, Intimidação 2d20+10, Ocultismo 2d20+10',d:'9m'},[
 H('Passiva','Rituais (DT 20, até 6 PE, sem custo)','Armadura de Sangue (discente); Descarnar (discente); Esfolar (discente); Transfusão Vital.'),
 A('Cutelo','Corpo a corpo ×2, crítico ×3','4d20+15','1d6+15 corte')]),
C({n:'Apóstolo do Sangue',tipo:'pessoa',e:'sangue',vd:200,t:'Médio',per:'3d20+15',sen:'percepção às cegas',ini:'2d20+10',def:30,fort:'3d20+15',ref:'2d20+10',von:'3d20+15',pv:300,at:'2 4 2 3 3',pe:'Atletismo 4d20+15, Intimidação 3d20+15, Ocultismo 2d20+15',d:'9m'},[
 H('Passiva','Rituais (DT 29, até 10 PE, sem custo)','Armadura de Sangue (discente); Descarnar (discente); Esfolar (verdadeiro); Hemofagia (discente: ataca com a marreta somando +6d6 de Sangue e cura metade); Transfusão Vital; Vomitar Pestes (discente).'),
 H('Passiva','Marreta transtornada','Num crítico, quebra um osso: fraco até receber cuidados prolongados num interlúdio (Fortitude DT 29 evita); se já estava fraco por ela, fica debilitado.'),
 A('Marreta sanguinária','Corpo a corpo ×2, crítico ×4','4d20+20','4d10+30 impacto, perfuração ou Sangue'),
 H('Livre','Rituais acelerados','Uma vez por rodada, um ritual de até ação completa vira ação livre.')]),
C({n:'Giovanni Opspor',tipo:'pessoa',e:'sangue',vd:80,t:'Médio',per:'3d20+10',ini:'2d20+5',def:23,fort:'1d20+5',ref:'2d20+5',von:'3d20+10',pv:70,at:'2 1 4 3 1',pe:'Crime 2d20+10, Enganação 3d20+10, Furtividade 2d20+10, Ocultismo 2d20+5',d:'9m'},[
 H('Passiva','Rituais (DT 20, até 6 PE, sem custo)','Distorcer Aparência; Esconder dos Olhos; Espelho (Sangue/Conhecimento 2: cópia de carne de si ou de alguém que viu, que ele controla e percebe; fica atordoado enquanto concentrado); Fortalecimento Sensorial (discente); Terceiro Olho.'),
 A('Revólver','Distância ×2, alcance curto, crítico 19','2d20+5','2d6+10 balístico'),
 A('Faca','Corpo a corpo, crítico 19','2d20+5','1d4+10 perfuração')]),
C({n:'Mosto',tipo:'pessoa',e:'sangue',vd:60,t:'Médio',per:'1d20',ini:'2d20+5',def:20,fort:'3d20+10',ref:'1d20+5',von:'1d20',pv:100,at:'1 4 1 1 3',pe:'Atletismo 4d20+10',d:'9m'},[
 H('Passiva','Rosto desfigurado','Se tirarem o saco do rosto dele, fica furioso: +1d8 de dano e pode usar Trocação Justa.'),
 A('Cutelo','Corpo a corpo, crítico 19/×3','4d20+10','1d6+10 corte'),
 A('Desarmado','Corpo a corpo','4d20+10','1d4+10 impacto'),
 H('Completa','Surra brutal','Um ataque de cutelo e um desarmado; não pode bloquear até o próximo turno.'),
 H('Completa','Trocação justa','Salta no alvo. Se o alvo aceitar a trocação, os dois rolam dano alternadamente (sem bloqueio) até um cair ou desistir. Se tentar se defender: Fortitude DT 20; passa, 1d6+10; falha, 1d6+1d4+20 (pode bloquear).')]),
C({n:'Tarrafa',tipo:'pessoa',e:'sangue',vd:60,t:'Médio',per:'1d20+5',ini:'3d20+10',def:21,fort:'2d20+5',ref:'3d20+10',von:'1d20',pv:80,at:'3 2 1 1 2',pe:'Acrobacia 3d20+10, Atletismo 2d20+10',d:'9m'},[
 H('Passiva','Perfuração permanente','Acertando o arpão, o alvo fica lento até gastar ação padrão e passar em Atletismo ou Luta DT 20 para tirá-lo.'),
 H('Passiva','Prazer na dor','Machucado, RD 5.'),
 A('Arpão do pescador','Distância, alcance curto, crítico ×3','3d20+10','1d6+10 perfuração + 1d6 Sangue'),
 A('Faca','Corpo a corpo ×2, crítico 19','3d20+10','1d4+10 perfuração'),
 H('Padrão','Engolir metal','Engole um objeto de metal Pequeno ou menor: perde 1d6 PV e ganha +2 em testes de Força e Agilidade (cumulativo, até três itens).')]),
C({n:'Carrara',tipo:'pessoa',e:'sangue',vd:60,t:'Médio',per:'2d20+5',ini:'2d20+10',def:18,fort:'1d20',ref:'2d20+10',von:'2d20+5',pv:70,at:'2 1 2 2 1',pe:'Atletismo 1d20+10, Enganação 2d20+10',d:'9m'},[
 H('Passiva','Sangue maldito','Munição banhada no sangue dele causa +1d6 de Sangue uma vez.'),
 A('Soco com pregos','Corpo a corpo ×2','1d20+10','1d4+10 impacto'),
 A('Pregador pneumático','Distância ×2, alcance curto, crítico ×4','2d20+10','3d4+10 perfuração + 1d6 Sangue'),
 H('Completa','Pregos de sangue','Arranca pregos do corpo e recarrega o pregador com eles (usando Sangue Maldito).')]),
C({n:'Nando Salles',tipo:'pessoa',vd:20,t:'Médio',per:'2d20+5',ini:'2d20+5',def:16,fort:'2d20+5',ref:'2d20+5',von:'2d20+5',pv:35,at:'2 1 2 2 2',pe:'Enganação 2d20+5',d:'9m'},[
 A('Pistola','Distância, alcance curto, crítico 18','2d20+5','1d12+5 balístico'),
 H('Completa','Arrogância diabólica','Diz a alguém em alcance longo que “basta ter o mindset certo”: Vontade DT 25 ou faz algo extremamente imprudente no próximo turno; se recusar, sofre 2d6 mental que não pode ser evitado nem reduzido.')]),
C({n:'Anulado',e:'sangue',vd:100,t:'Médio',pp:'DT 20 · 4d6 mental · NEX 45%+ imune',per:'3d20+10',sen:'visão no escuro',ini:'2d20+10',def:25,fort:'3d20+10',ref:'2d20+5',von:'1d20+10',pv:190,at:'2 3 1 1 3',d:'9m'},[
 H('Passiva','Corpo oscilante','Quem o olha diretamente pela primeira vez (qualquer ação contra ele) sofre 2d6 mental. Agir sem olhar evita, mas dá –1d20 nos testes.'),
 H('Passiva','Golpes anulados','Distribui os ataques entre até três alvos.'),
 H('Passiva','Quero o seu corpo','Quem o ataca e erra faz Reflexos DT 25 ou fica agarrado. Começando o turno com alguém agarrado, suga os órgãos: 4d10 de Sangue e recupera metade.'),
 A('Braços grotescos','Corpo a corpo ×2','3d20+15','1d8+10 impacto'),
 A('Mordida asquerosa','Corpo a corpo (mesma ação)','3d20+15','1d10+10 Sangue')]),
C({n:'Cleo Brisa',tipo:'pessoa',vd:60,t:'Médio',per:'2d20+5',ini:'2d20+10',def:20,fort:'2d20+5',ref:'2d20+5',von:'2d20+10',pv:80,at:'2 2 2 2 2',pe:'Atletismo 2d20+5, Crime 2d20+5, Intuição 2d20+10, Investigação 2d20+10, Tática 2d20+5',d:'9m'},[
 A('Pistola','Distância ×2, alcance curto, crítico 18','2d20+10','1d12+10 balístico'),
 A('Pé de cabra','Corpo a corpo ×2','2d20+10','1d8+10 impacto'),
 H('Completa','Empurrar e atirar','Empurra um alvo 3m com o pé de cabra (Fortitude DT 20 evita) e atira; se empurrou, +1d20 no ataque e +1d12 de dano.')]),
C({n:'Cristino',tipo:'pessoa',vd:180,t:'Médio',per:'2d20+5',ini:'2d20+15',def:36,fort:'3d20+15',ref:'3d20+15',von:'2d20+10',pv:240,at:'3 3 2 2 3',pe:'Atletismo 3d20+15, Furtividade 3d20+15, Medicina 2d20+15, Sobrevivência 2d20+15',d:'9m'},[
 H('Passiva','Combinação cruel','Faz dois ataques por rodada misturando tipos diferentes (ex.: um disparo e uma coronhada).'),
 A('Peixeira','Corpo a corpo ×2, crítico 19','3d20+20','3d8+30 corte'),
 A('Coronha da espingarda','Corpo a corpo ×2, crítico ×3','3d20+20','3d6+30 perfuração'),
 A('Espingarda','Distância ×2, alcance curto, crítico ×3','3d20+20','4d6+30 balístico'),
 H('Padrão','Luzernas','Posiciona uma lamparina que ilumina alcance curto: percebe automaticamente quem estiver iluminado. Atirando nela, explode: 6d6 de fogo e em chamas em alcance curto (Reflexos DT 28 metade e evita).'),
 H('Completa','Emboscada do cangaço','Escondido, os inimigos fazem Percepção DT 30; se ninguém passar, dois disparos e uma coronhada na mesma ação contra alvos desprevenidos e sem reações.')]),
]};
