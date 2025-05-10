console.time("⏱ Tempo de resposta"); // Inicia o cronômetro

fetch("http://api.iahub.site/chat", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "SUA_API_KEY",
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