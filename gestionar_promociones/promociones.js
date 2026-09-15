const listaPromociones = document.getElementById("lista-promos");
const panelNuevaPromo = document.getElementById("panel-nueva");
const usuarioPromo = TodoTala.usuarioActual();
const selectorProducto = document.getElementById("producto-promo");

function cargarProductos() {
    const datos = TodoTala.obtenerDatos();
    const productos = datos.productos.filter(function (producto) {
        return producto.comercioId === usuarioPromo.comercioId;
    });

    selectorProducto.innerHTML = productos.map(function (producto) {
        return '<option value="' + producto.id + '">' + producto.nombre + '</option>';
    }).join("");
}

function renderizarPromociones() {
    const datos = TodoTala.obtenerDatos();
    const hoy = new Date().toISOString().slice(0, 10);

    datos.promociones.forEach(function (promo) {
        if (promo.fin < hoy) promo.activa = false;
    });
    TodoTala.guardarDatos(datos);

    const promociones = datos.promociones.filter(function (promo) {
        return promo.comercioId === usuarioPromo.comercioId;
    });

    if (promociones.length === 0) {
        listaPromociones.innerHTML = '<p class="empty-state">Todavía no hay promociones.</p>';
        return;
    }

    listaPromociones.innerHTML = promociones.map(function (promo) {
        const producto = datos.productos.find(function (item) {
            return item.id === promo.productoId;
        });
        const detalle = promo.tipo === "porcentaje" ? promo.valor + "%" : TodoTala.formatearPrecio(promo.valor);

        return '<article class="promo-row" data-promo="' + promo.id + '">' +
            '<section><strong>' + promo.nombre + '</strong> <span class="' + (promo.activa ? 'badge badge--success' : 'badge') + '">' + (promo.activa ? 'Activa' : 'Inactiva') + '</span><p class="muted">' + (producto ? producto.nombre : "Producto") + ' · ' + detalle + ' · ' + promo.inicio + ' a ' + promo.fin + '</p></section>' +
            '<nav class="promo-actions"><button class="btn btn--secondary" data-action="toggle" type="button">' + (promo.activa ? 'Desactivar' : 'Activar') + '</button><button class="btn btn--danger" data-action="eliminar" type="button">Eliminar</button></nav>' +
        '</article>';
    }).join("");

    document.querySelectorAll("[data-promo]").forEach(function (fila) {
        const id = Number(fila.dataset.promo);
        const promo = datos.promociones.find(function (item) { return item.id === id; });

        fila.querySelector('[data-action="toggle"]').addEventListener("click", function () {
            promo.activa = !promo.activa;
            TodoTala.guardarDatos(datos);
            renderizarPromociones();
        });

        fila.querySelector('[data-action="eliminar"]').addEventListener("click", function () {
            datos.promociones = datos.promociones.filter(function (item) { return item.id !== id; });
            TodoTala.guardarDatos(datos);
            renderizarPromociones();
        });
    });
}

document.getElementById("btn-crear").addEventListener("click", function () {
    panelNuevaPromo.classList.toggle("is-visible");
});

document.getElementById("form-promocion").addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre-promo").value.trim();
    const productoId = Number(selectorProducto.value);
    const tipo = document.getElementById("tipo-promo").value;
    const valor = Number(document.getElementById("valor-promo").value);
    const inicio = document.getElementById("inicio").value;
    const fin = document.getElementById("fin").value;
    const valida = nombre && productoId && valor > 0 && inicio && fin && fin >= inicio;

    document.getElementById("error-promo").classList.toggle("is-visible", !valida);
    if (!valida) return;

    const datos = TodoTala.obtenerDatos();
    datos.promociones.push({
        id: Date.now(),
        comercioId: usuarioPromo.comercioId,
        nombre: nombre,
        tipo: tipo,
        valor: valor,
        productoId: productoId,
        inicio: inicio,
        fin: fin,
        activa: document.getElementById("activa").value === "true"
    });

    TodoTala.guardarDatos(datos);
    evento.target.reset();
    panelNuevaPromo.classList.remove("is-visible");
    renderizarPromociones();
    TodoTala.toast("Promoción creada");
});

document.getElementById("btn-volver").addEventListener("click", function () {
    TodoTala.irA("../panel_comercio/todo_tala_panel_comercio.html");
});

cargarProductos();
renderizarPromociones();