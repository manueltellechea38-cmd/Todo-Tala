/* Obtiene el campo de búsqueda. */
const buscarGestion = document.getElementById("buscar-producto");
/* Obtiene el filtro de visibilidad. */
const filtroVisibilidad = document.getElementById("filtro-visibilidad");
/* Obtiene la lista. */
const listaGestion = document.getElementById("lista-productos");

/* Renderiza los productos de Panadería El Sol. */
function renderizarGestionProductos() {
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Normaliza búsqueda. */
    const texto = buscarGestion.value.trim().toLowerCase();
    /* Filtra productos del comercio demo. */
    const productos = datos.productos.filter(function (producto) {
        /* Comprueba comercio. */
        const esDelComercio = producto.comercio === "Panadería El Sol";
        /* Comprueba texto. */
        const coincideTexto = producto.nombre.toLowerCase().includes(texto);
        /* Comprueba visibilidad. */
        const coincideVisibilidad = !filtroVisibilidad.value || (filtroVisibilidad.value === "visible" ? producto.visible : !producto.visible);
        /* Devuelve resultado. */
        return esDelComercio && coincideTexto && coincideVisibilidad;
    });
    /* Limpia lista. */
    listaGestion.innerHTML = "";
    /* Gestiona estado vacío. */
    if (productos.length === 0) {
        /* Muestra mensaje. */
        listaGestion.innerHTML = '<div class="empty-state">No hay productos con esos filtros.</div>';
        /* Finaliza. */
        return;
    }
    /* Recorre productos. */
    productos.forEach(function (producto) {
        /* Crea fila. */
        const fila = document.createElement("article");
        /* Asigna clase. */
        fila.className = "product-row";
        /* Define contenido. */
        fila.innerHTML = '<div><div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;"><strong>' + producto.nombre + '</strong><span class="' + (producto.visible ? 'badge badge--success' : 'badge') + '">' + (producto.visible ? 'Publicado' : 'Oculto') + '</span>' + (producto.stock <= 3 ? '<span class="badge badge--warning">Stock bajo: ' + producto.stock + '</span>' : '') + '</div><p class="muted">' + producto.categoria + ' · ' + producto.marca + '</p><p><strong>' + TodoTala.formatearPrecio(producto.precio) + '</strong> · Stock ' + producto.stock + '</p></div>' +
            '<div class="product-row__actions"><button class="btn btn--secondary" data-action="editar" type="button">Editar</button><button class="btn btn--secondary" data-action="visibilidad" type="button">' + (producto.visible ? 'Ocultar' : 'Publicar') + '</button></div>';
        /* Abre edición. */
        fila.querySelector('[data-action="editar"]').addEventListener("click", function () { TodoTala.irA("../editar_producto/todo_tala_editar_producto.html?id=" + producto.id); });
        /* Alterna visibilidad. */
        fila.querySelector('[data-action="visibilidad"]').addEventListener("click", function () {
            /* Invierte estado. */
            producto.visible = !producto.visible;
            /* Guarda datos. */
            TodoTala.guardarDatos(datos);
            /* Informa. */
            TodoTala.toast(producto.visible ? "Producto publicado" : "Producto ocultado");
            /* Refresca. */
            renderizarGestionProductos();
        });
        /* Agrega fila. */
        listaGestion.appendChild(fila);
    });
}

/* Filtra al escribir. */
buscarGestion.addEventListener("input", renderizarGestionProductos);
/* Filtra al cambiar selector. */
filtroVisibilidad.addEventListener("change", renderizarGestionProductos);
/* Abre alta de producto. */
document.getElementById("btn-agregar").addEventListener("click", function () { TodoTala.irA("../agregar_editar_producto/todo_tala_agregar_editar_producto.html"); });
/* Vuelve al panel. */
document.getElementById("btn-volver").addEventListener("click", function () { TodoTala.irA("../panel_comercio/todo_tala_panel_comercio.html"); });
/* Renderiza inicialmente. */
renderizarGestionProductos();
