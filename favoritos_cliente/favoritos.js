const listaProductos = document.getElementById("lista-productos-favoritos");
const listaComercios = document.getElementById("lista-comercios-seguidos");

function crearImagen(nombre, alt) {
    if (nombre) {
        const imagen = document.createElement("img");
        imagen.src = UPLOADS_URL + encodeURIComponent(nombre);
        imagen.alt = alt;
        imagen.loading = "lazy";
        imagen.className = "favorite-image";
        return imagen;
    }

    const sinImagen = document.createElement("span");
    sinImagen.className = "favorite-image favorite-image--empty";
    sinImagen.textContent = "📷";
    sinImagen.setAttribute("aria-label", "Sin foto");
    return sinImagen;
}

async function quitarFavorito(id, tipo) {
    const url = tipo === "producto"
        ? FAVORITOS_URL + "?id=" + encodeURIComponent(id)
        : COMERCIOS_SEGUIDOS_URL + "?id=" + encodeURIComponent(id);

    const respuesta = await fetch(url, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + obtenerToken() }
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) {
        TodoTala.toast(datos.error || "No se pudo quitar de la lista");
        return;
    }

    cargarFavoritos();
}

function mostrarProductos(productos) {
    listaProductos.replaceChildren();

    if (!productos.length) {
        listaProductos.innerHTML = '<p class="empty-state">Todavía no guardaste productos favoritos.</p>';
        return;
    }

    productos.forEach(function (producto) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "favorite-card";

        tarjeta.appendChild(crearImagen(
            producto.imagen,
            "Foto de " + producto.nombre
        ));

        const contenido = document.createElement("div");
        contenido.className = "favorite-card__content";

        const titulo = document.createElement("h3");
        titulo.textContent = producto.nombre;
        contenido.appendChild(titulo);

        const comercio = document.createElement("p");
        comercio.className = "muted";
        comercio.textContent = producto.comercio || "Comercio";
        contenido.appendChild(comercio);

        const precio = document.createElement("p");
        precio.textContent = TodoTala.formatearPrecio(producto.precio);
        contenido.appendChild(precio);

        const acciones = document.createElement("div");
        acciones.className = "favorite-actions";

        const ver = document.createElement("a");
        ver.className = "btn btn--secondary";
        ver.href = "../detalle_producto/todo_tala_detalle_producto.html?id=" +
            encodeURIComponent(producto.id_producto);
        ver.textContent = "Ver producto";

        const quitar = document.createElement("button");
        quitar.className = "btn btn--secondary";
        quitar.type = "button";
        quitar.textContent = "Quitar";
        quitar.addEventListener("click", function () {
            quitarFavorito(producto.id_producto, "producto");
        });

        acciones.append(ver, quitar);
        contenido.appendChild(acciones);
        tarjeta.appendChild(contenido);
        listaProductos.appendChild(tarjeta);
    });
}

function mostrarComercios(comercios) {
    listaComercios.replaceChildren();

    if (!comercios.length) {
        listaComercios.innerHTML = '<p class="empty-state">Todavía no seguís comercios.</p>';
        return;
    }

    comercios.forEach(function (comercio) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "favorite-card favorite-card--store";

        const icono = document.createElement("span");
        icono.className = "favorite-image favorite-image--empty";
        icono.textContent = "🏪";
        icono.setAttribute("aria-hidden", "true");
        tarjeta.appendChild(icono);

        const contenido = document.createElement("div");
        contenido.className = "favorite-card__content";

        const titulo = document.createElement("h3");
        titulo.textContent = comercio.nombre;
        contenido.appendChild(titulo);

        if (comercio.direccion) {
            const direccion = document.createElement("p");
            direccion.className = "muted";
            direccion.textContent = comercio.direccion;
            contenido.appendChild(direccion);
        }

        if (comercio.telefono) {
            const telefono = document.createElement("p");
            telefono.textContent = "Teléfono: " + comercio.telefono;
            contenido.appendChild(telefono);
        }

        const quitar = document.createElement("button");
        quitar.className = "btn btn--secondary";
        quitar.type = "button";
        quitar.textContent = "Dejar de seguir";
        quitar.addEventListener("click", function () {
            quitarFavorito(comercio.id_comercio, "comercio");
        });

        contenido.appendChild(quitar);
        tarjeta.appendChild(contenido);
        listaComercios.appendChild(tarjeta);
    });
}

async function cargarFavoritos() {
    const token = obtenerToken();

    if (!token) {
        TodoTala.irA("../pantalla_login/todo_tala_pantalla_login.html");
        return;
    }

    try {
        const opciones = {
            headers: { "Authorization": "Bearer " + token }
        };

        const [respuestaProductos, respuestaComercios] = await Promise.all([
            fetch(FAVORITOS_URL, opciones),
            fetch(COMERCIOS_SEGUIDOS_URL, opciones)
        ]);

        const [productos, comercios] = await Promise.all([
            respuestaProductos.json(),
            respuestaComercios.json()
        ]);

        if (!respuestaProductos.ok || !respuestaComercios.ok) {
            throw new Error(
                productos.error ||
                comercios.error ||
                "No se pudieron cargar tus favoritos"
            );
        }

        mostrarProductos(productos);
        mostrarComercios(comercios);
    } catch (error) {
        TodoTala.toast(error.message || "No se pudieron cargar tus favoritos");
    }
}

cargarFavoritos();