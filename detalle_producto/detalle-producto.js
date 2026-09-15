const idProducto = Number(TodoTala.parametro("id") || 1);
const datosDetalle = TodoTala.obtenerDatos();
const producto = datosDetalle.productos.find(function (item) {
    return item.id === idProducto;
});
let cantidad = 1;

/* Si el producto no existe, vuelve al catálogo. */
if (!producto) {
    TodoTala.irA("../catalogo_cliente/todo_tala_catalogo_cliente.html");
}

/* Muestra todos los datos del producto seleccionado. */
function renderizarDetalle() {
    const estado = TodoTala.estadoStock(producto);
    const tienePromocion = Number(producto.precioAnterior || 0) > Number(producto.precio || 0);

    document.getElementById("imagen-producto").textContent = producto.imagenTexto;
    document.getElementById("nombre-producto").textContent = producto.nombre;
    document.getElementById("comercio-producto").textContent = producto.comercio + " · " + producto.localidad;
    document.getElementById("precio-producto").textContent = TodoTala.formatearPrecio(producto.precio);
    document.getElementById("precio-anterior").textContent = tienePromocion ? TodoTala.formatearPrecio(producto.precioAnterior) : "";
    document.getElementById("meta-producto").textContent = producto.marca + " · " + producto.categoria;
    document.getElementById("descripcion-producto").textContent = producto.descripcion;
    document.getElementById("stock-producto").textContent = "Stock actual: " + producto.stock + " unidad(es)";
    document.getElementById("estado-producto").textContent = estado.texto;
    document.getElementById("estado-producto").className = estado.clase;
    document.getElementById("cantidad").textContent = cantidad;
    document.getElementById("btn-agregar").disabled = producto.stock <= 0;
    document.getElementById("btn-agregar").textContent = producto.stock > 0 ? "Agregar al carrito" : "Producto sin stock";
    document.getElementById("btn-favorito").textContent = datosDetalle.favoritos.includes(producto.id) ? "♥" : "♡";
}

/* Cambia la cantidad sin superar el stock. */
function cambiarCantidad(cambio) {
    const nuevaCantidad = cantidad + cambio;

    if (nuevaCantidad < 1 || nuevaCantidad > producto.stock) {
        return;
    }

    cantidad = nuevaCantidad;
    document.getElementById("cantidad").textContent = cantidad;
}

document.getElementById("btn-restar").addEventListener("click", function () {
    cambiarCantidad(-1);
});

document.getElementById("btn-sumar").addEventListener("click", function () {
    cambiarCantidad(1);
});

/* Agrega o quita el producto de favoritos. */
document.getElementById("btn-favorito").addEventListener("click", function () {
    const datos = TodoTala.obtenerDatos();
    const posicion = datos.favoritos.indexOf(producto.id);

    if (posicion >= 0) {
        datos.favoritos.splice(posicion, 1);
    } else {
        datos.favoritos.push(producto.id);
    }

    TodoTala.guardarDatos(datos);
    datosDetalle.favoritos = datos.favoritos;
    renderizarDetalle();
});

/* Agrega la cantidad elegida al carrito y abre el carrito. */
document.getElementById("btn-agregar").addEventListener("click", function () {
    if (!TodoTala.agregarAlCarrito(producto.id, cantidad)) {
        TodoTala.toast("No se pudo agregar esa cantidad.");
        return;
    }

    TodoTala.toast("Producto agregado al carrito");
    window.setTimeout(function () {
        TodoTala.irA("../carrito_pedidos/todo_tala_carrito_pedido.html");
    }, 400);
});

renderizarDetalle();
