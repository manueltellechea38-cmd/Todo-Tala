const nombreComercio =
    document.getElementById("nombre-comercio");

const rolActual =
    document.getElementById("rol-actual");

const cantidadProductos =
    document.getElementById("cantidad-productos");

const cantidadPedidos =
    document.getElementById("cantidad-pedidos");

const cantidadPromos =
    document.getElementById("cantidad-promos");

const cantidadEmpleados =
    document.getElementById("cantidad-empleados");

const avisoStock =
    document.getElementById("aviso-stock");


/*
Carga todos los datos reales del panel.
*/
async function cargarPanel() {

    const token = obtenerToken();

    if (!token) {
        return;
    }

    const headers = {
        "Authorization":
            "Bearer " + token
    };

    try {

        const respuestas =
            await Promise.all([
                fetch(
                    MI_COMERCIO_URL,
                    { headers: headers }
                ),

                fetch(
                    PRODUCTOS_URL +
                    "?gestion=1",
                    { headers: headers }
                ),

                fetch(
                    PEDIDOS_URL,
                    { headers: headers }
                ),

                fetch(
                    PROMOCIONES_URL +
                    "?gestion=1",
                    { headers: headers }
                ),

                fetch(
                    EMPLEADOS_URL,
                    { headers: headers }
                ),

                fetch(
                    USUARIOS_URL,
                    { headers: headers }
                )
            ]);

        const datosComercio =
            await respuestas[0].json();

        const productos =
            await respuestas[1].json();

        const pedidos =
            await respuestas[2].json();

        const promociones =
            await respuestas[3].json();

        const empleados =
            await respuestas[4].json();

        const usuario =
            await respuestas[5].json();

        if (!respuestas[0].ok) {
            TodoTala.toast(
                datosComercio.error ||
                "No se pudo cargar el comercio"
            );
            return;
        }

        nombreComercio.textContent =
            datosComercio.nombre;

        rolActual.textContent =
            usuario.rol === "jefe"
                ? "Jefe del comercio"
                : "Empleado";

        cantidadProductos.textContent =
            respuestas[1].ok &&
            Array.isArray(productos)
                ? productos.length
                : 0;

        const pedidosActivos =
            respuestas[2].ok &&
            Array.isArray(pedidos)
                ? pedidos.filter(
                    function (pedido) {
                        return ![
                            "Entregado",
                            "Cancelado",
                            "Rechazado"
                        ].includes(
                            pedido.estado
                        );
                    }
                )
                : [];

        cantidadPedidos.textContent =
            pedidosActivos.length;

        const promocionesActivas =
            respuestas[3].ok &&
            Array.isArray(promociones)
                ? promociones.filter(
                    function (promo) {
                        return (
                            promo.estado ===
                            "Activa"
                        );
                    }
                )
                : [];

        cantidadPromos.textContent =
            promocionesActivas.length;

        cantidadEmpleados.textContent =
            respuestas[4].ok &&
            Array.isArray(empleados)
                ? empleados.length
                : 0;

        const stockBajo =
            respuestas[1].ok &&
            Array.isArray(productos)
                ? productos.filter(
                    function (producto) {
                        return (
                            Number(
                                producto.stock
                            ) <= 5
                        );
                    }
                )
                : [];

        if (stockBajo.length > 0) {

            avisoStock.innerHTML =
                '<article class="stock-warning">' +
                    '<strong>Stock bajo</strong>' +
                    '<p>' +

                    stockBajo
                        .map(
                            function (producto) {
                                return (
                                    producto.nombre +
                                    " (" +
                                    producto.stock +
                                    ")"
                                );
                            }
                        )
                        .join(" · ") +

                    '</p>' +
                '</article>';

        } else {

            avisoStock.innerHTML = "";
        }

    } catch (error) {

        console.error(error);

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


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


cargarPanel();