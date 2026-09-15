const buscadorCatalogo = document.getElementById("search-input");
const filtroComercio = document.getElementById("filtro-comercio");
const filtroCategoria = document.getElementById("filtro-categoria");
const filtroDisponibilidad = document.getElementById("filtro-disponibilidad");
const filtroPromocion = document.getElementById("filtro-promocion");
const precioMinimo = document.getElementById("precio-min");
const precioMaximo = document.getElementById("precio-max");
const ordenProductos = document.getElementById("orden-productos");
const listaCatalogo = document.getElementById("lista-productos");
const resumenCatalogo = document.getElementById("resumen-catalogo");
const contadorCarrito = document.getElementById("contador-carrito");

function cargarFiltros() {
    const datos = TodoTala.obtenerDatos();
    const comercios = [...new Set(datos.productos.map(function (producto) {
        return producto.comercio;
    }))].sort();
    const categorias = [...new Set(datos.productos.map(function (producto) {
        return producto.categoria;
    }))].sort();

    comercios.forEach(function (comercio) {
        const opcion = document.createElement("option");
        opcion.value = comercio;
        opcion.textContent = comercio;
        filtroComercio.appendChild(opcion);
    });

    categorias.forEach(function (categoria) {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        filtroCategoria.appendChild(opcion);
    });
}

function productoTienePromocion(producto) {
    return Number(producto.precioAnterior || 0) > Number(producto.precio || 0);
}

function coincideDisponibilidad(producto) {
    if (!filtroDisponibilidad.value) return true;
    if (filtroDisponibilidad.value === "disponible") return producto.stock > 0;
    if (filtroDisponibilidad.value === "bajo") return producto.stock > 0 && producto.stock <= 5;
    if (filtroDisponibilidad.value === "sin-stock") return producto.stock <= 0;
    return true;
}

function ordenarLista(productos) {
    const copia = productos.slice();

    if (ordenProductos.value === "precio-asc") {
        copia.sort(function (a, b) { return a.precio - b.precio; });
    } else if (ordenProductos.value === "precio-desc") {
        copia.sort(function (a, b) { return b.precio - a.precio; });
    } else if (ordenProductos.value === "nombre") {
        copia.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); });
    } else {
        copia.sort(function (a, b) {
            if (productoTienePromocion(a) !== productoTienePromocion(b)) {
                return productoTienePromocion(a) ? -1 : 1;
            }
            if ((a.stock > 0) !== (b.stock > 0)) {
                return a.stock > 0 ? -1 : 1;
            }
            return a.id - b.id;
        });
    }

    return copia;
}

function abrirDetalle(id) {
    TodoTala.irA("../detalle_producto/todo_tala_detalle_producto.html?id=" + id);
}

function agregarRapido(id) {
    const agregado = TodoTala.agregarAlCarrito(id, 1);

    if (!agregado) {
        TodoTala.toast("No se pudo agregar: revisá el stock disponible", "danger");
        return;
    }

    actualizarContador();
    TodoTala.toast("Producto agregado al carrito", "success");
}

