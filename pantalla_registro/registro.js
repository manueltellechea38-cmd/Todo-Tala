/* El registro comienza como cuenta de Cliente. */
let tipoCuenta = "cliente";

const formularioRegistro = document.getElementById("registro-form");
const botonCliente = document.getElementById("btn-cliente");
const botonJefe = document.getElementById("btn-jefe");
const camposComercio = document.getElementById("campos-comercio");

/* Cambia los campos visibles según el tipo de cuenta elegido. */
function seleccionarTipo(tipo) {
    tipoCuenta = tipo;

    botonCliente.classList.toggle(
        "active",
        tipo === "cliente"
    );

    botonJefe.classList.toggle(
        "active",
        tipo === "jefe"
    );

    camposComercio.classList.toggle(
        "is-visible",
        tipo === "jefe"
    );
}

botonCliente.addEventListener("click", function () {
    seleccionarTipo("cliente");
});

botonJefe.addEventListener("click", function () {
    seleccionarTipo("jefe");
});

/* Valida los datos y los envía a la API. */
formularioRegistro.addEventListener("submit", async function (evento) {

    evento.preventDefault();

    const nombre = document
        .getElementById("nombre")
        .value
        .trim();

    const cedula = document
        .getElementById("cedula")
        .value
        .replace(/\D/g, "");

    const fechaNacimiento = document
        .getElementById("fecha-nacimiento")
        .value;

    const correo = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    const confirmacion = document
        .getElementById("confirm-password")
        .value;

    /*
    Validaciones básicas del navegador.
    La API también vuelve a validar todo.
    */
    const correoValido =
        correo.includes("@") &&
        correo.includes(".");

    const cedulaValida =
        cedula.length >= 7;

    const passwordValida =
        password.length >= 8 &&
        password === confirmacion;

    const datosPersonalesValidos =
        nombre !== "" &&
        cedulaValida;

    let comercioValido = true;
    let rucValido = true;
    let comercio = null;

    /*
    Si es Jefe también enviamos los datos del comercio.
    */
    if (tipoCuenta === "jefe") {

        const nombreComercio = document
            .getElementById("nombre-comercio")
            .value
            .trim();

        const ruc = document
            .getElementById("ruc")
            .value
            .replace(/\D/g, "");

        const telefono = document
            .getElementById("telefono-comercio")
            .value
            .trim();

        const direccion = document
            .getElementById("direccion")
            .value
            .trim();

        const horario = document
            .getElementById("horario")
            .value
            .trim();

        rucValido =
            ruc.length >= 10;

        comercioValido =
            nombreComercio !== "" &&
            rucValido &&
            telefono !== "" &&
            direccion !== "" &&
            horario !== "";

        comercio = {
            nombre: nombreComercio,
            ruc: ruc,
            telefono: telefono,
            direccion: direccion,
            horario: horario
        };
    }

    const formularioValido =
        datosPersonalesValidos &&
        correoValido &&
        passwordValida &&
        comercioValido;

    document
        .getElementById("error-email")
        .classList
        .toggle("is-visible", !correoValido);

    document
        .getElementById("error-password")
        .classList
        .toggle("is-visible", !passwordValida);

    document
        .getElementById("error-ruc")
        .classList
        .toggle(
            "is-visible",
            tipoCuenta === "jefe" && !rucValido
        );

    document
        .getElementById("error-general")
        .classList
        .toggle("is-visible", !formularioValido);

    if (!formularioValido) {
        return;
    }

    const datosRegistro = {
        nombre: nombre,
        cedula: cedula,
        correo: correo,
        password: password,
        rol: tipoCuenta,
        fecha_nacimiento: fechaNacimiento
    };

    if (tipoCuenta === "jefe") {
        datosRegistro.comercio = comercio;
    }

    try {

        const respuesta = await fetch(REGISTRO_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosRegistro)
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {

            if (
                respuesta.status === 409 &&
                datos.error &&
                datos.error.toLowerCase().includes("correo")
            ) {
                document
                    .getElementById("error-email")
                    .classList
                    .add("is-visible");
            }

            if (
                respuesta.status === 409 &&
                datos.error &&
                datos.error.toLowerCase().includes("ruc")
            ) {
                document
                    .getElementById("error-ruc")
                    .classList
                    .add("is-visible");
            }

            TodoTala.toast(
                datos.error || "No se pudo crear la cuenta"
            );

            return;
        }

        TodoTala.toast(
            "Cuenta creada correctamente"
        );

        window.setTimeout(function () {

            TodoTala.irA(
                "../pantalla_login/todo_tala_pantalla_login.html"
            );

        }, 500);

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
});