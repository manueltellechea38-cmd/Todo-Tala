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

function cancelarReservaSilenciosa(datos) {
    datos.reservaCarrito = null;
}

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
        grupos[producto.comercioId].items.push({
            producto: producto,
            cantidad: item.cantidad,
            subtotal: subtotal
        });
        grupos[producto.comercioId].subtotal += subtotal;
    });

    return Object.values(grupos);
}

function renderizarCarrito() {
    const datos = TodoTala.obtenerDatos();
    const grupos = obtenerGrupos(datos);
    let total = 0;
    let unidades = 0;

    listaCarrito.innerHTML = "";

    if (datos.carrito.length === 0) {
        listaCarrito.innerHTML = '<div class="empty-state"><strong>Tu carrito está vacío.</strong><br>Agregá productos desde el catálogo para empezar un pedido.</div>';
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

    grupos.forEach(function (grupo) {
        total += grupo.subtotal;

        const seccion = document.createElement("section");
        seccion.className = "commerce-group";
        seccion.innerHTML =
            '<header class="commerce-group__header">' +
                '<div><strong>' + grupo.nombre + '</strong><p>Retiro: ' + grupo.direccion + '</p></div>' +
                '<span class="badge">Pedido separado</span>' +
            '</header>' +
            '<div class="commerce-group__items"></div>' +
            '<div class="commerce-subtotal">Subtotal del comercio: <strong>' + TodoTala.formatearPrecio(grupo.subtotal) + '</strong></div>';

        const contenedorItems = seccion.querySelector(".commerce-group__items");

        grupo.items.forEach(function (detalle) {
            unidades += detalle.cantidad;

            const articulo = document.createElement("article");
            articulo.className = "cart-item";
            articulo.innerHTML =
                '<div class="cart-item__meta">' +
                    '<strong>' + detalle.producto.nombre + '</strong>' +
                    '<span class="muted">' + detalle.producto.marca + ' · ' + TodoTala.formatearPrecio(detalle.producto.precio) + ' c/u</span>' +
                    '<span>Subtotal: <strong>' + TodoTala.formatearPrecio(detalle.subtotal) + '</strong></span>' +
                '</div>' +
                '<div class="cart-actions">' +
                    '<button data-action="restar" type="button" aria-label="Restar una unidad">−</button>' +
                    '<strong>' + detalle.cantidad + '</strong>' +
                    '<button data-action="sumar" type="button" aria-label="Sumar una unidad">+</button>' +
                    '<button data-action="eliminar" type="button" aria-label="Eliminar producto">×</button>' +
                '</div>';

            articulo.querySelector('[data-action="restar"]').addEventListener("click", function () {
                cambiarCantidadCarrito(detalle.producto.id, -1);
            });
            articulo.querySelector('[data-action="sumar"]').addEventListener("click", function () {
                cambiarCantidadCarrito(detalle.producto.id, 1);
            });
            articulo.querySelector('[data-action="eliminar"]').addEventListener("click", function () {
                eliminarDelCarrito(detalle.producto.id);
            });

            contenedorItems.appendChild(articulo);
        });

        listaCarrito.appendChild(seccion);
    });

    cantidadTotal.textContent = unidades;
    comerciosTotal.textContent = grupos.length;
    totalCarrito.textContent = TodoTala.formatearPrecio(total);

    mostrarReservaExistente(datos);
}

function cambiarCantidadCarrito(id, cambio) {
    const datos = TodoTala.obtenerDatos();
    const item = datos.carrito.find(function (elemento) { return elemento.id === id; });
    const producto = datos.productos.find(function (elemento) { return elemento.id === id; });

    if (!item || !producto) return;

    const nueva = item.cantidad + cambio;

    if (nueva < 1) {
        eliminarDelCarrito(id);
        return;
    }

    if (nueva > producto.stock) {
        TodoTala.toast("No hay más stock disponible", "danger");
        return;
    }

    item.cantidad = nueva;
    cancelarReservaSilenciosa(datos);
    TodoTala.guardarDatos(datos);
    renderizarCarrito();
}

function eliminarDelCarrito(id) {
    const datos = TodoTala.obtenerDatos();
    datos.carrito = datos.carrito.filter(function (item) { return item.id !== id; });
    cancelarReservaSilenciosa(datos);
    TodoTala.guardarDatos(datos);
    renderizarCarrito();
}

function validarStock(datos) {
    return datos.carrito.every(function (item) {
        const producto = datos.productos.find(function (p) { return p.id === item.id; });
        return producto && producto.stock >= item.cantidad;
    });
}

function iniciarReserva() {
    const usuario = TodoTala.usuarioActual();

    if (!usuario || usuario.rol !== "cliente") {
        TodoTala.toast("Iniciá sesión como cliente para confirmar pedidos", "danger");
        window.setTimeout(function () {
            TodoTala.irA("../pantalla_login/todo_tala_pantalla_login.html");
        }, 800);
        return;
    }

    const datos = TodoTala.obtenerDatos();

    if (datos.carrito.length === 0) return;

    if (!validarStock(datos)) {
        TodoTala.toast("El stock cambió. Revisá las cantidades del carrito", "danger");
        renderizarCarrito();
        return;
    }

    const vence = Date.now() + (10 * 60 * 1000);
    datos.reservaCarrito = {
        clienteId: usuario.id,
        vence: vence,
        items: datos.carrito.map(function (item) {
            return { id: item.id, cantidad: item.cantidad };
        })
    };

    TodoTala.guardarDatos(datos);
    panelReserva.hidden = false;
    botonReservar.hidden = true;
    iniciarTemporizador(vence);
    TodoTala.toast("Stock reservado durante 10 minutos", "success");
}

function mostrarReservaExistente(datos) {
    if (!datos.reservaCarrito || !datos.reservaCarrito.vence) {
        panelReserva.hidden = true;
        botonReservar.hidden = false;
        return;
    }

    if (datos.reservaCarrito.vence <= Date.now()) {
        cancelarReservaSilenciosa(datos);
        TodoTala.guardarDatos(datos);
        panelReserva.hidden = true;
        botonReservar.hidden = false;
        return;
    }

    panelReserva.hidden = false;
    botonReservar.hidden = true;
    iniciarTemporizador(datos.reservaCarrito.vence);
}

function iniciarTemporizador(vence) {
    detenerTemporizador();

    function actualizar() {
        const restante = Math.max(0, vence - Date.now());
        const totalSegundos = Math.floor(restante / 1000);
        const minutos = Math.floor(totalSegundos / 60);
        const segundos = totalSegundos % 60;

        tiempoReserva.textContent = String(minutos).padStart(2, "0") + ":" + String(segundos).padStart(2, "0");

        if (restante <= 0) {
            detenerTemporizador();
            const datos = TodoTala.obtenerDatos();
            cancelarReservaSilenciosa(datos);
            TodoTala.guardarDatos(datos);
            panelReserva.hidden = true;
            botonReservar.hidden = false;
            TodoTala.toast("La reserva de stock venció. Podés iniciarla nuevamente", "danger");
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

function confirmarPedidos() {
    const datos = TodoTala.obtenerDatos();
    const usuario = TodoTala.usuarioActual();

    if (!usuario || usuario.rol !== "cliente") return;

    if (!datos.reservaCarrito || datos.reservaCarrito.vence <= Date.now()) {
        TodoTala.toast("La reserva venció. Volvé a reservar el stock", "danger");
        renderizarCarrito();
        return;
    }

    if (!validarStock(datos)) {
        TodoTala.toast("Ya no hay stock suficiente para completar el pedido", "danger");
        return;
    }

    const grupos = obtenerGrupos(datos);
    const fecha = new Date().toLocaleDateString("es-UY");
    const textoObservacion = observacion.value.trim();

    grupos.forEach(function (grupo, indice) {
        const pedido = {
            id: Date.now() + indice,
            clienteId: usuario.id,
            comercioId: grupo.comercioId,
            comercio: grupo.nombre,
            estado: "Pendiente",
            codigo: TodoTala.generarCodigo(),
            fecha: fecha,
            total: grupo.subtotal,
            items: grupo.items.map(function (detalle) {
                return detalle.producto.nombre + " x" + detalle.cantidad;
            }),
            observacion: textoObservacion,
            motivoCancelacion: null,
            listoDesde: null,
            venceRetiro: null
        };

        datos.pedidos.unshift(pedido);
    });

    datos.carrito.forEach(function (item) {
        const producto = datos.productos.find(function (p) { return p.id === item.id; });
        if (producto) producto.stock -= item.cantidad;
    });

    datos.carrito = [];
    datos.reservaCarrito = null;
    TodoTala.guardarDatos(datos);
    detenerTemporizador();
    TodoTala.toast(grupos.length === 1 ? "Pedido confirmado" : grupos.length + " pedidos confirmados, uno por comercio", "success");

    window.setTimeout(function () {
        TodoTala.irA("../mis_pedidos/todo_tala_mis_pedidos.html");
    }, 900);
}

function vaciarCarrito() {
    const datos = TodoTala.obtenerDatos();
    datos.carrito = [];
    datos.reservaCarrito = null;
    TodoTala.guardarDatos(datos);
    detenerTemporizador();
    renderizarCarrito();
    TodoTala.toast("Carrito vaciado");
}

botonReservar.addEventListener("click", iniciarReserva);
botonConfirmar.addEventListener("click", confirmarPedidos);
botonVaciar.addEventListener("click", vaciarCarrito);

document.getElementById("btn-volver").addEventListener("click", function () {
    TodoTala.irA("../catalogo_cliente/todo_tala_catalogo_cliente.html");
});

renderizarCarrito();
