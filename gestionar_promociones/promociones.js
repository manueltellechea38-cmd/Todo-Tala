/* Obtiene el listado de promociones. */
const listaPromociones = document.getElementById("lista-promos");
/* Obtiene el panel de creación. */
const panelNuevaPromo = document.getElementById("panel-nueva");

/* Renderiza las promociones guardadas. */
function renderizarPromociones() {
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Limpia el listado. */
    listaPromociones.innerHTML = "";
    /* Gestiona estado vacío. */
    if (datos.promociones.length === 0) {
        /* Muestra mensaje. */
        listaPromociones.innerHTML = '<div class="empty-state">Todavía no hay promociones.</div>';
        /* Finaliza. */
        return;
    }
    /* Recorre promociones. */
    datos.promociones.forEach(function (promo) {
        /* Crea fila. */
        const fila = document.createElement("article");
        /* Asigna clase. */
        fila.className = "promo-row";
        /* Crea contenido. */
        fila.innerHTML = '<div><div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;"><strong>' + promo.nombre + '</strong><span class="' + (promo.activa ? 'badge badge--success' : 'badge') + '">' + (promo.activa ? 'Activa' : 'Inactiva') + '</span></div><p class="muted">' + promo.alcance + ' · ' + promo.inicio + ' a ' + promo.fin + '</p></div><div class="promo-actions"><button class="btn btn--secondary" data-action="toggle" type="button">' + (promo.activa ? 'Desactivar' : 'Activar') + '</button><button class="btn btn--danger" data-action="eliminar" type="button">Eliminar</button></div>';
        /* Alterna el estado. */
        fila.querySelector('[data-action="toggle"]').addEventListener("click", function () {
            /* Invierte activa. */
            promo.activa = !promo.activa;
            /* Guarda. */
            TodoTala.guardarDatos(datos);
            /* Refresca. */
            renderizarPromociones();
        });
        /* Elimina promoción. */
        fila.querySelector('[data-action="eliminar"]').addEventListener("click", function () {
            /* Reemplaza la lista sin esta promoción. */
            datos.promociones = datos.promociones.filter(function (elemento) { return elemento.id !== promo.id; });
            /* Guarda. */
            TodoTala.guardarDatos(datos);
            /* Refresca. */
            renderizarPromociones();
        });
        /* Agrega fila. */
        listaPromociones.appendChild(fila);
    });
}

/* Muestra u oculta el panel de nueva promoción. */
document.getElementById("btn-crear").addEventListener("click", function () { panelNuevaPromo.classList.toggle("is-visible"); });

/* Crea una promoción demo. */
document.getElementById("form-promocion").addEventListener("submit", function (evento) {
    /* Evita envío real. */
    evento.preventDefault();
    /* Lee nombre. */
    const nombre = document.getElementById("nombre-promo").value.trim();
    /* Lee inicio. */
    const inicio = document.getElementById("inicio").value;
    /* Lee fin. */
    const fin = document.getElementById("fin").value;
    /* Comprueba validez básica. */
    const valido = nombre !== "" && inicio !== "" && fin !== "" && fin >= inicio;
    /* Muestra error. */
    document.getElementById("error-promo").classList.toggle("is-visible", !valido);
    /* Detiene si falla. */
    if (!valido) return;
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Agrega promoción. */
    datos.promociones.push({ id: Date.now(), nombre: nombre, alcance: document.getElementById("alcance").value, inicio: inicio, fin: fin, activa: document.getElementById("activa").value === "true" });
    /* Guarda. */
    TodoTala.guardarDatos(datos);
    /* Reinicia formulario. */
    evento.target.reset();
    /* Oculta panel. */
    panelNuevaPromo.classList.remove("is-visible");
    /* Refresca. */
    renderizarPromociones();
    /* Informa. */
    TodoTala.toast("Promoción creada");
});

/* Vuelve al panel. */
document.getElementById("btn-volver").addEventListener("click", function () { TodoTala.irA("../panel_comercio/todo_tala_panel_comercio.html"); });
/* Renderiza al cargar. */
renderizarPromociones();
