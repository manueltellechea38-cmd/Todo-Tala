const usuarioPedidos = TodoTala.usuarioActual();
const listaPedidos = document.getElementById("lista-pedidos");
let filtroActual = "activos";

const estadosActivos = ["Pendiente", "Aceptado", "En preparación", "Listo para retirar"];
const estadosCancelados = ["Cancelado", "Rechazado"];

/* Cancela automáticamente pedidos listos cuyo plazo de retiro ya terminó. */
function revisarVencimientos() {
    const datos = TodoTala.obtenerDatos();
    let huboCambios = false;

    datos.pedidos.forEach(function (pedido) {
        if (pedido.clienteId !== usuarioPedidos.id || pedido.estado !== "Listo para retirar" || !pedido.venceRetiro) return;

        if (new Date(pedido.venceRetiro).getTime() <= Date.now()) {
            pedido.estado = "Cancelado";
            pedido.motivoCancelacion = "Plazo de retiro vencido";
            TodoTala.restaurarStockPedido(pedido, datos);
            huboCambios = true;
        }
    });

    if (huboCambios) {
        TodoTala.guardarDatos(datos);
    }
}

/* Decide si un pedido pertenece al filtro seleccionado. */
function coincideFiltro(pedido) {
    if (filtroActual === "activos") return estadosActivos.includes(pedido.estado);
    if (filtroActual === "finalizados") return pedido.estado === "Entregado";
    return estadosCancelados.includes(pedido.estado);
}

/* Devuelve un texto con el plazo cuando el pedido está listo. */
function textoRetiro(pedido) {
    if (pedido.estado !== "Listo para retirar" || !pedido.venceRetiro) return "";

    const fecha = new Date(pedido.venceRetiro);
    return '<p class="helper">Retirar antes de: ' + fecha.toLocaleString("es-UY", { dateStyle: "short", timeStyle: "short" }) + '</p>';
}

/* Muestra los pedidos del cliente actual. */
function renderizarPedidos() {
    revisarVencimientos();
    const datos = TodoTala.obtenerDatos();
    const pedidos = datos.pedidos.filter(function (pedido) {
        return pedido.clienteId === usuarioPedidos.id && coincideFiltro(pedido);
    });

    if (pedidos.length === 0) {
        listaPedidos.innerHTML = '<p class="empty-state">No hay pedidos en esta sección.</p>';
        return;
    }

    listaPedidos.innerHTML = pedidos.map(function (pedido) {
        const puedeCancelar = ["Pendiente", "Aceptado", "En preparación"].includes(pedido.estado);
        const mostrarCodigo = !estadosCancelados.includes(pedido.estado) && pedido.estado !== "Entregado";
        const motivo = pedido.motivoCancelacion ? '<p class="helper">Motivo: ' + pedido.motivoCancelacion + '</p>' : '';

        return '<article class="order-card" data-pedido="' + pedido.id + '">' +
            '<header class="order-heading"><section><strong>Pedido #' + pedido.id + '</strong><p class="muted">' + pedido.comercio + ' · ' + pedido.fecha + '</p></section><span class="' + TodoTala.claseEstado(pedido.estado) + '">' + pedido.estado + '</span></header>' +
            '<section class="order-items">' + pedido.items.map(function (item) { return '<span>' + item + '</span>'; }).join("") + '</section>' +
            '<p><strong>Total: ' + TodoTala.formatearPrecio(pedido.total) + '</strong></p>' +
            (mostrarCodigo ? '<p class="order-code">Código de retiro: <strong>' + pedido.codigo + '</strong></p>' : '') +
            textoRetiro(pedido) + motivo +
            (puedeCancelar ? '<nav class="order-actions"><button class="btn btn--danger" data-cancelar type="button">Cancelar pedido</button></nav><form class="cancel-form" data-form-cancelar hidden><label>Motivo<select data-motivo><option value="Ya no lo necesito">Ya no lo necesito</option><option value="Me equivoqué en el pedido">Me equivoqué en el pedido</option><option value="No puedo retirarlo">No puedo retirarlo</option><option value="Otro">Otro</option></select></label><label data-otro-label hidden>Otro motivo<input data-otro type="text"></label><button class="btn btn--danger" type="submit">Confirmar cancelación</button></form>' : '') +
        '</article>';
    }).join("");

    /* Conecta los formularios de cancelación de cada tarjeta. */
    document.querySelectorAll("[data-pedido]").forEach(function (tarjeta) {
        const botonCancelar = tarjeta.querySelector("[data-cancelar]");
        const formulario = tarjeta.querySelector("[data-form-cancelar]");
        if (!botonCancelar || !formulario) return;

        const selector = formulario.querySelector("[data-motivo]");
        const otroLabel = formulario.querySelector("[data-otro-label]");
        const otroCampo = formulario.querySelector("[data-otro]");

        botonCancelar.addEventListener("click", function () {
            formulario.hidden = !formulario.hidden;
        });

        selector.addEventListener("change", function () {
            otroLabel.hidden = selector.value !== "Otro";
        });

        formulario.addEventListener("submit", function (evento) {
            evento.preventDefault();
            const motivo = selector.value === "Otro" ? otroCampo.value.trim() : selector.value;
            if (!motivo) return;
            cancelarPedido(Number(tarjeta.dataset.pedido), motivo);
        });
    });
}

/* Cancela el pedido, devuelve el stock y avisa al comercio. */
function cancelarPedido(id, motivo) {
    const datos = TodoTala.obtenerDatos();
    const pedido = datos.pedidos.find(function (item) { return item.id === id; });

    if (!pedido || !["Pendiente", "Aceptado", "En preparación"].includes(pedido.estado)) return;

    pedido.estado = "Cancelado";
    pedido.motivoCancelacion = motivo;
    TodoTala.restaurarStockPedido(pedido, datos);

    const comercio = datos.comercios.find(function (item) { return item.id === pedido.comercioId; });
    if (comercio && comercio.jefeId) {
        TodoTala.crearNotificacion(comercio.jefeId, "El pedido #" + pedido.id + " fue cancelado por el cliente.", datos);
    }

    TodoTala.guardarDatos(datos);
    renderizarPedidos();
}

/* Cambia entre Activos, Finalizados y Cancelados. */
document.querySelectorAll("[data-filtro]").forEach(function (boton) {
    boton.addEventListener("click", function () {
        filtroActual = boton.dataset.filtro;
        document.querySelectorAll("[data-filtro]").forEach(function (item) { item.classList.remove("active"); });
        boton.classList.add("active");
        renderizarPedidos();
    });
});

renderizarPedidos();
