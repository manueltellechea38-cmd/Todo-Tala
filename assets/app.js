window.TodoTala =
    window.TodoTala || {};


/*
VersiÃ³n actual del proyecto.
La cambiaremos a 1.0.0 cuando cerremos
Postman y documentaciÃ³n.
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
Lee un parÃ¡metro de la URL.

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
Devuelve el usuario de la sesiÃ³n actual.

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
Cierra la sesiÃ³n en la API
y tambiÃ©n en el navegador.
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
                se cierra la sesiÃ³n local.
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
segÃºn el stock del producto.
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
                    "Ãšltimas " + stock,

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
                "En preparaciÃ³n"
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
/* =========================
   CAMPANITA DE NOTIFICACIONES
   ========================= */

(function () {
    const scriptActual = document.currentScript;
    const raizProyecto = new URL("../", scriptActual.src);

    function iniciarCampanita() {
        const usuario =
            typeof obtenerUsuario === "function"
                ? obtenerUsuario()
                : null;

        const token =
            typeof obtenerToken === "function"
                ? obtenerToken()
                : null;

        if (!usuario || !token) return;

        const botonSalir = document.querySelector("#btn-salir");

        const contenedor =
            botonSalir?.parentElement ||
            document.querySelector(".top-nav") ||
            document.querySelector(".app-header");

        if (!contenedor) return;

        if (document.getElementById("campanita-notificaciones")) {
            return;
        }

        const enlace = document.createElement("a");
        enlace.id = "campanita-notificaciones";
        enlace.className = "campanita-notificaciones";
        enlace.href = new URL(
            "notificaciones/todo_tala_notificaciones.html",
            raizProyecto
        ).href;

        enlace.setAttribute(
            "aria-label",
            "Notificaciones"
        );

        enlace.innerHTML = `
    <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
        <path d="M10 21h4"></path>
    </svg>
    <span class="campanita-contador" hidden></span>
`;

        contenedor.insertBefore(
            enlace,
            botonSalir || null
        );

        enlace.style.marginLeft = contenedor.matches(".top-nav") ? "0" : "auto";

        const contador =
            enlace.querySelector(".campanita-contador");

        async function actualizarContador() {
            try {
                const respuesta = await fetch(
                    NOTIFICACIONES_URL,
                    {
                        method: "GET",
                        headers: {
                            "Authorization": "Bearer " + token
                        },
                        cache: "no-store"
                    }
                );

                if (!respuesta.ok) {
                    throw new Error("No se pudo consultar el contador.");
                }

                const datos = await respuesta.json();
                const cantidad = Number(datos.sin_leer || 0);

                contador.hidden = cantidad <= 0;
                contador.textContent = "";

                enlace.setAttribute(
                    "aria-label",
                    cantidad > 0
                        ? "Notificaciones, " + cantidad + " sin leer"
                        : "Notificaciones"
                );
            } catch (error) {
                console.error(
                    "Error al actualizar notificaciones:",
                    error
                );
            }
        }

        actualizarContador();
        window.setInterval(actualizarContador, 30000);
    }

    iniciarCampanita();
})();



