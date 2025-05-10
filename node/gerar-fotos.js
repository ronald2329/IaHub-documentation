const fs = require('fs');

async function gerarEbaixarImagem(prompt) {

    console.time('Gerando imagem... ')
  const response = await fetch('https://api.iahub.site/generate-image', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Accept-Encoding' : 'gzip, deflate',
        'x-api-key':'SUA_API_KEY'
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    console.error('Erro ao gerar imagem:', await response.text());
    return;
  }

  const buffer = await response.arrayBuffer();
  fs.writeFileSync('gerando-imagem-local.png', Buffer.from(buffer));
  console.log('✅ Imagem salva como: gerando-imagem-local.png');
  console.timeEnd('Gerando imagem... ')

}

gerarEbaixarImagem('A flying shark with mechanical wings, blue sky background, digital art');
