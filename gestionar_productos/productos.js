const buscarProductos = document.getElementById("buscar-producto");
const filtroVisibilidad = document.getElementById("filtro-visibilidad");
const listaProductos = document.getElementById("lista-productos");
const usuarioProductos = TodoTala.usuarioActual();

/* Filtra y muestra solamente productos del comercio actual. */
function renderizarProductos() {
    const datos = TodoTala.obtenerDatos();
    const texto = buscarProductos.value.trim().toLowerCase();
    const productos = datos.productos.filter(function (producto) {
        const coincideTexto = (producto.nombre + " " + producto.marca + " " + producto.categoria).toLowerCase().includes(texto);
        const coincideVisibilidad = !filtroVisibilidad.value || (filtroVisibilidad.value === "visible" ? producto.visible : !producto.visible);
        return producto.comercioId === usuarioProductos.comercioId && coincideTexto && coincideVisibilidad;
    });

    if (productos.length === 0) {
        listaProductos.innerHTML = '<p class="empty-state">No hay productos con esos filtros.</p>';
        return;
    }

    listaProductos.innerHTML = productos.map(function (producto) {
        const stockBajo = producto.stock <= 5 ? '<span class="badge badge--warning">Stock bajo: ' + producto.stock + '</span>' : '';
        const estado = producto.visible ? '<span class="badge badge--success">Publicado</span>' : '<span class="badge">Oculto</span>';

        return '<article class="product-row" data-id="' + producto.id + '">' +
            '<section class="product-info"><p class="product-badges"><strong>' + producto.nombre + '</strong>' + estado + stockBajo + '</p><p class="muted">' + producto.categoria + ' · ' + producto.marca + '</p><p><strong>' + TodoTala.formatearPrecio(producto.precio) + '</strong> · Stock ' + producto.stock + '</p></section>' +
            '<nav class="product-row__actions"><button class="btn btn--secondary" data-editar type="button">Editar</button><button class="btn btn--secondary" data-visibilidad type="button">' + (producto.visible ? 'Ocultar' : 'Publicar') + '</button></nav>' +
        '</article>';
    }).join("");

    /* Conecta las acciones de cada fila. */
    document.querySelectorAll("[data-id]").forEach(function (fila) {
        const id = Number(fila.dataset.id);
        const producto = datos.productos.find(function (item) { return item.id === id; });

        fila.querySelector("[data-editar]").addEventListener("click", function () {
            TodoTala.irA("../editar_producto/todo_tala_editar_producto.html?id=" + id);
        });

        fila.querySelector("[data-visibilidad]").addEventListener("click", function () {
            producto.visible = !producto.visible;
            TodoTala.guardarDatos(datos);
            renderizarProductos();
        });
    });
}

buscarProductos.addEventListener("input", renderizarProductos);
filtroVisibilidad.addEventListener("change", renderizarProductos);
document.getElementById("filtros-productos").addEventListener("submit", function (evento) { evento.preventDefault(); });

renderizarProductos();
