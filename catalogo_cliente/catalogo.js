/* Referencias a los filtros y a la lista de productos. */
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

/* Carga comercios y categorías disponibles en los filtros. */
function cargarFiltros() {
    const datos = TodoTala.obtenerDatos();
    const comercios = [...new Set(datos.productos.map(function (producto) { return producto.comercio; }))].sort();
    const categorias = [...new Set(datos.productos.map(function (producto) { return producto.categoria; }))].sort();

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

/* Comprueba si el producto tiene un precio anterior mayor al actual. */
function tienePromocion(producto) {
    return Number(producto.precioAnterior || 0) > Number(producto.precio || 0);
}

/* Aplica el filtro de disponibilidad. */
function coincideDisponibilidad(producto) {
    if (!filtroDisponibilidad.value) return true;
    if (filtroDisponibilidad.value === "disponible") return producto.stock > 0;
    if (filtroDisponibilidad.value === "bajo") return producto.stock > 0 && producto.stock <= 5;
    if (filtroDisponibilidad.value === "sin-stock") return producto.stock <= 0;
    return true;
}

/* Ordena una copia de la lista sin modificar los datos originales. */
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
            if (tienePromocion(a) !== tienePromocion(b)) return tienePromocion(a) ? -1 : 1;
            if ((a.stock > 0) !== (b.stock > 0)) return a.stock > 0 ? -1 : 1;
            return a.id - b.id;
        });
    }

    return copia;
}

/* Agrega una unidad desde la tarjeta del catálogo. */
function agregarRapido(id) {
    if (!TodoTala.agregarAlCarrito(id, 1)) {
        TodoTala.toast("No se pudo agregar. Revisá el stock disponible.");
        return;
    }

    contadorCarrito.textContent = TodoTala.cantidadCarrito();
    TodoTala.toast("Producto agregado al carrito");
}

/* Filtra y muestra los productos. */
function renderizarCatalogo() {
    const datos = TodoTala.obtenerDatos();
    const texto = buscadorCatalogo.value.trim().toLowerCase();
    const minimo = precioMinimo.value === "" ? null : Number(precioMinimo.value);
    const maximo = precioMaximo.value === "" ? null : Number(precioMaximo.value);

    let productos = datos.productos.filter(function (producto) {
        const contenido = [producto.nombre, producto.marca, producto.comercio, producto.categoria, producto.localidad].join(" ").toLowerCase();

        return producto.visible &&
            contenido.includes(texto) &&
            (!filtroComercio.value || producto.comercio === filtroComercio.value) &&
            (!filtroCategoria.value || producto.categoria === filtroCategoria.value) &&
            coincideDisponibilidad(producto) &&
            (minimo === null || producto.precio >= minimo) &&
            (maximo === null || producto.precio <= maximo) &&
            (!filtroPromocion.checked || tienePromocion(producto));
    });

    productos = ordenarLista(productos);
    resumenCatalogo.textContent = productos.length + (productos.length === 1 ? " producto encontrado" : " productos encontrados");

    if (productos.length === 0) {
        listaCatalogo.innerHTML = '<p class="empty-state">No encontramos productos con esos filtros.</p>';
        return;
    }

    listaCatalogo.innerHTML = productos.map(function (producto) {
        const stock = TodoTala.estadoStock(producto);
        const promocion = tienePromocion(producto);

        return '<article class="product-card" data-id="' + producto.id + '">' +
            '<section class="product-image" data-detalle>' + producto.imagenTexto + '</section>' +
            '<section class="product-card__body">' +
                '<p class="product-stock-row"><span class="' + stock.clase + '">' + stock.texto + '</span>' + (promocion ? '<span class="badge">Promoción</span>' : '') + '</p>' +
                '<strong class="product-card__title" data-detalle>' + producto.nombre + '</strong>' +
                '<p class="product-store">' + producto.comercio + ' · ' + producto.localidad + '</p>' +
                '<p class="muted">' + producto.marca + ' · ' + producto.categoria + '</p>' +
                '<p class="product-price-row"><span class="product-price">' + TodoTala.formatearPrecio(producto.precio) + '</span>' + (promocion ? '<span class="old-price">' + TodoTala.formatearPrecio(producto.precioAnterior) + '</span>' : '') + '</p>' +
                '<nav class="product-card__actions"><button class="btn btn--primary" data-agregar type="button" ' + (producto.stock <= 0 ? 'disabled' : '') + '>' + (producto.stock > 0 ? 'Agregar' : 'Sin stock') + '</button><button class="btn btn--secondary" data-detalle type="button">Ver</button></nav>' +
            '</section>' +
        '</article>';
    }).join("");

    /* Conecta las acciones después de crear las tarjetas. */
    document.querySelectorAll(".product-card").forEach(function (tarjeta) {
        const id = Number(tarjeta.dataset.id);

        tarjeta.querySelectorAll("[data-detalle]").forEach(function (elemento) {
            elemento.addEventListener("click", function () {
                TodoTala.irA("../detalle_producto/todo_tala_detalle_producto.html?id=" + id);
            });
        });

        tarjeta.querySelector("[data-agregar]").addEventListener("click", function () {
            agregarRapido(id);
        });
    });
}

/* Limpia todos los filtros del catálogo. */
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

[buscadorCatalogo, precioMinimo, precioMaximo].forEach(function (campo) {
    campo.addEventListener("input", renderizarCatalogo);
});

[filtroComercio, filtroCategoria, filtroDisponibilidad, filtroPromocion, ordenProductos].forEach(function (campo) {
    campo.addEventListener("change", renderizarCatalogo);
});

document.getElementById("btn-limpiar").addEventListener("click", limpiarFiltros);

cargarFiltros();
renderizarCatalogo();
contadorCarrito.textContent = TodoTala.cantidadCarrito();
