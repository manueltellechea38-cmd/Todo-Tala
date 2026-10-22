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

/* Valida los datos e intenta iniciar sesión mediante la API. */
formularioLogin.addEventListener("submit", async function (evento) {
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

    try {
        const respuesta = await fetch(LOGIN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: correo,
                password: password
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            errorLogin.textContent =
                datos.error || "No fue posible iniciar sesión.";

            errorLogin.classList.add("is-visible");
            return;
        }

        guardarSesion(datos);

        TodoTala.irSegunRol(datos.usuario);

    } catch (error) {
        errorLogin.textContent =
            "No se pudo conectar con el servidor.";

        errorLogin.classList.add("is-visible");

    } finally {
        botonIngresar.disabled = false;
        botonIngresar.textContent = "Ingresar";
    }
});