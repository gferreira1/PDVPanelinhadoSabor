// ==========================================
// APP.JS - Arquivo principal do sistema
// ==========================================

import { montarEstruturaPedidos, carregarPedidos } from "./pedidos.js";
import { carregarHistoricoClientes, toggleDetalhes } from "./historico.js";
import { db } from "../firebase/firebaseConfig.js";

// Deixa funções globais para botões inline
window.toggleDetalhes = toggleDetalhes;

// ------------------------------------------
// Quando a página terminar de carregar
// ------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {

  console.log("🔥 Sistema iniciado...");

  // 1️⃣ Monta a estrutura visual dos pedidos (colunas)
  montarEstruturaPedidos();

  // 2️⃣ Carrega primeiro os PEDIDOS (rápido)
  console.log("🔄 Carregando pedidos...");
  await carregarPedidos(db);

  // 3️⃣ Carrega o histórico APENAS depois (evita lentidão)
  console.log("📚 Carregando histórico de clientes...");
  setTimeout(() => {
    carregarHistoricoClientes(db);
  }, 500); // pequeno delay para não travar a interface

  // 4️⃣ Ativa a pesquisa do histórico
  ativarFiltroClientes();
});

// ------------------------------------------
// FILTRO DE CLIENTES – sem recarregar pedidos
// ------------------------------------------
function ativarFiltroClientes() {
  const inputFiltro = document.getElementById("clienteSearchInput");
  if (!inputFiltro) return;

  inputFiltro.addEventListener("input", () => {
    carregarHistoricoClientes(db, inputFiltro.value.trim());
  });
}

// ------------------------------------------
// Navegação entre seções (opcional)
// ------------------------------------------
document.querySelectorAll("[data-section]").forEach(btn => {
  btn.addEventListener("click", () => {
    const section = btn.getAttribute("data-section");

    document.querySelectorAll("section").forEach(sec => sec.style.display = "none");

    const alvo = document.getElementById(section);
    if (alvo) alvo.style.display = "block";
  });
});
