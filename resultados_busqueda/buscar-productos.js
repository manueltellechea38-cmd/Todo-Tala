/* Referencias a los filtros de búsqueda. */
const inputBuscar = document.getElementById("search-input");
const selectCategoria = document.getElementById("categoria");
const inputPrecioMax = document.getElementById("precio-max");
const checkStock = document.getElementById("solo-stock");
const contenedorResultados = document.getElementById("lista-resultados");
const resumenResultados = document.getElementById("resumen");

/* Carga las categorías sin repetir. */
function cargarCategorias() {
    const datos = TodoTala.obtenerDatos();
    const categorias = [...new Set(datos.productos.map(function (producto) { return producto.categoria; }))].sort();

    categorias.forEach(function (categoria) {
        const opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectCategoria.appendChild(opcion);
    });
}

/* Filtra y muestra los productos que coinciden. */
function ejecutarBusqueda() {
    const datos = TodoTala.obtenerDatos();
    const texto = inputBuscar.value.trim().toLowerCase();
    const maximo = inputPrecioMax.value ? Number(inputPrecioMax.value) : Infinity;

    const resultados = datos.productos.filter(function (producto) {
        const contenido = (producto.nombre + " " + producto.marca + " " + producto.comercio + " " + producto.categoria).toLowerCase();
        return producto.visible &&
            contenido.includes(texto) &&
            (!selectCategoria.value || producto.categoria === selectCategoria.value) &&
            producto.precio <= maximo &&
            (!checkStock.checked || producto.stock > 0);
    });

    resumenResultados.textContent = resultados.length + (resultados.length === 1 ? " resultado" : " resultados");

    if (resultados.length === 0) {
        contenedorResultados.innerHTML = '<p class="empty-state">No encontramos productos con esos criterios.</p>';
        return;
    }

    contenedorResultados.innerHTML = resultados.map(function (producto) {
        const estado = TodoTala.estadoStock(producto);
        return '<article class="result-item" data-id="' + producto.id + '">' +
            '<figure class="result-image">' + producto.imagenTexto + '</figure>' +
            '<section class="result-info"><strong>' + producto.nombre + '</strong><p class="muted">' + producto.comercio + ' · ' + producto.categoria + '</p><p><strong>' + TodoTala.formatearPrecio(producto.precio) + '</strong> · <span class="' + estado.clase + '">' + estado.texto + '</span></p></section>' +
            '<button class="btn btn--secondary" type="button">Ver detalle</button>' +
        '</article>';
    }).join("");

    document.querySelectorAll("[data-id]").forEach(function (item) {
        item.querySelector("button").addEventListener("click", function () {
            TodoTala.irA("../detalle_producto/todo_tala_detalle_producto.html?id=" + item.dataset.id);
        });
    });
}

/* Recupera una búsqueda enviada desde la pantalla de inicio. */
const consultaInicial = TodoTala.parametro("q");
if (consultaInicial) inputBuscar.value = consultaInicial;

cargarCategorias();
ejecutarBusqueda();

document.getElementById("form-busqueda").addEventListener("submit", function (evento) {
    evento.preventDefault();
    ejecutarBusqueda();
});

inputBuscar.addEventListener("input", ejecutarBusqueda);
selectCategoria.addEventListener("change", ejecutarBusqueda);
inputPrecioMax.addEventListener("input", ejecutarBusqueda);
checkStock.addEventListener("change", ejecutarBusqueda);
