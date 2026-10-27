/* Referencias a los filtros de búsqueda. */
const inputBuscar =
    document.getElementById("search-input");

const selectCategoria =
    document.getElementById("categoria");

const inputPrecioMax =
    document.getElementById("precio-max");

const checkStock =
    document.getElementById("solo-stock");

const contenedorResultados =
    document.getElementById("lista-resultados");

const resumenResultados =
    document.getElementById("resumen");

let productosBusqueda = [];


/*
Calcula el precio promocional.
*/
function calcularPrecio(
    precioBase,
    promocion
) {

    if (!promocion) {
        return precioBase;
    }

    const valor =
        Number(promocion.valor);

    if (promocion.tipo === "porcentaje") {

        return Math.round(
            (
                precioBase *
                (1 - valor / 100)
            ) * 100
        ) / 100;
    }

    if (promocion.tipo === "precio") {
        return valor;
    }

    return precioBase;
}


/*
Obtiene letras para productos sin imagen.
*/
function obtenerIniciales(nombre) {

    return nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(function (palabra) {
            return palabra.charAt(0);
        })
        .join("")
        .toUpperCase();
}


/*
Carga productos y promociones desde MySQL.
*/
async function cargarProductos() {

    try {

        const respuestas = await Promise.all([
            fetch(PRODUCTOS_URL),
            fetch(PROMOCIONES_URL)
        ]);

        const respuestaProductos =
            respuestas[0];

        const respuestaPromociones =
            respuestas[1];

        const datosProductos =
            await respuestaProductos.json();

        const datosPromociones =
            await respuestaPromociones.json();

        if (!respuestaProductos.ok) {

            TodoTala.toast(
                datosProductos.error ||
                "No se pudieron cargar los productos"
            );

            return;
        }

        if (!respuestaPromociones.ok) {

            TodoTala.toast(
                datosPromociones.error ||
                "No se pudieron cargar las promociones"
            );

            return;
        }

        productosBusqueda =
            datosProductos.map(
                function (producto) {

                    const promocion =
                        datosPromociones.find(
                            function (item) {

                                return (
                                    Number(
                                        item.id_producto
                                    ) ===
                                    Number(
                                        producto.id_producto
                                    )
                                );
                            }
                        ) || null;

                    const precioBase =
                        Number(producto.precio);

                    return {
                        id:
                            Number(
                                producto.id_producto
                            ),

                        nombre:
                            producto.nombre,

                        marca:
                            producto.marca || "",

                        comercio:
                            producto.comercio || "",

                        categoria:
                            producto.categoria || "",

                        precio_base:
                            precioBase,

                        precio:
                            calcularPrecio(
                                precioBase,
                                promocion
                            ),

                        stock:
                            Number(producto.stock),

                        visible:
                            Number(
                                producto.visible
                            ) === 1,

                        imagenTexto:
                            obtenerIniciales(
                                producto.nombre
                            ),

                        promocion:
                            promocion
                    };
                }
            );

        cargarCategorias();
        ejecutarBusqueda();

    } catch (error) {

        console.error(error);

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Carga las categorías sin repetir.
*/
function cargarCategorias() {

    selectCategoria.innerHTML =
        '<option value="">Todas</option>';

    const categorias = [
        ...new Set(
            productosBusqueda.map(
                function (producto) {
                    return producto.categoria;
                }
            )
        )
    ]
        .filter(Boolean)
        .sort();

    categorias.forEach(
        function (categoria) {

            const opcion =
                document.createElement("option");

            opcion.value = categoria;
            opcion.textContent = categoria;

            selectCategoria.appendChild(
                opcion
            );
        }
    );
}


/*
Filtra y muestra los productos.
*/
function ejecutarBusqueda() {

    const texto =
        inputBuscar
            .value
            .trim()
            .toLowerCase();

    const maximo =
        inputPrecioMax.value
            ? Number(inputPrecioMax.value)
            : Infinity;

    const resultados =
        productosBusqueda.filter(
            function (producto) {

                const contenido =
                    (
                        producto.nombre +
                        " " +
                        producto.marca +
                        " " +
                        producto.comercio +
                        " " +
                        producto.categoria
                    ).toLowerCase();

                return (
                    producto.visible &&
                    contenido.includes(texto) &&

                    (
                        !selectCategoria.value ||
                        producto.categoria ===
                        selectCategoria.value
                    ) &&

                    producto.precio <= maximo &&

                    (
                        !checkStock.checked ||
                        producto.stock > 0
                    )
                );
            }
        );

    resumenResultados.textContent =
        resultados.length +
        (
            resultados.length === 1
                ? " resultado"
                : " resultados"
        );

    if (resultados.length === 0) {

        contenedorResultados.innerHTML =
            '<p class="empty-state">' +
            'No encontramos productos con esos criterios.' +
            '</p>';

        return;
    }

    contenedorResultados.innerHTML =
        resultados.map(
            function (producto) {

                const estado =
                    TodoTala.estadoStock(
                        producto
                    );

                let precioHTML =
                    '<strong>' +
                    TodoTala.formatearPrecio(
                        producto.precio
                    ) +
                    '</strong>';

                if (producto.promocion) {

                    precioHTML =
                        '<span style="' +
                        'text-decoration: line-through;' +
                        'opacity: 0.6;' +
                        'margin-right: 8px;' +
                        '">' +

                        TodoTala.formatearPrecio(
                            producto.precio_base
                        ) +

                        '</span>' +

                        '<strong>' +

                        TodoTala.formatearPrecio(
                            producto.precio
                        ) +

                        '</strong>';
                }

                return (
                    '<article class="result-item" ' +
                    'data-id="' +
                    producto.id +
                    '">' +

                        '<figure class="result-image">' +
                            producto.imagenTexto +
                        '</figure>' +

                        '<section class="result-info">' +

                            '<strong>' +
                                producto.nombre +
                            '</strong>' +

                            '<p class="muted">' +
                                producto.comercio +
                                ' · ' +
                                producto.categoria +
                            '</p>' +

                            '<p>' +
                                precioHTML +
                                ' · ' +
                                '<span class="' +
                                estado.clase +
                                '">' +
                                    estado.texto +
                                '</span>' +
                            '</p>' +

                        '</section>' +

                        '<button ' +
                        'class="btn btn--secondary" ' +
                        'type="button">' +
                            'Ver detalle' +
                        '</button>' +

                    '</article>'
                );
            }
        ).join("");

    document
        .querySelectorAll("[data-id]")
        .forEach(
            function (item) {

                item
                    .querySelector("button")
                    .addEventListener(
                        "click",
                        function () {

                            TodoTala.irA(
                                "../detalle_producto/" +
                                "todo_tala_detalle_producto.html?id=" +
                                item.dataset.id
                            );
                        }
                    );
            }
        );
}


/*
Recupera una búsqueda enviada desde Inicio.
*/
const consultaInicial =
    TodoTala.parametro("q");

if (consultaInicial) {
    inputBuscar.value =
        consultaInicial;
}


document
    .getElementById("form-busqueda")
    .addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();
            ejecutarBusqueda();
        }
    );

inputBuscar.addEventListener(
    "input",
    ejecutarBusqueda
);

selectCategoria.addEventListener(
    "change",
    ejecutarBusqueda
);

inputPrecioMax.addEventListener(
    "input",
    ejecutarBusqueda
);

checkStock.addEventListener(
    "change",
    ejecutarBusqueda
);


/*
Inicio.
*/
cargarProductos();