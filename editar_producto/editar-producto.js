const idEditarProducto = Number(TodoTala.parametro("id"));
const usuarioEditar = TodoTala.usuarioActual();
let datosEditar = TodoTala.obtenerDatos();
let productoEditar = datosEditar.productos.find(function (producto) {
    return producto.id === idEditarProducto && producto.comercioId === usuarioEditar.comercioId;
});

if (!productoEditar) {
    TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html");
}

function actualizarAvisoStock() {
    const stock = Number(document.getElementById("stock").value);
    const aviso = document.getElementById("stock-aviso");

    if (stock === 0) {
        aviso.textContent = "Sin stock";
    } else if (stock <= 5) {
        aviso.textContent = "Stock bajo";
    } else {
        aviso.textContent = "Stock disponible";
    }
}

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

document.getElementById("stock").addEventListener("input", actualizarAvisoStock);

document.getElementById("form-editar").addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const marca = document.getElementById("marca").value.trim();
    const precio = Number(document.getElementById("precio").value);
    const stock = Number(document.getElementById("stock").value);
    const valido = nombre && marca && precio > 0 && stock >= 0;

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
    TodoTala.toast("Cambios guardados");
    setTimeout(function () {
        TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html");
    }, 350);
});

document.getElementById("btn-eliminar").addEventListener("click", function () {
    if (!window.confirm("¿Querés eliminar este producto?")) return;

    datosEditar.productos = datosEditar.productos.filter(function (producto) {
        return producto.id !== productoEditar.id;
    });
    datosEditar.carrito = datosEditar.carrito.filter(function (item) {
        return item.id !== productoEditar.id;
    });
    TodoTala.guardarDatos(datosEditar);
    TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html");
});

document.getElementById("btn-volver").addEventListener("click", function () {
    TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html");
});

if (productoEditar) cargarProducto();