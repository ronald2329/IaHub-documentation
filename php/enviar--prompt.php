<?php
$url = "https://api.iahub.site/chat";

$data = [
    "model" => "MODELO_DE_IA",
    "messages" => [
        [
            "role" => "system",
            "content" => "INSTRUÇÕES_DE_COMO_O_SISTEMA_DEVE_SE_COMPORTAR!"
        ],
        [
            "role" => "user",
            "content" => "PROMPT"
        ]
        ],
];

$XApiKey = '';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "x-api-key: ".$XApiKey
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) {
    echo $chunk;
    return strlen($chunk);
});

curl_exec($ch);
curl_close($ch);

