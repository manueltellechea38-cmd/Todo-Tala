const promoGrid =
    document.getElementById("promo-grid");

const previewGrid =
    document.getElementById("preview-grid");

const buscador =
    document.getElementById("busqueda-inicio");

let productosInicio = [];
let promocionesInicio = [];


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
Genera iniciales para productos sin imagen.
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
Carga el usuario autenticado.
*/
async function cargarUsuario() {

    const token = obtenerToken();

    if (!token) {
        return;
    }

    try {

        const respuesta = await fetch(
            USUARIOS_URL,
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        const usuario =
            await respuesta.json();

        if (!respuesta.ok) {
            return;
        }

        document
            .getElementById("saludo")
            .textContent =
                "Hola, " +
                usuario.nombre.split(" ")[0];

    } catch (error) {

        console.error(error);
    }
}


/*
Carga productos y promociones reales.
*/
async function cargarInicio() {

    try {

        const respuestas =
            await Promise.all([
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

        promocionesInicio =
            datosPromociones;

        productosInicio =
            datosProductos.map(
                function (producto) {

                    const promocion =
                        promocionesInicio.find(
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

                        comercio:
                            producto.comercio || "",

                        categoria:
                            producto.categoria || "",

                        marca:
                            producto.marca || "",

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

        renderizarPromociones();

        renderizarProductos(
            productosInicio.filter(
                function (producto) {
                    return producto.visible;
                }
            )
        );

    } catch (error) {

        console.error(error);

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Muestra promociones vigentes.
La API ya devuelve solamente promociones
activas y dentro de fecha.
*/
function renderizarPromociones() {

    if (promocionesInicio.length === 0) {

        promoGrid.innerHTML =
            '<p class="muted">' +
            'No hay promociones activas.' +
            '</p>';

        return;
    }

    promoGrid.innerHTML =
        promocionesInicio
            .slice(0, 3)
            .map(
                function (promo) {

                    const producto =
                        productosInicio.find(
                            function (item) {

                                return (
                                    item.id ===
                                    Number(
                                        promo.id_producto
                                    )
                                );
                            }
                        );

                    let detalle;

                    if (
                        promo.tipo ===
                        "porcentaje"
                    ) {

                        detalle =
                            Number(promo.valor) +
                            "% de descuento";

                    } else {

                        detalle =
                            "Precio especial " +
                            TodoTala.formatearPrecio(
                                Number(promo.valor)
                            );
                    }

                    return (
                        '<article class="promo-card">' +

                            '<strong>' +
                                promo.nombre +
                            '</strong>' +

                            '<p>' +
                                detalle +
                            '</p>' +

                            '<small>' +
                                (
                                    producto
                                        ? producto.nombre +
                                          " · " +
                                          producto.comercio
                                        : ""
                                ) +
                            '</small>' +

                        '</article>'
                    );
                }
            )
            .join("");
}


/*
Crea una tarjeta de producto.
*/
function tarjetaProducto(producto) {

    const estado =
        TodoTala.estadoStock(producto);

    let precioHTML =
        '<b>' +
        TodoTala.formatearPrecio(
            producto.precio
        ) +
        '</b>';

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

            '<b>' +

                TodoTala.formatearPrecio(
                    producto.precio
                ) +

            '</b>';
    }

    return (
        '<article class="preview-card" ' +
        'data-producto-id="' +
        producto.id +
        '" tabindex="0">' +

            '<span class="product-placeholder">' +
                producto.imagenTexto +
            '</span>' +

            '<span class="' +
            estado.clase +
            '">' +
                estado.texto +
            '</span>' +

            '<strong>' +
                producto.nombre +
            '</strong>' +

            '<p class="muted">' +
                producto.comercio +
            '</p>' +

            precioHTML +

        '</article>'
    );
}


/*
Muestra hasta cuatro productos.
*/
function renderizarProductos(lista) {

    previewGrid.innerHTML =
        lista
            .slice(0, 4)
            .map(tarjetaProducto)
            .join("");

    document
        .querySelectorAll(
            "[data-producto-id]"
        )
        .forEach(
            function (tarjeta) {

                tarjeta.addEventListener(
                    "click",
                    function () {

                        TodoTala.irA(
                            "../detalle_producto/" +
                            "todo_tala_detalle_producto.html?id=" +
                            tarjeta.dataset.productoId
                        );
                    }
                );
            }
        );
}


/*
Envía la búsqueda a la pantalla de resultados.
*/
document
    .getElementById("form-busqueda")
    .addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();

            TodoTala.irA(
                "../resultados_busqueda/" +
                "todo_tala_resultados_busqueda.html?q=" +
                encodeURIComponent(
                    buscador.value.trim()
                )
            );
        }
    );


/*
Filtra productos mientras se escribe.
*/
buscador.addEventListener(
    "input",
    function () {

        const texto =
            buscador
                .value
                .trim()
                .toLowerCase();

        const productos =
            productosInicio.filter(
                function (producto) {

                    const contenido =
                        (
                            producto.nombre +
                            " " +
                            producto.comercio +
                            " " +
                            producto.categoria
                        ).toLowerCase();

                    return (
                        producto.visible &&
                        (
                            texto.length < 2 ||
                            contenido.includes(texto)
                        )
                    );
                }
            );

        renderizarProductos(
            productos
        );
    }
);


/*
Cerrar sesión.
*/
document
    .getElementById("btn-salir")
    .addEventListener(
        "click",
        async function () {

            await TodoTala.cerrarSesion();

            TodoTala.abrir(
                "pantalla_login/" +
                "todo_tala_pantalla_login.html"
            );
        }
    );


/*
Inicio.
*/
cargarUsuario();
cargarInicio();