const listaPropias = document.getElementById("lista-propias");
const listaGenerales = document.getElementById("lista-generales");
const panelNueva = document.getElementById("panel-nueva");
const formulario = document.getElementById("form-categoria");
const campoNombre = document.getElementById("nombre-categoria");
const campoDescripcion = document.getElementById("descripcion-categoria");
const errorCategoria = document.getElementById("error-categoria");
const tituloFormulario = document.getElementById("titulo-formulario");
const botonGuardar = document.getElementById("btn-guardar");

let categoriasActuales = [];
let idCategoriaEditando = null;

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, function (caracter) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[caracter];
    });
}

function mostrarError(mensaje) {
    errorCategoria.textContent = mensaje;
    errorCategoria.classList.add("is-visible");
}

function ocultarFormulario() {
    panelNueva.hidden = true;
    formulario.reset();
    errorCategoria.textContent = "";
    errorCategoria.classList.remove("is-visible");
    idCategoriaEditando = null;
    tituloFormulario.textContent = "Nueva categoría";
    botonGuardar.textContent = "Guardar categoría";
}

function abrirFormulario(categoria = null) {
    formulario.reset();
    errorCategoria.textContent = "";
    errorCategoria.classList.remove("is-visible");

    idCategoriaEditando = categoria
        ? Number(categoria.id_categoria)
        : null;

    tituloFormulario.textContent = categoria
        ? "Editar categoría"
        : "Nueva categoría";

    botonGuardar.textContent = categoria
        ? "Guardar cambios"
        : "Guardar categoría";

    campoNombre.value = categoria ? categoria.nombre : "";
    campoDescripcion.value = categoria
        ? (categoria.descripcion || "")
        : "";

    panelNueva.hidden = false;
    campoNombre.focus();
}

async function cargarCategorias() {
    try {
        const respuesta = await fetch(CATEGORIAS_URL, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + obtenerToken()
            }
        });

        const datos = await respuesta.json();

        if (!respuesta.ok || !Array.isArray(datos)) {
            TodoTala.toast(
                datos.error || "No se pudieron cargar las categorías"
            );
            return;
        }

        categoriasActuales = datos;
        renderizarCategorias();
    } catch (error) {
        TodoTala.toast("No se pudo conectar con el servidor");
    }
}

function crearFilaCategoria(categoria, esGeneral) {
    const fila = document.createElement("article");
    fila.className = "category-row";

    const descripcion = categoria.descripcion
        ? escaparHTML(categoria.descripcion)
        : "Sin descripción";

    fila.innerHTML =
        '<section class="category-info">' +
            '<p><strong>' + escaparHTML(categoria.nombre) + '</strong></p>' +
            '<p class="muted">' + descripcion + '</p>' +
            (esGeneral
                ? '<span class="category-general-label">Categoría general</span>'
                : '') +
        '</section>';

    if (!esGeneral) {
        const acciones = document.createElement("nav");
        acciones.className = "category-actions";

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.className = "btn btn--secondary";
        botonEditar.textContent = "Editar";
        botonEditar.addEventListener("click", function () {
            abrirFormulario(categoria);
        });

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "btn btn--danger";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.addEventListener("click", function () {
            eliminarCategoria(categoria);
        });

        acciones.append(botonEditar, botonEliminar);
        fila.appendChild(acciones);
    }

    return fila;
}

function renderizarCategorias() {
    const propias = categoriasActuales.filter(function (categoria) {
        return Number(categoria.es_general) !== 1 &&
            categoria.id_comercio !== null;
    });

    const generales = categoriasActuales.filter(function (categoria) {
        return Number(categoria.es_general) === 1 ||
            categoria.id_comercio === null;
    });

    listaPropias.replaceChildren();
    listaGenerales.replaceChildren();

    if (propias.length === 0) {
        listaPropias.innerHTML =
            '<p class="empty-categories">Todavía no creaste categorías para tu comercio.</p>';
    } else {
        propias.forEach(function (categoria) {
            listaPropias.appendChild(crearFilaCategoria(categoria, false));
        });
    }

    if (generales.length === 0) {
        listaGenerales.innerHTML =
            '<p class="empty-categories">No hay categorías generales.</p>';
    } else {
        generales.forEach(function (categoria) {
            listaGenerales.appendChild(crearFilaCategoria(categoria, true));
        });
    }
}

async function guardarCategoria(evento) {
    evento.preventDefault();

    const nombre = campoNombre.value.trim();
    const descripcion = campoDescripcion.value.trim();

    if (!nombre || nombre.length > 100 || descripcion.length > 200) {
        mostrarError("Revisá el nombre y la descripción. El nombre admite hasta 100 caracteres y la descripción hasta 200.");
        return;
    }

    const editando = idCategoriaEditando !== null;
    const url = editando
        ? CATEGORIAS_URL + "?id=" + idCategoriaEditando
        : CATEGORIAS_URL;

    try {
        const respuesta = await fetch(url, {
            method: editando ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + obtenerToken()
            },
            body: JSON.stringify({
                nombre: nombre,
                descripcion: descripcion
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarError(datos.error || "No se pudo guardar la categoría");
            return;
        }

        TodoTala.toast(
            editando
                ? "Categoría actualizada correctamente"
                : "Categoría creada correctamente"
        );

        ocultarFormulario();
        await cargarCategorias();
    } catch (error) {
        TodoTala.toast("No se pudo conectar con el servidor");
    }
}

async function eliminarCategoria(categoria) {
    const confirmar = window.confirm(
        '¿Querés eliminar la categoría "' + categoria.nombre + '"?'
    );

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(
            CATEGORIAS_URL + "?id=" + Number(categoria.id_categoria),
            {
                method: "DELETE",
                headers: {
                    "Authorization": "Bearer " + obtenerToken()
                }
            }
        );

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            TodoTala.toast(
                datos.error || "No se pudo eliminar la categoría"
            );
            return;
        }

        TodoTala.toast("Categoría eliminada correctamente");
        await cargarCategorias();
    } catch (error) {
        TodoTala.toast("No se pudo conectar con el servidor");
    }
}

document.getElementById("btn-crear").addEventListener("click", function () {
    abrirFormulario();
});

document.getElementById("btn-cancelar").addEventListener("click", function () {
    ocultarFormulario();
});

formulario.addEventListener("submit", guardarCategoria);

if (!obtenerToken()) {
    TodoTala.abrir("../pantalla_login/todo_tala_pantalla_login.html");
} else {
    cargarCategorias();
}