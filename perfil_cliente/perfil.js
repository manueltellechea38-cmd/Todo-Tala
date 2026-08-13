/* Obtiene el formulario de edición. */
const formPerfil = document.getElementById("form-edicion");

/* Renderiza los datos actuales del cliente. */
function renderizarPerfil() {
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Guarda referencia del cliente. */
    const cliente = datos.cliente;
    /* Muestra nombre. */
    document.getElementById("nombre-visible").textContent = cliente.nombre;
    /* Muestra correo. */
    document.getElementById("email-visible").textContent = cliente.email;
    /* Muestra teléfono. */
    document.getElementById("telefono-visible").textContent = cliente.telefono || "No indicado";
    /* Crea iniciales a partir del nombre. */
    document.getElementById("avatar").textContent = cliente.nombre.split(" ").slice(0, 2).map(function (parte) { return parte.charAt(0); }).join("").toUpperCase();
    /* Precarga nombre editable. */
    document.getElementById("nombre").value = cliente.nombre;
    /* Precarga correo editable. */
    document.getElementById("email").value = cliente.email;
    /* Precarga teléfono editable. */
    document.getElementById("telefono").value = cliente.telefono;
}

/* Muestra u oculta el formulario. */
document.getElementById("btn-editar").addEventListener("click", function () {
    /* Alterna la clase visible. */
    formPerfil.classList.toggle("is-visible");
});

/* Guarda cambios del perfil en localStorage. */
formPerfil.addEventListener("submit", function (evento) {
    /* Evita envío real. */
    evento.preventDefault();
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Actualiza nombre. */
    datos.cliente.nombre = document.getElementById("nombre").value.trim();
    /* Actualiza correo. */
    datos.cliente.email = document.getElementById("email").value.trim();
    /* Actualiza teléfono. */
    datos.cliente.telefono = document.getElementById("telefono").value.trim();
    /* Guarda datos. */
    TodoTala.guardarDatos(datos);
    /* Refresca interfaz. */
    renderizarPerfil();
    /* Oculta formulario. */
    formPerfil.classList.remove("is-visible");
    /* Informa. */
    TodoTala.toast("Perfil actualizado en el MVP");
});

/* Cierra la sesión demo. */
document.getElementById("btn-salir").addEventListener("click", function () {
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Limpia el rol. */
    datos.sesion.rol = null;
    /* Guarda. */
    TodoTala.guardarDatos(datos);
    /* Vuelve al inicio. */
    TodoTala.irA("../pantalla_inicio/todo_tala_pantalla_inicio.html");
});

/* Vuelve al catálogo. */
document.getElementById("btn-volver").addEventListener("click", function () { TodoTala.irA("../catalogo_cliente/todo_tala_catalogo_cliente.html"); });
/* Renderiza al cargar. */
renderizarPerfil();
