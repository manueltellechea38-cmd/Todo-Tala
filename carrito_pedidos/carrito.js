/* Elementos principales de la pantalla. */
const listaCarrito = document.getElementById("lista-carrito");
const cantidadTotal = document.getElementById("cantidad-total");
const comerciosTotal = document.getElementById("comercios-total");
const totalCarrito = document.getElementById("total-total");
const botonConfirmar = document.getElementById("btn-confirmar");
const botonVaciar = document.getElementById("btn-vaciar");
const observacion = document.getElementById("observacion");

let carritoActual = [];


/*
Agrupa los productos según el comercio.
*/
function obtenerGrupos(productos) {

    const grupos = {};

    productos.forEach(function (producto) {

        const idComercio =
            Number(producto.id_comercio);

        if (!grupos[idComercio]) {

            grupos[idComercio] = {
                id_comercio: idComercio,
                nombre: producto.comercio,
                direccion:
                    producto.direccion ||
                    "Dirección a confirmar",
                items: [],
                subtotal: 0
            };
        }

        const subtotal =
            Number(producto.precio) *
            Number(producto.cantidad);

        grupos[idComercio].items.push({
            producto: producto,
            cantidad: Number(producto.cantidad),
            subtotal: subtotal
        });

        grupos[idComercio].subtotal += subtotal;
    });

    return Object.values(grupos);
}


/*
Carga el carrito desde MySQL.
*/
async function cargarCarrito() {

    try {

        const respuesta = await fetch(
            CARRITO_URL,
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
                "No se pudo cargar el carrito"
            );

            return;
        }

        carritoActual = datos;

        renderizarCarrito();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Muestra el carrito.
*/
function renderizarCarrito() {

    const grupos =
        obtenerGrupos(carritoActual);

    let total = 0;
    let unidades = 0;

    if (carritoActual.length === 0) {

        listaCarrito.innerHTML =
            '<p class="empty-state">' +
            'Tu carrito está vacío. ' +
            'Agregá productos desde el catálogo.' +
            '</p>';

        cantidadTotal.textContent = "0";
        comerciosTotal.textContent = "0";
        totalCarrito.textContent = "$0";

        botonConfirmar.disabled = true;
        botonVaciar.disabled = true;

        return;
    }

    botonConfirmar.disabled = false;
    botonVaciar.disabled = false;

    listaCarrito.innerHTML =
        grupos.map(function (grupo) {

            total += grupo.subtotal;

            const items =
                grupo.items.map(function (detalle) {

                    unidades += detalle.cantidad;

                    return (
                        '<article class="cart-item" ' +
                        'data-producto="' +
                        detalle.producto.id_producto +
                        '">' +

                            '<section class="cart-item__meta">' +

                                '<strong>' +
                                    detalle.producto.nombre +
                                '</strong>' +

                                '<span class="muted">' +
                                    (detalle.producto.marca || "") +
                                    ' · ' +
                                    TodoTala.formatearPrecio(
                                        Number(
                                            detalle.producto.precio
                                        )
                                    ) +
                                    ' c/u' +
                                '</span>' +

                                '<span>Subtotal: <strong>' +
                                    TodoTala.formatearPrecio(
                                        detalle.subtotal
                                    ) +
                                '</strong></span>' +

                            '</section>' +

                            '<nav class="cart-actions">' +

                                '<button ' +
                                'data-action="restar" ' +
                                'type="button">−</button>' +

                                '<strong>' +
                                    detalle.cantidad +
                                '</strong>' +

                                '<button ' +
                                'data-action="sumar" ' +
                                'type="button">+</button>' +

                                '<button ' +
                                'data-action="eliminar" ' +
                                'type="button">×</button>' +

                            '</nav>' +

                        '</article>'
                    );
                }).join("");

            return (
                '<section class="commerce-group">' +

                    '<header class="commerce-group__header">' +

                        '<section>' +

                            '<strong>' +
                                grupo.nombre +
                            '</strong>' +

                            '<p>Retiro: ' +
                                grupo.direccion +
                            '</p>' +

                        '</section>' +

                        '<span class="badge">' +
                            'Pedido separado' +
                        '</span>' +

                    '</header>' +

                    '<section class="commerce-group__items">' +
                        items +
                    '</section>' +

                    '<p class="commerce-subtotal">' +
                        'Subtotal del comercio: <strong>' +
                        TodoTala.formatearPrecio(
                            grupo.subtotal
                        ) +
                        '</strong>' +
                    '</p>' +

                '</section>'
            );
        }).join("");

    cantidadTotal.textContent = unidades;
    comerciosTotal.textContent = grupos.length;

    totalCarrito.textContent =
        TodoTala.formatearPrecio(total);


    /*
    Botones +, - y eliminar.
    */
    document
        .querySelectorAll("[data-producto]")
        .forEach(function (articulo) {

            const idProducto =
                Number(articulo.dataset.producto);

            articulo
                .querySelector('[data-action="restar"]')
                .addEventListener(
                    "click",
                    function () {

                        cambiarCantidad(
                            idProducto,
                            -1
                        );
                    }
                );

            articulo
                .querySelector('[data-action="sumar"]')
                .addEventListener(
                    "click",
                    function () {

                        cambiarCantidad(
                            idProducto,
                            1
                        );
                    }
                );

            articulo
                .querySelector('[data-action="eliminar"]')
                .addEventListener(
                    "click",
                    function () {

                        eliminarProducto(
                            idProducto
                        );
                    }
                );
        });
}


/*
Suma o resta cantidad.
*/
async function cambiarCantidad(
    idProducto,
    cambio
) {

    const producto =
        carritoActual.find(function (item) {

            return Number(item.id_producto) ===
                idProducto;
        });

    if (!producto) {
        return;
    }

    const nuevaCantidad =
        Number(producto.cantidad) + cambio;

    if (nuevaCantidad < 1) {

        eliminarProducto(idProducto);
        return;
    }

    try {

        const respuesta = await fetch(
            CARRITO_URL +
            "?id=" +
            idProducto,
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
                    cantidad: nuevaCantidad
                })
            }
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            TodoTala.toast(
                datos.error ||
                "No se pudo cambiar la cantidad"
            );

            return;
        }

        cargarCarrito();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Elimina un producto.
