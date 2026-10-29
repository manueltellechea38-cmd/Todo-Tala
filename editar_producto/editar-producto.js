const idEditar = Number(TodoTala.parametro("id"));

const botonEliminar = document.getElementById("btn-eliminar");
const inputImagen = document.getElementById("imagen");
const imagenActual = document.getElementById("imagen-actual");
const vistaPrevia = document.getElementById("vista-previa");

inputImagen.addEventListener("change", function () {
    const archivo = inputImagen.files[0];
    vistaPrevia.hidden = true;

    if (!archivo) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(archivo.type) || archivo.size > 2 * 1024 * 1024) {
        inputImagen.value = "";
        TodoTala.toast("Elegí una imagen JPG, PNG o WEBP de hasta 2 MB");
        return;
    }

    vistaPrevia.src = URL.createObjectURL(archivo);
    vistaPrevia.hidden = false;
});

let productoEditar = null;
let confirmarEliminacion = false;

/*
Carga el producto desde la API.
La API comprueba que pertenezca al comercio
del jefe o empleado autenticado.
*/
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
async function cargarProducto() {
    if (!(await cargarCategorias())) return;

    if (!idEditar) {
        TodoTala.irA(
            "../gestionar_productos/todo_tala_gestion_productos.html"
        );
        return;
    }

    try {

        const respuesta = await fetch(
            PRODUCTOS_URL +
            "?gestion=1&id=" +
            idEditar,
            {
                method: "GET",
                headers: {
                    "Authorization":
                        "Bearer " + obtenerToken()
                }
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            TodoTala.toast(
                datos.error ||
                "No se pudo cargar el producto"
            );

            TodoTala.irA(
                "../gestionar_productos/todo_tala_gestion_productos.html"
            );

            return;
        }

        productoEditar = datos;

        if (productoEditar.imagen) {
            imagenActual.src = UPLOADS_URL + encodeURIComponent(productoEditar.imagen);
            imagenActual.hidden = false;
        }

        document.getElementById("nombre").value =
            productoEditar.nombre;

        document.getElementById("marca").value =
            productoEditar.marca || "";

        document.getElementById("categoria").value =
            productoEditar.id_categoria;

        document.getElementById("precio").value =
            productoEditar.precio;

        document.getElementById("stock").value =
            productoEditar.stock;

        document.getElementById("descripcion").value =
            productoEditar.descripcion || "";

        document.getElementById("visible").checked =
            Number(productoEditar.visible) === 1;

        actualizarAvisoStock();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}

/*
Muestra el estado del stock.
*/
function actualizarAvisoStock() {

    const stock = Number(
        document.getElementById("stock").value
    );

    const aviso =
        document.getElementById("stock-aviso");

    if (stock === 0) {
        aviso.textContent = "Sin stock.";
    } else if (stock <= 5) {
        aviso.textContent = "Stock bajo.";
    } else {
        aviso.textContent = "Stock disponible.";
    }
}

document
    .getElementById("stock")
    .addEventListener(
        "input",
        actualizarAvisoStock
    );

/*
Guarda los cambios usando PUT.
*/
document
    .getElementById("form-editar")
    .addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();

            const nombre = document
                .getElementById("nombre")
                .value
                .trim();

            const marca = document
                .getElementById("marca")
                .value
                .trim();

            const idCategoria = Number(
                document.getElementById("categoria").value
            );

            const precio = Number(
                document.getElementById("precio").value
            );

            const stock = Number(
                document.getElementById("stock").value
            );

            const descripcion = document
                .getElementById("descripcion")
                .value
                .trim();

            const visible =
                document.getElementById("visible").checked;

            const valido =
                nombre !== "" &&
                marca !== "" &&
                idCategoria > 0 &&
                precio > 0 &&
                stock >= 0;

            document
                .getElementById("error-form")
                .classList
                .toggle("is-visible", !valido);

            if (!valido) {
                return;
            }

            const cambios = {
                id_categoria: idCategoria,
                nombre: nombre,
                marca: marca,
                precio: precio,
                stock: stock,
                descripcion: descripcion,
                visible: visible
            };

            try {

                const respuesta = await fetch(
                    PRODUCTOS_URL +
                    "?id=" +
                    idEditar,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type":
                                "application/json",
                            "Authorization":
                                "Bearer " +
                                obtenerToken()
                        },
                        body: JSON.stringify(
                            cambios
                        )
                    }
                );

                const datos =
                    await respuesta.json();

                if (!respuesta.ok) {

                    TodoTala.toast(
                        datos.error ||
                        "No se pudo actualizar el producto"
                    );

                    return;
                }

                if (inputImagen.files[0]) {
                    const datosImagen = new FormData();
                    datosImagen.append("imagen", inputImagen.files[0]);

                    const respuestaImagen = await fetch(
                        API_BASE + "/imagen.php?id=" + encodeURIComponent(idEditar),
                        {
                            method: "POST",
                            headers: {
                                "Authorization": "Bearer " + obtenerToken()
                            },
                            body: datosImagen
                        }
                    );

                    const resultadoImagen = await respuestaImagen.json();

                    if (!respuestaImagen.ok) {
                        TodoTala.toast(resultadoImagen.error || "No se pudo reemplazar la foto");
                        return;
                    }
                }

                TodoTala.toast(
                    "Cambios guardados"
                );

                window.setTimeout(function () {

                    TodoTala.irA(
                        "../gestionar_productos/todo_tala_gestion_productos.html"
                    );

                }, 350);

            } catch (error) {

                TodoTala.toast(
                    "No se pudo conectar con el servidor"
                );
            }
        }
    );

/*
La eliminación requiere dos clics.
*/
botonEliminar.addEventListener(
    "click",
    async function () {

        if (!confirmarEliminacion) {

            confirmarEliminacion = true;

            botonEliminar.textContent =
                "Confirmar eliminación";

            return;
        }

        try {

            const respuesta = await fetch(
                PRODUCTOS_URL +
                "?id=" +
                idEditar,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization":
                            "Bearer " +
                            obtenerToken()
                    }
                }
            );

            const datos =
                await respuesta.json();

            if (!respuesta.ok) {

                TodoTala.toast(
                    datos.error ||
                    "No se pudo eliminar el producto"
                );

                return;
            }

            TodoTala.toast(
                "Producto eliminado correctamente"
            );

            TodoTala.irA(
                "../gestionar_productos/todo_tala_gestion_productos.html"
            );

        } catch (error) {

            TodoTala.toast(
                "No se pudo conectar con el servidor"
            );
        }
    }
);

cargarProducto();