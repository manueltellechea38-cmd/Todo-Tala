/* Obtiene el identificador recibido por URL o usa el primer producto como respaldo. */
const idProductoDetalle = Number(TodoTala.parametro("id") || 1);
/* Obtiene los datos actuales del MVP. */
const datosDetalle = TodoTala.obtenerDatos();
/* Busca el producto correspondiente. */
const productoDetalle = datosDetalle.productos.find(function (producto) { return producto.id === idProductoDetalle; }) || datosDetalle.productos[0];
/* Guarda la cantidad seleccionada. */
let cantidadDetalle = 1;

/* Renderiza toda la información del producto. */
function renderizarDetalle() {
    /* Muestra las siglas de imagen. */
    document.getElementById("imagen-producto").textContent = productoDetalle.imagenTexto;
    /* Muestra el nombre. */
    document.getElementById("nombre-producto").textContent = productoDetalle.nombre;
    /* Muestra el comercio. */
    document.getElementById("comercio-producto").textContent = productoDetalle.comercio;
    /* Muestra el precio. */
    document.getElementById("precio-producto").textContent = TodoTala.formatearPrecio(productoDetalle.precio);
    /* Muestra precio anterior solo si existe. */
    document.getElementById("precio-anterior").textContent = productoDetalle.precioAnterior ? TodoTala.formatearPrecio(productoDetalle.precioAnterior) : "";
    /* Muestra marca y categoría. */
    document.getElementById("meta-producto").textContent = productoDetalle.marca + " · " + productoDetalle.categoria;
    /* Muestra descripción. */
    document.getElementById("descripcion-producto").textContent = productoDetalle.descripcion;
    /* Muestra stock. */
    document.getElementById("stock-producto").textContent = "Stock actual: " + productoDetalle.stock + " unidad(es)";
    /* Obtiene el badge. */
    const badge = document.getElementById("estado-producto");
    /* Define el texto del estado. */
    badge.textContent = productoDetalle.stock > 0 ? "Disponible" : "Sin stock";
    /* Define la clase del estado. */
    badge.className = productoDetalle.stock > 0 ? "badge badge--success" : "badge badge--danger";
    /* Deshabilita agregar si no hay stock. */
    document.getElementById("btn-agregar").disabled = productoDetalle.stock <= 0;
    /* Cambia el texto si no hay stock. */
    if (productoDetalle.stock <= 0) document.getElementById("btn-agregar").textContent = "Producto sin stock";
    /* Actualiza el corazón según favoritos. */
    document.getElementById("btn-favorito").textContent = datosDetalle.favoritos.includes(productoDetalle.id) ? "♥" : "♡";
}

/* Cambia la cantidad respetando los límites del stock. */
function cambiarCantidadDetalle(cambio) {
    /* Calcula la nueva cantidad. */
    const nueva = cantidadDetalle + cambio;
    /* Impide cantidades menores a uno. */
    if (nueva < 1) return;
    /* Impide superar el stock. */
    if (nueva > productoDetalle.stock) return;
    /* Guarda la nueva cantidad. */
    cantidadDetalle = nueva;
    /* Actualiza el texto. */
    document.getElementById("cantidad").textContent = cantidadDetalle;
}

/* Resta una unidad. */
document.getElementById("btn-restar").addEventListener("click", function () { cambiarCantidadDetalle(-1); });
/* Suma una unidad. */
document.getElementById("btn-sumar").addEventListener("click", function () { cambiarCantidadDetalle(1); });
/* Regresa al catálogo. */
document.getElementById("btn-volver").addEventListener("click", function () { TodoTala.irA("../catalogo_cliente/todo_tala_catalogo_cliente.html"); });

/* Alterna el producto como favorito. */
document.getElementById("btn-favorito").addEventListener("click", function () {
    /* Obtiene datos actualizados. */
    const datos = TodoTala.obtenerDatos();
    /* Busca la posición del producto en favoritos. */
    const indice = datos.favoritos.indexOf(productoDetalle.id);
    /* Si ya era favorito lo quita. */
    if (indice >= 0) datos.favoritos.splice(indice, 1);
    /* Si no era favorito lo agrega. */
    else datos.favoritos.push(productoDetalle.id);
    /* Guarda los datos. */
    TodoTala.guardarDatos(datos);
    /* Actualiza el estado local. */
    datosDetalle.favoritos = datos.favoritos;
    /* Vuelve a renderizar. */
    renderizarDetalle();
    /* Informa la acción. */
    TodoTala.toast(indice >= 0 ? "Producto quitado de favoritos" : "Producto agregado a favoritos");
});

/* Agrega el producto al carrito. */
document.getElementById("btn-agregar").addEventListener("click", function () {
    /* Obtiene datos actualizados. */
    const datos = TodoTala.obtenerDatos();
    /* Busca si el producto ya existe en carrito. */
    const existente = datos.carrito.find(function (item) { return item.id === productoDetalle.id; });
    /* Si existe aumenta su cantidad. */
    if (existente) existente.cantidad = Math.min(existente.cantidad + cantidadDetalle, productoDetalle.stock);
    /* Si no existe crea un nuevo item. */
    else datos.carrito.push({ id: productoDetalle.id, cantidad: cantidadDetalle });
    /* Guarda el carrito. */
    TodoTala.guardarDatos(datos);
    /* Informa la acción. */
    TodoTala.toast("Producto agregado al carrito");
    /* Navega al carrito luego de un momento corto. */
    window.setTimeout(function () { TodoTala.irA("../carrito_pedidos/todo_tala_carrito_pedido.html"); }, 550);
});

/* Renderiza al cargar. */
renderizarDetalle();
