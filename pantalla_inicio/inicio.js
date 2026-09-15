const formularioBusqueda = document.getElementById("form-busqueda");
const busquedaInicio = document.getElementById("busqueda-inicio");
const botonLogin = document.getElementById("btn-login");
const botonRegistro = document.getElementById("btn-registro");
const botonSalir = document.getElementById("btn-salir");
const botonPerfil = document.getElementById("btn-perfil");
const botonPanel = document.getElementById("btn-panel");
const botonNotificaciones = document.getElementById("btn-notificaciones");
const navPedidos = document.getElementById("nav-pedidos");
const navCarrito = document.getElementById("nav-carrito");
const saludo = document.getElementById("saludo");
const promoGrid = document.getElementById("promo-grid");
const previewGrid = document.getElementById("preview-grid");

let datos = TodoTala.obtenerDatos();
let usuario = TodoTala.usuarioActual();

function actualizarSesionVisual() {
    const haySesion = Boolean(usuario);
    const esCliente = haySesion && usuario.rol === "cliente";
    const esComercio = haySesion && (usuario.rol === "jefe" || usuario.rol === "empleado");

    botonLogin.hidden = haySesion;
    botonRegistro.hidden = haySesion;
    botonSalir.hidden = !haySesion;
    botonNotificaciones.hidden = !haySesion;
    botonPerfil.hidden = !esCliente;
    botonPanel.hidden = !esComercio;
    navPedidos.hidden = !esCliente;
    navCarrito.hidden = !esCliente;

    if (haySesion) {
        const primerNombre = usuario.nombre.split(" ")[0];
        saludo.textContent = "Hola, " + primerNombre + ". Buscá productos, revisá promociones y accedé a tus opciones desde aquí.";
    } else {
        saludo.textContent = "Buscá productos, compará opciones y consultá stock. Para realizar pedidos, iniciá sesión como cliente.";
    }
}

function promocionesActivas() {
    const hoy = new Date().toISOString().slice(0, 10);

    return datos.promociones.filter(function (promocion) {
        return promocion.activa && promocion.inicio <= hoy && promocion.fin >= hoy;
    });
}

function renderizarPromociones() {
    const promociones = promocionesActivas();

    if (promociones.length === 0) {
        promoGrid.innerHTML = '<p class="muted">No hay promociones activas en este momento.</p>';
        return;
    }

    promoGrid.innerHTML = promociones.map(function (promocion) {
        const producto = datos.productos.find(function (item) {
            return item.id === promocion.productoId;
        });
        const comercio = datos.comercios.find(function (item) {
            return item.id === promocion.comercioId;
        });
        const detalle = promocion.tipo === "porcentaje"
            ? promocion.valor + "% de descuento"
            : TodoTala.formatearPrecio(promocion.valor);

        return `
            <article class="promo-card">
                <span class="promo-label">Promoción</span>
                <strong>${promocion.nombre}</strong>
                <p>${detalle}${producto ? " · " + producto.nombre : ""}</p>
                <small>${comercio ? comercio.nombre : "Todo Tala"}</small>
            </article>
        `;
    }).join("");
}

function tarjetaProducto(producto) {
    const estado = TodoTala.estadoStock(producto);

    return `
        <article class="preview-card" data-producto-id="${producto.id}" tabindex="0" role="link">
            <div class="product-placeholder">${producto.imagenTexto || "TT"}</div>
            <div class="preview-card__body">
                <div><span class="${estado.clase}">${estado.texto}</span></div>
                <strong>${producto.nombre}</strong>
                <p class="muted">${producto.comercio}</p>
                <span class="preview-price">${TodoTala.formatearPrecio(producto.precio)}</span>
            </div>
        </article>
    `;
}

function activarTarjetasProducto() {
    document.querySelectorAll("[data-producto-id]").forEach(function (tarjeta) {
        function abrirDetalle() {
            TodoTala.irA("../detalle_producto/todo_tala_detalle_producto.html?id=" + tarjeta.dataset.productoId);
        }

        tarjeta.addEventListener("click", abrirDetalle);
        tarjeta.addEventListener("keydown", function (evento) {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                abrirDetalle();
            }
        });
    });
}

function renderizarProductos(productos) {
    const lista = productos || datos.productos.filter(function (producto) {
        return producto.visible;
    }).slice(0, 4);

    if (lista.length === 0) {
        previewGrid.innerHTML = '<div class="empty-state">No encontramos productos con esa búsqueda.</div>';
        return;
    }

    previewGrid.innerHTML = lista.map(tarjetaProducto).join("");
    activarTarjetasProducto();
}

formularioBusqueda.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const consulta = encodeURIComponent(busquedaInicio.value.trim());
    TodoTala.irA("../resultados_busqueda/todo_tala_resultados_busqueda.html?q=" + consulta);
});

busquedaInicio.addEventListener("input", function () {
    const texto = busquedaInicio.value.trim().toLowerCase();

    if (texto.length < 2) {
        renderizarProductos();
        return;
    }

    const coincidencias = datos.productos.filter(function (producto) {
        return producto.visible && (
            producto.nombre.toLowerCase().includes(texto) ||
            producto.comercio.toLowerCase().includes(texto) ||
            producto.categoria.toLowerCase().includes(texto) ||
            String(producto.marca || "").toLowerCase().includes(texto)
        );
    }).slice(0, 8);

    renderizarProductos(coincidencias);
});

botonSalir.addEventListener("click", function () {
    TodoTala.cerrarSesion();
    usuario = null;
    datos = TodoTala.obtenerDatos();
    actualizarSesionVisual();
    TodoTala.toast("Sesión cerrada", "success");
});

botonNotificaciones.addEventListener("click", function () {
    const noLeidas = datos.notificaciones.filter(function (notificacion) {
        return usuario && notificacion.usuarioId === usuario.id && !notificacion.leida;
    }).length;

    TodoTala.toast(noLeidas === 0 ? "No tenés notificaciones nuevas" : "Tenés " + noLeidas + " notificación(es) nueva(s)");
});

actualizarSesionVisual();
renderizarPromociones();
renderizarProductos();
