/* Obtiene el campo de búsqueda. */
const buscadorCatalogo = document.getElementById("search-input");
/* Obtiene el filtro de comercio. */
const filtroComercio = document.getElementById("filtro-comercio");
/* Obtiene el filtro de categoría. */
const filtroCategoria = document.getElementById("filtro-categoria");
/* Obtiene el contenedor de productos. */
const listaCatalogo = document.getElementById("lista-productos");
/* Obtiene el texto resumen. */
const resumenCatalogo = document.getElementById("resumen-catalogo");
/* Obtiene el contador del carrito. */
const contadorCarrito = document.getElementById("contador-carrito");

/* Carga opciones únicas de comercio y categoría. */
function cargarFiltros() {
    /* Obtiene datos actuales. */
    const datos = TodoTala.obtenerDatos();
    /* Crea una lista única de comercios. */
    const comercios = [...new Set(datos.productos.map(function (producto) { return producto.comercio; }))];
    /* Crea una lista única de categorías. */
    const categorias = [...new Set(datos.productos.map(function (producto) { return producto.categoria; }))];
    /* Agrega cada comercio al selector. */
    comercios.forEach(function (comercio) {
        /* Crea una opción. */
        const opcion = document.createElement("option");
        /* Define su valor. */
        opcion.value = comercio;
        /* Define su texto. */
        opcion.textContent = comercio;
        /* Agrega la opción. */
        filtroComercio.appendChild(opcion);
    });
    /* Agrega cada categoría al selector. */
    categorias.forEach(function (categoria) {
        /* Crea una opción. */
        const opcion = document.createElement("option");
        /* Define su valor. */
        opcion.value = categoria;
        /* Define su texto. */
        opcion.textContent = categoria;
        /* Agrega la opción. */
        filtroCategoria.appendChild(opcion);
    });
}

/* Renderiza los productos que cumplen con los filtros. */
function renderizarCatalogo() {
    /* Obtiene los datos. */
    const datos = TodoTala.obtenerDatos();
    /* Normaliza el texto buscado. */
    const texto = buscadorCatalogo.value.trim().toLowerCase();
    /* Filtra productos visibles según los controles. */
    const productos = datos.productos.filter(function (producto) {
        /* Comprueba coincidencia de texto. */
        const coincideTexto = (producto.nombre + " " + producto.marca + " " + producto.comercio).toLowerCase().includes(texto);
        /* Comprueba comercio. */
        const coincideComercio = !filtroComercio.value || producto.comercio === filtroComercio.value;
        /* Comprueba categoría. */
        const coincideCategoria = !filtroCategoria.value || producto.categoria === filtroCategoria.value;
        /* Solo devuelve productos publicados. */
        return producto.visible && coincideTexto && coincideComercio && coincideCategoria;
    });
    /* Vacía resultados anteriores. */
    listaCatalogo.innerHTML = "";
    /* Actualiza el resumen. */
    resumenCatalogo.textContent = productos.length + " producto(s) encontrado(s)";
    /* Muestra estado vacío si no hay coincidencias. */
    if (productos.length === 0) {
        /* Agrega un mensaje simple. */
        listaCatalogo.innerHTML = '<div class="empty-state">No encontramos productos con esos filtros.</div>';
        /* Finaliza. */
        return;
    }
    /* Crea una tarjeta por producto. */
    productos.forEach(function (producto) {
        /* Crea el artículo. */
        const tarjeta = document.createElement("article");
        /* Asigna clase visual. */
        tarjeta.className = "product-card";
        /* Define el contenido de la tarjeta. */
        tarjeta.innerHTML = '<div class="product-image">' + producto.imagenTexto + '</div>' +
            '<strong>' + producto.nombre + '</strong>' +
            '<p class="muted">' + producto.comercio + ' · ' + producto.categoria + '</p>' +
            '<div class="product-meta"><strong>' + TodoTala.formatearPrecio(producto.precio) + '</strong>' +
            '<span class="' + (producto.stock > 0 ? 'badge badge--success' : 'badge badge--danger') + '">' + (producto.stock > 0 ? 'En stock' : 'Sin stock') + '</span></div>';
        /* Abre el detalle al hacer clic. */
        tarjeta.addEventListener("click", function () {
            /* Navega con el id del producto. */
            TodoTala.irA("../detalle_producto/todo_tala_detalle_producto.html?id=" + producto.id);
        });
        /* Agrega la tarjeta al catálogo. */
        listaCatalogo.appendChild(tarjeta);
    });
}

/* Actualiza el número de unidades del carrito. */
function actualizarContador() {
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Suma cantidades. */
    const cantidad = datos.carrito.reduce(function (total, item) { return total + item.cantidad; }, 0);
    /* Muestra el resultado. */
    contadorCarrito.textContent = cantidad;
}

/* Filtra en tiempo real al escribir. */
buscadorCatalogo.addEventListener("input", renderizarCatalogo);
/* Filtra al cambiar comercio. */
filtroComercio.addEventListener("change", renderizarCatalogo);
/* Filtra al cambiar categoría. */
filtroCategoria.addEventListener("change", renderizarCatalogo);
/* Abre el carrito. */
document.getElementById("btn-carrito").addEventListener("click", function () { TodoTala.irA("../carrito_pedidos/todo_tala_carrito_pedido.html"); });
/* Abre mis pedidos. */
document.getElementById("btn-pedidos").addEventListener("click", function () { TodoTala.irA("../mis_pedidos/todo_tala_mis_pedidos.html"); });
/* Carga filtros iniciales. */
cargarFiltros();
/* Renderiza productos iniciales. */
renderizarCatalogo();
/* Actualiza el carrito. */
actualizarContador();
