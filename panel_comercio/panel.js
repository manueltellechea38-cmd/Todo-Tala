const datosPanel = TodoTala.obtenerDatos();
const usuarioPanel = TodoTala.usuarioActual();
const comercioPanel = datosPanel.comercios.find(function (comercio) {
    return comercio.id === usuarioPanel.comercioId;
});

const productos = datosPanel.productos.filter(function (producto) {
    return producto.comercioId === usuarioPanel.comercioId;
});

const pedidos = datosPanel.pedidos.filter(function (pedido) {
    return pedido.comercioId === usuarioPanel.comercioId && !["Entregado", "Cancelado", "Rechazado"].includes(pedido.estado);
});

const promociones = datosPanel.promociones.filter(function (promo) {
    return promo.comercioId === usuarioPanel.comercioId && promo.activa;
});

const empleados = datosPanel.usuarios.filter(function (usuario) {
    return usuario.rol === "empleado" && usuario.comercioId === usuarioPanel.comercioId;
});

document.getElementById("nombre-comercio").textContent = comercioPanel ? comercioPanel.nombre : "Mi comercio";
document.getElementById("rol-actual").textContent = usuarioPanel.rol === "jefe" ? "Jefe del comercio" : "Empleado";
document.getElementById("cantidad-productos").textContent = productos.length;
document.getElementById("cantidad-pedidos").textContent = pedidos.length;
document.getElementById("cantidad-promos").textContent = promociones.length;
document.getElementById("cantidad-empleados").textContent = empleados.length;

const stockBajo = productos.filter(function (producto) {
    return producto.stock <= 5;
});

if (stockBajo.length > 0) {
    document.getElementById("aviso-stock").innerHTML = '<article class="stock-warning"><strong>Stock bajo</strong><p>' +
        stockBajo.map(function (producto) {
            return producto.nombre + " (" + producto.stock + ")";
        }).join(" · ") +
    '</p></article>';
}

if (usuarioPanel.rol !== "jefe") {
    document.getElementById("acceso-empleados").hidden = true;
    document.getElementById("nav-empleados").hidden = true;
    document.getElementById("metric-empleados").hidden = true;
    document.getElementById("nav-comercio").className = "commerce-nav commerce-nav--4";
}

document.getElementById("btn-salir").addEventListener("click", function () {
    TodoTala.cerrarSesion();
    TodoTala.abrir("pantalla_login/todo_tala_pantalla_login.html");
});