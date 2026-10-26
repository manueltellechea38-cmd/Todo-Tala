const listaPromociones =
    document.getElementById("lista-promos");

const panelNuevaPromo =
    document.getElementById("panel-nueva");

const selectorProducto =
    document.getElementById("producto-promo");

let promocionesActuales = [];
let productosActuales = [];


/*
Carga los productos del comercio
para mostrarlos en el selector.
*/
async function cargarProductos() {

    try {

        const respuesta = await fetch(
            PRODUCTOS_URL + "?gestion=1",
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
                "No se pudieron cargar los productos"
            );

            return;
        }

        productosActuales = datos;

        if (productosActuales.length === 0) {

            selectorProducto.innerHTML =
                '<option value="">' +
                'No hay productos disponibles' +
                '</option>';

            return;
        }

        selectorProducto.innerHTML =
            productosActuales.map(
                function (producto) {

                    return (
                        '<option value="' +
                        producto.id_producto +
                        '">' +
                        producto.nombre +
                        '</option>'
                    );
                }
            ).join("");

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Carga las promociones del comercio.
*/
async function cargarPromociones() {

    try {

        const respuesta = await fetch(
            PROMOCIONES_URL + "?gestion=1",
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
                "No se pudieron cargar las promociones"
            );

            return;
        }

        promocionesActuales = datos;

        renderizarPromociones();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Devuelve el texto del descuento.
*/
function detallePromocion(promo) {

    if (promo.tipo === "porcentaje") {

        return Number(promo.valor) + "%";
    }

    return TodoTala.formatearPrecio(
        Number(promo.valor)
    );
}


/*
Muestra las promociones.
*/
function renderizarPromociones() {

    if (promocionesActuales.length === 0) {

        listaPromociones.innerHTML =
            '<p class="empty-state">' +
            'Todavía no hay promociones.' +
            '</p>';

        return;
    }

    listaPromociones.innerHTML =
        promocionesActuales.map(
            function (promo) {

                const activa =
                    promo.estado === "Activa";

                return (
                    '<article class="promo-row" ' +
                    'data-promo="' +
                    promo.id_promocion +
                    '">' +

                        '<section class="promo-info">' +

                            '<p>' +

                                '<strong>' +
                                    promo.nombre +
                                '</strong> ' +

                                '<span class="' +
                                    (
                                        activa
                                            ? 'badge badge--success'
                                            : 'badge'
                                    ) +
                                '">' +

                                    (
                                        activa
                                            ? 'Activa'
                                            : 'Inactiva'
                                    ) +

                                '</span>' +

                            '</p>' +

                            '<p class="muted">' +
                                promo.producto +
                                ' · ' +
                                detallePromocion(promo) +
                                ' · ' +
                                (promo.fecha_inicio || "Sin inicio") +
                                ' a ' +
                                (promo.fecha_fin || "Sin fin") +
                            '</p>' +

                        '</section>' +

                        '<nav class="promo-actions">' +

                            '<button ' +
                            'class="btn btn--secondary" ' +
                            'data-toggle ' +
                            'type="button">' +

                                (
                                    activa
                                        ? 'Desactivar'
                                        : 'Activar'
                                ) +

                            '</button>' +

                            '<button ' +
                            'class="btn btn--danger" ' +
                            'data-eliminar ' +
                            'type="button">' +
                                'Eliminar' +
                            '</button>' +

                        '</nav>' +

                    '</article>'
                );
            }
        ).join("");


    /*
    Botones de cada promoción.
    */
    document
        .querySelectorAll("[data-promo]")
        .forEach(function (fila) {

            const idPromocion =
                Number(fila.dataset.promo);

            const promo =
                promocionesActuales.find(
                    function (item) {

                        return Number(
                            item.id_promocion
                        ) === idPromocion;
                    }
                );

            if (!promo) {
                return;
            }

            fila
                .querySelector("[data-toggle]")
                .addEventListener(
                    "click",
                    function () {

                        cambiarEstadoPromocion(
                            promo
                        );
                    }
                );

            fila
                .querySelector("[data-eliminar]")
                .addEventListener(
                    "click",
                    function () {

                        eliminarPromocion(
                            idPromocion
                        );
                    }
                );
        });
}


/*
Activa o desactiva una promoción.
*/
async function cambiarEstadoPromocion(promo) {

    const nuevoEstado =
        promo.estado === "Activa"
            ? "Inactiva"
            : "Activa";

    try {

        const respuesta = await fetch(
            PROMOCIONES_URL +
            "?id=" +
            promo.id_promocion,
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
                    estado: nuevoEstado
                })
            }
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            TodoTala.toast(
                datos.error ||
                "No se pudo actualizar la promoción"
            );

            return;
        }

        TodoTala.toast(
            nuevoEstado === "Activa"
                ? "Promoción activada"
                : "Promoción desactivada"
        );

        cargarPromociones();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Elimina una promoción.
*/
async function eliminarPromocion(idPromocion) {

    try {

        const respuesta = await fetch(
            PROMOCIONES_URL +
            "?id=" +
            idPromocion,
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
                "No se pudo eliminar la promoción"
            );

            return;
        }

        TodoTala.toast(
            "Promoción eliminada"
        );

        cargarPromociones();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Abre o cierra el formulario.
*/
document
    .getElementById("btn-crear")
    .addEventListener(
        "click",
        function () {

            panelNuevaPromo.hidden =
                !panelNuevaPromo.hidden;
        }
    );


/*
Crea una promoción nueva.
*/
document
    .getElementById("form-promocion")
    .addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();

            const nombre =
                document
                    .getElementById("nombre-promo")
                    .value
                    .trim();

            const idProducto =
                Number(
                    selectorProducto.value
                );

            const tipo =
                document
                    .getElementById("tipo-promo")
                    .value;

            const valor =
                Number(
                    document
                        .getElementById("valor-promo")
                        .value
                );

            const inicio =
                document
                    .getElementById("inicio")
                    .value;

            const fin =
                document
                    .getElementById("fin")
                    .value;

            const estado =
                document
                    .getElementById("activa")
                    .value === "true"
                    ? "Activa"
                    : "Inactiva";

            const valida =
                nombre !== "" &&
                idProducto > 0 &&
                valor > 0 &&
                inicio !== "" &&
                fin !== "" &&
                fin >= inicio;

            document
                .getElementById("error-promo")
                .classList
                .toggle(
                    "is-visible",
                    !valida
                );

            if (!valida) {
                return;
            }

            const nuevaPromo = {
                id_producto: idProducto,
                nombre: nombre,
                tipo: tipo,
                valor: valor,
                fecha_inicio: inicio,
                fecha_fin: fin,
                estado: estado
            };

            try {

                const respuesta = await fetch(
                    PROMOCIONES_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " +
                                obtenerToken()
                        },

                        body: JSON.stringify(
                            nuevaPromo
                        )
                    }
                );

                const datos =
                    await respuesta.json();

                if (!respuesta.ok) {

                    TodoTala.toast(
                        datos.error ||
                        "No se pudo crear la promoción"
                    );

                    return;
                }

                TodoTala.toast(
                    "Promoción creada correctamente"
                );

                evento.target.reset();

                panelNuevaPromo.hidden = true;

                cargarPromociones();

            } catch (error) {

                TodoTala.toast(
                    "No se pudo conectar con el servidor"
                );
            }
        }
    );


/*
Inicio.
*/
async function iniciarPromociones() {

    await cargarProductos();
    await cargarPromociones();
}

iniciarPromociones();