const formPerfil = document.getElementById("form-edicion");
const usuarioPerfil = TodoTala.usuarioActual();

function renderizarPerfil() {
    const datos = TodoTala.obtenerDatos();
    const usuario = datos.usuarios.find(function (item) {
        return item.id === usuarioPerfil.id;
    });
    const telefono = datos.cliente && datos.cliente.id === usuario.id ? datos.cliente.telefono : "";

    document.getElementById("nombre-visible").textContent = usuario.nombre;
    document.getElementById("email-visible").textContent = usuario.correo;
    document.getElementById("telefono-visible").textContent = telefono || "No indicado";
    document.getElementById("avatar").textContent = usuario.nombre.split(" ").slice(0, 2).map(function (parte) {
        return parte.charAt(0);
    }).join("").toUpperCase();

    document.getElementById("nombre").value = usuario.nombre;
    document.getElementById("email").value = usuario.correo;
    document.getElementById("telefono").value = telefono;
}

document.getElementById("btn-editar").addEventListener("click", function () {
    formPerfil.classList.toggle("is-visible");
});

formPerfil.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const datos = TodoTala.obtenerDatos();
    const usuario = datos.usuarios.find(function (item) {
        return item.id === usuarioPerfil.id;
    });

    usuario.nombre = document.getElementById("nombre").value.trim();
    usuario.correo = document.getElementById("email").value.trim();

    if (datos.cliente && datos.cliente.id === usuario.id) {
        datos.cliente.nombre = usuario.nombre;
        datos.cliente.email = usuario.correo;
        datos.cliente.telefono = document.getElementById("telefono").value.trim();
    }

    TodoTala.guardarDatos(datos);
    formPerfil.classList.remove("is-visible");
    renderizarPerfil();
    TodoTala.toast("Perfil actualizado");
});

document.getElementById("btn-salir").addEventListener("click", function () {
    TodoTala.cerrarSesion();
    TodoTala.abrir("pantalla_login/todo_tala_pantalla_login.html");
});

renderizarPerfil();