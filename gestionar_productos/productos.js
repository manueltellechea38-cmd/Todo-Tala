const buscarProductos = document.getElementById("buscar-producto");
const filtroVisibilidad = document.getElementById("filtro-visibilidad");
const listaProductos = document.getElementById("lista-productos");

let productosActuales = [];

/*
Carga desde MySQL solamente los productos
del comercio del jefe o empleado autenticado.
*/
async function cargarProductos() {

    const token = obtenerToken();

    if (!token) {
        TodoTala.irA(
            "../pantalla_login/todo_tala_pantalla_login.html"
        );
        return;
    }

    try {

        const respuesta = await fetch(
            PRODUCTOS_URL + "?gestion=1",
            {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            if (
                respuesta.status === 401 ||
                respuesta.status === 403
            ) {
                cerrarSesionLocal();

                TodoTala.irA(
                    "../pantalla_login/todo_tala_pantalla_login.html"
                );

                return;
            }

            TodoTala.toast(
                datos.error || "No se pudieron cargar los productos"
            );

            return;
        }

        productosActuales = datos;

        renderizarProductos();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}

/*
Filtra en pantalla los productos que ya
vinieron desde MySQL.
*/
function renderizarProductos() {

    const texto = buscarProductos
        .value
        .trim()
        .toLowerCase();

    const filtro = filtroVisibilidad.value;

    const productos = productosActuales.filter(
        function (producto) {

            const contenido = (
                producto.nombre + " " +
                (producto.marca || "") + " " +
                producto.categoria
            ).toLowerCase();

            const coincideTexto =
                contenido.includes(texto);

            let coincideVisibilidad = true;

            if (filtro === "visible") {
                coincideVisibilidad =
                    Number(producto.visible) === 1;
            }

            if (filtro === "oculto") {
                coincideVisibilidad =
                    Number(producto.visible) === 0;
            }

            return (
                coincideTexto &&
                coincideVisibilidad
            );
        }
    );

    if (productos.length === 0) {

        listaProductos.innerHTML =
            '<p class="empty-state">No hay productos con esos filtros.</p>';

        return;
    }

    listaProductos.innerHTML = productos
        .map(function (producto) {

            const miniatura = producto.imagen
                ? `<img class="product-thumbnail" src="${UPLOADS_URL}${encodeURIComponent(producto.imagen)}" alt="Foto de ${producto.nombre}">`
                : `<span class="product-thumbnail product-thumbnail--empty" aria-label="Sin foto">📷</span>`;

            const stockBajo =
                Number(producto.stock) <= 5
                    ? '<span class="badge badge--warning">Stock bajo: ' +
                      producto.stock +
                      '</span>'
                    : "";

            const visible =
                Number(producto.visible) === 1;

            const estado = visible
                ? '<span class="badge badge--success">Publicado</span>'
                : '<span class="badge">Oculto</span>';

            return `
                <article class="product-row"
                    data-id="${producto.id_producto}">

                    ${miniatura}

                    <section class="product-info">

                        <p class="product-badges">
                            <strong>${producto.nombre}</strong>
                            ${estado}
                            ${stockBajo}
                        </p>

                        <p class="muted">
                            ${producto.categoria}
                            ·
                            ${producto.marca || "Sin marca"}
                        </p>

                        <p>
                            <strong>
                                ${TodoTala.formatearPrecio(producto.precio)}
                            </strong>
                            · Stock ${producto.stock}
                        </p>

                    </section>

                    <nav class="product-row__actions">

                        <button
                            class="btn btn--secondary"
                            data-editar
                            type="button">
                            Editar
                        </button>

                        <button
                            class="btn btn--secondary"
                            data-visibilidad
                            type="button">
                            ${visible ? "Ocultar" : "Publicar"}
                        </button>

                    </nav>

                </article>
            `;
        })
        .join("");

    document
        .querySelectorAll("[data-id]")
        .forEach(function (fila) {

            const id = Number(
                fila.dataset.id
            );

            const producto =
                productosActuales.find(
                    function (item) {
                        return Number(
                            item.id_producto
                        ) === id;
                    }
                );

            fila
                .querySelector("[data-editar]")
                .addEventListener(
                    "click",
                    function () {

                        TodoTala.irA(
                            "../editar_producto/todo_tala_editar_producto.html?id=" +
                            id
                        );
                    }
                );

            fila
                .querySelector("[data-visibilidad]")
                .addEventListener(
                    "click",
                    function () {

                        cambiarVisibilidad(
                            producto
                        );
                    }
                );
        });
}

/*
Publica u oculta un producto usando PUT.
*/
async function cambiarVisibilidad(producto) {

    const nuevoEstado =
        Number(producto.visible) !== 1;

    try {

        const respuesta = await fetch(
            PRODUCTOS_URL +
            "?id=" +
            producto.id_producto,
            {
                method: "PUT",
                headers: {
                    "Content-Type":
                        "application/json",
                    "Authorization":
                        "Bearer " +
                        obtenerToken()
                },
                body: JSON.stringify({
                    visible: nuevoEstado
                })
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            TodoTala.toast(
                datos.error ||
                "No se pudo cambiar la visibilidad"
            );

            return;
        }

        await cargarProductos();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}

buscarProductos.addEventListener(
    "input",
    renderizarProductos
);

filtroVisibilidad.addEventListener(
    "change",
    renderizarProductos
);

document
    .getElementById("filtros-productos")
    .addEventListener(
        "submit",
        function (evento) {
            evento.preventDefault();
        }
    );

cargarProductos();