<?php
header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['image'])) {
        echo json_encode(['success' => false, 'message' => 'Nenhuma imagem recebida']);
        exit;
    }

    // Remove prefixo base64
    $imageData = str_replace('data:image/jpeg;base64,', '', $data['image']);
    $imageData = str_replace(' ', '+', $imageData);
    $image = base64_decode($imageData);

    if ($image === false) {
        echo json_encode(['success' => false, 'message' => 'Erro ao decodificar imagem']);
        exit;
    }

    // Caminho da pasta
    $baseDir = __DIR__ . '/../imagens';
    $monthDir = $baseDir . '/NF' . date('Y-m');

    // Cria a pasta se não existir
    if (!is_dir($monthDir)) {
        mkdir($monthDir, 0777, true);
    }

    $filename = $monthDir . '/nota_' . date('Ymd_His') . '.jpg';

    if (file_put_contents($filename, $image)) {
        echo json_encode([
            'success' => true,
            'message' => 'Imagem salva com sucesso!',
            'file' => 'imagens/NF' . date('Y-m') . '/' . basename($filename)
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar imagem']);
    }
} catch (Throwable $e) {
    echo json_encode(['success' => false, 'message' => 'Exceção: ' . $e->getMessage()]);
}
