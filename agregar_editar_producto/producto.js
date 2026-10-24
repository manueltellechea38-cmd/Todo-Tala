const formularioProducto = document.getElementById("form-producto");
const inputImagen = document.getElementById("imagen");
const vistaPrevia = document.getElementById("vista-previa");

/*
Muestra la imagen elegida antes de guardar.
Por ahora la imagen no se guarda en MySQL.
*/
inputImagen.addEventListener("change", function () {

    const archivo = inputImagen.files[0];

    if (!archivo) {
        return;
    }

    const lector = new FileReader();

    lector.addEventListener("load", function () {

        vistaPrevia.src = lector.result;
        vistaPrevia.classList.add("is-visible");

    });

    lector.readAsDataURL(archivo);
});

/*
Valida y crea un producto usando la API.
El comercio se obtiene automáticamente desde la sesión.
*/
formularioProducto.addEventListener(
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

        const nuevoProducto = {
            id_categoria: idCategoria,
            nombre: nombre,
            marca: marca,
            precio: precio,
            descripcion: descripcion,
            stock: stock,
            imagen: null,
            visible: true
        };

        try {

            const respuesta = await fetch(
                PRODUCTOS_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization":
                            "Bearer " + obtenerToken()
                    },
                    body: JSON.stringify(
                        nuevoProducto
                    )
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {

                TodoTala.toast(
                    datos.error ||
                    "No se pudo guardar el producto"
                );

                return;
            }

            TodoTala.toast(
                "Producto guardado correctamente"
            );

            window.setTimeout(function () {

                TodoTala.irA(
                    "../gestionar_productos/todo_tala_gestion_productos.html"
                );

            }, 400);

        } catch (error) {

            TodoTala.toast(
                "No se pudo conectar con el servidor"
            );
        }
    }
);