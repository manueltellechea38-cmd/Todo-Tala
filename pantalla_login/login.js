const formularioLogin = document.getElementById("login-form");
const campoEmail = document.getElementById("email");
const campoPassword = document.getElementById("password");
const errorEmail = document.getElementById("error-email");
const errorLogin = document.getElementById("error-login");
const botonVerPassword = document.getElementById("btn-ver-password");
const botonVolver = document.getElementById("btn-volver");
const botonRegistro = document.getElementById("btn-registro");

botonVolver.addEventListener("click", function () {
    TodoTala.irA("../pantalla_inicio/todo_tala_pantalla_inicio.html");
});

botonRegistro.addEventListener("click", function () {
    TodoTala.irA("../pantalla_reguistro/todo_tala_pantalla_registro.html");
});

botonVerPassword.addEventListener("click", function () {
    const estaOculta = campoPassword.type === "password";
    campoPassword.type = estaOculta ? "text" : "password";
    botonVerPassword.textContent = estaOculta ? "Ocultar" : "Mostrar";
});

formularioLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const correo = campoEmail.value.trim();
    const password = campoPassword.value;
    const emailValido = correo.includes("@") && correo.includes(".");

    errorEmail.classList.toggle("is-visible", !emailValido);
    errorLogin.classList.remove("is-visible");

    if (!emailValido || password === "") {
        return;
    }

    const usuario = TodoTala.iniciarSesion(correo, password);

    if (!usuario) {
        errorLogin.classList.add("is-visible");
        return;
    }

    TodoTala.toast("Bienvenido, " + usuario.nombre, "success");

    window.setTimeout(function () {
        if (usuario.rol === "cliente") {
            TodoTala.irA("../pantalla_inicio/todo_tala_pantalla_inicio.html");
            return;
        }

        TodoTala.irA("../panel_comercio/todo_tala_panel_comercio.html");
    }, 450);
});
