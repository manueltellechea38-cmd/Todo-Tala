const formularioLogin = document.getElementById("login-form");
const campoEmail = document.getElementById("email");
const campoPassword = document.getElementById("password");
const errorEmail = document.getElementById("error-email");
const errorLogin = document.getElementById("error-login");
const botonVerPassword = document.getElementById("btn-ver-password");
const botonIngresar = document.getElementById("btn-ingresar");

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
        if (password === "") {
            errorLogin.textContent = "Ingresá tu contraseña.";
            errorLogin.classList.add("is-visible");
        }
        return;
    }

    botonIngresar.disabled = true;
    botonIngresar.textContent = "Ingresando...";

    const usuario = TodoTala.iniciarSesion(correo, password);

    if (!usuario) {
        botonIngresar.disabled = false;
        botonIngresar.textContent = "Ingresar";
        errorLogin.textContent = "Correo o contraseña incorrectos.";
        errorLogin.classList.add("is-visible");
        return;
    }

    TodoTala.toast("Bienvenido, " + usuario.nombre, "success");

    window.setTimeout(function () {
        if (usuario.rol === "cliente") {
            window.location.href = "../pantalla_inicio/todo_tala_pantalla_inicio.html";
            return;
        }

        window.location.href = "../panel_comercio/todo_tala_panel_comercio.html";
    }, 300);
});
