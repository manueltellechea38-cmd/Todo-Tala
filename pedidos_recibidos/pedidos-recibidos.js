/* Guarda el filtro actual. */
let filtroRecibidos = "";
/* Obtiene el listado. */
const listaRecibidos = document.getElementById("lista-pedidos");

/* Cambia el estado de un pedido. */
function cambiarEstadoPedido(id, estado) {
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Busca pedido. */
    const pedido = datos.pedidos.find(function (elemento) { return elemento.id === id; });
    /* Detiene si no existe. */
    if (!pedido) return;
    /* Actualiza estado. */
    pedido.estado = estado;
    /* Guarda. */
    TodoTala.guardarDatos(datos);
    /* Informa. */
    TodoTala.toast("Pedido actualizado a: " + estado);
    /* Refresca. */
    renderizarPedidosRecibidos();
}

/* Renderiza pedidos asociados al comercio demo. */
function renderizarPedidosRecibidos() {
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Filtra comercio y estado. */
    const pedidos = datos.pedidos.filter(function (pedido) { return pedido.comercio === "Panadería El Sol" && (!filtroRecibidos || pedido.estado === filtroRecibidos); });
    /* Limpia. */
    listaRecibidos.innerHTML = "";
    /* Estado vacío. */
    if (pedidos.length === 0) {
        /* Muestra mensaje. */
        listaRecibidos.innerHTML = '<div class="empty-state">No hay pedidos en este estado para Panadería El Sol.</div>';
        /* Finaliza. */
        return;
    }
    /* Recorre pedidos. */
    pedidos.forEach(function (pedido) {
        /* Crea tarjeta. */
        const tarjeta = document.createElement("article");
        /* Asigna clase. */
        tarjeta.className = "received-order";
        /* Construye acciones según estado. */
        let acciones = "";
        /* Si está pendiente permite aceptar o rechazar. */
        if (pedido.estado === "Pendiente") acciones = '<button class="btn btn--primary" data-next="Aceptado" type="button">Aceptar</button><button class="btn btn--danger" data-next="Rechazado" type="button">Rechazar</button>';
        /* Si está aceptado permite preparar. */
        if (pedido.estado === "Aceptado") acciones = '<button class="btn btn--primary" data-next="En preparación" type="button">Iniciar preparación</button>';
        /* Si está en preparación permite marcar listo. */
        if (pedido.estado === "En preparación") acciones = '<button class="btn btn--primary" data-next="Listo para retirar" type="button">Marcar listo</button>';
        /* Si está listo muestra verificación de código. */
        const verificacion = pedido.estado === "Listo para retirar" ? '<div class="code-check"><input type="text" placeholder="Código que muestra el cliente" data-code-input><button class="btn btn--primary" data-validar type="button">Validar y entregar</button></div>' : '';
        /* Define contenido. */
        tarjeta.innerHTML = '<div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;"><div><strong>Pedido #' + pedido.id + '</strong><p class="muted">' + pedido.fecha + ' · ' + pedido.items.join(" · ") + '</p></div><span class="' + TodoTala.claseEstado(pedido.estado) + '">' + pedido.estado + '</span></div><p style="margin-top:8px;"><strong>Total: ' + TodoTala.formatearPrecio(pedido.total) + '</strong></p><div class="order-actions">' + acciones + '</div>' + verificacion;
        /* Conecta botones de cambio de estado. */
        tarjeta.querySelectorAll("[data-next]").forEach(function (boton) { boton.addEventListener("click", function () { cambiarEstadoPedido(pedido.id, boton.dataset.next); }); });
        /* Busca botón de validación si existe. */
        const botonValidar = tarjeta.querySelector("[data-validar]");
        /* Configura validación si corresponde. */
        if (botonValidar) {
            /* Escucha clic. */
            botonValidar.addEventListener("click", function () {
                /* Lee código ingresado. */
                const ingresado = tarjeta.querySelector("[data-code-input]").value.trim().toUpperCase();
                /* Compara con el código real. */
                if (ingresado !== pedido.codigo.toUpperCase()) {
                    /* Informa error. */
                    TodoTala.toast("Código incorrecto");
                    /* Finaliza. */
                    return;
                }
                /* Marca como entregado. */
                cambiarEstadoPedido(pedido.id, "Entregado");
            });
        }
        /* Agrega tarjeta. */
        listaRecibidos.appendChild(tarjeta);
    });
}

/* Configura filtros. */
document.querySelectorAll("[data-estado]").forEach(function (boton) {
    /* Escucha clic. */
    boton.addEventListener("click", function () {
        /* Guarda filtro. */
        filtroRecibidos = boton.dataset.estado;
        /* Quita active. */
        document.querySelectorAll("[data-estado]").forEach(function (otro) { otro.classList.remove("active"); });
        /* Marca actual. */
        boton.classList.add("active");
        /* Refresca. */
        renderizarPedidosRecibidos();
    });
});

/* Vuelve al panel. */
document.getElementById("btn-volver").addEventListener("click", function () { TodoTala.irA("../panel_comercio/todo_tala_panel_comercio.html"); });
/* Renderiza al cargar. */
renderizarPedidosRecibidos();
