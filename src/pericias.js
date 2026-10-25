// Usos das perícias (livro de regras, cap. 2), resumidos com nossas palavras.
// Cada uso: [nome, requisito ('' | 'Treinado' | 'Veterano' | 'Expert'), texto].
// "–1d20" = perde um dado no teste (o "–O" do livro).
module.exports={
 geral:[
  'Teste de perícia: role tantos d20 quanto o atributo-base, fique com o maior e some o bônus do grau (treinado +5, veterano +10, expert +15) e outros modificadores. Atributo 0: role 2d20 e fique com o pior.',
  'Perícias marcadas como “somente treinada” só podem ser usadas por quem é treinado nelas. Alguns usos pedem um grau mínimo, indicado ao lado do nome.',
  'Perícias com penalidade de carga sofrem a penalidade de armadura ou sobrecarga.',
  'Usos que exigem kit sofrem –5 no teste sem o kit apropriado.',
  'Ajuda: em tarefas em grupo, cada ajudante testa contra DT 10; quem passa dá +1 ao líder (+2 com resultado 20, +3 com 30…). O mestre limita quantos podem ajudar.',
 ],
 acrobacia:{desc:'Proezas acrobáticas, equilíbrio e agilidade corporal.',usos:[
  ['Amortecer Queda','Veterano','DT 15, reação ao cair. Passando, reduz o dano da queda em 1d6, +1d6 a cada 5 pontos acima da DT. Se zerar o dano, cai de pé.'],
  ['Equilíbrio','','Andar por superfícies precárias: um teste por ação de movimento. DT 10 (piso escorregadio), 15 (superfície estreita, como topo de muro) ou 20 (muito estreita, como corda). Passou: avança metade do deslocamento. Falhou: não avança. Falhou por 5+: cai. Aceitando –1d20 avança o deslocamento total. Enquanto se equilibra fica desprevenido e, se sofrer dano, testa de novo para não cair.'],
  ['Escapar','','Livrar-se de amarras com uma ação completa. DT = teste de Agilidade de quem amarrou +10 (cordas) ou 30 (algemas).'],
  ['Levantar-se Rapidamente','Treinado','DT 20, caído e com a ação de movimento disponível. Passou: levanta como ação livre. Falhou: gasta a ação de movimento e continua caído.'],
  ['Passar por Espaço Apertado','Treinado','DT 25. Espreme-se por onde só a cabeça passaria, com uma ação completa, avançando metade do deslocamento.'],
  ['Passar por Inimigo','','Atravessar o espaço de um inimigo durante o movimento: teste oposto à Acrobacia, Iniciativa ou Luta dele (a melhor). Falhou: não atravessa e o movimento acaba. O espaço conta como terreno difícil.'],
 ]},
 adestramento:{desc:'Lidar com animais e montarias.',usos:[
  ['Acalmar Animal','','DT 25, ação completa. Acalma um animal nervoso ou agressivo (um touro furioso, um cão de guarda).'],
  ['Cavalgar','','Montar é uma ação de movimento, ou ação livre com teste DT 20 (falhar por 5+ derruba você). Terreno plano não pede teste; obstáculos pequenos ou terreno ruim DT 15, grandes ou muito ruim DT 20. Falhou: cai e sofre 1d6 de dano. Galopar: ação completa e teste; avança quadrados de 1,5m iguais ao deslocamento da montaria + resultado, em linha reta e fora de terreno difícil.'],
  ['Manejar Animal','','DT 15, ação de movimento. O animal faz uma tarefa para a qual foi treinado. Também serve como Pilotagem para veículos de tração animal.'],
 ]},
 artes:{desc:'Expressão artística: música, dança, escrita, pintura, atuação e outras.',usos:[
  ['Impressionar','','Teste oposto à Vontade do público. Passou: +2 em testes de perícias de Presença contra essas pessoas na cena. Falhou: –2 nesses testes e não pode tentar de novo na cena. Para uma plateia o mestre rola uma vez, usando o melhor bônus. Leva de minutos (música) a horas (peça de teatro).'],
 ]},
 atletismo:{desc:'Façanhas físicas: correr, escalar, nadar e saltar.',usos:[
  ['Corrida','','Ação completa: avança quadrados de 1,5m iguais ao deslocamento + resultado do teste, em linha reta e fora de terreno difícil. Pode correr por rodadas iguais ao Vigor; depois, Fortitude a cada rodada (DT 5, +5 por teste anterior) ou fica fatigado.'],
  ['Escalar','','Ação de movimento. DT 10 (barranco com apoios), 15 (portão ou árvore), 20 (muro com reentrâncias) ou 25 (parede lisa). Passou: avança metade do deslocamento; falhou: não avança; falhou por 5+: cai. Com –1d20 avança o deslocamento total. Escalando fica desprevenido e, se sofrer dano, testa de novo. Pode segurar alguém adjacente que caia com teste contra a DT +5 (falhar por 5+ derruba você também).'],
  ['Natação','','Na água, uma ação de movimento e um teste por rodada. DT 10 (calma), 15 (agitada) ou 20+ (tempestuosa). Passou: avança metade do deslocamento; falhou: boia sem avançar; falhou por 5+: afunda. Pode gastar outra ação de movimento para outro teste. Submerso, prende a respiração por rodadas iguais ao Vigor; depois, Fortitude por rodada (DT 5, +5 por teste) ou se afoga (0 PV, morrendo). Sofre penalidade de carga.'],
  ['Saltar','','Parte do movimento. Salto longo: DT 5 por quadrado de 1,5m (10 para 3m, 15 para 4,5m…). Salto em altura: DT 15 por quadrado (30 para 3m). Sem 6m de corrida para impulso, +5 na DT.'],
 ]},
 atualidades:{desc:'Conhecimentos gerais: política, esporte, entretenimento, cultura.',usos:[
  ['Informação','','Responder dúvidas sobre assuntos gerais. DT 15 (comum, como o autor de um livro), 20 (específica, como a história do fundador de uma empresa) ou 25 (quase desconhecida, como uma lenda urbana esquecida).'],
 ]},
 ciencias:{desc:'Campos científicos: matemática, física, química, biologia etc. Você pode escolher uma especialidade para interpretar (sem efeito mecânico).',usos:[
  ['Informação','','Questões simples não exigem teste. Questões complexas (funcionamento de um procedimento científico específico) DT 20. Campos experimentais (avaliar uma liga metálica recém-criada) DT 30.'],
 ]},
 crime:{desc:'Atividades ilícitas: arrombar, furtar, esconder e sabotar.',usos:[
  ['Arrombar','','Ação completa. DT 20 (fechadura comum), 25 (reforçada) ou 30 (avançada, como cofre de banco). Exige kit (–5 sem ele).'],
  ['Furto','','DT 20, ação padrão. Pega um objeto de alguém (ou planta um nas coisas dela). A vítima faz Percepção contra o seu resultado; se passar, percebe a tentativa, tendo você conseguido ou não.'],
  ['Ocultar','','Ação padrão. Esconde um objeto em você; teste oposto à Percepção de quem puder ver. Quem revistar você recebe +10.'],
  ['Sabotar','Veterano','Desabilita um dispositivo. DT 20 (ação simples, como desligar um alarme) ou 30 (complexa, como fazer uma pistola explodir ao disparar). Falhar por 5+ dá errado sem você saber. Leva 1d4+1 ações completas, ou uma com –1d20. Exige kit (–5 sem ele).'],
 ]},
 diplomacia:{desc:'Convencer com lábia e argumentos. Atitudes de NPC: prestativo (+5 para persuadir), amistoso, indiferente, inamistoso (–5) e hostil (falha automática na persuasão).',usos:[
  ['Acalmar','Treinado','DT 20, ação padrão. Estabiliza um personagem adjacente que esteja enlouquecendo, deixando-o com Sanidade 1. +5 na DT para cada vez que ele já foi acalmado na cena.'],
  ['Mudar Atitude','','Teste oposto à Vontade do alvo, leva um minuto (ou ação completa com –2d20). Passou: muda a atitude uma categoria para cima ou para baixo; por 10+, até duas. Falhou por 5+: muda uma categoria no sentido contrário. Uma vez por dia por pessoa.'],
  ['Persuasão','','DT 20, um minuto ou mais. Convence alguém a fazer algo (responder, prestar um favor). –5 se for custoso (emprestar o carro); –10 ou falha automática se for perigoso. O mestre pode pedir teste oposto à Vontade.'],
 ]},
 enganacao:{desc:'Blefes, disfarces e trapaças.',usos:[
  ['Disfarce','Treinado','Muda sua aparência ou a de outra pessoa (pelo menos dez minutos, exige kit; –5 sem ele). Teste oposto à Percepção de quem prestar atenção. Quem conhece a pessoa imitada recebe +10.'],
  ['Falsificação','Veterano','Falsifica um documento; teste oposto à Percepção de quem examinar. Documento complexo, ou com assinatura ou carimbo específico: –2d20.'],
  ['Fintar','Treinado','Ação padrão, teste oposto aos Reflexos de um ser em alcance curto. Passou: ele fica desprevenido contra seu próximo ataque, se feito até o fim do seu próximo turno.'],
  ['Insinuação','','DT 20. Passa uma mensagem que só o receptor entende. Falhou por 5+: ele entende outra coisa. Outros podem fazer Intuição oposta para entender.'],
  ['Intriga','','DT 20 (ou 30 se muito improvável), leva pelo menos um dia. Espalha uma fofoca. Quem investigar a origem faz Investigação contra o seu resultado e pode chegar até você.'],
  ['Mentir','','Teste oposto à Intuição da vítima. Mentiras muito implausíveis: –2d20.'],
 ]},
 fortitude:{desc:'Resistência física.',usos:[
  ['Teste de resistência','','Contra efeitos que exigem vitalidade, como doenças, venenos e muitos rituais. A DT vem do efeito.'],
  ['Fôlego','','Manter o fôlego correndo ou sem respirar: DT 5, +5 por teste anterior (veja Atletismo).'],
 ]},
 furtividade:{desc:'Ser discreto e sorrateiro.',usos:[
  ['Esconder-se','','Ação livre no fim do turno, em um lugar onde dê para se esconder. Teste oposto à Percepção de quem puder notar você; quem falhar não o percebe (camuflagem total). Se moveu no turno: –1d20 (ou ande à metade do deslocamento para evitar). Se atacou ou fez algo chamativo: –3d20.'],
  ['Seguir','','Teste oposto à Percepção de quem é seguido. –5 em lugar sem esconderijos ou movimento. O alvo recebe +5 se estiver tomando precauções. Passou: segue até o destino. Falhou: é percebido na metade do caminho.'],
 ]},
 iniciativa:{desc:'Velocidade de reação.',usos:[
  ['Ordem de ação','','No início de uma cena de ação, todos testam Iniciativa e agem do maior resultado para o menor.'],
 ]},
 intimidacao:{desc:'Assustar ou coagir. Todos os usos são efeitos de medo.',usos:[
  ['Assustar','Treinado','Ação padrão, teste oposto à Vontade de uma pessoa em alcance curto. Passou: ela fica abalada pela cena (não cumulativo). Por 10+: apavorada por uma rodada e depois abalada pela cena.'],
  ['Coagir','','Teste oposto à Vontade de uma pessoa adjacente, leva um minuto ou mais. Passou: ela obedece uma ordem (uma pequena tarefa, deixar você passar). Ordem perigosa ou contra a natureza dela: +5 para ela ou passa automaticamente. Deixa a pessoa hostil a você.'],
 ]},
 intuicao:{desc:'Empatia e “sexto sentido”.',usos:[
  ['Perceber Mentira','','Teste oposto à Enganação de quem tenta mentir para você.'],
  ['Pressentimento','Treinado','DT 20. Tem uma ideia da índole de uma pessoa ou percebe que algo está estranho numa situação. Só indica que há algo anormal; para descobrir a causa, use Investigação.'],
 ]},
 investigacao:{desc:'Descobrir pistas e informações.',usos:[
  ['Interrogar','','Perguntar por aí ou ouvir em um lugar movimentado, de uma hora a um dia. Informação geral não exige teste; restrita DT 20; confidencial ou perigosa DT 30.'],
  ['Procurar','','Examinar um local, de uma ação completa (uma escrivaninha) a um dia (uma biblioteca). DT 15 (item discreto ou no meio da bagunça), 20 (escondido, como cofre atrás de um quadro) ou 30 (muito bem escondido, como passagem secreta ou tinta invisível). Também serve para pesquisar informações públicas na internet.'],
 ]},
 luta:{desc:'Ataques corpo a corpo.',usos:[
  ['Atacar','','A DT é a Defesa do alvo. Acertando, causa o dano da arma. Um ataque desarmado é uma arma leve de 1d3 de dano não letal; arma improvisada: 1d6 e –1d20 no ataque.'],
  ['Manobra de combate','','Ataque corpo a corpo oposto (o alvo usa Luta, mesmo com arma à distância; empate, rolam de novo). Agarrar (só desarmado): o alvo fica desprevenido, imóvel, com –1d20 no ataque e só ataca com armas leves; ele se solta vencendo uma manobra com ação padrão; você pode trocar um ataque por manobra para causar dano desarmado. Derrubar: deixa caído (vencendo por 5+ também empurra 1,5m). Desarmar: o item cai (vencendo por 5+ é empurrado 1,5m). Empurrar: 1,5m, +1,5m a cada 5 de diferença. Quebrar: atinge um item que o alvo segura.'],
  ['Atropelar','','Ação padrão durante o movimento para passar pelo espaço de alguém. Se ele resistir, manobra oposta: vencendo, ele fica caído e você continua. Ação livre durante uma investida.'],
 ]},
 medicina:{desc:'Tratar ferimentos, doenças e venenos. Exige kit (–5 sem ele). Em si mesmo: –1d20.',usos:[
  ['Primeiros Socorros','','DT 20, ação padrão. Um personagem adjacente morrendo perde essa condição e fica com 1 PV. +5 na DT para cada vez que já foi estabilizado na cena.'],
  ['Cuidados Prolongados','Veterano','DT 20, uma ação de interlúdio. Trata até um ser por ponto de Intelecto; quem você tratar recupera o dobro de PV ao dormir neste interlúdio.'],
  ['Necropsia','Treinado','DT 20 (causas raras ou paranormais +10), dez minutos. Descobre a causa e o momento aproximado da morte.'],
  ['Tratamento','Treinado','Ação completa, teste contra a DT da doença ou veneno contínuo. Passou: o paciente recebe +5 no próximo teste de Fortitude contra o efeito.'],
 ]},
 ocultismo:{desc:'Estudo do paranormal. Ser treinado não significa saber conjurar rituais.',usos:[
  ['Identificar Criatura','','Ação completa, DT = DT da Presença Perturbadora da criatura. Passou: descobre uma característica (um poder ou vulnerabilidade), mais uma a cada 5 pontos acima da DT. Falhou por 5+: tira uma conclusão errada.'],
  ['Identificar Item Amaldiçoado','','DT 20, uma ação de interlúdio (ou ação completa com –2d20). Descobre os poderes do item ou qual ritual ele contém.'],
  ['Identificar Ritual','','DT 10 + 5 por círculo, reação. Descobre qual ritual alguém está conjurando pelos gestos, palavras e componentes.'],
  ['Informação','','Dúvidas sobre o Outro Lado, itens amaldiçoados, fenômenos, runas, profecias. Simples: sem teste. Complexas: DT 20. Mistérios e enigmas: DT 30.'],
  ['Conjurar rituais','','O teste do Custo do Paranormal (regra opcional) usa Ocultismo: DT 20 + PE gastos.'],
 ]},
 percepcao:{desc:'Notar coisas com os sentidos.',usos:[
  ['Observar','','DT 15 (difícil de ver, como um livro específico numa estante) a 30 (quase invisível, como uma gota de sangue numa folha à noite). Contra algo escondido, a DT é o teste de Furtividade ou Crime de quem escondeu. Ler lábios: DT 20.'],
  ['Ouvir','','Conversa próxima DT 0; sussurros DT 15; atrás de uma porta +5. Dormindo pode testar com –2d20 (passar acorda você). Perceber um ser que não pode ver: DT 20 ou Furtividade dele +10, o que for maior (ainda sofre as penalidades de lutar sem ver).'],
 ]},
 pilotagem:{desc:'Operar veículos terrestres e aquáticos. Pilotar gasta uma ação de movimento por turno.',usos:[
  ['Conduzir','','Situações comuns não exigem teste. Situações ruins (estrada de terra sem luz, chuva) pedem um teste por turno contra DT 15; terríveis (terreno acidentado, tempestade) DT 25.'],
  ['Veículos aéreos','Veterano','Com grau veterano, pode pilotar aviões e helicópteros.'],
 ]},
 pontaria:{desc:'Ataques à distância.',usos:[
  ['Atacar','','A DT é a Defesa do alvo. Acertando, causa o dano da arma. Atirar em um ser adjacente a qualquer inimigo (inclusive você) impõe –1d20. Até o dobro do alcance da arma: –5.'],
 ]},
 profissao:{desc:'Exercer uma profissão (advogado, engenheiro, jornalista…). Combine com o mestre que testes ela permite.',usos:[
  ['Usos da profissão','','Um advogado pode argumentar com a polícia; um administrador, analisar documentos de uma empresa.'],
  ['Rendimentos','Treinado','Começa cada missão com um item extra além dos fornecidos pela Ordem: categoria I (treinado), II (veterano) ou III (expert).'],
 ]},
 reflexos:{desc:'Reação rápida.',usos:[
  ['Teste de resistência','','Contra armadilhas, explosões e efeitos de área. A DT vem do efeito.'],
  ['Evitar finta','','Teste oposto à Enganação de quem tenta fintar você.'],
 ]},
 religiao:{desc:'Teologia e as religiões do mundo.',usos:[
  ['Acalmar','','DT 20. Funciona como o Acalmar de Diplomacia, para estabilizar quem está enlouquecendo.'],
  ['Informação','','Mitos, profecias, relíquias. DT 10 (simples), 20 (complexa) ou 30 (mistérios e enigmas).'],
  ['Rito','Veterano','DT 20. Conduz uma cerimônia religiosa (batizado, casamento, funeral…).'],
 ]},
 sobrevivencia:{desc:'Guiar-se em regiões selvagens e evitar perigos da natureza.',usos:[
  ['Acampamento','Treinado','Consegue abrigo e comida nos ermos. DT 15 (campo aberto), 20 (mata fechada) ou 25 (deserto, pântano, montanha); –5 cumulativo por região árida ou clima ruim. Passando, o grupo pode alimentar-se e dormir no interlúdio mesmo ao relento.'],
  ['Identificar Animal','Treinado','DT 20, ação completa. Identifica um animal exótico (como Identificar Criatura de Ocultismo).'],
  ['Orientar-se','','Um teste por dia de viagem nos ermos, com a DT do terreno. Passou: avança o deslocamento normal; falhou: metade; falhou por 5+: se perde e não avança. Num grupo, escolha um guia; treinados podem ajudá-lo.'],
  ['Rastrear','Treinado','DT 15 (grupo grande ou solo macio), 20 (solo comum) ou 25 (solo duro); noite, chuva ou neblina: –1d20. Um teste por dia, com deslocamento à metade; +1 na DT por dia desde que o rastro foi feito.'],
 ]},
 tatica:{desc:'Educação militar.',usos:[
  ['Analisar Terreno','','DT 20, ação de movimento. Descobre uma vantagem do campo de batalha (cobertura, camuflagem, terreno elevado), se houver.'],
  ['Plano de Ação','Veterano','DT 20, ação padrão. Um aliado em alcance médio recebe +5 na Iniciativa; se ficar acima da sua e ainda não tiver agido, age logo depois de você, e segue a nova ordem nas próximas rodadas.'],
 ]},
 tecnologia:{desc:'Eletrônica e informática avançadas. Usar um computador ou celular no dia a dia não exige teste.',usos:[
  ['Falsificação','Veterano','Como o uso de Enganação, mas para documentos eletrônicos.'],
  ['Hackear','','Invade um computador protegido. DT 15 (pessoal), 20 (rede profissional) ou 25 (servidor corporativo, governamental ou militar). Leva 1d4+1 ações completas (ou uma com –1d20). Falhou: só tenta de novo com informação nova (usuário, senha). Falhou por 5+: pode ser rastreado.'],
  ['Localizar Arquivo','','Procura um arquivo num sistema que você acessa. Ação completa e DT 15 (computador pessoal), 1d4+1 ações e DT 20 (rede pequena) ou 1d6+2 ações e DT 25 (rede corporativa ou governamental).'],
  ['Operar Dispositivo','','Acessa câmeras, destrava fechaduras eletrônicas, liga ou desliga alarmes. DT 15 (comum), 20 (profissional) ou 25 (protegido). Leva 1d4+1 ações completas (ou uma com –1d20). Exige kit (–5 sem ele).'],
 ]},
 vontade:{desc:'Determinação e força mental.',usos:[
  ['Teste de resistência','','Contra intimidação, medo e rituais que afetam a mente. A DT vem do efeito.'],
  ['Conjurar em condições adversas','','Se estiver numa situação difícil ou sofrer dano enquanto conjura um ritual, passe em Vontade; se falhar, o ritual não funciona e os PE são perdidos.'],
 ]},
};
