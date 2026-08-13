/* Obtiene los elementos de control. */
const inputBuscar = document.getElementById("search-input");
/* Obtiene el selector de categoría. */
const selectCategoria = document.getElementById("categoria");
/* Obtiene el precio máximo. */
const inputPrecioMax = document.getElementById("precio-max");
/* Obtiene la casilla de disponibilidad. */
const checkStock = document.getElementById("solo-stock");
/* Obtiene el contenedor de resultados. */
const contenedorResultados = document.getElementById("lista-resultados");
/* Obtiene el resumen. */
const resumenResultados = document.getElementById("resumen");

/* Carga categorías disponibles. */
function cargarCategoriasBusqueda() {
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Obtiene categorías sin repetir. */
    const categorias = [...new Set(datos.productos.map(function (producto) { return producto.categoria; }))];
    /* Recorre categorías. */
    categorias.forEach(function (categoria) {
        /* Crea una opción. */
        const opcion = document.createElement("option");
        /* Define valor. */
        opcion.value = categoria;
        /* Define texto. */
        opcion.textContent = categoria;
        /* Agrega opción. */
        selectCategoria.appendChild(opcion);
    });
}

/* Ejecuta la búsqueda con los filtros elegidos. */
function ejecutarBusqueda() {
    /* Obtiene datos actuales. */
    const datos = TodoTala.obtenerDatos();
    /* Normaliza texto. */
    const texto = inputBuscar.value.trim().toLowerCase();
    /* Convierte precio máximo o usa infinito si está vacío. */
    const maximo = inputPrecioMax.value ? Number(inputPrecioMax.value) : Infinity;
    /* Filtra productos. */
    const resultados = datos.productos.filter(function (producto) {
        /* Comprueba texto. */
        const coincideTexto = (producto.nombre + " " + producto.marca + " " + producto.comercio).toLowerCase().includes(texto);
        /* Comprueba categoría. */
        const coincideCategoria = !selectCategoria.value || producto.categoria === selectCategoria.value;
        /* Comprueba precio. */
        const coincidePrecio = producto.precio <= maximo;
        /* Comprueba stock si la casilla está marcada. */
        const coincideStock = !checkStock.checked || producto.stock > 0;
        /* Solo devuelve productos visibles. */
        return producto.visible && coincideTexto && coincideCategoria && coincidePrecio && coincideStock;
    });
    /* Limpia el contenedor. */
    contenedorResultados.innerHTML = "";
    /* Muestra cantidad. */
    resumenResultados.textContent = resultados.length + " resultado(s)";
    /* Gestiona el estado vacío. */
    if (resultados.length === 0) {
        /* Muestra mensaje. */
        contenedorResultados.innerHTML = '<div class="empty-state">No encontramos productos con esos criterios.</div>';
        /* Finaliza. */
        return;
    }
    /* Recorre resultados. */
    resultados.forEach(function (producto) {
        /* Crea artículo. */
        const item = document.createElement("article");
        /* Asigna clase. */
        item.className = "result-item";
        /* Crea contenido. */
        item.innerHTML = '<div class="result-image">' + producto.imagenTexto + '</div>' +
            '<div><strong>' + producto.nombre + '</strong><p class="muted">' + producto.comercio + ' · ' + producto.categoria + '</p>' +
            '<p><strong>' + TodoTala.formatearPrecio(producto.precio) + '</strong> · <span class="' + (producto.stock > 0 ? 'badge badge--success' : 'badge badge--danger') + '">' + (producto.stock > 0 ? producto.stock + ' disponibles' : 'Sin stock') + '</span></p></div>' +
            '<button class="btn btn--secondary" type="button">Ver detalle</button>';
        /* Abre detalle desde el botón. */
        item.querySelector("button").addEventListener("click", function () {
            /* Navega con el id. */
            TodoTala.irA("../detalle_producto/todo_tala_detalle_producto.html?id=" + producto.id);
        });
        /* Agrega al listado. */
        contenedorResultados.appendChild(item);
    });
}

/* Lee una consulta recibida desde otra ventana. */
const consultaInicial = TodoTala.parametro("q");
/* Si existe, la coloca en el buscador. */
if (consultaInicial) inputBuscar.value = consultaInicial;
/* Carga categorías. */
cargarCategoriasBusqueda();
/* Ejecuta búsqueda inicial. */
ejecutarBusqueda();
/* Busca al tocar el botón. */
document.getElementById("btn-buscar").addEventListener("click", ejecutarBusqueda);
/* Actualiza al cambiar stock. */
checkStock.addEventListener("change", ejecutarBusqueda);
/* Regresa al inicio. */
document.getElementById("btn-volver").addEventListener("click", function () { TodoTala.irA("../pantalla_inicio/todo_tala_pantalla_inicio.html"); });
