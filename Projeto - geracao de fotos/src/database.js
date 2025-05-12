import sqlite3 from 'sqlite3';
export const db = new sqlite3.Database('./database.db',  (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
         initDb();
    }
});


export async function initDb() {

  // Tabela de imagens
  await db.run(`
    CREATE TABLE IF NOT EXISTS imagens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt TEXT,
      caminho TEXT,
      data DATE
      );
  `);

  // Tabela de usuários/API keys
  await db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      api_key TEXT
    );
  `);
}

export async function getUser() {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM usuarios ORDER BY id DESC LIMIT 1', (err, row) => {
      if (err) {
        console.error('Erro ao buscar usuário:', err);
        return reject(err);
      }
      console.log('Usuário encontrado:', row);
      resolve(row);
    });
  });
}

export async function getImagens() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM imagens ORDER BY id DESC', (err, rows) => {
      if (err) {
        console.error('Erro ao buscar imagens:', err);
        return reject(err);
      }
      console.log('Imagens encontradas:', rows);
      resolve(rows);
    });
  });
}


export async function adicionarUsuario(nome, api_key) {
  if (!db) await initDb();
  const timestamp = Date.now();
  await db.run(
    'INSERT INTO usuarios (nome, api_key) VALUES (?, ?)',
    [nome, api_key, timestamp]
  );
}

export async function getApiKeyByUserId(id) {
  if (!db) await initDb();
  const row = await db.get('SELECT api_key FROM usuarios WHERE id = ?', [id]);
  return row?.api_key || null;
}

export async function insertImageRecord(prompt, caminho, data) {
  if (!db) await initDb();
  await db.run(
    'INSERT INTO imagens (prompt, caminho, data) VALUES (?, ?, ?)',
    [prompt, caminho, data]
  );
}
