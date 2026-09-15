const datos = TodoTala.obtenerDatos();
const usuario = TodoTala.usuarioActual();
const promoGrid = document.getElementById("promo-grid");
const previewGrid = document.getElementById("preview-grid");
const buscador = document.getElementById("busqueda-inicio");

/* Muestra un saludo con el nombre del cliente que inició sesión. */
if (usuario) {
    document.getElementById("saludo").textContent = "Hola, " + usuario.nombre.split(" ")[0];
}

/* Carga solamente las promociones activas en la fecha actual. */
function renderizarPromociones() {
    const hoy = new Date().toISOString().slice(0, 10);
    const promociones = datos.promociones.filter(function (promo) {
        return promo.activa && promo.inicio <= hoy && promo.fin >= hoy;
    });

    if (promociones.length === 0) {
        promoGrid.innerHTML = '<p class="muted">No hay promociones activas.</p>';
        return;
    }

    promoGrid.innerHTML = promociones.map(function (promo) {
        const producto = datos.productos.find(function (item) {
            return item.id === promo.productoId;
        });
        const comercio = datos.comercios.find(function (item) {
            return item.id === promo.comercioId;
        });
        const detalle = promo.tipo === "porcentaje"
            ? promo.valor + "% de descuento"
            : TodoTala.formatearPrecio(promo.valor);

        return '<article class="promo-card">' +
            '<strong>' + promo.nombre + '</strong>' +
            '<p>' + detalle + '</p>' +
            '<small>' + (producto ? producto.nombre + " · " : "") + (comercio ? comercio.nombre : "") + '</small>' +
        '</article>';
    }).join("");
}

/* Devuelve el HTML de una tarjeta simple de producto. */
function tarjetaProducto(producto) {
    const estado = TodoTala.estadoStock(producto);

    return '<article class="preview-card" data-producto-id="' + producto.id + '" tabindex="0">' +
        '<span class="product-placeholder">' + producto.imagenTexto + '</span>' +
        '<span class="' + estado.clase + '">' + estado.texto + '</span>' +
        '<strong>' + producto.nombre + '</strong>' +
        '<p class="muted">' + producto.comercio + '</p>' +
        '<b>' + TodoTala.formatearPrecio(producto.precio) + '</b>' +
    '</article>';
}

/* Hace que cada tarjeta abra el detalle del producto. */
function activarTarjetas() {
    document.querySelectorAll("[data-producto-id]").forEach(function (tarjeta) {
        tarjeta.addEventListener("click", function () {
            TodoTala.irA("../detalle_producto/todo_tala_detalle_producto.html?id=" + tarjeta.dataset.productoId);
        });
    });
}

/* Muestra hasta cuatro productos en la portada. */
function renderizarProductos(lista) {
    previewGrid.innerHTML = lista.slice(0, 4).map(tarjetaProducto).join("");
    activarTarjetas();
}

renderizarPromociones();
renderizarProductos(datos.productos.filter(function (producto) {
    return producto.visible;
}));

/* Envía la búsqueda completa a la pantalla de resultados. */
document.getElementById("form-busqueda").addEventListener("submit", function (evento) {
    evento.preventDefault();
    TodoTala.irA("../resultados_busqueda/todo_tala_resultados_busqueda.html?q=" + encodeURIComponent(buscador.value.trim()));
});

/* Mientras el usuario escribe, actualiza los destacados que coinciden. */
buscador.addEventListener("input", function () {
    const texto = buscador.value.trim().toLowerCase();

    if (texto.length < 2) {
        renderizarProductos(datos.productos.filter(function (producto) {
            return producto.visible;
        }));
        return;
    }

    const resultados = datos.productos.filter(function (producto) {
        const contenido = producto.nombre + " " + producto.comercio + " " + producto.categoria;
        return producto.visible && contenido.toLowerCase().includes(texto);
    });

    renderizarProductos(resultados);
});

/* Cierra la sesión y vuelve al login. */
document.getElementById("btn-salir").addEventListener("click", function () {
    TodoTala.cerrarSesion();
    TodoTala.abrir("pantalla_login/todo_tala_pantalla_login.html");
});