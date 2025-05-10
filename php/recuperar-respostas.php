<?php
$url = "https://api.iahub.site/chat";
$XApiKey = '';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "x-api-key: ".$XApiKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) {
    echo $chunk;
    return strlen($chunk);
});

curl_exec($ch);
curl_close($ch);

