import requests
import time
import json

# Início do cronômetro
inicio = time.time()

# Endpoint e cabeçalhos
url = "http://api.iahub.site/chat"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "SUA_API_KEY"
}

# Corpo da requisição
payload = {
    "model": "MODELO_DE_IA",
    "messages": [
        {
            "role": "system",
            "content": "INSTRUÇÕES_DE_COMO_O_SISTEMA_DEVE_SE_COMPORTAR!"
        },
        {
            "role": "user",
            "content": "PROMPT"
        }
    ]
}

# Envio da requisição
response = requests.post(url, headers=headers, data=json.dumps(payload))

# Fim do cronômetro
fim = time.time()
print(f"⏱ Tempo de resposta: {fim - inicio:.2f} segundos")

# Processamento da resposta
try:
    data = response.json()
    resposta = data.get("message", {}).get("content") or data.get("response") or json.dumps(data)
    print("✅ Resposta final:", resposta)
except Exception as e:
    print("❌ Erro ao processar resposta:", str(e))
