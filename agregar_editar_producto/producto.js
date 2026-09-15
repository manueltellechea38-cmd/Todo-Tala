const formularioProducto = document.getElementById("form-producto");
const inputImagen = document.getElementById("imagen");
const vistaPrevia = document.getElementById("vista-previa");
const usuarioProducto = TodoTala.usuarioActual();

inputImagen.addEventListener("change", function () {
    const archivo = inputImagen.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.addEventListener("load", function () {
        vistaPrevia.src = lector.result;
        vistaPrevia.classList.add("is-visible");
    });
    lector.readAsDataURL(archivo);
});

formularioProducto.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const marca = document.getElementById("marca").value.trim();
    const categoria = document.getElementById("categoria").value;
    const precio = Number(document.getElementById("precio").value);
    const stock = Number(document.getElementById("stock").value);
    const descripcion = document.getElementById("descripcion").value.trim();
    const valido = nombre !== "" && marca !== "" && precio > 0 && stock >= 0;

    document.getElementById("error-form").classList.toggle("is-visible", !valido);
    if (!valido) return;

    const datos = TodoTala.obtenerDatos();
    const comercio = datos.comercios.find(function (item) {
        return item.id === usuarioProducto.comercioId;
    });
    const nuevoId = Math.max.apply(null, datos.productos.map(function (producto) {
        return producto.id;
    })) + 1;

    datos.productos.push({
        id: nuevoId,
        comercioId: usuarioProducto.comercioId,
        comercio: comercio ? comercio.nombre : "Comercio",
        categoria: categoria,
        nombre: nombre,
        marca: marca,
        precio: precio,
        precioAnterior: null,
        descripcion: descripcion || "Sin descripción",
        stock: stock,
        visible: true,
        imagenTexto: nombre.substring(0, 2).toUpperCase(),
        localidad: comercio ? comercio.localidad : ""
    });

    TodoTala.guardarDatos(datos);
    TodoTala.toast("Producto guardado");
    setTimeout(function () {
        TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html");
    }, 400);
});

document.getElementById("btn-volver").addEventListener("click", function () {
    TodoTala.irA("../gestioinar_productos/todo_tala_gestion_productos.html");
});