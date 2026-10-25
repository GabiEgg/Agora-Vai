// Acesso ao banco: Turso (SQLite na nuvem, gratuito) quando TURSO_DATABASE_URL está definido;
// senão, um arquivo SQLite local (node:sqlite). As duas opções têm a mesma interface assíncrona.
'use strict';
const fs=require('node:fs');
const path=require('node:path');

const ESQUEMA=[
 `CREATE TABLE IF NOT EXISTS usuarios(id TEXT PRIMARY KEY, usuario TEXT UNIQUE NOT NULL COLLATE NOCASE, hash TEXT NOT NULL, sal TEXT NOT NULL, criado INTEGER NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS sessoes(token TEXT PRIMARY KEY, usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, expira INTEGER NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS docs(usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, doc_id TEXT NOT NULL, dados TEXT NOT NULL, atualizado INTEGER NOT NULL, PRIMARY KEY(usuario_id,doc_id))`,
 `CREATE TABLE IF NOT EXISTS mesas(id TEXT PRIMARY KEY, nome TEXT NOT NULL, codigo TEXT UNIQUE NOT NULL, mestre_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, criado INTEGER NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS mesa_membros(mesa_id TEXT NOT NULL REFERENCES mesas(id) ON DELETE CASCADE, usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, papel TEXT NOT NULL, entrou INTEGER NOT NULL, PRIMARY KEY(mesa_id,usuario_id))`,
 `CREATE TABLE IF NOT EXISTS mesa_eventos(id INTEGER PRIMARY KEY AUTOINCREMENT, mesa_id TEXT NOT NULL REFERENCES mesas(id) ON DELETE CASCADE, usuario_id TEXT NOT NULL, criado INTEGER NOT NULL, dados TEXT NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS mesa_ini(mesa_id TEXT NOT NULL REFERENCES mesas(id) ON DELETE CASCADE, chave TEXT NOT NULL, usuario_id TEXT, tipo TEXT NOT NULL, nome TEXT NOT NULL, valor INTEGER, fonte TEXT, dados TEXT, atualizado INTEGER NOT NULL, PRIMARY KEY(mesa_id,chave))`,
 `CREATE TABLE IF NOT EXISTS mesa_estado(mesa_id TEXT PRIMARY KEY REFERENCES mesas(id) ON DELETE CASCADE, pedido INTEGER NOT NULL DEFAULT 0, turno TEXT, rodada INTEGER NOT NULL DEFAULT 0, atualizado INTEGER NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS mesa_log(id INTEGER PRIMARY KEY AUTOINCREMENT, mesa_id TEXT NOT NULL REFERENCES mesas(id) ON DELETE CASCADE, usuario_id TEXT, criado INTEGER NOT NULL, dados TEXT NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS mesa_cfg(mesa_id TEXT PRIMARY KEY REFERENCES mesas(id) ON DELETE CASCADE, dados TEXT NOT NULL, atualizado INTEGER NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS imagens(id TEXT PRIMARY KEY, usuario_id TEXT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE, tipo TEXT NOT NULL, dados BLOB NOT NULL, criado INTEGER NOT NULL)`,
];

/* Turso: cada consulta vai pela rede (HTTPS). */
async function abrirTurso(url,authToken){
  let libsql;
  try{libsql=require('@libsql/client')}catch(e){throw new Error('Para usar o Turso, instale as dependências com "npm install" (pacote @libsql/client).')}
  const cli=libsql.createClient({url,authToken});
  await cli.batch(ESQUEMA,'write');
  const exec=(sql,args)=>cli.execute({sql,args:args.map(a=>a===undefined?null:a)});
  return {
    tipo:'Turso ('+url.replace(/^libsql:\/\/|^https:\/\//,'').split('.')[0]+')',
    async get(sql,...args){const r=await exec(sql,args);return r.rows[0]||null},
    async all(sql,...args){return (await exec(sql,args)).rows},
    async run(sql,...args){await exec(sql,args)},
  };
}

/* Arquivo local: node:sqlite (síncrono), embrulhado na mesma interface. */
function abrirLocal(dbPath){
  const {DatabaseSync}=require('node:sqlite');
  fs.mkdirSync(path.dirname(dbPath),{recursive:true});
  const db=new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
  ESQUEMA.forEach(s=>db.exec(s));
  const cache=new Map();const prep=sql=>{let st=cache.get(sql);if(!st){st=db.prepare(sql);cache.set(sql,st)}return st};
  return {
    tipo:'arquivo '+dbPath,
    async get(sql,...args){return prep(sql).get(...args)||null},
    async all(sql,...args){return prep(sql).all(...args)},
    async run(sql,...args){prep(sql).run(...args)},
  };
}

async function abrirBanco(dbPath){
  const url=process.env.TURSO_DATABASE_URL;
  if(url)return abrirTurso(url,process.env.TURSO_AUTH_TOKEN);
  return abrirLocal(dbPath);
}
/* Converte BLOBs (ArrayBuffer no Turso, Uint8Array no node:sqlite) em Buffer. */
const paraBuffer=v=>Buffer.isBuffer(v)?v:v instanceof ArrayBuffer?Buffer.from(new Uint8Array(v)):Buffer.from(v);

module.exports={abrirBanco,paraBuffer};
