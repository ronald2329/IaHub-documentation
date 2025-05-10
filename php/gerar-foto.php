<?php

function gerarEBaixarImagem($prompt) {
    $url = 'https://api.iahub.site/generate-image';
    $apiKey = 'SUA_API_KEY';

    $data = json_encode(['prompt' => $prompt]);

    $headers = [
        'Content-Type: application/json',
        'Accept-Encoding: gzip, deflate',
        'x-api-key: ' . $apiKey
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_ENCODING, ''); // habilita gzip/deflate

    echo "Gerando imagem...\n";
    $start = microtime(true);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($http_code !== 200) {
        echo "Erro ao gerar imagem: " . $response . "\n";
        curl_close($ch);
        return;
    }

    curl_close($ch);

    file_put_contents('gerando-imagem-local.png', $response);
    echo "✅ Imagem salva como: gerando-imagem-local.png\n";

    $end = microtime(true);
    $elapsed = round($end - $start, 2);
    echo "Gerando imagem... {$elapsed} segundos\n";
}

gerarEBaixarImagem('A flying shark with mechanical wings, blue sky background, digital art');
