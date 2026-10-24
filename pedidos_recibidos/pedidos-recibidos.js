const listaRecibidos =
    document.getElementById("lista-pedidos");

const buscadorPedidos =
    document.getElementById("buscar-pedido");

const filtroEstado =
    document.getElementById("estado-pedido");

let pedidosActuales = [];


/*
Carga los pedidos del comercio.
El backend determina el comercio según
el jefe o empleado autenticado.
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
Formatea la fecha recibida desde MySQL.
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
Devuelve las acciones permitidas
según el estado actual.
*/
function accionesPedido(pedido) {

    if (pedido.estado === "Pendiente") {

        return (
            '<button ' +
            'class="btn btn--primary" ' +
            'data-next="Aceptado" ' +
            'type="button">' +
            'Aceptar' +
            '</button>' +

            '<button ' +
            'class="btn btn--danger" ' +
            'data-cancelar ' +
            'type="button">' +
            'Rechazar' +
            '</button>'
        );
    }

    if (pedido.estado === "Aceptado") {

        return (
            '<button ' +
            'class="btn btn--primary" ' +
            'data-next="En preparación" ' +
            'type="button">' +
            'Preparar' +
            '</button>' +

            '<button ' +
            'class="btn btn--danger" ' +
            'data-cancelar ' +
            'type="button">' +
            'Cancelar' +
            '</button>'
        );
    }

    if (pedido.estado === "En preparación") {

        return (
            '<button ' +
            'class="btn btn--primary" ' +
            'data-next="Listo para retirar" ' +
            'type="button">' +
            'Marcar listo' +
            '</button>' +

            '<button ' +
            'class="btn btn--danger" ' +
            'data-cancelar ' +
            'type="button">' +
            'Cancelar' +
            '</button>'
        );
    }

    return "";
}


/*
Cambia un pedido al siguiente estado.
*/
async function cambiarEstadoPedido(
    idPedido,
    estado,
    codigoRetiro
) {

    const cuerpo = {
        estado: estado
    };

    if (codigoRetiro) {
        cuerpo.codigo_retiro =
            codigoRetiro;
    }

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

                body: JSON.stringify(
                    cuerpo
                )
            }
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            TodoTala.toast(
                datos.error ||
                "No se pudo actualizar el pedido"
            );

            return;
        }

        TodoTala.toast(
            "Pedido actualizado"
        );

        cargarPedidos();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Rechaza o cancela un pedido.
