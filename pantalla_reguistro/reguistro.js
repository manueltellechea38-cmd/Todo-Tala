/* Guarda el tipo de cuenta seleccionado; comienza como cliente. */
let tipoCuenta = "cliente";
/* Obtiene el formulario. */
const formularioRegistro = document.getElementById("registro-form");
/* Obtiene el botón de cliente. */
const botonCliente = document.getElementById("btn-cliente");
/* Obtiene el botón de jefe. */
const botonJefe = document.getElementById("btn-jefe");
/* Obtiene la sección comercial. */
const camposComercio = document.getElementById("campos-comercio");
/* Obtiene el botón de volver. */
const botonVolverRegistro = document.getElementById("btn-volver");
/* Obtiene el botón hacia login. */
const botonIrLogin = document.getElementById("btn-login");

/* Cambia visualmente el tipo de cuenta. */
function seleccionarTipo(tipo) {
    /* Guarda el nuevo tipo. */
    tipoCuenta = tipo;
    /* Marca cliente si corresponde. */
    botonCliente.classList.toggle("active", tipo === "cliente");
    /* Marca jefe si corresponde. */
    botonJefe.classList.toggle("active", tipo === "jefe");
    /* Muestra datos del comercio únicamente para jefe. */
    camposComercio.classList.toggle("is-visible", tipo === "jefe");
}

/* Selecciona cliente al tocar su botón. */
botonCliente.addEventListener("click", function () {
    /* Activa el modo cliente. */
    seleccionarTipo("cliente");
});

/* Selecciona jefe al tocar su botón. */
botonJefe.addEventListener("click", function () {
    /* Activa el modo jefe. */
    seleccionarTipo("jefe");
});

/* Vuelve al login. */
botonVolverRegistro.addEventListener("click", function () {
    /* Navega al login. */
    TodoTala.irA("../pantalla_login/todo_tala_pantalla_login.html");
});

/* También abre login desde el botón inferior. */
botonIrLogin.addEventListener("click", function () {
    /* Navega al login. */
    TodoTala.irA("../pantalla_login/todo_tala_pantalla_login.html");
});

/* Valida el formulario y simula la creación de cuenta. */
formularioRegistro.addEventListener("submit", function (evento) {
    /* Evita envío real a servidor. */
    evento.preventDefault();
    /* Lee el nombre. */
    const nombre = document.getElementById("nombre").value.trim();
    /* Lee el correo. */
    const email = document.getElementById("email").value.trim();
    /* Lee la contraseña. */
    const password = document.getElementById("password").value;
    /* Lee la confirmación. */
    const confirmacion = document.getElementById("confirm-password").value;
    /* Lee el RUT solo si existe contenido. */
    const rut = document.getElementById("rut").value.replace(/\D/g, "");
    /* Comprueba formato simple de correo. */
    const emailValido = email.includes("@") && email.includes(".");
    /* Comprueba contraseñas. */
    const passwordValida = password.length >= 8 && password === confirmacion;
    /* Comprueba campos comerciales cuando corresponde. */
    const comercioValido = tipoCuenta === "cliente" || (document.getElementById("nombre-comercio").value.trim() !== "" && rut.length === 12);
    /* Comprueba los campos generales. */
    const generalValido = nombre !== "" && emailValido && passwordValida && comercioValido;
    /* Muestra error de correo si corresponde. */
    document.getElementById("error-email").classList.toggle("is-visible", !emailValido);
    /* Muestra error de contraseña si corresponde. */
    document.getElementById("error-password").classList.toggle("is-visible", !passwordValida);
    /* Muestra error general si falta información. */
    document.getElementById("error-general").classList.toggle("is-visible", !generalValido);
    /* Detiene el flujo si existe un error. */
    if (!generalValido) return;
    /* Muestra confirmación visual. */
    TodoTala.toast("Cuenta demo creada correctamente");
    /* Espera un momento breve y abre el login. */
    window.setTimeout(function () {
        /* Navega al login. */
        TodoTala.irA("../pantalla_login/todo_tala_pantalla_login.html");
    }, 700);
});
