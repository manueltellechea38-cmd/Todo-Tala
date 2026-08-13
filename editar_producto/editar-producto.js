/* Obtiene el identificador del producto desde la URL. */
const idEditarProducto = Number(TodoTala.parametro("id") || 2);
/* Obtiene los datos actuales. */
let datosEditar = TodoTala.obtenerDatos();
/* Busca el producto a editar. */
let productoEditar = datosEditar.productos.find(function (producto) { return producto.id === idEditarProducto; });
/* Si no existe regresa a gestión. */
if (!productoEditar) TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html");

/* Carga los valores existentes en el formulario. */
function cargarProductoEditar() {
    /* Carga nombre. */
    document.getElementById("nombre").value = productoEditar.nombre;
    /* Carga marca. */
    document.getElementById("marca").value = productoEditar.marca;
    /* Carga categoría. */
    document.getElementById("categoria").value = productoEditar.categoria;
    /* Carga precio. */
    document.getElementById("precio").value = productoEditar.precio;
    /* Carga stock. */
    document.getElementById("stock").value = productoEditar.stock;
    /* Carga descripción. */
    document.getElementById("descripcion").value = productoEditar.descripcion;
    /* Carga visibilidad. */
    document.getElementById("visible").checked = productoEditar.visible;
    /* Actualiza aviso de stock. */
    actualizarAvisoStock();
}

/* Muestra un aviso simple cuando el stock está por terminarse. */
function actualizarAvisoStock() {
    /* Lee stock actual del formulario. */
    const stock = Number(document.getElementById("stock").value);
    /* Obtiene el texto de ayuda. */
    const aviso = document.getElementById("stock-aviso");
    /* Define el mensaje. */
    aviso.textContent = stock === 0 ? "Sin stock: seguirá visible para el cliente como 'Sin stock'." : stock <= 3 ? "Stock bajo: conviene reponer pronto." : "Stock disponible.";
}

/* Escucha cambios de stock. */
document.getElementById("stock").addEventListener("input", actualizarAvisoStock);

/* Guarda cambios. */
document.getElementById("form-editar").addEventListener("submit", function (evento) {
    /* Evita envío real. */
    evento.preventDefault();
    /* Lee los campos. */
    const nombre = document.getElementById("nombre").value.trim();
    /* Lee marca. */
    const marca = document.getElementById("marca").value.trim();
    /* Lee precio. */
    const precio = Number(document.getElementById("precio").value);
    /* Lee stock. */
    const stock = Number(document.getElementById("stock").value);
    /* Comprueba validez. */
    const valido = nombre !== "" && marca !== "" && precio > 0 && stock >= 0;
    /* Muestra error si corresponde. */
    document.getElementById("error-form").classList.toggle("is-visible", !valido);
    /* Detiene si falla. */
    if (!valido) return;
    /* Actualiza propiedades. */
    productoEditar.nombre = nombre;
    /* Actualiza marca. */
    productoEditar.marca = marca;
    /* Actualiza categoría. */
    productoEditar.categoria = document.getElementById("categoria").value;
    /* Actualiza precio. */
    productoEditar.precio = precio;
    /* Actualiza stock. */
    productoEditar.stock = stock;
    /* Actualiza descripción. */
    productoEditar.descripcion = document.getElementById("descripcion").value.trim();
    /* Actualiza visibilidad. */
    productoEditar.visible = document.getElementById("visible").checked;
    /* Guarda. */
    TodoTala.guardarDatos(datosEditar);
    /* Informa. */
    TodoTala.toast("Cambios guardados");
    /* Regresa a gestión. */
    window.setTimeout(function () { TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html"); }, 500);
});

/* Elimina el producto con confirmación. */
document.getElementById("btn-eliminar").addEventListener("click", function () {
    /* Pide confirmación para evitar borrados accidentales. */
    const confirmar = window.confirm("¿Querés eliminar este producto del MVP?");
    /* Detiene si se cancela. */
    if (!confirmar) return;
    /* Elimina de la lista. */
    datosEditar.productos = datosEditar.productos.filter(function (producto) { return producto.id !== productoEditar.id; });
    /* También lo quita del carrito. */
    datosEditar.carrito = datosEditar.carrito.filter(function (item) { return item.id !== productoEditar.id; });
    /* Guarda. */
    TodoTala.guardarDatos(datosEditar);
    /* Vuelve a gestión. */
    TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html");
});

/* Vuelve sin guardar. */
document.getElementById("btn-volver").addEventListener("click", function () { TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html"); });
/* Carga datos iniciales. */
cargarProductoEditar();
