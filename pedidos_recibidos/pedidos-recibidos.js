let filtroRecibidos = "";
const listaRecibidos = document.getElementById("lista-pedidos");
const usuarioPedidos = TodoTala.usuarioActual();

function cambiarEstadoPedido(id, estado) {
    const datos = TodoTala.obtenerDatos();
    const pedido = datos.pedidos.find(function (item) {
        return item.id === id && item.comercioId === usuarioPedidos.comercioId;
    });

    if (!pedido) return;

    pedido.estado = estado;

    if (estado === "Listo para retirar") {
        const ahora = Date.now();
        pedido.listoDesde = new Date(ahora).toISOString();
        pedido.venceRetiro = new Date(ahora + 48 * 60 * 60 * 1000).toISOString();
    }

    TodoTala.guardarDatos(datos);
    renderizarPedidosRecibidos();
    TodoTala.toast("Pedido actualizado");
}

function accionesPedido(pedido) {
    if (pedido.estado === "Pendiente") {
        return '<button class="btn btn--primary" data-next="Aceptado" type="button">Aceptar</button><button class="btn btn--danger" data-next="Rechazado" type="button">Rechazar</button>';
    }
    if (pedido.estado === "Aceptado") {
        return '<button class="btn btn--primary" data-next="En preparación" type="button">Preparar</button>';
    }
    if (pedido.estado === "En preparación") {
        return '<button class="btn btn--primary" data-next="Listo para retirar" type="button">Marcar listo</button>';
    }
    return "";
}

function renderizarPedidosRecibidos() {
    const datos = TodoTala.obtenerDatos();
    const pedidos = datos.pedidos.filter(function (pedido) {
        return pedido.comercioId === usuarioPedidos.comercioId && (!filtroRecibidos || pedido.estado === filtroRecibidos);
    });

    if (pedidos.length === 0) {
        listaRecibidos.innerHTML = '<p class="empty-state">No hay pedidos en este estado.</p>';
        return;
    }

    listaRecibidos.innerHTML = pedidos.map(function (pedido) {
        const verificacion = pedido.estado === "Listo para retirar"
            ? '<section class="code-check"><input type="text" placeholder="Código de retiro" data-code-input><button class="btn btn--primary" data-validar type="button">Validar y entregar</button></section>'
            : "";

        return '<article class="received-order" data-pedido="' + pedido.id + '">' +
            '<header><strong>Pedido #' + pedido.id + '</strong><span class="' + TodoTala.claseEstado(pedido.estado) + '">' + pedido.estado + '</span></header>' +
            '<p class="muted">' + pedido.fecha + ' · ' + pedido.items.join(" · ") + '</p>' +
            '<p><strong>Total: ' + TodoTala.formatearPrecio(pedido.total) + '</strong></p>' +
            '<nav class="order-actions">' + accionesPedido(pedido) + '</nav>' + verificacion +
        '</article>';
    }).join("");

    document.querySelectorAll("[data-pedido]").forEach(function (tarjeta) {
        const id = Number(tarjeta.dataset.pedido);
        const pedido = datos.pedidos.find(function (item) { return item.id === id; });

        tarjeta.querySelectorAll("[data-next]").forEach(function (boton) {
            boton.addEventListener("click", function () {
                cambiarEstadoPedido(id, boton.dataset.next);
            });
        });

        const botonValidar = tarjeta.querySelector("[data-validar]");
        if (botonValidar) {
            botonValidar.addEventListener("click", function () {
                const codigo = tarjeta.querySelector("[data-code-input]").value.trim().toUpperCase();
                if (codigo !== pedido.codigo.toUpperCase()) {
                    TodoTala.toast("Código incorrecto");
                    return;
                }
                cambiarEstadoPedido(id, "Entregado");
            });
        }
    });
}

document.querySelectorAll("[data-estado]").forEach(function (boton) {
    boton.addEventListener("click", function () {
        filtroRecibidos = boton.dataset.estado;
        document.querySelectorAll("[data-estado]").forEach(function (otro) {
            otro.classList.remove("active");
        });
        boton.classList.add("active");
        renderizarPedidosRecibidos();
    });
});

document.getElementById("btn-volver").addEventListener("click", function () {
    TodoTala.irA("../panel_comercio/todo_tala_panel_comercio.html");
});

renderizarPedidosRecibidos();