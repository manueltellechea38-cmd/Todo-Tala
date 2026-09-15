const usuarioEditar = TodoTala.usuarioActual();
const idEditar = Number(TodoTala.parametro("id"));
const datosEditar = TodoTala.obtenerDatos();
const productoEditar = datosEditar.productos.find(function (producto) {
    return producto.id === idEditar && producto.comercioId === usuarioEditar.comercioId;
});
const botonEliminar = document.getElementById("btn-eliminar");
let confirmarEliminacion = false;

/* Si el producto no pertenece al comercio, vuelve al listado. */
if (!productoEditar) {
    TodoTala.irA("../gestionar_productos/todo_tala_gestion_productos.html");
}

/* Carga los datos actuales del producto en el formulario. */
function cargarProducto() {
    document.getElementById("nombre").value = productoEditar.nombre;
    document.getElementById("marca").value = productoEditar.marca;
    document.getElementById("categoria").value = productoEditar.categoria;
    document.getElementById("precio").value = productoEditar.precio;
    document.getElementById("stock").value = productoEditar.stock;
    document.getElementById("descripcion").value = productoEditar.descripcion;
    document.getElementById("visible").checked = productoEditar.visible;
    actualizarAvisoStock();
}

/* Informa cuando quedan cinco unidades o menos. */
function actualizarAvisoStock() {
    const stock = Number(document.getElementById("stock").value);
    const aviso = document.getElementById("stock-aviso");

    if (stock === 0) aviso.textContent = "Sin stock.";
    else if (stock <= 5) aviso.textContent = "Stock bajo.";
    else aviso.textContent = "Stock disponible.";
}

document.getElementById("stock").addEventListener("input", actualizarAvisoStock);

/* Guarda los cambios realizados. */
document.getElementById("form-editar").addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const marca = document.getElementById("marca").value.trim();
    const precio = Number(document.getElementById("precio").value);
    const stock = Number(document.getElementById("stock").value);
    const valido = nombre !== "" && marca !== "" && precio > 0 && stock >= 0;

    document.getElementById("error-form").classList.toggle("is-visible", !valido);
    if (!valido) return;

    productoEditar.nombre = nombre;
    productoEditar.marca = marca;
    productoEditar.categoria = document.getElementById("categoria").value;
    productoEditar.precio = precio;
    productoEditar.stock = stock;
    productoEditar.descripcion = document.getElementById("descripcion").value.trim();
    productoEditar.visible = document.getElementById("visible").checked;

    TodoTala.guardarDatos(datosEditar);
    TodoTala.toast("Cambios guardados.");
    window.setTimeout(function () {
        TodoTala.irA("../gestionar_productos/todo_tala_gestion_productos.html");
    }, 350);
});

/* La eliminación necesita dos clics para evitar borrados accidentales. */
botonEliminar.addEventListener("click", function () {
    if (!confirmarEliminacion) {
        confirmarEliminacion = true;
        botonEliminar.textContent = "Confirmar eliminación";
        return;
    }

    datosEditar.productos = datosEditar.productos.filter(function (producto) { return producto.id !== productoEditar.id; });
    datosEditar.carrito = datosEditar.carrito.filter(function (item) { return item.id !== productoEditar.id; });
    datosEditar.promociones = datosEditar.promociones.filter(function (promo) { return promo.productoId !== productoEditar.id; });
    TodoTala.guardarDatos(datosEditar);
    TodoTala.irA("../gestionar_productos/todo_tala_gestion_productos.html");
});

cargarProducto();
