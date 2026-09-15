/* Elementos principales de la pantalla. */
const listaCarrito = document.getElementById("lista-carrito");
const cantidadTotal = document.getElementById("cantidad-total");
const comerciosTotal = document.getElementById("comercios-total");
const totalCarrito = document.getElementById("total-total");
const botonReservar = document.getElementById("btn-reservar");
const botonConfirmar = document.getElementById("btn-confirmar");
const botonVaciar = document.getElementById("btn-vaciar");
const panelReserva = document.getElementById("confirmacion-reserva");
const tiempoReserva = document.getElementById("tiempo-reserva");
const observacion = document.getElementById("observacion");
let intervaloReserva = null;

/* Agrupa los productos del carrito según el comercio al que pertenecen. */
function obtenerGrupos(datos) {
    const grupos = {};

    datos.carrito.forEach(function (item) {
        const producto = datos.productos.find(function (p) { return p.id === item.id; });
        if (!producto) return;

        if (!grupos[producto.comercioId]) {
            const comercio = datos.comercios.find(function (c) { return c.id === producto.comercioId; });
            grupos[producto.comercioId] = {
                comercioId: producto.comercioId,
                nombre: producto.comercio,
                direccion: comercio ? comercio.direccion : "Dirección a confirmar",
                items: [],
                subtotal: 0
            };
        }

        const subtotal = producto.precio * item.cantidad;
        grupos[producto.comercioId].items.push({ producto: producto, cantidad: item.cantidad, subtotal: subtotal });
        grupos[producto.comercioId].subtotal += subtotal;
    });

    return Object.values(grupos);
}

/* Dibuja el carrito y actualiza sus totales. */
function renderizarCarrito() {
    const datos = TodoTala.obtenerDatos();
    const grupos = obtenerGrupos(datos);
    let total = 0;
    let unidades = 0;

    if (datos.carrito.length === 0) {
        listaCarrito.innerHTML = '<p class="empty-state">Tu carrito está vacío. Agregá productos desde el catálogo.</p>';
        cantidadTotal.textContent = "0";
        comerciosTotal.textContent = "0";
        totalCarrito.textContent = "$0";
        botonReservar.disabled = true;
        botonVaciar.disabled = true;
        panelReserva.hidden = true;
        detenerTemporizador();
        return;
    }

    botonReservar.disabled = false;
    botonVaciar.disabled = false;

    listaCarrito.innerHTML = grupos.map(function (grupo) {
        total += grupo.subtotal;

        const items = grupo.items.map(function (detalle) {
            unidades += detalle.cantidad;

            return '<article class="cart-item" data-producto="' + detalle.producto.id + '">' +
                '<section class="cart-item__meta"><strong>' + detalle.producto.nombre + '</strong><span class="muted">' + detalle.producto.marca + ' · ' + TodoTala.formatearPrecio(detalle.producto.precio) + ' c/u</span><span>Subtotal: <strong>' + TodoTala.formatearPrecio(detalle.subtotal) + '</strong></span></section>' +
                '<nav class="cart-actions"><button data-action="restar" type="button">−</button><strong>' + detalle.cantidad + '</strong><button data-action="sumar" type="button">+</button><button data-action="eliminar" type="button">×</button></nav>' +
            '</article>';
        }).join("");

        return '<section class="commerce-group">' +
            '<header class="commerce-group__header"><section><strong>' + grupo.nombre + '</strong><p>Retiro: ' + grupo.direccion + '</p></section><span class="badge">Pedido separado</span></header>' +
            '<section class="commerce-group__items">' + items + '</section>' +
            '<p class="commerce-subtotal">Subtotal del comercio: <strong>' + TodoTala.formatearPrecio(grupo.subtotal) + '</strong></p>' +
        '</section>';
    }).join("");

    cantidadTotal.textContent = unidades;
    comerciosTotal.textContent = grupos.length;
    totalCarrito.textContent = TodoTala.formatearPrecio(total);

    /* Conecta los botones de cantidad y eliminación. */
    document.querySelectorAll("[data-producto]").forEach(function (articulo) {
        const id = Number(articulo.dataset.producto);
        articulo.querySelector('[data-action="restar"]').addEventListener("click", function () { cambiarCantidad(id, -1); });
        articulo.querySelector('[data-action="sumar"]').addEventListener("click", function () { cambiarCantidad(id, 1); });
        articulo.querySelector('[data-action="eliminar"]').addEventListener("click", function () { eliminarProducto(id); });
    });

    mostrarReservaExistente(datos);
}

/* Modifica la cantidad y elimina cualquier reserva anterior. */
function cambiarCantidad(id, cambio) {
    const datos = TodoTala.obtenerDatos();
    const item = datos.carrito.find(function (elemento) { return elemento.id === id; });
    const producto = datos.productos.find(function (elemento) { return elemento.id === id; });

    if (!item || !producto) return;

    const nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad < 1) {
        eliminarProducto(id);
        return;
    }

    if (nuevaCantidad > producto.stock) {
        TodoTala.toast("No hay más stock disponible.");
        return;
    }

    item.cantidad = nuevaCantidad;
    datos.reservaCarrito = null;
    TodoTala.guardarDatos(datos);
    renderizarCarrito();
}

function eliminarProducto(id) {
    const datos = TodoTala.obtenerDatos();
    datos.carrito = datos.carrito.filter(function (item) { return item.id !== id; });
    datos.reservaCarrito = null;
    TodoTala.guardarDatos(datos);
    renderizarCarrito();
}

