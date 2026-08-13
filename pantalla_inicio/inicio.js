/* Busca el campo de búsqueda de la pantalla inicial. */
const busquedaInicio = document.getElementById("busqueda-inicio");
/* Busca el botón que ejecuta la búsqueda. */
const botonBuscar = document.getElementById("btn-buscar");
/* Busca el botón de inicio de sesión. */
const botonLogin = document.getElementById("btn-login");
/* Busca el botón de registro. */
const botonRegistro = document.getElementById("btn-registro");
/* Busca el botón que abre el catálogo. */
const botonCatalogo = document.getElementById("btn-catalogo");
/* Busca el botón superior para explorar. */
const botonExplorar = document.getElementById("btn-explorar");

/* Crea una función para enviar la búsqueda a la ventana de resultados. */
function buscarDesdeInicio() {
    /* Elimina espacios innecesarios del texto ingresado. */
    const texto = busquedaInicio.value.trim();
    /* Codifica el texto para poder enviarlo de forma segura en la URL. */
    const consulta = encodeURIComponent(texto);
    /* Abre la pantalla de resultados incluyendo el término buscado. */
    TodoTala.irA("../resultados_busqueda/todo_tala_resultados_busqueda.html?q=" + consulta);
}

/* Ejecuta la búsqueda cuando se toca el botón Buscar. */
botonBuscar.addEventListener("click", buscarDesdeInicio);
/* Permite buscar presionando Enter dentro del campo. */
busquedaInicio.addEventListener("keydown", function (evento) {
    /* Verifica si la tecla presionada fue Enter. */
    if (evento.key === "Enter") {
        /* Evita comportamientos predeterminados del navegador. */
        evento.preventDefault();
        /* Ejecuta la misma función del botón. */
        buscarDesdeInicio();
    }
});

/* Abre la pantalla de login. */
botonLogin.addEventListener("click", function () {
    /* Navega al formulario de inicio de sesión. */
    TodoTala.irA("../pantalla_login/todo_tala_pantalla_login.html");
});

/* Abre la pantalla de registro. */
botonRegistro.addEventListener("click", function () {
    /* Navega al formulario de creación de cuenta. */
    TodoTala.irA("../pantalla_reguistro/todo_tala_pantalla_registro.html");
});

/* Abre el catálogo desde el botón de sección. */
botonCatalogo.addEventListener("click", function () {
    /* Navega al catálogo de cliente. */
    TodoTala.irA("../catalogo_cliente/todo_tala_catalogo_cliente.html");
});

/* Hace que el botón Explorar lleve al mismo catálogo. */
botonExplorar.addEventListener("click", function () {
    /* Navega al catálogo sin exigir login porque es una demostración visual. */
    TodoTala.irA("../catalogo_cliente/todo_tala_catalogo_cliente.html");
});

/* Recorre las tarjetas de productos destacados. */
document.querySelectorAll("[data-producto-id]").forEach(function (tarjeta) {
    /* Agrega un evento de clic a cada producto. */
    tarjeta.addEventListener("click", function () {
        /* Lee el identificador guardado en el atributo data. */
        const id = tarjeta.dataset.productoId;
        /* Abre la pantalla de detalle con ese identificador. */
        TodoTala.irA("../detalle_producto/todo_tala_detalle_producto.html?id=" + id);
    });
});
