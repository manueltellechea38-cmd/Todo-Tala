window.TodoTala =
    window.TodoTala || {};


/*
Versión actual del proyecto.
La cambiaremos a 1.0.0 cuando cerremos
Postman y documentación.
*/
TodoTala.VERSION =
    "1.0.0";


/*
Formatea precios para Uruguay.
*/
TodoTala.formatearPrecio =
    function (valor) {

        return (
            "$" +
            Number(
                valor || 0
            ).toLocaleString(
                "es-UY"
            )
        );
    };


/*
Lee un parámetro de la URL.

Ejemplo:
?id=3
*/
TodoTala.parametro =
    function (nombre) {

        return new URLSearchParams(
            window.location.search
        ).get(nombre);
    };


/*
Abre una ruta relativa.
*/
TodoTala.irA =
    function (ruta) {

        window.location.href =
            ruta;
    };


/*
Muestra mensajes breves
en la interfaz.
*/
TodoTala.toast =
    function (mensaje) {

        let aviso =
            document.getElementById(
                "toast-global"
            );

        if (!aviso) {

            aviso =
                document.createElement(
                    "aside"
                );

            aviso.id =
                "toast-global";

            aviso.className =
                "toast";

            document.body.appendChild(
                aviso
            );
        }

        aviso.textContent =
            mensaje;

        aviso.classList.add(
            "is-visible"
        );

        window.setTimeout(
            function () {

                aviso.classList.remove(
                    "is-visible"
                );
            },
            2400
        );
    };


/*
Devuelve el usuario de la sesión actual.

Los datos vienen de sesion.js.
Ya no usa usuarios simulados.
*/
TodoTala.usuarioActual =
    function () {

        if (
            typeof obtenerUsuario !==
            "function"
        ) {
            return null;
        }

        return obtenerUsuario();
    };


/*
Cierra la sesión en la API
y también en el navegador.
*/
TodoTala.cerrarSesion =
    async function () {

        const token =
            typeof obtenerToken ===
            "function"
                ? obtenerToken()
                : null;

        if (token) {

            try {

                await fetch(
                    LOGOUT_URL,
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                "Bearer " +
                                token
                        }
                    }
                );

            } catch (error) {

                /*
                Aunque el servidor no responda,
                se cierra la sesión local.
                */
            }
        }

        if (
            typeof cerrarSesionLocal ===
            "function"
        ) {
            cerrarSesionLocal();
        }
    };


/*
Devuelve el estado visual
según el stock del producto.
*/
TodoTala.estadoStock =
    function (producto) {

        const stock =
            Number(
                producto.stock
            );

        if (stock <= 0) {

            return {
                texto:
                    "Sin stock",

                clase:
                    "badge badge--danger"
            };
        }

        if (stock <= 5) {

            return {
                texto:
                    "Últimas " + stock,

                clase:
                    "badge badge--warning"
            };
        }

        return {
            texto:
                "Disponible",

            clase:
                "badge badge--success"
        };
    };


/*
Devuelve la clase visual
correspondiente al estado
de un pedido.
*/
TodoTala.claseEstado =
    function (estado) {

        if (
            estado ===
                "Listo para retirar" ||
            estado ===
                "Entregado"
        ) {

            return (
                "badge " +
                "badge--success"
            );
        }

        if (
            estado ===
                "Rechazado" ||
            estado ===
                "Cancelado"
        ) {

            return (
                "badge " +
                "badge--danger"
            );
        }

        if (
            [
                "Pendiente",
                "Aceptado",
                "En preparación"
            ].includes(estado)
        ) {

            return (
                "badge " +
                "badge--warning"
            );
        }

        return "badge";
    };


/*
Oculta las opciones exclusivas
del Jefe cuando entra un Empleado.

La seguridad real igualmente
la controla PHP.
*/
TodoTala.ajustarNavegacionComercio =
    function () {

        const usuario =
            TodoTala.usuarioActual();

        if (
            !usuario ||
            usuario.rol === "jefe"
        ) {
            return;
        }

        document
            .querySelectorAll(
                "[data-solo-jefe]"
            )
            .forEach(
                function (elemento) {

                    elemento.hidden =
                        true;
                }
            );
    };