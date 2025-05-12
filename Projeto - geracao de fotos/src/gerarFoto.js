import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

export async function gerarEbaixarImagem(prompt, caminho, api_key) {
  if (!prompt || !api_key) {
    throw new Error('Prompt ou API Key ausente.');
  }

  console.time('Tempo de geração da imagem');

  const response = await fetch('https://api.iahub.site/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'x-api-key': api_key
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao gerar imagem: ${errorText}`);
  }

  const buffer = await response.arrayBuffer();

  // Garante que a pasta de destino existe
  const dir = path.dirname(caminho);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(caminho, Buffer.from(buffer));

  console.log(`✅ Imagem salva em: ${caminho}`);
  console.timeEnd('Tempo de geração da imagem');
}
