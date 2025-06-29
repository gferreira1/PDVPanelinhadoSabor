import { salvarNoFirebase } from './frontend/firebase-service.js';

document.querySelectorAll('.btn-salvar').forEach(btn => {
  btn.addEventListener('click', async () => {
    const produtoEl = btn.closest('.product');
    const nome = produtoEl.querySelector('.nome-produto').innerText;
    const precoTexto = produtoEl.querySelector('.preco-produto').innerText;
    const imagem = produtoEl.querySelector('.img-produto').getAttribute('src');

    const preco = parseFloat(precoTexto.replace('R$', '').replace(',', '.'));

    const produto = { nome, preco, imagem };

    await salvarNoFirebase(produto);
    alert('Produto salvo no Firebase!');
  });
});
