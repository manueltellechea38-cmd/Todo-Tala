const idProducto =
    Number(TodoTala.parametro("id") || 0);

let producto = null;
let promocion = null;
let esFavorito = false;
let cantidad = 1;
let comercioSeguido = false;

/*
Calcula el precio final teniendo en cuenta
la promoción vigente.
*/
function calcularPrecioPromocional(
    precioBase,
    promocionProducto
) {

    if (!promocionProducto) {
        return precioBase;
    }

    const valor =
        Number(promocionProducto.valor);

    if (
        promocionProducto.tipo ===
        "porcentaje"
    ) {
        return Math.round(
            (
                precioBase *
                (1 - valor / 100)
            ) * 100
        ) / 100;
    }

    if (
        promocionProducto.tipo ===
        "precio"
    ) {
        return valor;
    }

    return precioBase;
}


/*
Genera letras para mostrar cuando
el producto no tiene imagen.
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
Carga producto, promoción y favorito.
*/
async function cargarDetalle() {

    if (idProducto <= 0) {

        TodoTala.irA(
            "../catalogo_cliente/" +
            "todo_tala_catalogo_cliente.html"
        );

        return;
    }

    const token = obtenerToken();

    if (!token) {

        TodoTala.irA(
            "../pantalla_login/" +
            "todo_tala_pantalla_login.html"
        );

        return;
    }

    try {

        const respuestas = await Promise.all([
            fetch(
                PRODUCTOS_URL +
                "?id=" +
                idProducto
            ),

            fetch(
                PROMOCIONES_URL
            ),

            fetch(
                FAVORITOS_URL +
                "?id=" +
                idProducto,
                {
                    headers: {
                        "Authorization":
                            "Bearer " + token
                    }
                }
            )
        ]);

        const respuestaProducto =
            respuestas[0];

        const respuestaPromociones =
            respuestas[1];

        const respuestaFavorito =
            respuestas[2];

        const datosProducto =
            await respuestaProducto.json();

        const datosPromociones =
            await respuestaPromociones.json();

        const datosFavorito =
            await respuestaFavorito.json();

        if (!respuestaProducto.ok) {

            TodoTala.toast(
                datosProducto.error ||
                "Producto no encontrado"
            );

            TodoTala.irA(
                "../catalogo_cliente/" +
                "todo_tala_catalogo_cliente.html"
            );

            return;
        }

        producto = {
            id:
                Number(
                    datosProducto.id_producto
                ),

            nombre:
                datosProducto.nombre,

            marca:
                datosProducto.marca || "",

            categoria:
                datosProducto.categoria || "",

            comercio:
                datosProducto.comercio || "",

            id_comercio:
               Number(datosProducto.id_comercio),

            descripcion:
                datosProducto.descripcion || "",

            stock:
                Number(datosProducto.stock),

            precio_base:
                Number(datosProducto.precio),

            imagen:
                datosProducto.imagen,

            imagenTexto:
                obtenerIniciales(
                    datosProducto.nombre
                )
        };

        if (
            respuestaPromociones.ok &&
            Array.isArray(datosPromociones)
        ) {

            promocion =
                datosPromociones.find(
                    function (item) {

                        return (
                            Number(
                                item.id_producto
                            ) ===
                            idProducto
                        );
                    }
                ) || null;
        }

        producto.precio =
            calcularPrecioPromocional(
                producto.precio_base,
                promocion
            );

if (respuestaFavorito.ok) {
    esFavorito =
        Boolean(
            datosFavorito.favorito
        );
}

const respuestaComercioSeguido =
    await fetch(
        COMERCIOS_SEGUIDOS_URL +
        "?id=" +
        producto.id_comercio,
        {
            headers: {
                "Authorization":
                    "Bearer " + token
            }
        }
    );

const datosComercioSeguido =
    await respuestaComercioSeguido.json();

if (respuestaComercioSeguido.ok) {
    comercioSeguido =
        Boolean(
            datosComercioSeguido.seguido
        );
}

renderizarDetalle();
        renderizarDetalle();

    } catch (error) {

        console.error(error);

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Muestra los datos reales del producto.
*/
function renderizarDetalle() {

    if (!producto) {
        return;
    }

    const estado =
        TodoTala.estadoStock(producto);

    const contenedorImagen = document.getElementById("imagen-producto");
    if (producto.imagen) {
        const foto = document.createElement("img");
        foto.src = UPLOADS_URL + encodeURIComponent(producto.imagen);
        foto.alt = "Foto de " + producto.nombre;
        foto.loading = "lazy";
        contenedorImagen.replaceChildren(foto);
    } else {
        contenedorImagen.textContent = producto.imagenTexto;
    }

    document
        .getElementById("nombre-producto")
        .textContent =
            producto.nombre;

    document
        .getElementById("comercio-producto")
        .textContent =
            producto.comercio;

    document
        .getElementById("precio-producto")
        .textContent =
            TodoTala.formatearPrecio(
                producto.precio
            );

    document
        .getElementById("precio-anterior")
        .textContent =
            promocion
                ? TodoTala.formatearPrecio(
                    producto.precio_base
                )
                : "";

    document
        .getElementById("meta-producto")
        .textContent =
            producto.marca +
            " · " +
            producto.categoria;

    document
        .getElementById("descripcion-producto")
        .textContent =
            producto.descripcion;

    document
        .getElementById("stock-producto")
        .textContent =
            "Stock actual: " +
            producto.stock +
            " unidad(es)";

    document
        .getElementById("estado-producto")
        .textContent =
            estado.texto;

    document
        .getElementById("estado-producto")
        .className =
            estado.clase;

    document
        .getElementById("cantidad")
        .textContent =
            cantidad;

    document
        .getElementById("btn-agregar")
        .disabled =
            producto.stock <= 0;

    document
        .getElementById("btn-agregar")
        .textContent =
            producto.stock > 0
                ? "Agregar al carrito"
                : "Producto sin stock";

    document
        .getElementById("btn-favorito")
        .textContent =
            esFavorito
                ? "♥"
                : "♡";
    document
        .getElementById("btn-seguir-comercio")
        .textContent =
            comercioSeguido
                ? "Dejar de seguir"
                : "Seguir comercio";
}


/*
Cambia la cantidad.
*/
function cambiarCantidad(cambio) {

    if (!producto) {
        return;
    }

    const nuevaCantidad =
        cantidad + cambio;

    if (
        nuevaCantidad < 1 ||
        nuevaCantidad > producto.stock
    ) {
        return;
    }

    cantidad = nuevaCantidad;

    renderizarDetalle();
}


document
    .getElementById("btn-restar")
    .addEventListener(
        "click",
        function () {
            cambiarCantidad(-1);
        }
    );


document
    .getElementById("btn-sumar")
    .addEventListener(
        "click",
        function () {
            cambiarCantidad(1);
        }
    );


/*
Agrega o elimina el favorito en MySQL.
*/
document
    .getElementById("btn-favorito")
    .addEventListener(
        "click",
        async function () {

            const token = obtenerToken();

            if (!token || !producto) {
                return;
            }

            try {

                let respuesta;

                if (esFavorito) {

                    respuesta = await fetch(
                        FAVORITOS_URL +
                        "?id=" +
                        producto.id,
                        {
                            method: "DELETE",
                            headers: {
                                "Authorization":
                                    "Bearer " +
                                    token
                            }
                        }
                    );

                } else {

                    respuesta = await fetch(
                        FAVORITOS_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " +
                                    token
                            },

                            body:
                                JSON.stringify({
                                    id_producto:
                                        producto.id
                                })
                        }
                    );
                }

                const datos =
                    await respuesta.json();

                if (!respuesta.ok) {

                    TodoTala.toast(
                        datos.error ||
                        "No se pudo actualizar favoritos"
                    );

                    return;
                }

                esFavorito =
                    !esFavorito;

                renderizarDetalle();

                TodoTala.toast(
                    esFavorito
                        ? "Producto agregado a favoritos"
                        : "Producto eliminado de favoritos"
                );

            } catch (error) {

                console.error(error);

                TodoTala.toast(
                    "No se pudo conectar con el servidor"
                );
            }
        }
    );


