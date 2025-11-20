<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
    // Lê o corpo da requisição
    $json = file_get_contents('php://input');
    if (!$json) {
        echo json_encode(['success' => false, 'message' => 'Nenhum dado recebido']);
        exit;
    }

    $data = json_decode($json, true);
    if (!isset($data['image'])) {
        echo json_encode(['success' => false, 'message' => 'Imagem não recebida']);
        exit;
    }

    $imgData = $data['image'];

    // Remove o prefixo do base64
    $imgData = str_replace('data:image/jpeg;base64,', '', $imgData);
    $imgData = str_replace(' ', '+', $imgData);
    $decodedData = base64_decode($imgData);
// Remove o prefixo base64
$image = str_replace('data:image/jpeg;base64,', '', $imageData);
$image = str_replace(' ', '+', $image);
$image = base64_decode($image);

// Caminho para salvar (ajuste conforme seu ambiente)
$baseDir = __DIR__ . '/../imagens'; // sobe 1 nível e vai pra /imagens
$subDir = 'NF' . date('Y-m');       // cria pasta tipo NF2025-11
$dir = $baseDir . '/' . $subDir;

    if (!$decodedData) {
        echo json_encode(['success' => false, 'message' => 'Erro ao decodificar imagem']);
        exit;
    }

    // Caminho da pasta onde salvar
    $folder = __DIR__ . '/../imagens/NF2025-11/';
    if (!file_exists($folder)) {
        mkdir($folder, 0777, true);
    }

    // Nome do arquivo com data/hora
    $fileName = 'nota_' . date('Ymd_His') . '.jpg';
    $filePath = $folder . $fileName;

    // Salva a imagem
    if (file_put_contents($filePath, $decodedData)) {
        echo json_encode([
            'success' => true,
            'message' => 'Imagem salva com sucesso!',
            'file' => 'imagens/NF2025-11/' . $fileName
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar imagem no servidor']);
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Exceção: ' . $e->getMessage()
    ]);
}
?>
