const listaRecibidos = document.getElementById("lista-pedidos");
const usuarioPedidos = TodoTala.usuarioActual();
const buscadorPedidos = document.getElementById("buscar-pedido");
const filtroEstado = document.getElementById("estado-pedido");

/* Cambia el estado normal de un pedido del comercio. */
function cambiarEstadoPedido(id, estado) {
    const datos = TodoTala.obtenerDatos();
    const pedido = datos.pedidos.find(function (item) {
        return item.id === id && item.comercioId === usuarioPedidos.comercioId;
    });

    if (!pedido) return;

    pedido.estado = estado;

    /* El plazo de 48 horas comienza recién cuando el pedido está listo. */
    if (estado === "Listo para retirar") {
        const ahora = Date.now();
        pedido.listoDesde = new Date(ahora).toISOString();
        pedido.venceRetiro = new Date(ahora + 48 * 60 * 60 * 1000).toISOString();
        TodoTala.crearNotificacion(pedido.clienteId, "Tu pedido #" + pedido.id + " está listo para retirar.", datos);
    }

    if (estado === "Entregado") {
        pedido.venceRetiro = null;
    }

    TodoTala.guardarDatos(datos);
    renderizarPedidos();
}

/* Cancela o rechaza un pedido, devuelve el stock y guarda el motivo. */
function cancelarPedido(id, motivo) {
    const datos = TodoTala.obtenerDatos();
    const pedido = datos.pedidos.find(function (item) {
        return item.id === id && item.comercioId === usuarioPedidos.comercioId;
    });

    if (!pedido || !["Pendiente", "Aceptado", "En preparación"].includes(pedido.estado)) return;

    pedido.estado = pedido.estado === "Pendiente" ? "Rechazado" : "Cancelado";
    pedido.motivoCancelacion = motivo;
    TodoTala.restaurarStockPedido(pedido, datos);
    TodoTala.crearNotificacion(pedido.clienteId, "El comercio canceló el pedido #" + pedido.id + ". Motivo: " + motivo, datos);
    TodoTala.guardarDatos(datos);
    renderizarPedidos();
}

/* Devuelve los botones permitidos según el estado actual. */
function accionesPedido(pedido) {
    if (pedido.estado === "Pendiente") {
        return '<button class="btn btn--primary" data-next="Aceptado" type="button">Aceptar</button><button class="btn btn--danger" data-cancelar type="button">Rechazar</button>';
    }
    if (pedido.estado === "Aceptado") {
        return '<button class="btn btn--primary" data-next="En preparación" type="button">Preparar</button><button class="btn btn--danger" data-cancelar type="button">Cancelar</button>';
    }
    if (pedido.estado === "En preparación") {
        return '<button class="btn btn--primary" data-next="Listo para retirar" type="button">Marcar listo</button><button class="btn btn--danger" data-cancelar type="button">Cancelar</button>';
    }
    return "";
}

/* Filtra y muestra los pedidos del comercio. */
function renderizarPedidos() {
    const datos = TodoTala.obtenerDatos();
    const texto = buscadorPedidos.value.trim().toLowerCase();

    const pedidos = datos.pedidos.filter(function (pedido) {
        if (pedido.comercioId !== usuarioPedidos.comercioId) return false;

        const cliente = datos.usuarios.find(function (usuario) { return usuario.id === pedido.clienteId; });
        const contenido = (pedido.codigo + " " + (cliente ? cliente.nombre : "")).toLowerCase();
        const coincideTexto = contenido.includes(texto);
        const coincideEstado = !filtroEstado.value || pedido.estado === filtroEstado.value;
        return coincideTexto && coincideEstado;
    });

    if (pedidos.length === 0) {
        listaRecibidos.innerHTML = '<p class="empty-state">No hay pedidos con esos filtros.</p>';
        return;
    }

    listaRecibidos.innerHTML = pedidos.map(function (pedido) {
        const cliente = datos.usuarios.find(function (usuario) { return usuario.id === pedido.clienteId; });
        const puedeCancelar = ["Pendiente", "Aceptado", "En preparación"].includes(pedido.estado);
        const verificacion = pedido.estado === "Listo para retirar"
            ? '<section class="code-check"><input type="text" placeholder="Código de retiro" data-code-input><button class="btn btn--primary" data-validar type="button">Validar y entregar</button></section>'
            : "";
        const cancelacion = puedeCancelar
            ? '<form class="cancel-order-form" data-form-cancelar hidden><label>Motivo<select data-motivo><option value="Sin stock disponible">Sin stock disponible</option><option value="No podemos preparar el pedido">No podemos preparar el pedido</option><option value="Problema con el pedido">Problema con el pedido</option><option value="Otro">Otro</option></select></label><label data-otro-label hidden>Otro motivo<input data-otro type="text"></label><button class="btn btn--danger" type="submit">Confirmar cancelación</button></form>'
            : "";

        return '<article class="received-order" data-pedido="' + pedido.id + '">' +
            '<header><section><strong>Pedido #' + pedido.id + '</strong><p class="muted">' + (cliente ? cliente.nombre : "Cliente") + ' · ' + pedido.fecha + '</p></section><span class="' + TodoTala.claseEstado(pedido.estado) + '">' + pedido.estado + '</span></header>' +
            '<p class="order-items">' + pedido.items.join(" · ") + '</p>' +
            '<p><strong>Total: ' + TodoTala.formatearPrecio(pedido.total) + '</strong></p>' +
            (pedido.observacion ? '<p class="helper">Observación: ' + pedido.observacion + '</p>' : '') +
            '<nav class="order-actions">' + accionesPedido(pedido) + '</nav>' + verificacion + cancelacion +
        '</article>';
    }).join("");

    /* Conecta las acciones después de crear las tarjetas. */
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
                    TodoTala.toast("Código incorrecto.");
                    return;
                }
                cambiarEstadoPedido(id, "Entregado");
            });
        }

        const botonCancelar = tarjeta.querySelector("[data-cancelar]");
        const formularioCancelar = tarjeta.querySelector("[data-form-cancelar]");
        if (botonCancelar && formularioCancelar) {
            const selector = formularioCancelar.querySelector("[data-motivo]");
            const otroLabel = formularioCancelar.querySelector("[data-otro-label]");
            const otroCampo = formularioCancelar.querySelector("[data-otro]");

            botonCancelar.addEventListener("click", function () {
                formularioCancelar.hidden = !formularioCancelar.hidden;
            });

            selector.addEventListener("change", function () {
                otroLabel.hidden = selector.value !== "Otro";
            });

            formularioCancelar.addEventListener("submit", function (evento) {
                evento.preventDefault();
                const motivo = selector.value === "Otro" ? otroCampo.value.trim() : selector.value;
                if (motivo) cancelarPedido(id, motivo);
            });
        }
    });
}

buscadorPedidos.addEventListener("input", renderizarPedidos);
filtroEstado.addEventListener("change", renderizarPedidos);
document.getElementById("filtros-pedidos").addEventListener("submit", function (evento) { evento.preventDefault(); });

renderizarPedidos();
