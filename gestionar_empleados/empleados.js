const listaEmpleados = document.getElementById("lista-empleados");
const errorEmpleado = document.getElementById("error-empleado");
const formularioEmpleado = document.getElementById("form-empleado");

/*
Obtiene el token de la sesión iniciada.
*/
function tokenActual() {
    return obtenerToken();
}

/*
Muestra los empleados que devuelve la API.
*/
function mostrarEmpleados(empleados) {

    if (empleados.length === 0) {
        listaEmpleados.innerHTML =
            '<p class="empty-state">No hay empleados registrados.</p>';
        return;
    }

    listaEmpleados.innerHTML = empleados.map(function (empleado) {

        return `
            <article class="employee-item" data-empleado="${empleado.id_persona}">
                <strong>${empleado.nombre}</strong>
                <span>${empleado.correo}</span>
                <span>Cédula: ${empleado.cedula}</span>
                <button class="btn btn--danger" type="button">
                    Eliminar
                </button>
            </article>
        `;

    }).join("");

    document.querySelectorAll("[data-empleado]").forEach(function (tarjeta) {

        tarjeta
            .querySelector("button")
            .addEventListener("click", function () {

                eliminarEmpleado(
                    Number(tarjeta.dataset.empleado)
                );

            });
    });
}

/*
Carga los empleados del comercio del jefe autenticado.
El backend obtiene automáticamente cuál es su comercio.
*/
async function cargarEmpleados() {

    const token = tokenActual();

    if (!token) {
        TodoTala.irA(
            "../pantalla_login/todo_tala_pantalla_login.html"
        );
        return;
    }

    try {

        const respuesta = await fetch(EMPLEADOS_URL, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            if (
                respuesta.status === 401 ||
                respuesta.status === 403
            ) {
                cerrarSesionLocal();

                TodoTala.irA(
                    "../pantalla_login/todo_tala_pantalla_login.html"
                );

                return;
            }

            TodoTala.toast(
                datos.error || "No se pudieron cargar los empleados"
            );

            return;
        }

        mostrarEmpleados(datos);

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}

/*
Elimina un empleado del comercio.
En el backend realmente se desactiva la cuenta.
*/
async function eliminarEmpleado(id) {

    const token = tokenActual();

    try {

        const respuesta = await fetch(
            EMPLEADOS_URL + "?id=" + id,
            {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + token
                }
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            TodoTala.toast(
                datos.error || "No se pudo eliminar el empleado"
            );
            return;
        }

        TodoTala.toast(
            "Empleado eliminado correctamente"
        );

        await cargarEmpleados();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}

/*
Crea un empleado nuevo.
*/
formularioEmpleado.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();

        const nombre = document
            .getElementById("nombre")
            .value
            .trim();

        const cedula = document
            .getElementById("cedula")
            .value
            .replace(/\D/g, "");

        const correo = document
            .getElementById("correo")
            .value
            .trim()
            .toLowerCase();

        const password = document
            .getElementById("password")
            .value;

        const fechaNacimiento = document
            .getElementById("fecha-nacimiento")
            .value;

        const valido =
            nombre !== "" &&
            cedula.length >= 7 &&
            correo.includes("@") &&
            correo.includes(".") &&
            password.length >= 8;

        if (!valido) {

            errorEmpleado.textContent =
                "Completá los datos obligatorios. La contraseña debe tener al menos 8 caracteres.";

            errorEmpleado.classList.add(
                "is-visible"
            );

            return;
        }

        const nuevoEmpleado = {
            nombre: nombre,
            cedula: cedula,
            correo: correo,
            password: password,
            fecha_nacimiento: fechaNacimiento
        };

        try {

            const respuesta = await fetch(
                EMPLEADOS_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization":
                            "Bearer " + tokenActual()
                    },
                    body: JSON.stringify(
                        nuevoEmpleado
                    )
                }
            );

            const datos = await respuesta.json();

            if (!respuesta.ok) {

                errorEmpleado.textContent =
                    datos.error ||
                    "No se pudo crear el empleado";

                errorEmpleado.classList.add(
                    "is-visible"
                );

                return;
            }

            formularioEmpleado.reset();

            errorEmpleado.classList.remove(
                "is-visible"
            );

            TodoTala.toast(
                "Empleado creado correctamente"
            );

            await cargarEmpleados();

        } catch (error) {

            TodoTala.toast(
                "No se pudo conectar con el servidor"
            );
        }
    }
);

/*
Al abrir la pantalla cargamos los empleados desde MySQL.
*/
cargarEmpleados();