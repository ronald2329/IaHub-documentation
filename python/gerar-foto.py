import requests
import time

def gerar_e_baixar_imagem(prompt):
    url = 'https://api.iahub.site/generate-image'
    headers = {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'x-api-key': 'SUA_API_KEY'
    }
    data = { 'prompt': prompt }

    print('Gerando imagem... ')
    start_time = time.time()

    response = requests.post(url, json=data, headers=headers)

    if response.status_code != 200:
        print('Erro ao gerar imagem:', response.text)
        return

    with open('gerando-imagem-local.png', 'wb') as f:
        f.write(response.content)

    print('✅ Imagem salva como: gerando-imagem-local.png')
    print(f'Gerando imagem... {round(time.time() - start_time, 2)} segundos')

# Exemplo de uso:
gerar_e_baixar_imagem('A flying shark with mechanical wings, blue sky background, digital art')
