// Formato das criaturas. Estatísticas: n nome, e/e2 elementos, vd, t tamanho, pp presença perturbadora,
// per/sen percepção e sentidos, ini iniciativa, def, fort/ref/von resistências, pv, res/vul/imu,
// at "AGI FOR INT PRE VIG", pe perícias, d deslocamento. Testes no formato "3d20+10" (o "3O+10" do livro).
const slug=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const C=(s,acoes,extra={})=>{const [AGI,FOR,INT,PRE,VIG]=String(s.at||'').split(/\s+/).map(x=>x===''||x==='-'?null:+x);
  return {id:'cri_'+slug(s.n),nome:s.n,elemento:s.e||'',elemento2:s.e2||'',vd:s.vd??null,tamanho:s.t||'',presenca:s.pp||'',percepcao:s.per||'',sentidos:s.sen||'',
    iniciativa:s.ini||'',defesa:s.def??null,fortitude:s.fort||'',reflexos:s.ref||'',vontade:s.von||'',pv:s.pv??null,resistencias:s.res||'',vulnerabilidades:s.vul||'',imunidades:s.imu||'',
    atributos:{AGI,FOR,INT,PRE,VIG},pericias:s.pe||'',deslocamento:s.d||'',tipo:s.tipo||'criatura',acoes,...extra}};
const A=(nome,alcance,teste,dano)=>({ataque:true,nome,alcance,teste,dano});
const H=(acao,nome,texto)=>({acao,nome,texto});
module.exports={C,A,H,slug};