/*
Agrega el producto al carrito real.
*/
document
    .getElementById("btn-agregar")
    .addEventListener(
        "click",
        async function () {

            const token = obtenerToken();

            if (!token || !producto) {
                return;
            }

            try {

                const respuesta =
                    await fetch(
                        CARRITO_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " +
                                    token
                            },

                            body:
                                JSON.stringify({
                                    id_producto:
                                        producto.id,

                                    cantidad:
                                        cantidad
                                })
                        }
                    );

                const datos =
                    await respuesta.json();

                if (!respuesta.ok) {

                    TodoTala.toast(
                        datos.error ||
                        "No se pudo agregar al carrito"
                    );

                    return;
                }

                TodoTala.toast(
                    "Producto agregado al carrito"
                );

                window.setTimeout(
                    function () {

                        TodoTala.irA(
                            "../carrito_pedidos/" +
                            "todo_tala_carrito_pedido.html"
                        );
                    },
                    400
                );

            } catch (error) {

                console.error(error);

                TodoTala.toast(
                    "No se pudo conectar con el servidor"
                );
            }
        }
    );
document
    .getElementById("btn-seguir-comercio")
    .addEventListener(
        "click",
        async function () {

            const token = obtenerToken();

            if (!token || !producto) {
                return;
            }

            try {

                let respuesta;

                if (comercioSeguido) {

                    respuesta = await fetch(
                        COMERCIOS_SEGUIDOS_URL +
                        "?id=" +
                        producto.id_comercio,
                        {
                            method: "DELETE",
                            headers: {
                                "Authorization":
                                    "Bearer " + token
                            }
                        }
                    );

                } else {

                    respuesta = await fetch(
                        COMERCIOS_SEGUIDOS_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    "Bearer " + token
                            },

                            body:
                                JSON.stringify({
                                    id_comercio:
                                        producto.id_comercio
                                })
                        }
                    );
                }

                const datos =
                    await respuesta.json();

                if (!respuesta.ok) {

                    TodoTala.toast(
                        datos.error ||
                        "No se pudo actualizar el comercio"
                    );

                    return;
                }

                comercioSeguido =
                    !comercioSeguido;

                renderizarDetalle();

                TodoTala.toast(
                    comercioSeguido
                        ? "Ahora seguís este comercio"
                        : "Dejaste de seguir este comercio"
                );

            } catch (error) {

                console.error(error);

                TodoTala.toast(
                    "No se pudo conectar con el servidor"
                );
            }
        }
    );

cargarDetalle();