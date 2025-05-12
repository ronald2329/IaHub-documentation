async function recuperarFotos() {
    const historicoList = document.getElementById('historico-list');
    historicoList.innerHTML = '';
  
    const imagens = await window.electron.obterFotos();
  
    imagens.forEach(imagem => {
      const li = document.createElement('li');
      li.innerHTML = `
        <img src="file://${imagem.caminho}" alt="Imagem gerada" class="w-full h-auto rounded shadow cursor-pointer hover:opacity-80 transition" data-caminho="file://${imagem.caminho}" />
        <p class="text-sm text-gray-500"><strong>Criação:</strong> ${imagem.data}</p>
        <p class="text-sm text-gray-500"><strong>Prompt:</strong> ${imagem.prompt}</p>
        <p class="text-sm text-gray-500"><strong>Nome do arquivo:</strong> ${imagem.nome}</p>
        <div class="flex gap-2 mt-2">
            <button class="abrir-pasta bg-blue-500 text-white px-2 py-1 rounded text-xs" data-caminho="${imagem.caminho}">📂 Abrir na pasta</button>
            <button class="editar-imagem bg-purple-600 text-white px-2 py-1 rounded text-xs" data-caminho="${imagem.caminho}">✂️ Editar</button>
        </div>
      `;
  
      historicoList.appendChild(li);
  
      // Abrir modal ao clicar na imagem
      const img = li.querySelector('img');
      img.addEventListener('click', () => {
        const modal = document.getElementById('imagem-modal');
        const modalImg = document.getElementById('imagem-ampliada');
        modalImg.src = img.dataset.caminho;
        modal.classList.remove('hidden');
      });
  
      // 📂 Abrir na pasta
      const btnAbrir = li.querySelector('.abrir-pasta');
      btnAbrir.addEventListener('click', (e) => {
        const caminho = e.target.dataset.caminho;
        window.electron.abrirNaPasta(caminho);
      });
  
      // ✂️ Editar imagem
      const btnEditar = li.querySelector('.editar-imagem');
      btnEditar.addEventListener('click', (e) => {
        const caminho = e.target.dataset.caminho;
        const modal = document.getElementById('editar-modal');
        const img = document.getElementById('editar-img');
  
        img.src = `file://${caminho}`;
  
        img.onload = () => {
          if (window.cropper) window.cropper.destroy();
          window.cropper = new Cropper(img, {
            viewMode: 1,
            autoCropArea: 1,
            background: false,
          });
        };
  
        modal.classList.remove('hidden');
      });
    });
  }
  
  
document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.electron.obterUsuario();

    if (user) {
      document.getElementById('dados-usuario').classList.remove('hidden');
      document.getElementById('usuario-nome').textContent = user.nome;
      document.getElementById('usuario-key').textContent = '****' + user.api_key.slice(-4);

      await recuperarFotos();

      document.getElementById('btnGerarImagem').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const originalText = btn.innerHTML;
      
        // Desativa o botão e adiciona um spinner
        btn.disabled = true;
        btn.innerHTML = `<span class="animate-spin border-t-2 border-white rounded-full h-4 w-4 mr-2"></span>`;
      
        const prompt = document.getElementById('prompt').value;
        const caminho = `${Date.now()}.png`;
        const data = new Date().toLocaleString();
      
        try {
          const sucesso = await window.electron.salvarImagem(prompt, caminho, data);
      
          if (sucesso) {
            new Notification('Imagem gerada', {
              body: 'Nova imagem criada e adicionada ao seu computador com sucesso!',
              icon: '../icon/logo.png'
            });
            await recuperarFotos();
          } else {
            new Notification('Erro', {
              body: 'Erro ao gerar imagem',
              icon: '../icon/logo.png'
            });
          }
        } catch (err) {
          console.error('Erro ao gerar imagem:', err);
          alert('Erro ao gerar imagem.');
        } finally {
          // Reativa o botão e restaura o texto original
          btn.disabled = false;
          btn.innerHTML = originalText;
        }
      });
        
    } else {
      document.getElementById('modal-cadastro').classList.remove('hidden');
    }

    const form = document.getElementById('modal-usuario-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nome = document.getElementById('modal-nome').value.trim();
      const apiKey = document.getElementById('modal-apiKey').value.trim();

      if (!nome || !apiKey) {
        alert('Por favor, preencha todos os campos!');
        return;
      }

      try {
        const sucesso = await window.electron.salvarUsuario(nome, apiKey);
        if (sucesso) {
            new Notification('Cadastro Realizado', {
                body: 'Usuário salvo com sucesso!',
                icon: '../icon/logo.png' // Opcional, pode ser removido
              });
              setTimeout(() => location.reload(), 1000);
              
        }
      } catch (err) {
        console.error('Erro ao salvar usuário:', err);
        alert('Erro ao salvar usuário.');
      }
    });

    // Fechar modal de edição
document.getElementById('fechar-editar-modal').addEventListener('click', () => {
    document.getElementById('editar-modal').classList.add('hidden');
    if (window.cropper) {
      window.cropper.destroy();
      window.cropper = null;
    }
  });
  
  // Salvar imagem recortada
  document.getElementById('salvar-editada').addEventListener('click', () => {
    if (window.cropper) {
      window.cropper.getCroppedCanvas().toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `editada-${Date.now()}.png`;
        a.click();
      }, 'image/png');
    }
  });
  

    document.getElementById('fechar-modal').addEventListener('click', () => {
        document.getElementById('imagem-modal').classList.add('hidden');
      });
      
      document.getElementById('imagem-modal').addEventListener('click', (e) => {
        console.log('clicado:', e.target, e.currentTarget);
        if (e.target === e.currentTarget) {
          e.currentTarget.classList.add('hidden');
        }
      });
  });

  
  