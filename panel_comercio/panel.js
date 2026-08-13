/* Obtiene los datos actuales del MVP. */
const datosPanel = TodoTala.obtenerDatos();
/* Filtra productos del comercio demo. */
const productosComercio = datosPanel.productos.filter(function (producto) { return producto.comercio === "Panadería El Sol"; });
/* Filtra pedidos que todavía no están entregados o cancelados. */
const pedidosActivos = datosPanel.pedidos.filter(function (pedido) { return pedido.comercio === "Panadería El Sol" && !["Entregado", "Cancelado", "Rechazado"].includes(pedido.estado); });
/* Cuenta promociones existentes. */
const promocionesComercio = datosPanel.promociones.length;
/* Muestra la cantidad de productos. */
document.getElementById("cantidad-productos").textContent = productosComercio.length;
/* Muestra la cantidad de pedidos activos. */
document.getElementById("cantidad-pedidos").textContent = pedidosActivos.length;
/* Muestra la cantidad de promociones. */
document.getElementById("cantidad-promos").textContent = promocionesComercio;
/* Muestra el rol elegido en login si existe. */
document.getElementById("rol-actual").textContent = datosPanel.sesion.rol === "empleado" ? "Panel del empleado" : "Panel del jefe";
/* Obtiene productos con stock menor o igual a tres. */
const stockBajo = productosComercio.filter(function (producto) { return producto.stock <= 3; });
/* Si existe stock bajo muestra un aviso. */
if (stockBajo.length > 0) {
    /* Inserta aviso de stock. */
    document.getElementById("aviso-stock").innerHTML = '<div class="mini-card" style="background:var(--color-warning-soft);"><strong>Atención de stock</strong><p class="muted">' + stockBajo.map(function (producto) { return producto.nombre + " (" + producto.stock + ")"; }).join(" · ") + '</p></div>';
}
/* Abre agregar producto. */
document.getElementById("btn-agregar").addEventListener("click", function () { TodoTala.irA("../agregar_editar_producto/todo_tala_agregar_editar_producto.html"); });
/* Abre gestión de productos. */
document.getElementById("btn-productos").addEventListener("click", function () { TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html"); });
/* Abre pedidos recibidos. */
document.getElementById("btn-pedidos").addEventListener("click", function () { TodoTala.irA("../pedidos_recibidos/todo_tala_pedidos_recibidos.html"); });
/* Abre promociones. */
document.getElementById("btn-promos").addEventListener("click", function () { TodoTala.irA("../gestionar_promociones/todo_tala_gestion_promociones.html"); });
/* Cierra la sesión demo. */
document.getElementById("btn-salir").addEventListener("click", function () {
    /* Limpia el rol actual. */
    const datos = TodoTala.obtenerDatos();
    /* Establece sesión vacía. */
    datos.sesion.rol = null;
    /* Guarda el cambio. */
    TodoTala.guardarDatos(datos);
    /* Vuelve al inicio. */
    TodoTala.irA("../pantalla_inicio/todo_tala_pantalla_inicio.html");
});
