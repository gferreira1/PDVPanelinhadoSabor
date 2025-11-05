<?php
header('Content-Type: application/json');

// Lê o corpo JSON enviado pelo fetch
$data = json_decode(file_get_contents("php://input"), true);
$imageData = $data['image'] ?? '';

if (!$imageData) {
    echo json_encode(['success' => false, 'message' => 'Nenhuma imagem recebida']);
    exit;
}

// Remove o prefixo base64
$image = str_replace('data:image/jpeg;base64,', '', $imageData);
$image = str_replace(' ', '+', $image);
$image = base64_decode($image);

// Caminho para salvar (ajuste conforme seu ambiente)
$baseDir = __DIR__ . '/../imagens'; // sobe 1 nível e vai pra /imagens
$subDir = 'NF' . date('Y-m');       // cria pasta tipo NF2025-11
$dir = $baseDir . '/' . $subDir;

// Cria a pasta se não existir
if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
}

// Nome do arquivo
$filename = $dir . '/nota_' . date('Ymd_His') . '.jpg';

// Tenta salvar
if (file_put_contents($filename, $image)) {
    echo json_encode([
        'success' => true,
        'message' => 'Imagem salva com sucesso!',
        'path' => $filename
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao salvar imagem',
        'dir' => $dir,
        'dir_exists' => is_dir($dir),
        'writable' => is_writable($dir)
    ]);
}
?>
