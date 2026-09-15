const usuarioJefe = TodoTala.usuarioActual();
const listaEmpleados = document.getElementById("lista-empleados");
const errorEmpleado = document.getElementById("error-empleado");

/* Muestra solamente empleados del comercio del jefe actual. */
function renderizarEmpleados() {
    const datos = TodoTala.obtenerDatos();
    const comercio = TodoTala.comercioActual();
    const empleados = datos.usuarios.filter(function (usuario) {
        return usuario.rol === "empleado" && usuario.comercioId === usuarioJefe.comercioId;
    });

    document.getElementById("nombre-comercio").textContent = comercio ? comercio.nombre : "Mi comercio";

    if (empleados.length === 0) {
        listaEmpleados.innerHTML = '<p class="empty-state">No hay empleados registrados.</p>';
        return;
    }

    listaEmpleados.innerHTML = empleados.map(function (empleado) {
        return '<article class="employee-item" data-empleado="' + empleado.id + '"><strong>' + empleado.nombre + '</strong><span>' + empleado.correo + '</span><span>Cédula: ' + empleado.cedula + '</span><button class="btn btn--danger" type="button">Eliminar</button></article>';
    }).join("");

    document.querySelectorAll("[data-empleado]").forEach(function (tarjeta) {
        tarjeta.querySelector("button").addEventListener("click", function () {
            eliminarEmpleado(Number(tarjeta.dataset.empleado));
        });
    });
}

/* Elimina una cuenta de empleado del comercio. */
function eliminarEmpleado(id) {
    const datos = TodoTala.obtenerDatos();
    const empleado = datos.usuarios.find(function (usuario) { return usuario.id === id; });

    if (!empleado || empleado.rol !== "empleado" || empleado.comercioId !== usuarioJefe.comercioId) return;

    datos.usuarios = datos.usuarios.filter(function (usuario) { return usuario.id !== id; });
    TodoTala.guardarDatos(datos);
    renderizarEmpleados();
}

/* Valida y crea la cuenta de un nuevo empleado. */
document.getElementById("form-empleado").addEventListener("submit", function (evento) {
    evento.preventDefault();

    const datos = TodoTala.obtenerDatos();
    const nombre = document.getElementById("nombre").value.trim();
    const cedula = document.getElementById("cedula").value.replace(/\D/g, "");
    const correo = document.getElementById("correo").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const fechaNacimiento = document.getElementById("fecha-nacimiento").value;

    const repetido = datos.usuarios.some(function (usuario) {
        return usuario.correo.toLowerCase() === correo || String(usuario.cedula) === cedula;
    });

    const valido = nombre !== "" && cedula.length >= 7 && correo.includes("@") && correo.includes(".") && password.length >= 8 && !repetido;

    if (!valido) {
        errorEmpleado.textContent = repetido ? "Ese correo o cédula ya está registrado." : "Completá los datos obligatorios. La contraseña debe tener al menos 8 caracteres.";
        errorEmpleado.classList.add("is-visible");
        return;
    }

    const nuevoId = datos.usuarios.reduce(function (mayor, usuario) {
        return Math.max(mayor, usuario.id);
    }, 0) + 1;

    datos.usuarios.push({
        id: nuevoId,
        nombre: nombre,
        cedula: cedula,
        correo: correo,
        password: password,
        fechaNacimiento: fechaNacimiento,
        rol: "empleado",
        comercioId: usuarioJefe.comercioId
    });

    TodoTala.guardarDatos(datos);
    evento.target.reset();
    errorEmpleado.classList.remove("is-visible");
    renderizarEmpleados();
    TodoTala.toast("Empleado creado correctamente.");
});

renderizarEmpleados();