*/
async function cancelarPedido(
    pedido,
    motivo
) {

    let nuevoEstado;

    if (pedido.estado === "Pendiente") {
        nuevoEstado = "Rechazado";
    } else {
        nuevoEstado = "Cancelado";
    }

    try {

        const respuesta = await fetch(
            PEDIDOS_URL +
            "?id=" +
            pedido.id_pedido,
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
                    estado: nuevoEstado,
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
            nuevoEstado === "Rechazado"
                ? "Pedido rechazado"
                : "Pedido cancelado"
        );

        cargarPedidos();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Filtra y muestra los pedidos.
*/
function renderizarPedidos() {

    const texto =
        buscadorPedidos.value
            .trim()
            .toLowerCase();

    const pedidos =
        pedidosActuales.filter(
            function (pedido) {

                const contenido = (
                    pedido.id_pedido +
                    " " +
                    (pedido.cliente || "") +
                    " " +
                    (pedido.codigo_retiro || "")
                ).toLowerCase();

                const coincideTexto =
                    contenido.includes(texto);

                const coincideEstado =
                    !filtroEstado.value ||
                    pedido.estado ===
                    filtroEstado.value;

                return (
                    coincideTexto &&
                    coincideEstado
                );
            }
        );

    if (pedidos.length === 0) {

        listaRecibidos.innerHTML =
            '<p class="empty-state">' +
            'No hay pedidos con esos filtros.' +
            '</p>';

        return;
    }

    listaRecibidos.innerHTML =
        pedidos.map(function (pedido) {

            const puedeCancelar = [
                "Pendiente",
                "Aceptado",
                "En preparación"
            ].includes(pedido.estado);

            const productos =
                pedido.productos.map(
                    function (producto) {

                        return (
                            producto.nombre +
                            " x" +
                            producto.cantidad
                        );
                    }
                ).join(" · ");

            const verificacion =
                pedido.estado ===
                "Listo para retirar"
                    ? (
                        '<section class="code-check">' +

                            '<input ' +
                            'type="text" ' +
                            'placeholder="Código de retiro" ' +
                            'data-code-input>' +

                            '<button ' +
                            'class="btn btn--primary" ' +
                            'data-validar ' +
                            'type="button">' +
                            'Validar y entregar' +
                            '</button>' +

                        '</section>'
                    )
                    : "";

            const cancelacion =
                puedeCancelar
                    ? (
                        '<form ' +
                        'class="cancel-order-form" ' +
                        'data-form-cancelar ' +
                        'hidden>' +

                            '<label>' +
                                'Motivo' +

                                '<select data-motivo>' +

                                    '<option value="Sin stock disponible">' +
                                        'Sin stock disponible' +
                                    '</option>' +

                                    '<option value="No podemos preparar el pedido">' +
                                        'No podemos preparar el pedido' +
                                    '</option>' +

                                    '<option value="Problema con el pedido">' +
                                        'Problema con el pedido' +
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

            const motivo =
                pedido.motivo_cancelacion
                    ? (
                        '<p class="helper">' +
                        'Motivo: ' +
                        pedido.motivo_cancelacion +
                        '</p>'
                    )
                    : "";

            const vencimiento =
                pedido.vence_retiro
                    ? (
                        '<p class="helper">' +
                        'Retirar antes de: ' +
                        formatearFecha(
                            pedido.vence_retiro
                        ) +
                        '</p>'
                    )
                    : "";

            return (
                '<article class="received-order" ' +
                'data-pedido="' +
                pedido.id_pedido +
                '">' +

                    '<header>' +

                        '<section>' +

                            '<strong>Pedido #' +
                                pedido.id_pedido +
                            '</strong>' +

                            '<p class="muted">' +
                                (pedido.cliente || "Cliente") +
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

                    '<p class="order-items">' +
                        productos +
                    '</p>' +

                    '<p><strong>Total: ' +
                        TodoTala.formatearPrecio(
                            Number(pedido.total)
                        ) +
                    '</strong></p>' +

                    observacion +
                    vencimiento +
                    motivo +

                    '<nav class="order-actions">' +
                        accionesPedido(pedido) +
                    '</nav>' +

                    verificacion +
                    cancelacion +

                '</article>'
            );
        }).join("");


    /*
    Conecta acciones de cada pedido.
    */
    document
        .querySelectorAll("[data-pedido]")
        .forEach(function (tarjeta) {

            const idPedido =
                Number(
                    tarjeta.dataset.pedido
                );

            const pedido =
                pedidosActuales.find(
                    function (item) {

                        return Number(
                            item.id_pedido
                        ) === idPedido;
                    }
                );

            if (!pedido) {
                return;
            }


            /*
            Aceptar / Preparar / Marcar listo.
            */
            tarjeta
                .querySelectorAll("[data-next]")
                .forEach(function (boton) {

                    boton.addEventListener(
                        "click",
                        function () {

                            cambiarEstadoPedido(
                                idPedido,
                                boton.dataset.next
                            );
                        }
                    );
                });


            /*
            Validar código y entregar.
            */
            const botonValidar =
                tarjeta.querySelector(
                    "[data-validar]"
                );

            if (botonValidar) {

                botonValidar.addEventListener(
                    "click",
                    function () {

                        const campo =
                            tarjeta.querySelector(
                                "[data-code-input]"
                            );

                        const codigo =
                            campo.value.trim();

                        if (!codigo) {

                            TodoTala.toast(
                                "Ingresá el código de retiro"
                            );

                            return;
                        }

                        cambiarEstadoPedido(
                            idPedido,
                            "Entregado",
                            codigo
                        );
                    }
                );
            }


            /*
            Rechazar o cancelar.
            */
            const botonCancelar =
                tarjeta.querySelector(
                    "[data-cancelar]"
                );

            const formularioCancelar =
                tarjeta.querySelector(
                    "[data-form-cancelar]"
                );

            if (
                botonCancelar &&
                formularioCancelar
            ) {

                const selector =
                    formularioCancelar
                        .querySelector(
                            "[data-motivo]"
                        );

                const otroLabel =
                    formularioCancelar
                        .querySelector(
                            "[data-otro-label]"
                        );

                const otroCampo =
                    formularioCancelar
                        .querySelector(
                            "[data-otro]"
                        );

                botonCancelar.addEventListener(
                    "click",
                    function () {

                        formularioCancelar.hidden =
                            !formularioCancelar.hidden;
                    }
                );

                selector.addEventListener(
                    "change",
                    function () {

                        otroLabel.hidden =
                            selector.value !==
                            "Otro";
                    }
                );

                formularioCancelar.addEventListener(
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
                            pedido,
                            motivo
                        );
                    }
                );
            }
        });
}


/*
Filtros.
*/
buscadorPedidos.addEventListener(
    "input",
    renderizarPedidos
);

filtroEstado.addEventListener(
    "change",
    renderizarPedidos
);

document
    .getElementById("filtros-pedidos")
    .addEventListener(
        "submit",
        function (evento) {
            evento.preventDefault();
        }
    );


/*
Inicio.
*/
cargarPedidos();