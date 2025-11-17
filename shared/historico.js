// shared/historico.js
// ----------------------
// Utilidades de data
// ----------------------
export function parseData(d) {
  if (!d) return null;

  // ISO (AAAA-MM-DD)
  if (d.includes("-")) return new Date(d);

  // DD/MM/AAAA
  const partes = d.split("/");
  if (partes.length !== 3) return null;

  const [dia, mes, ano] = partes;
  return new Date(`${ano}-${mes}-${dia}`);
}

// ----------------------
// Alternar detalhes (caso use)
// ----------------------
export function toggleDetalhes(btn) {
  const detalhes = btn.nextElementSibling;
  if (!detalhes) return;
  detalhes.style.display =
    detalhes.style.display === "none" ? "block" : "none";
}

// ----------------------
// Carregar histórico
// ----------------------
export async function carregarHistoricoClientes(db) {
  const container = document.querySelector("#clientsSection .cards-container");
  if (!container)
    return console.warn("Container histórico clientes não encontrado");

  container.innerHTML = "Carregando histórico de clientes...";

  try {
    const { getDocs, collection } = await import(
      "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
    );

    const snapshot = await getDocs(collection(db, "pedidos"));

    if (snapshot.empty) {
      container.innerHTML = "<p>Nenhum pedido encontrado.</p>";
      return;
    }

    // Últimos 2 meses (quando não estiver pesquisando)
    const hoje = new Date();
    const doisMesesAtras = new Date();
    doisMesesAtras.setMonth(hoje.getMonth() - 2);

    // Campo de busca
    const termoBuscaEl = document.querySelector("#clienteSearchInput");
    const termo = termoBuscaEl ? termoBuscaEl.value.trim().toLowerCase() : "";
    const modoPesquisa = termo.length > 0;

    const clientes = {};

    snapshot.forEach((docSnap) => {
      const pedido = docSnap.data();
      const id = docSnap.id;

      const dataPedido = parseData(pedido.data);
      if (!dataPedido || isNaN(dataPedido.getTime())) return;

      const nome = pedido.cliente || "Cliente sem nome";
      const telefone = pedido.telefone || "Telefone não informado";
      const endereco = pedido.endereco || "Endereço não informado";
      const itens = pedido.itens || [];
      const valor = pedido.valor || 0;

      // -------------------------
      // FILTRO DE DATAS / PESQUISA
      // -------------------------
      if (!modoPesquisa) {
        // SEM PESQUISA → últimos 2 meses
        if (dataPedido < doisMesesAtras) return;
      } else {
        // COM PESQUISA → busca total
        const itensTexto = Array.isArray(itens)
          ? itens
              .map((i) =>
                typeof i === "object"
                  ? i.nome || i.produto || "item"
                  : i
              )
              .join(" ")
              .toLowerCase()
          : String(itens).toLowerCase();

        const match =
          nome.toLowerCase().includes(termo) ||
          telefone.toLowerCase().includes(termo) ||
          endereco.toLowerCase().includes(termo) ||
          itensTexto.includes(termo) ||
          String(id).toLowerCase().includes(termo);

        if (!match) return;
      }

      // Agrupar cliente
      const key = nome + "|" + telefone;

      if (!clientes[key]) {
        clientes[key] = {
          nome,
          telefone,
          endereco,
          pedidos: [],
        };
      }

      clientes[key].pedidos.push({
        id,
        data: pedido.data,
        itens,
        valor,
      });
    });

    // -------------------------
    // ORDENAR clientes pela data do último pedido (MAIS RECENTE PRIMEIRO)
    // -------------------------
    const listaClientes = Object.values(clientes).sort((a, b) => {
      const dataA = parseData(a.pedidos.sort((x, y) => parseData(y.data) - parseData(x.data))[0].data);
      const dataB = parseData(b.pedidos.sort((x, y) => parseData(y.data) - parseData(x.data))[0].data);
      return dataB - dataA;
    });

    // ----------------------
    // MONTAR HTML
    // ----------------------
    let html = "";

    for (const cliente of listaClientes) {
      const pedidosOrdenados = cliente.pedidos.sort(
        (a, b) => parseData(b.data) - parseData(a.data)
      );

      const ultimoPedido = pedidosOrdenados[0];
      const pedidosAnteriores = pedidosOrdenados.slice(1);

      // Total gasto
      const totalGasto = pedidosOrdenados.reduce((acc, p) => {
        let val = 0;
        if (typeof p.valor === "string") {
          val =
            parseFloat(
              p.valor.replace(/[^\d,.-]/g, "").replace(",", ".")
            ) || 0;
        } else {
          val = p.valor;
        }
        return acc + val;
      }, 0);

      // Itens do último pedido
      const itensUltimoPedidoHtml = Array.isArray(ultimoPedido.itens)
        ? ultimoPedido.itens
            .map((item) => {
              if (typeof item === "object") {
                const nm = item.nome || item.produto || "Item";
                const qtd = item.quantidade || item.qtd || 1;
                return `<li>• ${qtd}x ${nm}</li>`;
              } else {
                return `<li>• ${item}</li>`;
              }
            })
            .join("")
        : "";

      // -------------------------
      // CARROSSEL → pedidos anteriores
      // -------------------------

      const pedidosAnterioresHtml =
        pedidosAnteriores.length > 0
          ? `
            <div class="carrossel-anteriores">
              ${pedidosAnteriores
                .map(
                  (p) => `
                <div class="card-anterior">
                  <h6>Pedido #${p.id}</h6>
                  <small>${p.data}</small>
                  <div class="itens-anteriores">
                    ${
                      Array.isArray(p.itens)
                        ? p.itens
                            .map((i) =>
                              typeof i === "object"
                                ? (i.quantidade || i.qtd || 1) +
                                  "x " +
                                  (i.nome || i.produto || "Item")
                                : i
                            )
                            .join("<br>")
                        : p.itens
                    }
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          `
          : "<p>Sem pedidos anteriores</p>";

      // ----------------------
      // CARD COMPLETO
      // ----------------------
      html += `
        <div class="pedido-card">
          <div class="pedido-info">
            <h5 class="mb-1">Último Pedido: <strong>#${ultimoPedido.id}</strong></h5>

            <h5>Cliente: ${cliente.nome}</h5>
            <p><strong>Telefone:</strong> ${cliente.telefone}</p>
            <p><strong>Endereço:</strong> ${cliente.endereco}</p>

            <p><strong>Itens do Último Pedido:</strong></p>
            <ul>${itensUltimoPedidoHtml}</ul>

            <p><strong>Data:</strong> ${ultimoPedido.data}</p>
            <p><strong>Total de Pedidos:</strong> ${pedidosOrdenados.length}</p>
            <p><strong>Total Gasto:</strong> R$ ${totalGasto.toFixed(2)}</p>

            <p><strong>Pedidos Anteriores:</strong></p>
            ${pedidosAnterioresHtml}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  } catch (erro) {
    console.error("Erro ao carregar histórico de clientes:", erro);
    container.innerHTML = "<p>Erro ao carregar histórico.</p>";
  }
}

// ----------------------
// FILTRO EM TEMPO REAL
// ----------------------
import { db } from "../firebase/firebaseConfig.js";

document.addEventListener("input", (e) => {
  if (e.target.id === "clienteSearchInput") {
    carregarHistoricoClientes(db);
  }
});
