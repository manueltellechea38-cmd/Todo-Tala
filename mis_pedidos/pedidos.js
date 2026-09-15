let filtroEstadoPedido = "";
const listaMisPedidos = document.getElementById("lista-pedidos");
const usuarioPedidos = TodoTala.usuarioActual();

function renderizarMisPedidos() {
    const datos = TodoTala.obtenerDatos();
    const pedidos = datos.pedidos.filter(function (pedido) {
        const pertenece = !pedido.clienteId || pedido.clienteId === usuarioPedidos.id;
        const coincideEstado = !filtroEstadoPedido || pedido.estado === filtroEstadoPedido;
        return pertenece && coincideEstado;
    });

    if (pedidos.length === 0) {
        listaMisPedidos.innerHTML = '<p class="empty-state">No hay pedidos en este estado.</p>';
        return;
    }

    listaMisPedidos.innerHTML = pedidos.map(function (pedido) {
        const mostrarCodigo = !["Rechazado", "Cancelado"].includes(pedido.estado);
        return '<article class="order-card">' +
            '<header class="order-head"><strong>Pedido #' + pedido.id + '</strong><span class="' + TodoTala.claseEstado(pedido.estado) + '">' + pedido.estado + '</span></header>' +
            '<p class="muted">' + pedido.comercio + ' · ' + pedido.fecha + '</p>' +
            '<p>' + pedido.items.join(" · ") + '</p>' +
            '<p><strong>Total: ' + TodoTala.formatearPrecio(pedido.total) + '</strong></p>' +
            (mostrarCodigo ? '<section class="pickup-code"><span>Código de retiro</span><strong>' + pedido.codigo + '</strong></section>' : '') +
        '</article>';
    }).join("");
}

document.querySelectorAll("[data-estado]").forEach(function (boton) {
    boton.addEventListener("click", function () {
        filtroEstadoPedido = boton.dataset.estado;
        document.querySelectorAll("[data-estado]").forEach(function (otro) {
            otro.classList.remove("active");
        });
        boton.classList.add("active");
        renderizarMisPedidos();
    });
});

renderizarMisPedidos();