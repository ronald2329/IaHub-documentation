const { contextBridge, ipcRenderer,shell } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  salvarUsuario: (nome, apiKey) => ipcRenderer.invoke('salvar-usuario', nome, apiKey),
  obterUsuario: () => ipcRenderer.invoke('init'),
  salvarImagem: (prompt, caminho, data) =>
    ipcRenderer.invoke('salvar-imagem', prompt, caminho, data),
  obterFotos: () => ipcRenderer.invoke('obter-fotos'),
  abrirNaPasta: (caminho) => ipcRenderer.invoke('abrir-na-pasta', caminho),
  
});