/* Comprueba que el stock siga alcanzando antes de reservar o confirmar. */
function validarStock(datos) {
    return datos.carrito.every(function (item) {
        const producto = datos.productos.find(function (p) { return p.id === item.id; });
        return producto && producto.stock >= item.cantidad;
    });
}

/* Inicia la reserva de stock por diez minutos. */
function iniciarReserva() {
    const usuario = TodoTala.usuarioActual();
    const datos = TodoTala.obtenerDatos();

    if (!usuario || datos.carrito.length === 0) return;

    if (!validarStock(datos)) {
        TodoTala.toast("El stock cambió. Revisá las cantidades del carrito.");
        renderizarCarrito();
        return;
    }

    const vence = Date.now() + (10 * 60 * 1000);
    datos.reservaCarrito = {
        clienteId: usuario.id,
        vence: vence,
        items: datos.carrito.map(function (item) { return { id: item.id, cantidad: item.cantidad }; })
    };

    TodoTala.guardarDatos(datos);
    panelReserva.hidden = false;
    botonReservar.hidden = true;
    iniciarTemporizador(vence);
}

/* Recupera una reserva vigente después de recargar la página. */
function mostrarReservaExistente(datos) {
    if (!datos.reservaCarrito || datos.reservaCarrito.vence <= Date.now()) {
        if (datos.reservaCarrito) {
            datos.reservaCarrito = null;
            TodoTala.guardarDatos(datos);
        }
        panelReserva.hidden = true;
        botonReservar.hidden = false;
        return;
    }

    panelReserva.hidden = false;
    botonReservar.hidden = true;
    iniciarTemporizador(datos.reservaCarrito.vence);
}

/* Actualiza el contador de la reserva una vez por segundo. */
function iniciarTemporizador(vence) {
    detenerTemporizador();

    function actualizar() {
        const restante = Math.max(0, vence - Date.now());
        const segundosTotales = Math.floor(restante / 1000);
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = segundosTotales % 60;

        tiempoReserva.textContent = String(minutos).padStart(2, "0") + ":" + String(segundos).padStart(2, "0");

        if (restante <= 0) {
            detenerTemporizador();
            const datos = TodoTala.obtenerDatos();
            datos.reservaCarrito = null;
            TodoTala.guardarDatos(datos);
            panelReserva.hidden = true;
            botonReservar.hidden = false;
            TodoTala.toast("La reserva venció. Podés reservar nuevamente.");
        }
    }

    actualizar();
    intervaloReserva = window.setInterval(actualizar, 1000);
}

function detenerTemporizador() {
    if (intervaloReserva) {
        window.clearInterval(intervaloReserva);
        intervaloReserva = null;
    }
}

/* Crea un pedido diferente para cada comercio y descuenta el stock. */
function confirmarPedidos() {
    const datos = TodoTala.obtenerDatos();
    const usuario = TodoTala.usuarioActual();

    if (!usuario || !datos.reservaCarrito || datos.reservaCarrito.vence <= Date.now()) {
        TodoTala.toast("La reserva venció. Volvé a reservar el stock.");
        renderizarCarrito();
        return;
    }

    if (!validarStock(datos)) {
        TodoTala.toast("Ya no hay stock suficiente para completar el pedido.");
        return;
    }

    const grupos = obtenerGrupos(datos);
    const fecha = new Date().toLocaleDateString("es-UY");
    const textoObservacion = observacion.value.trim();

    grupos.forEach(function (grupo, indice) {
        datos.pedidos.unshift({
            id: Date.now() + indice,
            clienteId: usuario.id,
            comercioId: grupo.comercioId,
            comercio: grupo.nombre,
            estado: "Pendiente",
            codigo: TodoTala.generarCodigo(),
            fecha: fecha,
            total: grupo.subtotal,
            items: grupo.items.map(function (detalle) { return detalle.producto.nombre + " x" + detalle.cantidad; }),
            detalle: grupo.items.map(function (detalle) { return { productoId: detalle.producto.id, cantidad: detalle.cantidad, precio: detalle.producto.precio }; }),
            observacion: textoObservacion,
            motivoCancelacion: null,
            listoDesde: null,
            venceRetiro: null,
            stockRestaurado: false
        });
    });

    datos.carrito.forEach(function (item) {
        const producto = datos.productos.find(function (p) { return p.id === item.id; });
        if (producto) producto.stock -= item.cantidad;
    });

    datos.carrito = [];
    datos.reservaCarrito = null;
    TodoTala.guardarDatos(datos);
    detenerTemporizador();

    TodoTala.toast(grupos.length === 1 ? "Pedido confirmado." : "Pedidos confirmados por comercio.");
    window.setTimeout(function () {
        TodoTala.irA("../mis_pedidos/todo_tala_mis_pedidos.html");
    }, 500);
}

function vaciarCarrito() {
    const datos = TodoTala.obtenerDatos();
    datos.carrito = [];
    datos.reservaCarrito = null;
    TodoTala.guardarDatos(datos);
    detenerTemporizador();
    renderizarCarrito();
}

botonReservar.addEventListener("click", iniciarReserva);
botonConfirmar.addEventListener("click", confirmarPedidos);
botonVaciar.addEventListener("click", vaciarCarrito);

renderizarCarrito();
