// Marcadores de página (brindes promocionais): origens, itens amaldiçoados, modificação e ritual.
// Textos resumidos com nossas palavras; consulte o marcador para a redação completa.
const {O,R,I}=require('./h');
module.exports={
origens:[
 O('jornalista','Jornalista','atualidades,investigacao','Fontes Confiáveis','Uma vez por sessão, 1 PE para acionar seus contatos: rola de novo um teste já feito para encontrar uma pista, com +5, ou recebe outra informação relevante (a critério do mestre).'),
 O('escritor','Escritor','artes,atualidades','Bagagem de Leitura','Uma vez por cena, 2 PE para ficar treinado em uma perícia qualquer até o fim da cena.'),
 O('professor','Professor','ciencias,intuicao','Aula de Campo','Uma vez por cena, ação padrão e 2 PE: outro personagem em alcance curto recebe +1 em um atributo até o fim da cena.'),
 O('cientista_forense','Cientista Forense','ciencias,investigacao','Investigação Científica','Uma vez por cena de investigação, ação livre para procurar pistas usando Ciências no lugar da perícia que seria usada.'),
 O('duble','Dublê','pilotagem,reflexos','Destemido','+5 em testes de perícia em que uma falha causaria diretamente dano ou uma condição negativa.',[],{bonusTeste:{nome:'Destemido (falha causaria dano ou condição)',valor:5,pe:0}}),
 O('ginasta','Ginasta','acrobacia,reflexos','Mobilidade Acrobática','+2 na Defesa e +3m de deslocamento.',[{alvo:'defesa',valor:2},{alvo:'deslocamento',valor:3}]),
 O('revoltado','Revoltado','furtividade,vontade','Antes Só...','Sem nenhum aliado em alcance curto: +1 na Defesa, em testes de perícia e no limite de PE por turno.',[],{bonusTeste:{nome:'Antes Só... (nenhum aliado em alcance curto)',valor:1,pe:0}}),
 O('gauderio_abutre','Gaudério Abutre','luta,pilotagem','Fraternidade Gaudéria','Uma vez por rodada, quando um aliado adjacente é alvo de ataque ou efeito, 1 PE para trocar de lugar com ele e virar o alvo. Se fizer isso, no seu próximo turno tem +2 em ataques contra o agressor.'),
 O('body_builder','Body Builder','atletismo,fortitude','Saindo da Jaula','Em testes de Força ou Vigor (exceto Luta), pode gastar 2 PE para +5 no teste.',[],{bonusTeste:{nome:'Saindo da Jaula',valor:5,pe:2,attrs:['FOR','VIG'],exceto:['luta']}}),
 O('personal_trainer','Personal Trainer','atletismo,ciencias','Todo Mundo Pagando 10','Ação de movimento e 2 PE: enquanto você estiver consciente, você e aliados em alcance curto recebem +2 em testes de perícia de Força ou Agilidade (exceto Luta e Pontaria) até o fim da cena.'),
 O('blaster','Blaster','ciencias,profissao','Explosão Solidária','Seus explosivos que causam dano causam +2d6. Além disso, 2 PE e uma ação de interlúdio para melhorar um explosivo: +5 na DT para resistir a ele (uma vez por explosivo). Profissão: químico.'),
],
itens:[
 I('amaldicoado','Óculos que Viram Morte Demais',4,1,{elemento:'morte',unico:true,ritConcedido:['rit_cicatrizacao','rit_decadencia','rit_eco_espiral','rit_paradoxo','rit_tentaculos_de_lodo'],desc:'Óculos de armação quadrada corrompidos por Morte. Vestindo, conjura Cicatrização, Decadência, Eco Espiral, Paradoxo e Tentáculos de Lodo como se os conhecesse. Se já conhece um deles, o custo dele cai em 1 PE (acumula com outras reduções). Item único.'}),
 I('amaldicoado','Pingente da Lua Dourada',4,0.5,{elemento:'conhecimento',unico:true,rd:'Conhecimento 10',desc:'Pingente dourado de lua crescente. Vestindo: resistência a Conhecimento 10 e +2 em testes de resistência contra efeitos de Conhecimento. 4 PE: tênue luz dourada que dá camuflagem total e +10 em Furtividade por uma rodada. Item único.'}),
 I('amaldicoado','Colar Banhado em Sangue',4,0.5,{elemento:'sangue',unico:true,rd:'Sangue 15',desc:'Colar de cordão preto distorcido por Sangue. Vestindo: resistência a Sangue 15; seus rituais de Sangue têm +2 na DT e +1 dado de dano do mesmo tipo. Ao conjurar ritual de Sangue, 3 PE para tratar dados de dano com 1 ou 2 como 3. Item único.'}),
 I('amaldicoado','Brinco da Possessão Energética',4,0.5,{elemento:'energia',unico:true,desc:'Brinco prateado de corrente. Vestindo, com a habilidade Poder Não Desejado (SaH): +5 PP e recupera +1 PP a cada ação de interlúdio dormir. Item único.'}),
 I('amaldicoado','Anel Espiral',3,0.5,{elemento:'morte',unico:true,desc:'Anel espiralado que distorce o tempo do disparo. Vestindo, ao atacar com arma de fogo: 2 PE para um disparo adicional, ou o disparo adicional sem gastar PE mas com metade do dano se acertar. Item único. (O marcador não diz o elemento; a espiral sugere Morte.)'}),
 I('amaldicoado','Faixas da Vidência (marcador)',3,1,{idSuf:'',elemento:'morte',mods:[{alvo:'esquiva',valor:10}],desc:'Versão do marcador de página (diferente da do AS#05). Faixa de tecido com símbolos de Morte. O usuário fica cego para alvos além de alcance médio. Dentro do médio: nunca fica desprevenido, +10 em testes de resistência e +10 na Defesa quando esquiva. Uma vez por cena de investigação, 2 PE para um vislumbre do passado: +5 para procurar pistas. (Categoria e espaços não aparecem no marcador; ajuste se precisar.)'}),
],
modificacoes:[
 {id:'mod_cano_dispersante',nome:'Cano Dispersante',aplica:'lancachamas',desc:'Só para lança-chamas: em vez de uma linha de 1,5m em alcance curto, atinge todos os seres num cone de 9m (um teste de ataque contra a Defesa de cada um). Além do dano, os atingidos ficam em chamas.',efeitos:{}},
],
rituais:[
 R('Barganha Insana','morte',3,'Completa','Pessoal','Você','Instantânea','','Você entrega à Morte parte da sua percepção do tempo em troca da saúde: recupera todos os PV e PE e elimina as condições negativas. No fim da cena, perde 1d4 de Sanidade permanentemente. A cada conjuração a pele fica mais acinzentada e o sangue mais escuro; há quem diga que o uso repetido transforma o ocultista em um luzídio.'),
],
};
