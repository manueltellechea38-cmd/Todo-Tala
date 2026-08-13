/* Obtiene el formulario. */
const formularioProducto = document.getElementById("form-producto");
/* Obtiene el campo de imagen. */
const inputImagen = document.getElementById("imagen");
/* Obtiene la vista previa. */
const vistaPrevia = document.getElementById("vista-previa");

/* Muestra una vista previa local sin subir la imagen a ningún servidor. */
inputImagen.addEventListener("change", function () {
    /* Obtiene el primer archivo elegido. */
    const archivo = inputImagen.files[0];
    /* Detiene si no hay archivo. */
    if (!archivo) return;
    /* Crea un lector de archivos del navegador. */
    const lector = new FileReader();
    /* Define qué hacer cuando termine de leer. */
    lector.addEventListener("load", function () {
        /* Usa el resultado como fuente de la imagen. */
        vistaPrevia.src = lector.result;
        /* Muestra la vista previa. */
        vistaPrevia.classList.add("is-visible");
    });
    /* Lee el archivo como URL local temporal. */
    lector.readAsDataURL(archivo);
});

/* Valida y crea un producto de demostración. */
formularioProducto.addEventListener("submit", function (evento) {
    /* Evita envío real. */
    evento.preventDefault();
    /* Lee nombre. */
    const nombre = document.getElementById("nombre").value.trim();
    /* Lee marca. */
    const marca = document.getElementById("marca").value.trim();
    /* Lee categoría. */
    const categoria = document.getElementById("categoria").value;
    /* Lee precio. */
    const precio = Number(document.getElementById("precio").value);
    /* Lee stock. */
    const stock = Number(document.getElementById("stock").value);
    /* Lee descripción. */
    const descripcion = document.getElementById("descripcion").value.trim();
    /* Comprueba los campos obligatorios. */
    const valido = nombre !== "" && marca !== "" && precio > 0 && stock >= 0;
    /* Muestra error si corresponde. */
    document.getElementById("error-form").classList.toggle("is-visible", !valido);
    /* Detiene si es inválido. */
    if (!valido) return;
    /* Obtiene los datos. */
    const datos = TodoTala.obtenerDatos();
    /* Calcula un nuevo identificador. */
    const nuevoId = Math.max.apply(null, datos.productos.map(function (producto) { return producto.id; })) + 1;
    /* Agrega el producto del comercio demo. */
    datos.productos.push({ id: nuevoId, nombre: nombre, marca: marca, comercio: "Panadería El Sol", categoria: categoria, precio: precio, precioAnterior: null, stock: stock, visible: true, descripcion: descripcion || "Producto sin descripción.", imagenTexto: nombre.substring(0, 2).toUpperCase() });
    /* Guarda los datos. */
    TodoTala.guardarDatos(datos);
    /* Informa la acción. */
    TodoTala.toast("Producto guardado en el MVP");
    /* Regresa a gestión de productos. */
    window.setTimeout(function () { TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html"); }, 600);
});

/* Vuelve a la gestión de productos. */
document.getElementById("btn-volver").addEventListener("click", function () { TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html"); });
