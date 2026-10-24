const listaPedidos =
    document.getElementById("lista-pedidos");

let filtroActual = "activos";
let pedidosActuales = [];

const estadosActivos = [
    "Pendiente",
    "Aceptado",
    "En preparación",
    "Listo para retirar"
];

const estadosCancelados = [
    "Cancelado",
    "Rechazado"
];


/*
Carga solamente los pedidos del cliente
autenticado.
*/
async function cargarPedidos() {

    try {

        const respuesta = await fetch(
            PEDIDOS_URL,
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
                "No se pudieron cargar los pedidos"
            );

            return;
        }

        pedidosActuales = datos;

        renderizarPedidos();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Decide si el pedido pertenece
al filtro seleccionado.
*/
function coincideFiltro(pedido) {

    if (filtroActual === "activos") {
        return estadosActivos.includes(
            pedido.estado
        );
    }

    if (filtroActual === "finalizados") {
        return pedido.estado === "Entregado";
    }

    return estadosCancelados.includes(
        pedido.estado
    );
}


/*
Formatea una fecha de MySQL.
*/
function formatearFecha(fecha) {

    if (!fecha) {
        return "";
    }

    const fechaJS =
        new Date(
            fecha.replace(" ", "T")
        );

    return fechaJS.toLocaleString(
        "es-UY",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
}


/*
Texto del plazo de retiro.
*/
function textoRetiro(pedido) {

    if (
        pedido.estado !== "Listo para retirar" ||
        !pedido.vence_retiro
    ) {
        return "";
    }

    return (
        '<p class="helper">' +
        'Retirar antes de: ' +
        formatearFecha(
            pedido.vence_retiro
        ) +
        '</p>'
    );
}


/*
Muestra los pedidos reales.
*/
function renderizarPedidos() {

    const pedidos =
        pedidosActuales.filter(
            coincideFiltro
        );

    if (pedidos.length === 0) {

        listaPedidos.innerHTML =
            '<p class="empty-state">' +
            'No hay pedidos en esta sección.' +
            '</p>';

        return;
    }

    listaPedidos.innerHTML =
        pedidos.map(function (pedido) {

            const puedeCancelar = [
                "Pendiente",
                "Aceptado",
                "En preparación"
            ].includes(pedido.estado);

            const motivo =
                pedido.motivo_cancelacion
                    ? (
                        '<p class="helper">' +
                        'Motivo: ' +
                        pedido.motivo_cancelacion +
                        '</p>'
                    )
                    : "";

            const observacion =
                pedido.observacion
                    ? (
                        '<p class="helper">' +
                        'Observación: ' +
                        pedido.observacion +
                        '</p>'
                    )
                    : "";

            const codigo =
                pedido.codigo_retiro
                    ? (
                        '<p class="order-code">' +
                        'Código de retiro: <strong>' +
                        pedido.codigo_retiro +
                        '</strong></p>'
                    )
                    : "";

            const productos =
                pedido.productos.map(
                    function (producto) {

                        return (
                            '<span>' +
                            producto.nombre +
                            ' x' +
                            producto.cantidad +
                            '</span>'
                        );
                    }
                ).join("");

            return (
                '<article class="order-card" ' +
                'data-pedido="' +
                pedido.id_pedido +
                '">' +

                    '<header class="order-heading">' +

                        '<section>' +

                            '<strong>Pedido #' +
                                pedido.id_pedido +
                            '</strong>' +

                            '<p class="muted">' +
                                pedido.comercio +
                                ' · ' +
                                formatearFecha(
                                    pedido.fecha_pedido
                                ) +
                            '</p>' +

                        '</section>' +

                        '<span class="' +
                            TodoTala.claseEstado(
                                pedido.estado
                            ) +
                        '">' +
                            pedido.estado +
                        '</span>' +

                    '</header>' +

                    '<section class="order-items">' +
                        productos +
                    '</section>' +

                    '<p><strong>Total: ' +
                        TodoTala.formatearPrecio(
                            Number(pedido.total)
                        ) +
                    '</strong></p>' +

                    observacion +
                    codigo +
                    textoRetiro(pedido) +
                    motivo +

                    (
                        puedeCancelar
                            ? (
                                '<nav class="order-actions">' +

                                    '<button ' +
                                    'class="btn btn--danger" ' +
                                    'data-cancelar ' +
                                    'type="button">' +
                                    'Cancelar pedido' +
                                    '</button>' +

                                '</nav>' +

                                '<form ' +
                                'class="cancel-form" ' +
                                'data-form-cancelar ' +
                                'hidden>' +

                                    '<label>' +
                                        'Motivo' +

                                        '<select data-motivo>' +

                                            '<option value="Ya no lo necesito">' +
                                                'Ya no lo necesito' +
                                            '</option>' +

                                            '<option value="Me equivoqué en el pedido">' +
                                                'Me equivoqué en el pedido' +
                                            '</option>' +

                                            '<option value="No puedo retirarlo">' +
                                                'No puedo retirarlo' +
                                            '</option>' +

                                            '<option value="Otro">' +
                                                'Otro' +
                                            '</option>' +

                                        '</select>' +
                                    '</label>' +

                                    '<label ' +
                                    'data-otro-label ' +
                                    'hidden>' +

                                        'Otro motivo' +

                                        '<input ' +
                                        'data-otro ' +
                                        'type="text">' +

                                    '</label>' +

                                    '<button ' +
                                    'class="btn btn--danger" ' +
                                    'type="submit">' +
                                        'Confirmar cancelación' +
                                    '</button>' +

                                '</form>'
                            )
                            : ""
                    ) +

                '</article>'
            );
        }).join("");


    /*
    Conecta los botones de cancelación.
    */
    document
        .querySelectorAll("[data-pedido]")
        .forEach(function (tarjeta) {

            const botonCancelar =
                tarjeta.querySelector(
                    "[data-cancelar]"
                );

            const formulario =
                tarjeta.querySelector(
                    "[data-form-cancelar]"
                );

            if (
                !botonCancelar ||
                !formulario
            ) {
                return;
            }

            const selector =
                formulario.querySelector(
                    "[data-motivo]"
                );

            const otroLabel =
                formulario.querySelector(
                    "[data-otro-label]"
                );

            const otroCampo =
                formulario.querySelector(
                    "[data-otro]"
                );

            botonCancelar.addEventListener(
                "click",
                function () {

                    formulario.hidden =
                        !formulario.hidden;
                }
            );

            selector.addEventListener(
                "change",
                function () {

                    otroLabel.hidden =
                        selector.value !== "Otro";
                }
            );

            formulario.addEventListener(
                "submit",
                function (evento) {

                    evento.preventDefault();

                    const motivo =
                        selector.value === "Otro"
                            ? otroCampo.value.trim()
                            : selector.value;

                    if (!motivo) {
                        return;
                    }

                    cancelarPedido(
                        Number(
                            tarjeta.dataset.pedido
                        ),
                        motivo
                    );
                }
            );
        });
}


/*
Cancela un pedido mediante la API.
El backend se encarga de devolver el stock.
*/
async function cancelarPedido(
    idPedido,
    motivo
) {

    try {

        const respuesta = await fetch(
            PEDIDOS_URL +
            "?id=" +
            idPedido,
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
                    estado: "Cancelado",
                    motivo_cancelacion: motivo
                })
            }
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            TodoTala.toast(
                datos.error ||
                "No se pudo cancelar el pedido"
            );

            return;
        }

        TodoTala.toast(
            "Pedido cancelado correctamente"
        );

        cargarPedidos();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Filtros:
Activos / Finalizados / Cancelados.
*/
document
    .querySelectorAll("[data-filtro]")
    .forEach(function (boton) {

        boton.addEventListener(
            "click",
            function () {

                filtroActual =
                    boton.dataset.filtro;

                document
                    .querySelectorAll(
                        "[data-filtro]"
                    )
                    .forEach(function (item) {

                        item.classList.remove(
                            "active"
                        );
                    });

                boton.classList.add(
                    "active"
                );

                renderizarPedidos();
            }
        );
    });


/*
Inicio.
*/
cargarPedidos();