const buscarGestion = document.getElementById("buscar-producto");
const filtroVisibilidad = document.getElementById("filtro-visibilidad");
const listaGestion = document.getElementById("lista-productos");
const usuarioGestion = TodoTala.usuarioActual();

function renderizarGestionProductos() {
    const datos = TodoTala.obtenerDatos();
    const texto = buscarGestion.value.trim().toLowerCase();
    const productos = datos.productos.filter(function (producto) {
        const esDelComercio = producto.comercioId === usuarioGestion.comercioId;
        const coincideTexto = producto.nombre.toLowerCase().includes(texto);
        const coincideVisibilidad = !filtroVisibilidad.value ||
            (filtroVisibilidad.value === "visible" ? producto.visible : !producto.visible);
        return esDelComercio && coincideTexto && coincideVisibilidad;
    });

    if (productos.length === 0) {
        listaGestion.innerHTML = '<p class="empty-state">No hay productos con esos filtros.</p>';
        return;
    }

    listaGestion.innerHTML = productos.map(function (producto) {
        const stockBajo = producto.stock <= 5 ? '<span class="badge badge--warning">Stock bajo: ' + producto.stock + '</span>' : '';
        return '<article class="product-row" data-id="' + producto.id + '">' +
            '<section><strong>' + producto.nombre + '</strong> ' +
            '<span class="' + (producto.visible ? 'badge badge--success' : 'badge') + '">' + (producto.visible ? 'Publicado' : 'Oculto') + '</span> ' + stockBajo +
            '<p class="muted">' + producto.categoria + ' · ' + producto.marca + '</p>' +
            '<p><strong>' + TodoTala.formatearPrecio(producto.precio) + '</strong> · Stock ' + producto.stock + '</p></section>' +
            '<nav class="product-row__actions"><button class="btn btn--secondary" data-action="editar" type="button">Editar</button><button class="btn btn--secondary" data-action="visibilidad" type="button">' + (producto.visible ? 'Ocultar' : 'Publicar') + '</button></nav>' +
        '</article>';
    }).join("");

    document.querySelectorAll("[data-id]").forEach(function (fila) {
        const id = Number(fila.dataset.id);
        const producto = datos.productos.find(function (item) { return item.id === id; });

        fila.querySelector('[data-action="editar"]').addEventListener("click", function () {
            TodoTala.irA("../editar_producto/todo_tala_editar_producto.html?id=" + id);
        });

        fila.querySelector('[data-action="visibilidad"]').addEventListener("click", function () {
            producto.visible = !producto.visible;
            TodoTala.guardarDatos(datos);
            renderizarGestionProductos();
        });
    });
}

buscarGestion.addEventListener("input", renderizarGestionProductos);
filtroVisibilidad.addEventListener("change", renderizarGestionProductos);
document.getElementById("btn-agregar").addEventListener("click", function () {
    TodoTala.irA("../agregar_editar_producto/todo_tala_agregar_editar_producto.html");
});
document.getElementById("btn-volver").addEventListener("click", function () {
    TodoTala.irA("../panel_comercio/todo_tala_panel_comercio.html");
});

renderizarGestionProductos();