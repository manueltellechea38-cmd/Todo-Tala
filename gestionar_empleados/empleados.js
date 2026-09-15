const usuarioJefe = TodoTala.usuarioActual();
const listaEmpleados = document.getElementById("lista-empleados");
const errorEmpleado = document.getElementById("error-empleado");

/* Muestra solamente los empleados que pertenecen al comercio del jefe. */
function renderizarEmpleados() {
    const datos = TodoTala.obtenerDatos();
    const comercio = datos.comercios.find(function (item) {
        return item.id === usuarioJefe.comercioId;
    });

    document.getElementById("nombre-comercio").textContent = comercio ? comercio.nombre : "Mi comercio";

    const empleados = datos.usuarios.filter(function (usuario) {
        return usuario.rol === "empleado" && usuario.comercioId === usuarioJefe.comercioId;
    });

    if (empleados.length === 0) {
        listaEmpleados.innerHTML = '<p class="empty-state">No hay empleados registrados.</p>';
        return;
    }

    listaEmpleados.innerHTML = empleados.map(function (empleado) {
        return '<article class="employee-item">' +
            '<strong>' + empleado.nombre + '</strong>' +
            '<span>' + empleado.correo + '</span>' +
            '<span>Cédula: ' + empleado.cedula + '</span>' +
            '<button class="btn btn--danger" data-eliminar="' + empleado.id + '" type="button">Eliminar</button>' +
        '</article>';
    }).join("");

    /* Conecta el botón eliminar de cada empleado. */
    document.querySelectorAll("[data-eliminar]").forEach(function (boton) {
        boton.addEventListener("click", function () {
            const id = Number(boton.dataset.eliminar);
            const datosActuales = TodoTala.obtenerDatos();

            datosActuales.usuarios = datosActuales.usuarios.filter(function (usuario) {
                return usuario.id !== id;
            });

            TodoTala.guardarDatos(datosActuales);
            renderizarEmpleados();
            TodoTala.toast("Empleado eliminado");
        });
    });
}

/* Crea una nueva cuenta de empleado para el comercio actual. */
document.getElementById("form-empleado").addEventListener("submit", function (evento) {
    evento.preventDefault();

    const datos = TodoTala.obtenerDatos();
    const nombre = document.getElementById("nombre").value.trim();
    const cedula = document.getElementById("cedula").value.trim();
    const correo = document.getElementById("correo").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const fechaNacimiento = document.getElementById("fecha-nacimiento").value;

    const repetido = datos.usuarios.some(function (usuario) {
        return usuario.correo.toLowerCase() === correo || usuario.cedula === cedula;
    });

    /* Valida los campos obligatorios. */
    if (!nombre || !cedula || !correo || password.length < 8) {
        errorEmpleado.textContent = "Completá los datos obligatorios. La contraseña debe tener al menos 8 caracteres.";
        errorEmpleado.classList.add("is-visible");
        return;
    }

    /* Evita repetir correo o cédula. */
    if (repetido) {
        errorEmpleado.textContent = "Ese correo o cédula ya está registrado.";
        errorEmpleado.classList.add("is-visible");
        return;
    }

    const nuevoId = Math.max.apply(null, datos.usuarios.map(function (usuario) {
        return usuario.id;
    })) + 1;

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
    TodoTala.toast("Empleado creado correctamente");
});

renderizarEmpleados();