import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';
import { db, initDb, getUser, getImagens } from './src/database.js';
import { gerarEbaixarImagem } from './src/gerarFoto.js';

let mainWindow;
var api_Key = null;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Diretório persistente para imagens
const pastaImagens = path.join(app.getPath('userData'), 'imagens');

function createWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    center: true,
    fullscreenable: true,
    icon: './public/icon/logo.png',
    autoHideMenuBar: true,
    width: 1200,
    height: 1024,
  });

  mainWindow.loadFile(path.join('public/index.html'));
}

app.whenReady().then(async () => {
  await initDb();

  if (!fs.existsSync(pastaImagens)) fs.mkdirSync(pastaImagens, { recursive: true });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('init', async () => {
  const user = await getUser();
  api_Key = user !== undefined ? user.api_key : null;
  console.log(api_Key);
  return user;
});

ipcMain.handle('salvar-usuario', async (event, nome, apiKey) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO usuarios (nome, api_key) VALUES (?, ?)',
      [nome, apiKey],
      function (err) {
        if (err) {
          console.error('Erro ao salvar usuário:', err);
          return reject(err);
        }
        console.log('Usuário salvo com sucesso:', { nome, apiKey });
        resolve(true);
      }
    );
  });
});

ipcMain.handle('salvar-imagem', async (event, prompt, caminho, data) => {
  const finalPath = path.join(pastaImagens, caminho); // ← usa a pasta persistente
  const apiKey = api_Key;

  try {
    await gerarEbaixarImagem(prompt, finalPath, apiKey);

    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO imagens (prompt, caminho, data) VALUES (?, ?, ?)',
        [prompt, finalPath, data],
        function (err) {
          if (err) {
            console.error('Erro ao salvar no banco de dados:', err);
            return reject(err);
          }
          console.log('Imagem salva com sucesso:', { prompt, finalPath, data });
          resolve(true);
        }
      );
    });

    return true;
  } catch (err) {
    console.error('Erro durante geração ou salvamento da imagem:', err.message);
    return false;
  }
});

ipcMain.handle('obter-fotos', async () => {
  try {
    const registros = await getImagens();

    const mapaPrompts = {};
    registros.forEach(({ caminho, prompt }) => {
      const caminhoNormalizado = path.normalize(caminho);
      mapaPrompts[caminhoNormalizado] = prompt;
    });

    const arquivos = fs.readdirSync(pastaImagens)
      .filter(arquivo => arquivo.endsWith('.png'))
      .map(arquivo => {
        const caminhoCompleto = path.normalize(path.join(pastaImagens, arquivo));
        const stat = fs.statSync(caminhoCompleto);

        return {
          caminho: caminhoCompleto,
          nome: arquivo,
          data: new Date(stat.mtime).toLocaleString(),
          prompt: mapaPrompts[caminhoCompleto] || '(prompt não encontrado)',
        };
      })
      .sort((a, b) => new Date(b.data) - new Date(a.data));

    console.log(arquivos);
    return arquivos;
  } catch (err) {
    console.error('Erro ao obter fotos:', err);
    return [];
  }
});

ipcMain.handle('abrir-na-pasta', async (event, caminho) => {
  const caminhoNormalizado = path.normalize(caminho);
  shell.showItemInFolder(caminhoNormalizado);
});
