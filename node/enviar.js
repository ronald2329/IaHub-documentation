console.time("⏱ Tempo de resposta"); // Inicia o cronômetro

fetch("http://api.iahub.site/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "SUA_API_KEY",
  },
  body:{
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

  })
  .then((response) => {
    console.timeEnd("⏱ Tempo de resposta"); // Termina o cronômetro assim que a resposta for recebida
    return response.json();
  })
  .then((data) => {
    const resposta =
      data.message?.content || data.response || JSON.stringify(data);
    console.log("✅ Resposta final:", resposta);
  })