*/
async function eliminarProducto(idProducto) {

    try {

        const respuesta = await fetch(
            CARRITO_URL +
            "?id=" +
            idProducto,
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
            "Producto eliminado"
        );

        cargarCarrito();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Vacía el carrito.
*/
async function vaciarCarrito() {

    try {

        const respuesta = await fetch(
            CARRITO_URL,
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
                "No se pudo vaciar el carrito"
            );

            return;
        }

        TodoTala.toast(
            "Carrito vaciado"
        );

        cargarCarrito();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Confirma el carrito y crea los pedidos.
*/
async function confirmarPedido() {

    if (carritoActual.length === 0) {

        TodoTala.toast(
            "El carrito está vacío"
        );

        return;
    }

    botonConfirmar.disabled = true;

    try {

        const respuesta = await fetch(
            PEDIDOS_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " +
                        obtenerToken()
                },

                body: JSON.stringify({
                    observacion:
                        observacion.value.trim()
                })
            }
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            botonConfirmar.disabled = false;

            TodoTala.toast(
                datos.error ||
                "No se pudo confirmar el pedido"
            );

            return;
        }

        TodoTala.toast(
            datos.mensaje ||
            "Pedido confirmado"
        );

        window.setTimeout(function () {

            TodoTala.irA(
                "../mis_pedidos/todo_tala_mis_pedidos.html"
            );

        }, 500);

    } catch (error) {

        botonConfirmar.disabled = false;

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


botonConfirmar.addEventListener(
    "click",
    confirmarPedido
);

botonVaciar.addEventListener(
    "click",
    vaciarCarrito
);


/*
Inicio.
*/
cargarCarrito();