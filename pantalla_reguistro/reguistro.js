let tipoCuenta = "cliente";

const formularioRegistro = document.getElementById("registro-form");
const botonCliente = document.getElementById("btn-cliente");
const botonJefe = document.getElementById("btn-jefe");
const camposComercio = document.getElementById("campos-comercio");
const botonVolverRegistro = document.getElementById("btn-volver");
const botonIrLogin = document.getElementById("btn-login");

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

botonVolverRegistro.addEventListener("click", function () {
    TodoTala.irA("../pantalla_login/todo_tala_pantalla_login.html");
});

botonIrLogin.addEventListener("click", function () {
    TodoTala.irA("../pantalla_login/todo_tala_pantalla_login.html");
});

formularioRegistro.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const cedula = document.getElementById("cedula").value.replace(/\D/g, "");
    const fechaNacimiento = document.getElementById("fecha-nacimiento").value;
    const correo = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmacion = document.getElementById("confirm-password").value;

    const correoValido = correo.includes("@") && correo.includes(".") && !TodoTala.correoRegistrado(correo);
    const passwordValida = password.length >= 8 && password === confirmacion;
    const datosPersonalesValidos = nombre !== "" && cedula.length >= 7;

    let comercioValido = true;
    let rucValido = true;
    let comercio = null;

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
            horario: horario,
            descripcion: "",
            whatsapp: "",
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

    TodoTala.toast("Cuenta creada correctamente", "success");

    window.setTimeout(function () {
        TodoTala.irA("../pantalla_login/todo_tala_pantalla_login.html");
    }, 600);
});
