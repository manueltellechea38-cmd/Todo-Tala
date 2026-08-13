/* Guarda el estado seleccionado para filtrar pedidos. */
let filtroEstadoPedido = "";
/* Obtiene el contenedor de pedidos. */
const listaMisPedidos = document.getElementById("lista-pedidos");

/* Renderiza los pedidos del cliente. */
function renderizarMisPedidos() {
    /* Obtiene datos actuales. */
    const datos = TodoTala.obtenerDatos();
    /* Filtra por el estado elegido. */
    const pedidos = datos.pedidos.filter(function (pedido) { return !filtroEstadoPedido || pedido.estado === filtroEstadoPedido; });
    /* Limpia el contenedor. */
    listaMisPedidos.innerHTML = "";
    /* Muestra un estado vacío si no hay coincidencias. */
    if (pedidos.length === 0) {
        /* Inserta mensaje. */
        listaMisPedidos.innerHTML = '<div class="empty-state">No hay pedidos en este estado.</div>';
        /* Finaliza. */
        return;
    }
    /* Recorre pedidos. */
    pedidos.forEach(function (pedido) {
        /* Crea una tarjeta. */
        const tarjeta = document.createElement("article");
        /* Asigna clase visual. */
        tarjeta.className = "order-card";
        /* Decide si el código debe destacarse. */
        const mostrarCodigo = pedido.estado !== "Rechazado" && pedido.estado !== "Cancelado";
        /* Construye contenido. */
        tarjeta.innerHTML = '<div class="order-head"><div><strong>Pedido #' + pedido.id + '</strong><p class="muted">' + pedido.comercio + ' · ' + pedido.fecha + '</p></div><span class="' + TodoTala.claseEstado(pedido.estado) + '">' + pedido.estado + '</span></div>' +
            '<p style="margin-top:10px;">' + pedido.items.join(" · ") + '</p><p style="margin-top:6px;"><strong>Total: ' + TodoTala.formatearPrecio(pedido.total) + '</strong></p>' +
            (mostrarCodigo ? '<div class="pickup-code"><span>Código para retirar</span><strong>' + pedido.codigo + '</strong><small class="muted">Mostralo en el local. No es un QR.</small></div>' : '');
        /* Agrega la tarjeta. */
        listaMisPedidos.appendChild(tarjeta);
    });
}

/* Configura cada pestaña de filtro. */
document.querySelectorAll("[data-estado]").forEach(function (boton) {
    /* Escucha clic. */
    boton.addEventListener("click", function () {
        /* Guarda el estado asociado. */
        filtroEstadoPedido = boton.dataset.estado;
        /* Quita active a todas las pestañas. */
        document.querySelectorAll("[data-estado]").forEach(function (otro) { otro.classList.remove("active"); });
        /* Marca la pestaña actual. */
        boton.classList.add("active");
        /* Renderiza de nuevo. */
        renderizarMisPedidos();
    });
});

/* Regresa al catálogo. */
document.getElementById("btn-volver").addEventListener("click", function () { TodoTala.irA("../catalogo_cliente/todo_tala_catalogo_cliente.html"); });
/* Renderiza al cargar. */
renderizarMisPedidos();
