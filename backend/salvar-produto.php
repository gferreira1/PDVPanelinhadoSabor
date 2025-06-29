<?php
include 'db-config.php';

$dados = json_decode(file_get_contents("php://input"), true);
$nome = $dados['nome'];
$preco = $dados['preco'];

$stmt = $conexao->prepare("INSERT INTO produtos (nome, preco) VALUES (?, ?)");
$stmt->bind_param("sd", $nome, $preco);
$stmt->execute();

echo json_encode(["status" => "sucesso"]);
?>
