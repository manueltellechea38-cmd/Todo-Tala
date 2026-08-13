/* Obtiene el contenedor principal del carrito. */
const listaCarrito = document.getElementById("lista-carrito");
/* Obtiene el subtotal. */
const subtotalCarrito = document.getElementById("subtotal-total");
/* Obtiene el total. */
const totalCarrito = document.getElementById("total-total");
/* Obtiene el botón de confirmación. */
const botonConfirmarPedido = document.getElementById("btn-confirmar");

/* Renderiza el carrito completo desde localStorage. */
function renderizarCarrito() {
    /* Obtiene datos actuales. */
    const datos = TodoTala.obtenerDatos();
    /* Limpia el contenido anterior. */
    listaCarrito.innerHTML = "";
    /* Inicializa el total. */
    let total = 0;
    /* Si el carrito está vacío muestra un estado vacío. */
    if (datos.carrito.length === 0) {
        /* Muestra mensaje. */
        listaCarrito.innerHTML = '<div class="empty-state">Tu carrito está vacío. Volvé al catálogo para agregar productos.</div>';
        /* Deshabilita confirmar. */
        botonConfirmarPedido.disabled = true;
        /* Actualiza totales. */
        subtotalCarrito.textContent = "$0";
        /* Actualiza total. */
        totalCarrito.textContent = "$0";
        /* Finaliza. */
        return;
    }
    /* Habilita confirmar si hay productos. */
    botonConfirmarPedido.disabled = false;
    /* Recorre cada item del carrito. */
    datos.carrito.forEach(function (item) {
        /* Busca el producto correspondiente. */
        const producto = datos.productos.find(function (p) { return p.id === item.id; });
        /* Ignora items inválidos. */
        if (!producto) return;
        /* Calcula subtotal de este producto. */
        const subtotal = producto.precio * item.cantidad;
        /* Acumula el total. */
        total += subtotal;
        /* Crea la tarjeta. */
        const articulo = document.createElement("article");
        /* Asigna clase. */
        articulo.className = "cart-item";
        /* Define contenido. */
        articulo.innerHTML = '<div><strong>' + producto.nombre + '</strong><p class="muted">' + producto.comercio + '</p><p>' + TodoTala.formatearPrecio(producto.precio) + ' c/u · <strong>' + TodoTala.formatearPrecio(subtotal) + '</strong></p></div>' +
            '<div class="cart-actions"><button data-action="restar">−</button><strong>' + item.cantidad + '</strong><button data-action="sumar">+</button><button data-action="eliminar" title="Eliminar">×</button></div>';
        /* Resta una unidad. */
        articulo.querySelector('[data-action="restar"]').addEventListener("click", function () { cambiarCantidadCarrito(item.id, -1); });
        /* Suma una unidad. */
        articulo.querySelector('[data-action="sumar"]').addEventListener("click", function () { cambiarCantidadCarrito(item.id, 1); });
        /* Elimina el producto. */
        articulo.querySelector('[data-action="eliminar"]').addEventListener("click", function () { eliminarDelCarrito(item.id); });
        /* Agrega la tarjeta. */
        listaCarrito.appendChild(articulo);
    });
    /* Muestra subtotal. */
    subtotalCarrito.textContent = TodoTala.formatearPrecio(total);
    /* En este MVP no se calculan cargos extra, por lo que total y subtotal coinciden. */
    totalCarrito.textContent = TodoTala.formatearPrecio(total);
}

/* Cambia la cantidad de un item. */
function cambiarCantidadCarrito(id, cambio) {
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Busca item. */
    const item = datos.carrito.find(function (elemento) { return elemento.id === id; });
    /* Busca producto. */
    const producto = datos.productos.find(function (elemento) { return elemento.id === id; });
    /* Detiene si falta información. */
    if (!item || !producto) return;
    /* Calcula nueva cantidad. */
    const nueva = item.cantidad + cambio;
    /* Elimina si baja de uno. */
    if (nueva < 1) {
        /* Llama a eliminar. */
        eliminarDelCarrito(id);
        /* Finaliza. */
        return;
    }
    /* Impide superar stock. */
    if (nueva > producto.stock) {
        /* Informa límite. */
        TodoTala.toast("No hay más stock disponible");
        /* Finaliza. */
        return;
    }
    /* Guarda cantidad. */
    item.cantidad = nueva;
    /* Persiste cambios. */
    TodoTala.guardarDatos(datos);
    /* Renderiza nuevamente. */
    renderizarCarrito();
}

/* Elimina un producto del carrito. */
function eliminarDelCarrito(id) {
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Filtra el item indicado. */
    datos.carrito = datos.carrito.filter(function (item) { return item.id !== id; });
    /* Guarda cambios. */
    TodoTala.guardarDatos(datos);
    /* Renderiza nuevamente. */
    renderizarCarrito();
}

/* Confirma el pedido y genera un código de retiro. */
botonConfirmarPedido.addEventListener("click", function () {
    /* Obtiene datos. */
    const datos = TodoTala.obtenerDatos();
    /* Evita confirmar un carrito vacío. */
    if (datos.carrito.length === 0) return;
    /* Calcula el total. */
    let total = 0;
    /* Crea una lista resumida de items. */
    const items = datos.carrito.map(function (item) {
        /* Busca producto. */
        const producto = datos.productos.find(function (p) { return p.id === item.id; });
        /* Acumula el total. */
        total += producto.precio * item.cantidad;
        /* Devuelve descripción corta. */
        return producto.nombre + " x" + item.cantidad;
    });
    /* Usa el comercio del primer producto para mantener simple el MVP. */
    const primerProducto = datos.productos.find(function (p) { return p.id === datos.carrito[0].id; });
    /* Crea el nuevo pedido. */
    datos.pedidos.unshift({ id: Date.now(), comercio: primerProducto.comercio, estado: "Pendiente", codigo: TodoTala.generarCodigo(), fecha: new Date().toLocaleDateString("es-UY"), total: total, items: items });
    /* Vacía el carrito. */
    datos.carrito = [];
    /* Guarda cambios. */
    TodoTala.guardarDatos(datos);
    /* Informa el resultado. */
    TodoTala.toast("Pedido creado correctamente");
    /* Abre mis pedidos. */
    window.setTimeout(function () { TodoTala.irA("../mis_pedidos/todo_tala_mis_pedidos.html"); }, 600);
});

/* Regresa al catálogo. */
document.getElementById("btn-volver").addEventListener("click", function () { TodoTala.irA("../catalogo_cliente/todo_tala_catalogo_cliente.html"); });
/* Renderiza al cargar. */
renderizarCarrito();
