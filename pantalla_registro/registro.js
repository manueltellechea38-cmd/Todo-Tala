/* El registro comienza como cuenta de Cliente. */
let tipoCuenta = "cliente";

const formularioRegistro = document.getElementById("registro-form");
const botonCliente = document.getElementById("btn-cliente");
const botonJefe = document.getElementById("btn-jefe");
const camposComercio = document.getElementById("campos-comercio");

/* Cambia los campos visibles según el tipo de cuenta elegido. */
function seleccionarTipo(tipo) {
    tipoCuenta = tipo;
    botonCliente.classList.toggle("active", tipo === "cliente");
    botonJefe.classList.toggle("active", tipo === "jefe");
    camposComercio.classList.toggle("is-visible", tipo === "jefe");
}

botonCliente.addEventListener("click", function () {
    seleccionarTipo("cliente");
});

botonJefe.addEventListener("click", function () {
    seleccionarTipo("jefe");
});

/* Valida y guarda una nueva cuenta. */
formularioRegistro.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const cedula = document.getElementById("cedula").value.replace(/\D/g, "");
    const fechaNacimiento = document.getElementById("fecha-nacimiento").value;
    const correo = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmacion = document.getElementById("confirm-password").value;

    const correoValido = correo.includes("@") && correo.includes(".") && !TodoTala.correoRegistrado(correo);
    const cedulaValida = cedula.length >= 7 && !TodoTala.cedulaRegistrada(cedula);
    const passwordValida = password.length >= 8 && password === confirmacion;
    const datosPersonalesValidos = nombre !== "" && cedulaValida;

    let comercioValido = true;
    let rucValido = true;
    let comercio = null;

    /* Un Jefe también debe registrar los datos principales de su comercio. */
    if (tipoCuenta === "jefe") {
        const nombreComercio = document.getElementById("nombre-comercio").value.trim();
        const ruc = document.getElementById("ruc").value.replace(/\D/g, "");
        const telefono = document.getElementById("telefono-comercio").value.trim();
        const direccion = document.getElementById("direccion").value.trim();
        const horario = document.getElementById("horario").value.trim();

        rucValido = ruc.length >= 10 && !TodoTala.rucRegistrado(ruc);
        comercioValido = nombreComercio !== "" && rucValido && telefono !== "" && direccion !== "" && horario !== "";

        comercio = {
            nombre: nombreComercio,
            ruc: ruc,
            telefono: telefono,
            direccion: direccion,
            localidad: "",
            horario: horario,
            descripcion: "",
            whatsapp: telefono,
            correo: correo
        };
    }

    const formularioValido = datosPersonalesValidos && correoValido && passwordValida && comercioValido;

    document.getElementById("error-email").classList.toggle("is-visible", !correoValido);
    document.getElementById("error-password").classList.toggle("is-visible", !passwordValida);
    document.getElementById("error-ruc").classList.toggle("is-visible", tipoCuenta === "jefe" && !rucValido);
    document.getElementById("error-general").classList.toggle("is-visible", !formularioValido);

    if (!formularioValido) {
        return;
    }

    TodoTala.registrarUsuario({
        nombre: nombre,
        cedula: cedula,
        correo: correo,
        password: password,
        fechaNacimiento: fechaNacimiento,
        rol: tipoCuenta
    }, comercio);

    TodoTala.toast("Cuenta creada correctamente");

    window.setTimeout(function () {
        TodoTala.irA("../pantalla_login/todo_tala_pantalla_login.html");
    }, 500);
});