function renderizarCatalogo() {
    const datos = TodoTala.obtenerDatos();
    const texto = buscadorCatalogo.value.trim().toLowerCase();
    const minimo = precioMinimo.value === "" ? null : Number(precioMinimo.value);
    const maximo = precioMaximo.value === "" ? null : Number(precioMaximo.value);

    let productos = datos.productos.filter(function (producto) {
        const textoProducto = [
            producto.nombre,
            producto.marca,
            producto.comercio,
            producto.categoria,
            producto.localidad
        ].join(" ").toLowerCase();

        const coincideTexto = textoProducto.includes(texto);
        const coincideComercio = !filtroComercio.value || producto.comercio === filtroComercio.value;
        const coincideCategoria = !filtroCategoria.value || producto.categoria === filtroCategoria.value;
        const coincideMinimo = minimo === null || producto.precio >= minimo;
        const coincideMaximo = maximo === null || producto.precio <= maximo;
        const coincidePromo = !filtroPromocion.checked || productoTienePromocion(producto);

        return producto.visible &&
            coincideTexto &&
            coincideComercio &&
            coincideCategoria &&
            coincideDisponibilidad(producto) &&
            coincideMinimo &&
            coincideMaximo &&
            coincidePromo;
    });

    productos = ordenarLista(productos);
    listaCatalogo.innerHTML = "";
    resumenCatalogo.textContent = productos.length + (productos.length === 1 ? " producto encontrado" : " productos encontrados");

    if (productos.length === 0) {
        listaCatalogo.innerHTML = '<div class="empty-state"><strong>No encontramos coincidencias.</strong><br>Probá quitando algún filtro o usando otra búsqueda.</div>';
        return;
    }

    productos.forEach(function (producto) {
        const tarjeta = document.createElement("article");
        const stock = TodoTala.estadoStock(producto);
        const tienePromo = productoTienePromocion(producto);

        tarjeta.className = "product-card";
        tarjeta.innerHTML =
            '<div class="product-image" data-detalle>' + producto.imagenTexto + '</div>' +
            '<div class="product-card__body">' +
                '<div class="product-stock-row">' +
                    '<span class="' + stock.clase + '">' + stock.texto + '</span>' +
                    (tienePromo ? '<span class="badge">Promoción</span>' : '') +
                '</div>' +
                '<strong class="product-card__title" data-detalle>' + producto.nombre + '</strong>' +
                '<p class="product-store">' + producto.comercio + ' · ' + producto.localidad + '</p>' +
                '<p class="muted">' + producto.marca + ' · ' + producto.categoria + '</p>' +
                '<div class="product-price-row">' +
                    '<p><span class="product-price">' + TodoTala.formatearPrecio(producto.precio) + '</span>' +
                    (tienePromo ? '<span class="old-price">' + TodoTala.formatearPrecio(producto.precioAnterior) + '</span>' : '') + '</p>' +
                '</div>' +
                '<div class="product-card__actions">' +
                    '<button class="btn btn--primary" data-agregar type="button" ' + (producto.stock <= 0 ? 'disabled' : '') + '>' + (producto.stock > 0 ? 'Agregar' : 'Sin stock') + '</button>' +
                    '<button class="btn btn--secondary btn-detail" data-detalle type="button" aria-label="Ver detalle">→</button>' +
                '</div>' +
            '</div>';

        tarjeta.querySelectorAll("[data-detalle]").forEach(function (elemento) {
            elemento.addEventListener("click", function () {
                abrirDetalle(producto.id);
            });
        });

        const botonAgregar = tarjeta.querySelector("[data-agregar]");
        botonAgregar.addEventListener("click", function () {
            agregarRapido(producto.id);
        });

        listaCatalogo.appendChild(tarjeta);
    });
}

function actualizarContador() {
    contadorCarrito.textContent = TodoTala.cantidadCarrito();
}

function limpiarFiltros() {
    buscadorCatalogo.value = "";
    filtroComercio.value = "";
    filtroCategoria.value = "";
    filtroDisponibilidad.value = "";
    filtroPromocion.checked = false;
    precioMinimo.value = "";
    precioMaximo.value = "";
    ordenProductos.value = "relevancia";
    renderizarCatalogo();
}

[
    buscadorCatalogo,
    precioMinimo,
    precioMaximo
].forEach(function (campo) {
    campo.addEventListener("input", renderizarCatalogo);
});

[
    filtroComercio,
    filtroCategoria,
    filtroDisponibilidad,
    filtroPromocion,
    ordenProductos
].forEach(function (campo) {
    campo.addEventListener("change", renderizarCatalogo);
});

document.getElementById("btn-limpiar").addEventListener("click", limpiarFiltros);
document.getElementById("btn-carrito").addEventListener("click", function () {
    TodoTala.irA("../carrito_pedidos/todo_tala_carrito_pedido.html");
});
document.getElementById("btn-pedidos").addEventListener("click", function () {
    TodoTala.irA("../mis_pedidos/todo_tala_mis_pedidos.html");
});

cargarFiltros();
renderizarCatalogo();
actualizarContador();
