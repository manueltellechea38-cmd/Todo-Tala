const datosPanel = TodoTala.obtenerDatos();
const usuarioPanel = TodoTala.usuarioActual();
const comercioPanel = TodoTala.comercioActual();

/* Filtra la información para mostrar solamente datos del comercio actual. */
const productosPanel = datosPanel.productos.filter(function (producto) {
    return producto.comercioId === usuarioPanel.comercioId;
});

const pedidosPanel = datosPanel.pedidos.filter(function (pedido) {
    return pedido.comercioId === usuarioPanel.comercioId && !["Entregado", "Cancelado", "Rechazado"].includes(pedido.estado);
});

const promocionesPanel = datosPanel.promociones.filter(function (promo) {
    return promo.comercioId === usuarioPanel.comercioId && promo.activa;
});

const empleadosPanel = datosPanel.usuarios.filter(function (usuario) {
    return usuario.rol === "empleado" && usuario.comercioId === usuarioPanel.comercioId;
});

/* Completa las métricas del panel. */
document.getElementById("nombre-comercio").textContent = comercioPanel ? comercioPanel.nombre : "Mi comercio";
document.getElementById("rol-actual").textContent = usuarioPanel.rol === "jefe" ? "Jefe del comercio" : "Empleado";
document.getElementById("cantidad-productos").textContent = productosPanel.length;
document.getElementById("cantidad-pedidos").textContent = pedidosPanel.length;
document.getElementById("cantidad-promos").textContent = promocionesPanel.length;
document.getElementById("cantidad-empleados").textContent = empleadosPanel.length;

/* Avisa cuando algún producto tiene cinco unidades o menos. */
const stockBajo = productosPanel.filter(function (producto) {
    return producto.stock <= 5;
});

if (stockBajo.length > 0) {
    document.getElementById("aviso-stock").innerHTML = '<article class="stock-warning"><strong>Stock bajo</strong><p>' + stockBajo.map(function (producto) { return producto.nombre + " (" + producto.stock + ")"; }).join(" · ") + '</p></article>';
}

/* Cierra la sesión desde el panel. */
document.getElementById("btn-salir").addEventListener("click", function () {
    TodoTala.cerrarSesion();
    TodoTala.abrir("pantalla_login/todo_tala_pantalla_login.html");
});
