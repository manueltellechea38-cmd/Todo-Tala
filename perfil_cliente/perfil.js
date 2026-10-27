const usuarioPerfil = TodoTala.usuarioActual();
const formularioPerfil = document.getElementById("form-edicion");

/* Carga los datos del usuario que inició sesión. */
function renderizarPerfil() {
    const datos = TodoTala.obtenerDatos();
    const usuario = datos.usuarios.find(function (item) { return item.id === usuarioPerfil.id; });

    document.getElementById("nombre-visible").textContent = usuario.nombre;
    document.getElementById("email-visible").textContent = usuario.correo;
    document.getElementById("cedula-visible").textContent = usuario.cedula;
    document.getElementById("fecha-visible").textContent = usuario.fechaNacimiento || "No indicada";
    document.getElementById("avatar").textContent = usuario.nombre.split(" ").slice(0, 2).map(function (parte) { return parte.charAt(0); }).join("").toUpperCase();

    document.getElementById("nombre").value = usuario.nombre;
    document.getElementById("email").value = usuario.correo;
    document.getElementById("fecha-nacimiento").value = usuario.fechaNacimiento || "";
}

/* Muestra u oculta el formulario de edición. */
document.getElementById("btn-editar").addEventListener("click", function () {
    formularioPerfil.hidden = !formularioPerfil.hidden;
});

/* Guarda los cambios del perfil. */
formularioPerfil.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const datos = TodoTala.obtenerDatos();
    const usuario = datos.usuarios.find(function (item) { return item.id === usuarioPerfil.id; });
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("email").value.trim();
    const correoOcupado = datos.usuarios.some(function (item) {
        return item.id !== usuario.id && item.correo.toLowerCase() === correo.toLowerCase();
    });
    const valido = nombre !== "" && correo.includes("@") && correo.includes(".") && !correoOcupado;

    document.getElementById("error-perfil").classList.toggle("is-visible", !valido);
    if (!valido) return;

    usuario.nombre = nombre;
    usuario.correo = correo;
    usuario.fechaNacimiento = document.getElementById("fecha-nacimiento").value;

    TodoTala.guardarDatos(datos);
    formularioPerfil.hidden = true;
    renderizarPerfil();
    TodoTala.toast("Perfil actualizado.");
});
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
document.getElementById("btn-salir").addEventListener("click", async function () {
    await TodoTala.cerrarSesion();

    TodoTala.abrir(
        "pantalla_login/todo_tala_pantalla_login.html"
    );
});
cargarComerciosSeguidos();