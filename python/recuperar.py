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

# Envio da requisição
response = requests.get(url, headers=headers)

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
