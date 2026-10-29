const formularioProducto = document.getElementById("form-producto");
const inputImagen = document.getElementById("imagen");
const vistaPrevia = document.getElementById("vista-previa");
const botonGuardar = formularioProducto.querySelector('button[type="submit"]');

let idProductoGuardado = null;
let urlPrevia = null;

inputImagen.accept = "image/jpeg,image/png,image/webp";

inputImagen.addEventListener("change", function () {
    if (urlPrevia) {
        URL.revokeObjectURL(urlPrevia);
        urlPrevia = null;
    }

    vistaPrevia.removeAttribute("src");
    vistaPrevia.classList.remove("is-visible");

    const archivo = inputImagen.files[0];
    if (!archivo) return;

    urlPrevia = URL.createObjectURL(archivo);
    vistaPrevia.src = urlPrevia;
    vistaPrevia.classList.add("is-visible");
});

async function leerRespuesta(respuesta) {
    let datos;

    try {
        datos = await respuesta.json();
    } catch {
        throw new Error(
            "El servidor devolvio una respuesta inesperada. Revisa la ventana de la API."
        );
    }

    if (!respuesta.ok) {
        throw new Error(datos.error || "No se pudo completar la operacion");
    }

    return datos;
}

async function cargarCategorias() {
    const selector = document.getElementById("categoria");
    selector.disabled = true;

    try {
        const respuesta = await fetch(CATEGORIAS_URL);
        const categorias = await respuesta.json();

        if (!respuesta.ok || !Array.isArray(categorias)) {
            throw new Error("No se pudieron cargar las categorías");
        }

        selector.replaceChildren(new Option("Seleccioná una categoría", ""));

        categorias.forEach(function (categoria) {
            selector.add(new Option(categoria.nombre, categoria.id_categoria));
        });

        selector.disabled = false;
        return true;
    } catch (error) {
        selector.replaceChildren(new Option("Error al cargar categorías", ""));
        TodoTala.toast("No se pudieron cargar las categorías");
        return false;
    }
}
cargarCategorias();

formularioProducto.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    if (botonGuardar.disabled) return;

    const nombre = document.getElementById("nombre").value.trim();
    const marca = document.getElementById("marca").value.trim();
    const idCategoria = Number(document.getElementById("categoria").value);
    const precioTexto = document.getElementById("precio").value;
    const stockTexto = document.getElementById("stock").value;
    const precio = Number(precioTexto);
    const stock = Number(stockTexto);
    const descripcion = document.getElementById("descripcion").value.trim();
    const archivo = inputImagen.files[0];

    const valido =
        nombre !== "" &&
        marca !== "" &&
        idCategoria > 0 &&
        precioTexto !== "" &&
        Number.isFinite(precio) &&
        precio > 0 &&
        stockTexto !== "" &&
        Number.isInteger(stock) &&
        stock >= 0;

    document.getElementById("error-form")
        .classList.toggle("is-visible", !valido);

    if (!valido) return;

    if (archivo) {
        const permitidos = ["image/jpeg", "image/png", "image/webp"];

        if (!permitidos.includes(archivo.type)) {
            TodoTala.toast("Selecciona una imagen JPG, PNG o WEBP");
            return;
        }

        if (archivo.size > 2 * 1024 * 1024) {
            TodoTala.toast("La imagen debe pesar como maximo 2 MB");
            return;
        }
    }

    const producto = {
        id_categoria: idCategoria,
        nombre,
        marca,
        precio,
        descripcion,
        stock,
        visible: true
    };

    botonGuardar.disabled = true;
    botonGuardar.textContent = "Guardando...";

    try {
        const urlProducto = idProductoGuardado
            ? PRODUCTOS_URL + "?id=" + encodeURIComponent(idProductoGuardado)
            : PRODUCTOS_URL;

        const respuesta = await fetch(urlProducto, {
            method: idProductoGuardado ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + obtenerToken()
            },
            body: JSON.stringify(producto)
        });

        const datos = await leerRespuesta(respuesta);

        if (!idProductoGuardado) {
            const id = Number(datos.id);

            if (!Number.isInteger(id) || id <= 0) {
                throw new Error("El servidor no devolvio el ID del producto");
            }

            idProductoGuardado = id;
        }

        if (archivo) {
            botonGuardar.textContent = "Subiendo imagen...";

            const formularioImagen = new FormData();
            formularioImagen.append("imagen", archivo);

            const respuestaImagen = await fetch(
                API_BASE + "/imagen.php?id=" +
                    encodeURIComponent(idProductoGuardado),
                {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + obtenerToken()
                    },
                    body: formularioImagen
                }
            );

            await leerRespuesta(respuestaImagen);
        }

        TodoTala.toast("Producto guardado correctamente");

        window.setTimeout(function () {
            TodoTala.irA(
                "../gestionar_productos/todo_tala_gestion_productos.html"
            );
        }, 400);
    } catch (error) {
        const detalle = error instanceof TypeError
            ? "No se pudo conectar con la API"
            : error.message;

        TodoTala.toast(
            idProductoGuardado
                ? "El producto ya esta creado. " + detalle +
                  ". Podes volver a guardar para reintentar."
                : detalle
        );

        botonGuardar.disabled = false;
        botonGuardar.textContent = "Guardar producto";
    }
});