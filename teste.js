  function montarEstruturaPedidos() {
    const ordersSection = document.getElementById('ordersSection');
    ordersSection.innerHTML = `
      <div class="container-fluid">
        <div class="status-columns">
          <div class="status-column">
            <div class="recebido-header status-header">
              <i class="bi bi-hourglass-top me-2"></i>Recebido
            </div>
            <div id="recebidos-container" class="pedidos-container"></div>
          </div>
          <div class="status-column">
            <div class="producao-header status-header">
              <i class="bi bi-gear-wide-connected me-2"></i>Em Produção
            </div>
            <div id="producao-container" class="pedidos-container"></div>
          </div>
          <div class="status-column">
            <div class="finalizado-header status-header">
              <i class="bi bi-check-circle me-2"></i>Finalizadoo
            </div>
            <div id="finalizado-container" class="pedidos-container"></div>
          </div>
        </div>
      </div>
    `;
  }

async function carregarPedidos() {
  const pedidosSnapshot = await getDocs(collection(db, 'pedidos'));
  const pedidos = pedidosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const recebidosContainer = document.getElementById('recebidos-container');
  const producaoContainer = document.getElementById('producao-container');
  const finalizadoContainer = document.getElementById('finalizado-container');

  if (!recebidosContainer || !producaoContainer || !finalizadoContainer) return;

  recebidosContainer.innerHTML = '';
  producaoContainer.innerHTML = '';
  finalizadoContainer.innerHTML = '';

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1; // 1 a 12
  const anoAtual = hoje.getFullYear();

  let totalRecebidos = 0;
  let totalProducao = 0;
  let totalFinalizadosMes = 0;

  // Ordena do mais recente para o mais antigo
  pedidos.sort((a, b) => {
    const dataA = a.data ? new Date(a.data.split('/').reverse().join('-')) : new Date(0);
    const dataB = b.data ? new Date(b.data.split('/').reverse().join('-')) : new Date(0);
    return dataB - dataA; // mais recente primeiro
  });

  pedidos.forEach(pedido => {
    const status = typeof pedido.status === 'string' ? pedido.status.toLowerCase() : 'desconhecido';

    const itensFormatados = (Array.isArray(pedido.itens)
      ? pedido.itens
      : (typeof pedido.itens === 'string' ? pedido.itens.split(',') : [])
    ).map(item => {
      if (typeof item === 'object' && item !== null) {
        const nome = item.nome || item.produto || 'Item';
        const qtd = item.quantidade || item.qtd || 1;
        return `<li>• ${qtd}x ${nome}</li>`;
      } else {
        return `<li>• ${String(item).trim()}</li>`;
      }
    }).join('');

    const cardHTML = `
      <div class="pedido-card status-${status}">
        <div class="pedido-info">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="mb-2">${pedido.id}</h5>
              <small class="text-muted"><strong>Data:</strong> ${pedido.data || ''}</small><br>  
              <small class="text-muted">${pedido.horario || ''}</small>
            </div>

            ${status === 'recebido' ? `
              <div class="dropdown ms-2">
                <button class="btn btn-sm btn-light" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item text-danger" href="#" onclick="excluirPedido('${pedido.id}')">
                      🗑 Cancelar Pedido
                    </a>
                  </li>
                </ul>
              </div>
            ` : ''}

          </div>

          <p class="mb-1"><strong>Cliente:</strong> ${pedido.cliente}</p>
          <p class="mb-2"><strong>Valor:</strong> ${pedido.valor}</p>        
          <div class="detalhes-pedido ${status !== 'finalizado' ? 'show' : ''}">
            <div class="border-top pt-2 mt-2">
              <p class="mb-1"><strong>Itens:</strong></p>
              <ul class="list-unstyled ps-3">
                ${itensFormatados}
              </ul>
              <p class="mb-1"><strong>Pagamento:</strong> ${pedido.pagamento || 'Não informado'}</p>
              ${pedido.observacoes ? `<p class="mb-1"><strong>Observações:</strong> ${pedido.observacoes}</p>` : ''}
            </div>
          </div>
        </div>

        <div class="pedido-actions mt-2">
          ${status === 'recebido' ? `
            <button class="btn btn-sm btn-primary w-100 mb-2" onclick="mudarStatus('${pedido.id}', 'producao')">
              <i class="bi bi-play-fill me-1"></i> Produzir
            </button>
          ` : ''}

          ${status === 'producao' ? `
            <button class="btn btn-sm btn-success w-100 mb-2" onclick="mudarStatus('${pedido.id}', 'finalizado')">
              <i class="bi bi-check-lg me-1"></i> Finalizar
            </button>
          ` : ''}

          <button class="btn btn-sm btn-outline-secondary btn-detalhes w-100" onclick="toggleDetalhes(this)">
            <i class="bi bi-list-ul me-1"></i> Detalhes
          </button>
        </div>
      </div>
    `;

    if (status === 'recebido') {
      recebidosContainer.insertAdjacentHTML('beforeend', cardHTML);
      totalRecebidos++;
    } else if (status === 'producao') {
      producaoContainer.insertAdjacentHTML('beforeend', cardHTML);
      totalProducao++;
    } else if (status === 'finalizado') {
      // Filtra apenas do mês atual
      if (pedido.data) {
        const [dia, mes, ano] = pedido.data.split('/').map(Number);
        if (mes === mesAtual && ano === anoAtual) {
          finalizadoContainer.insertAdjacentHTML('beforeend', cardHTML);
          totalFinalizadosMes++;
        }
      }
    }
  });

  // Atualiza os headers com a quantidade
  const headerRecebidos = document.querySelector('.recebido-header');
  const headerProducao = document.querySelector('.producao-header');
  const headerFinalizado = document.querySelector('.finalizado-header');

  if (headerRecebidos) headerRecebidos.innerHTML = `<i class="bi bi-hourglass-top me-2"></i>Recebido (${totalRecebidos})`;
  if (headerProducao) headerProducao.innerHTML = `<i class="bi bi-gear-wide-connected me-2"></i>Em Produção (${totalProducao})`;
  if (headerFinalizado) headerFinalizado.innerHTML = `<i class="bi bi-check-circle me-2"></i>Finalizado (${totalFinalizadosMes})`;
}