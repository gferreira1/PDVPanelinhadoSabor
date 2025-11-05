<?php
header('Content-Type: application/json');

// Recebe os dados enviados pelo fetch
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['image'])) {
  echo json_encode(['success' => false, 'message' => 'Imagem não recebida']);
  exit;
}

// Remove o cabeçalho base64 e decodifica a imagem
$imgData = str_replace('data:image/jpeg;base64,', '', $data['image']);
$imgData = str_replace(' ', '+', $imgData);
$image = base64_decode($imgData);

// Cria a pasta do mês automaticamente
$dir = __DIR__ . '/../nf/' . date('Y-m');
if (!is_dir($dir)) mkdir($dir, 0777, true);

// Gera um nome de arquivo único
$filename = $dir . '/nota_' . date('Ymd_His') . '.jpg';

// Salva o arquivo
if (file_put_contents($filename, $image)) {
  echo json_encode(['success' => true, 'message' => 'Nota salva: ' . basename($filename)]);
} else {
  echo json_encode(['success' => false, 'message' => 'Erro ao salvar imagem']);
}
?>
