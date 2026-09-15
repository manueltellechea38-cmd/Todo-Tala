/* Referencias a los elementos principales del formulario. */
const formularioLogin = document.getElementById("login-form");
const campoEmail = document.getElementById("email");
const campoPassword = document.getElementById("password");
const errorEmail = document.getElementById("error-email");
const errorLogin = document.getElementById("error-login");
const botonVerPassword = document.getElementById("btn-ver-password");
const botonIngresar = document.getElementById("btn-ingresar");

/* Permite mostrar u ocultar la contraseña. */
botonVerPassword.addEventListener("click", function () {
    const estaOculta = campoPassword.type === "password";
    campoPassword.type = estaOculta ? "text" : "password";
    botonVerPassword.textContent = estaOculta ? "Ocultar" : "Mostrar";
});

/* Valida los datos e intenta iniciar sesión. */
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

    /* Si no existe una cuenta con esos datos, vuelve a habilitar el formulario. */
    if (!usuario) {
        botonIngresar.disabled = false;
        botonIngresar.textContent = "Ingresar";
        errorLogin.textContent = "Correo o contraseña incorrectos.";
        errorLogin.classList.add("is-visible");
        return;
    }

    /* Cada rol entra a la parte de la aplicación que le corresponde. */
    TodoTala.irSegunRol(usuario);
});
