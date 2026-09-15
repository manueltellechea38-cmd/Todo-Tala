const listaPromociones = document.getElementById("lista-promos");
const panelNuevaPromo = document.getElementById("panel-nueva");
const usuarioPromo = TodoTala.usuarioActual();
const selectorProducto = document.getElementById("producto-promo");

/* Devuelve el producto relacionado con una promoción. */
function buscarProducto(datos, promo) {
    return datos.productos.find(function (producto) {
        return producto.id === promo.productoId;
    });
}

/* Aplica el precio correspondiente cuando una promoción está activa. */
function aplicarPromocion(promo, producto) {
    if (!producto) return;

    const precioBase = promo.precioBase || producto.precioAnterior || producto.precio;
    promo.precioBase = precioBase;
    producto.precioAnterior = precioBase;

    if (promo.tipo === "porcentaje") {
        producto.precio = Math.round(precioBase * (1 - promo.valor / 100));
    } else {
        producto.precio = promo.valor;
    }
}

/* Restaura el precio normal cuando la promoción termina o se desactiva. */
function quitarPromocion(promo, producto) {
    if (!producto) return;
    const precioBase = promo.precioBase || producto.precioAnterior;
    if (precioBase) producto.precio = precioBase;
    producto.precioAnterior = null;
}

/* Carga los productos del comercio en el selector. */
function cargarProductos() {
    const datos = TodoTala.obtenerDatos();
    const productos = datos.productos.filter(function (producto) {
        return producto.comercioId === usuarioPromo.comercioId;
    });

    selectorProducto.innerHTML = productos.map(function (producto) {
        return '<option value="' + producto.id + '">' + producto.nombre + '</option>';
    }).join("");
}

/* Actualiza vencimientos y muestra las promociones del comercio. */
function renderizarPromociones() {
    const datos = TodoTala.obtenerDatos();
    const hoy = new Date().toISOString().slice(0, 10);

    datos.promociones.forEach(function (promo) {
        const producto = buscarProducto(datos, promo);
        if (promo.activa && promo.fin < hoy) {
            promo.activa = false;
            quitarPromocion(promo, producto);
        }
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
        const producto = buscarProducto(datos, promo);
        const detalle = promo.tipo === "porcentaje" ? promo.valor + "%" : TodoTala.formatearPrecio(promo.valor);

        return '<article class="promo-row" data-promo="' + promo.id + '">' +
            '<section class="promo-info"><p><strong>' + promo.nombre + '</strong> <span class="' + (promo.activa ? 'badge badge--success' : 'badge') + '">' + (promo.activa ? 'Activa' : 'Inactiva') + '</span></p><p class="muted">' + (producto ? producto.nombre : "Producto") + ' · ' + detalle + ' · ' + promo.inicio + ' a ' + promo.fin + '</p></section>' +
            '<nav class="promo-actions"><button class="btn btn--secondary" data-toggle type="button">' + (promo.activa ? 'Desactivar' : 'Activar') + '</button><button class="btn btn--danger" data-eliminar type="button">Eliminar</button></nav>' +
        '</article>';
    }).join("");

    /* Conecta las acciones de cada promoción. */
    document.querySelectorAll("[data-promo]").forEach(function (fila) {
        const id = Number(fila.dataset.promo);
        const promo = datos.promociones.find(function (item) { return item.id === id; });
        const producto = buscarProducto(datos, promo);

        fila.querySelector("[data-toggle]").addEventListener("click", function () {
            promo.activa = !promo.activa;
            if (promo.activa) aplicarPromocion(promo, producto);
            else quitarPromocion(promo, producto);
            TodoTala.guardarDatos(datos);
            renderizarPromociones();
        });

        fila.querySelector("[data-eliminar]").addEventListener("click", function () {
            if (promo.activa) quitarPromocion(promo, producto);
            datos.promociones = datos.promociones.filter(function (item) { return item.id !== id; });
            TodoTala.guardarDatos(datos);
            renderizarPromociones();
        });
    });
}

/* Abre o cierra el formulario. */
document.getElementById("btn-crear").addEventListener("click", function () {
    panelNuevaPromo.hidden = !panelNuevaPromo.hidden;
});

/* Crea una nueva promoción y aplica su precio si queda activa. */
document.getElementById("form-promocion").addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nombre = document.getElementById("nombre-promo").value.trim();
    const productoId = Number(selectorProducto.value);
    const tipo = document.getElementById("tipo-promo").value;
    const valor = Number(document.getElementById("valor-promo").value);
    const inicio = document.getElementById("inicio").value;
    const fin = document.getElementById("fin").value;
    const activa = document.getElementById("activa").value === "true";
    const valida = nombre && productoId && valor > 0 && inicio && fin && fin >= inicio;

    document.getElementById("error-promo").classList.toggle("is-visible", !valida);
    if (!valida) return;

    const datos = TodoTala.obtenerDatos();
    const producto = datos.productos.find(function (item) { return item.id === productoId && item.comercioId === usuarioPromo.comercioId; });
    if (!producto) return;

    /* Evita dos promociones activas al mismo tiempo sobre el mismo producto. */
    datos.promociones.forEach(function (promoAnterior) {
        if (promoAnterior.productoId === productoId && promoAnterior.activa) {
            promoAnterior.activa = false;
            quitarPromocion(promoAnterior, producto);
        }
    });

    const nuevaPromo = {
        id: Date.now(),
        comercioId: usuarioPromo.comercioId,
        nombre: nombre,
        tipo: tipo,
        valor: valor,
        productoId: productoId,
        inicio: inicio,
        fin: fin,
        activa: activa,
        precioBase: producto.precio
    };

    datos.promociones.push(nuevaPromo);
    if (activa) aplicarPromocion(nuevaPromo, producto);

    TodoTala.guardarDatos(datos);
    evento.target.reset();
    panelNuevaPromo.hidden = true;
    renderizarPromociones();
});

cargarProductos();
renderizarPromociones();
