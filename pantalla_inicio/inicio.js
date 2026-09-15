const formularioBusqueda = document.getElementById("form-busqueda");
const busquedaInicio = document.getElementById("busqueda-inicio");
const botonLogin = document.getElementById("btn-login");
const botonRegistro = document.getElementById("btn-registro");
const botonSalir = document.getElementById("btn-salir");
const botonPerfil = document.getElementById("btn-perfil");
const botonCatalogo = document.getElementById("btn-catalogo");
const botonNotificaciones = document.getElementById("btn-notificaciones");
const saludo = document.getElementById("saludo");
const promoGrid = document.getElementById("promo-grid");
const previewGrid = document.getElementById("preview-grid");

const datos = TodoTala.obtenerDatos();
const usuario = TodoTala.usuarioActual();

function actualizarSesionVisual() {
    const haySesion = Boolean(usuario);

    botonLogin.hidden = haySesion;
    botonRegistro.hidden = haySesion;
    botonPerfil.hidden = !haySesion;
    botonSalir.hidden = !haySesion;
    botonNotificaciones.hidden = !haySesion;

    if (usuario) {
        saludo.textContent = "Hola, " + usuario.nombre.split(" ")[0] + ". ¿Qué buscás hoy?";
    }
}

function renderizarPromociones() {
    const hoy = new Date().toISOString().slice(0, 10);
    const promocionesActivas = datos.promociones.filter(function (promocion) {
        return promocion.activa && promocion.inicio <= hoy && promocion.fin >= hoy;
    });

    if (promocionesActivas.length === 0) {
        promoGrid.innerHTML = '<p class="muted">No hay promociones activas en este momento.</p>';
        return;
    }

    promoGrid.innerHTML = promocionesActivas.map(function (promocion) {
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

function renderizarProductos() {
    const productos = datos.productos.filter(function (producto) {
        return producto.visible;
    }).slice(0, 4);

    previewGrid.innerHTML = productos.map(function (producto) {
        const estadoStock = producto.stock === 0
            ? '<span class="badge badge--danger">Sin stock</span>'
            : producto.stock <= 5
                ? '<span class="badge badge--warning">Últimas unidades</span>'
                : '<span class="badge badge--success">Disponible</span>';

        return `
            <article class="preview-card" data-producto-id="${producto.id}" tabindex="0">
                <div class="product-placeholder">${producto.imagenTexto || "TT"}</div>
                <div class="preview-card__body">
                    <div>${estadoStock}</div>
                    <strong>${producto.nombre}</strong>
                    <p class="muted">${producto.comercio}</p>
                    <span class="preview-price">${TodoTala.formatearPrecio(producto.precio)}</span>
                </div>
            </article>
        `;
    }).join("");

    document.querySelectorAll("[data-producto-id]").forEach(function (tarjeta) {
        tarjeta.addEventListener("click", function () {
            TodoTala.irA("../detalle_producto/todo_tala_detalle_producto.html?id=" + tarjeta.dataset.productoId);
        });
    });
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
            producto.categoria.toLowerCase().includes(texto)
        );
    });

    previewGrid.innerHTML = coincidencias.slice(0, 4).map(function (producto) {
        return `
            <article class="preview-card" data-producto-id="${producto.id}" tabindex="0">
                <div class="product-placeholder">${producto.imagenTexto || "TT"}</div>
                <div class="preview-card__body">
                    <strong>${producto.nombre}</strong>
                    <p class="muted">${producto.comercio}</p>
                    <span class="preview-price">${TodoTala.formatearPrecio(producto.precio)}</span>
                </div>
            </article>
        `;
    }).join("");

    document.querySelectorAll("[data-producto-id]").forEach(function (tarjeta) {
        tarjeta.addEventListener("click", function () {
            TodoTala.irA("../detalle_producto/todo_tala_detalle_producto.html?id=" + tarjeta.dataset.productoId);
        });
    });
});

botonLogin.addEventListener("click", function () {
    TodoTala.irA("../pantalla_login/todo_tala_pantalla_login.html");
});

botonRegistro.addEventListener("click", function () {
    TodoTala.irA("../pantalla_reguistro/todo_tala_pantalla_registro.html");
});

botonSalir.addEventListener("click", function () {
    TodoTala.cerrarSesion();
    TodoTala.irA("../pantalla_login/todo_tala_pantalla_login.html");
});

botonPerfil.addEventListener("click", function () {
    TodoTala.irA("../perfil_cliente/tala_perfil_cliente.html");
});

botonCatalogo.addEventListener("click", function () {
    TodoTala.irA("../catalogo_cliente/todo_tala_catalogo_cliente.html");
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
