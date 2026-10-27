const formularioPerfil =
    document.getElementById("form-edicion");

let usuarioPerfil = null;


/*
Carga los datos reales del usuario desde MySQL.
*/
async function cargarPerfil() {

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

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            TodoTala.toast(
                datos.error ||
                "No se pudo cargar el perfil"
            );

            return;
        }

        usuarioPerfil = datos;

        renderizarPerfil();

    } catch (error) {

        console.error(error);

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Muestra los datos del usuario.
*/
function renderizarPerfil() {

    if (!usuarioPerfil) {
        return;
    }

    document
        .getElementById("nombre-visible")
        .textContent =
            usuarioPerfil.nombre;

    document
        .getElementById("email-visible")
        .textContent =
            usuarioPerfil.correo;

    document
        .getElementById("cedula-visible")
        .textContent =
            usuarioPerfil.cedula ||
            "No indicada";

    document
        .getElementById("fecha-visible")
        .textContent =
            usuarioPerfil.fecha_nacimiento ||
            "No indicada";

    document
        .getElementById("avatar")
        .textContent =
            usuarioPerfil.nombre
                .split(" ")
                .slice(0, 2)
                .map(function (parte) {
                    return parte
                        .charAt(0)
                        .toUpperCase();
                })
                .join("");

    document
        .getElementById("nombre")
        .value =
            usuarioPerfil.nombre;

    document
        .getElementById("email")
        .value =
            usuarioPerfil.correo;

    document
        .getElementById("fecha-nacimiento")
        .value =
            usuarioPerfil.fecha_nacimiento || "";
}


/*
Muestra u oculta el formulario.
*/
document
    .getElementById("btn-editar")
    .addEventListener(
        "click",
        function () {

            formularioPerfil.hidden =
                !formularioPerfil.hidden;
        }
    );


/*
Guarda los cambios en MySQL.
*/
formularioPerfil.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();

        const token = obtenerToken();

        if (!token) {
            return;
        }

        const nombre =
            document
                .getElementById("nombre")
                .value
                .trim();

        const correo =
            document
                .getElementById("email")
                .value
                .trim();

        const fechaNacimiento =
            document
                .getElementById(
                    "fecha-nacimiento"
                )
                .value;

        if (
            nombre === "" ||
            correo === ""
        ) {

            document
                .getElementById("error-perfil")
                .classList
                .add("is-visible");

            return;
        }

        try {

            const respuesta = await fetch(
                USUARIOS_URL,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token
                    },

                    body:
                        JSON.stringify({
                            nombre: nombre,
                            correo: correo,
                            fecha_nacimiento:
                                fechaNacimiento
                        })
                }
            );

            const datos =
                await respuesta.json();

            if (!respuesta.ok) {

                document
                    .getElementById("error-perfil")
                    .classList
                    .add("is-visible");

                TodoTala.toast(
                    datos.error ||
                    "No se pudo actualizar el perfil"
                );

                return;
            }

            document
                .getElementById("error-perfil")
                .classList
                .remove("is-visible");

            formularioPerfil.hidden = true;

            TodoTala.toast(
                "Perfil actualizado"
            );

            await cargarPerfil();

        } catch (error) {

            console.error(error);

            TodoTala.toast(
                "No se pudo conectar con el servidor"
            );
        }
    }
);


/*
Carga los comercios seguidos desde MySQL.
*/
async function cargarComerciosSeguidos() {

    const lista =
        document.getElementById(
            "lista-comercios-seguidos"
        );

    const token = obtenerToken();

    if (!token) {
        return;
    }

    try {

        const respuesta = await fetch(
            COMERCIOS_SEGUIDOS_URL,
            {
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        const comercios =
            await respuesta.json();

        if (!respuesta.ok) {

            TodoTala.toast(
                comercios.error ||
                "No se pudieron cargar los comercios"
            );

            return;
        }

        if (comercios.length === 0) {

            lista.innerHTML =
                '<p class="muted">' +
                'Todavía no seguís ningún comercio.' +
                '</p>';

            return;
        }

        lista.innerHTML =
            comercios.map(
                function (comercio) {

                    return (
                        '<article class="profile-data">' +
                            '<strong>' +
                                comercio.nombre +
                            '</strong>' +
                            '<p class="muted">' +
                                (
                                    comercio.direccion ||
                                    "Sin dirección"
                                ) +
                            '</p>' +
                            '<p class="muted">' +
                                (
                                    comercio.horario ||
                                    "Horario no indicado"
                                ) +
                            '</p>' +
                        '</article>'
                    );
                }
            ).join("");

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


cargarPerfil();
cargarComerciosSeguidos();