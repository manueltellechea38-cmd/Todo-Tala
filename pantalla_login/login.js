/* Obtiene el formulario principal. */
const formularioLogin = document.getElementById("login-form");
/* Obtiene el campo de correo. */
const campoEmail = document.getElementById("email");
/* Obtiene el campo de contraseña. */
const campoPassword = document.getElementById("password");
/* Obtiene el selector de rol demo. */
const selectorRol = document.getElementById("rol");
/* Obtiene el mensaje de error de correo. */
const errorEmail = document.getElementById("error-email");
/* Obtiene el mensaje de error de contraseña. */
const errorPassword = document.getElementById("error-password");
/* Obtiene el botón para mostrar contraseña. */
const botonVerPassword = document.getElementById("btn-ver-password");
/* Obtiene el botón de volver. */
const botonVolver = document.getElementById("btn-volver");
/* Obtiene el botón de registro. */
const botonRegistro = document.getElementById("btn-registro");

/* Regresa a la pantalla inicial. */
botonVolver.addEventListener("click", function () {
    /* Navega al inicio. */
    TodoTala.irA("../pantalla_inicio/todo_tala_pantalla_inicio.html");
});

/* Abre la pantalla de registro. */
botonRegistro.addEventListener("click", function () {
    /* Navega al registro. */
    TodoTala.irA("../pantalla_reguistro/todo_tala_pantalla_registro.html");
});

/* Alterna entre mostrar y ocultar la contraseña. */
botonVerPassword.addEventListener("click", function () {
    /* Comprueba si actualmente está oculta. */
    const estaOculta = campoPassword.type === "password";
    /* Cambia el tipo del input. */
    campoPassword.type = estaOculta ? "text" : "password";
    /* Cambia el texto del botón. */
    botonVerPassword.textContent = estaOculta ? "Ocultar" : "Mostrar";
});

/* Valida y simula el inicio de sesión. */
formularioLogin.addEventListener("submit", function (evento) {
    /* Evita enviar el formulario a un servidor inexistente. */
    evento.preventDefault();
    /* Comprueba el formato básico del correo. */
    const emailValido = campoEmail.value.includes("@") && campoEmail.value.includes(".");
    /* Comprueba el largo mínimo de contraseña. */
    const passwordValida = campoPassword.value.length >= 8;
    /* Muestra u oculta el error de correo. */
    errorEmail.classList.toggle("is-visible", !emailValido);
    /* Muestra u oculta el error de contraseña. */
    errorPassword.classList.toggle("is-visible", !passwordValida);
    /* Detiene el flujo si hay errores. */
    if (!emailValido || !passwordValida) return;
    /* Obtiene los datos simulados actuales. */
    const datos = TodoTala.obtenerDatos();
    /* Guarda el rol seleccionado para mantener el contexto entre pantallas. */
    datos.sesion.rol = selectorRol.value;
    /* Persiste el cambio en localStorage. */
    TodoTala.guardarDatos(datos);
    /* Si el rol es cliente abre el catálogo. */
    if (selectorRol.value === "cliente") {
        /* Navega al flujo de cliente. */
        TodoTala.irA("../catalogo_cliente/todo_tala_catalogo_cliente.html");
        /* Finaliza la función. */
        return;
    }
    /* Jefe y empleado acceden al panel del comercio dentro de este MVP. */
    TodoTala.irA("../panel_comercio/todo_tala_panel_comercio.html");
});
