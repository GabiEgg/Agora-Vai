// NPCs e criaturas do Arquivos Secretos #04 (Complexo 0413), resumidos com nossas palavras.
const {C,A,H}=require('./cri_util');
const MASCARA=H('Passiva','Máscara de gás','+10 em Fortitude contra efeitos que dependem de respiração.');
module.exports={criaturas:[
C({n:'Assistente de Produção',tipo:'pessoa',e:'energia',vd:40,t:'Médio',per:'2d20+5',ini:'1d20+5',def:14,fort:'1d20+5',ref:'1d20+5',von:'2d20+5',pv:20,at:'1 1 3 2 1',pe:'Ciências, Investigação, Ocultismo, Profissão e Tecnologia 3d20+5',d:'9m'},[
 H('Passiva','Rituais (DT 15, até 3 PE, sem custo)','Amaldiçoar Tecnologia; Coincidência Forçada; Eletrocussão.'),MASCARA,
 A('Pancada','Corpo a corpo','1d20+5','1d4+5 impacto'),
 A('Pistola','Distância, alcance curto, crítico 18','1d20+5','1d12+5 balístico')]),
C({n:'Produtor',tipo:'pessoa',e:'energia',vd:80,t:'Médio',per:'1d20+5',ini:'2d20+10',def:20,fort:'3d20+10',ref:'2d20+10',von:'1d20+5',pv:100,at:'2 2 2 1 3',pe:'Atletismo 2d20+10, Crime 2d20+10, Ocultismo 2d20+5',d:'9m'},[
 H('Passiva','Rituais (DT 20, até 6 PE, sem custo)','Chamas do Caos; Eletrocussão (discente); Tela de Ruído (discente, até três vezes por cena; também como reação, RD 30 contra um dano).'),MASCARA,
 A('Martelo meteoro USB','Corpo a corpo ×2, crítico ×3','2d20+10','1d12+10 impacto ou Energia')]),
C({n:'Diretor',tipo:'pessoa',e:'energia',vd:200,t:'Médio',per:'4d20+15',ini:'3d20+10',def:28,fort:'3d20+15',ref:'3d20+10',von:'4d20+15',pv:280,at:'3 3 3 4 3',pe:'Enganação e Intimidação 4d20+15; Atletismo 3d20+15; Crime, Ocultismo e Tecnologia 3d20+10',d:'9m'},[
 H('Passiva','Rituais (DT 29, até 10 PE, sem custo)','Coincidência Forçada (verdadeiro); Dissonância Acústica; Eletrocussão (verdadeiro); Salto Fantasma; Tela de Ruído (discente, até três vezes por cena; também como reação, RD 30).'),MASCARA,
 A('Murro eletrificado','Corpo a corpo ×3','3d20+20','4d8+20 eletricidade'),
 A('Carga eletrificada','Distância ×3, alcance curto','3d20+20','4d8+20 eletricidade')]),
C({n:'Simulacro.EXE',e:'energia',e2:'conhecimento',vd:32,t:'Minúsculo',pp:'DT 15 · 2d6 mental · NEX 30%+ imune',per:'1d20+5',sen:'percepção às cegas, visão no escuro',ini:'1d20+5',def:10,fort:'1d20+5',ref:'1d20+5',von:'1d20+5',pv:70,imu:'Dano (exceto Conhecimento)',vul:'Conhecimento',at:'1 - 1 1 1',d:'0m'},[
 H('Passiva','Intangibilidade digital','Incorpóreo, só afetado por Conhecimento. Notar que há um simulacro num aparelho exige Ocultismo DT 4d10, a menos que ele se revele.'),
 H('Passiva','Forma evolutiva','Está no estágio troyan. Krypto: VD 64, 100 PV, Defesa 20, testes 1d20+10, Pequeno. Vvorm: VD 128, 200 PV, Defesa 30, atributos 2 (exceto Força), testes 2d20+15, Médio. Botnetz: VD 256, 500 PV, Defesa 40, atributos 3, testes 3d20+20, Grande.'),
 H('Passiva','Exorcismo digital','Dois treinados em Ocultismo ou Religião: um encara a tela e aguenta o simulacro enquanto o outro faz um teste estendido de Ocultismo (DT 4d10, 3 sucessos); o primeiro sucesso o impede de saltar para outro aparelho.'),
 H('Movimento','Saltar','Vai para qualquer aparelho eletrônico em alcance curto (krypto médio, vvorm longo, botnetz extremo).'),
 H('Padrão','Perturbação digital','A qualquer distância, alguém olhando uma tela ou algo enquadrado sofre 2d6 mental (Vontade DT 3d10 metade). Krypto: 3d6, DT 4d10, até 2 pessoas. Vvorm: 4d6, DT 5d10, até 3. Botnetz: 6d8, DT 6d10, até 4. Quem fica insano pode virar um novo simulacro (50%).')]),
]};
