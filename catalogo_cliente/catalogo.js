/* Elementos principales del catálogo. */
const buscadorCatalogo = document.getElementById("search-input");
const filtroComercio = document.getElementById("filtro-comercio");
const filtroCategoria = document.getElementById("filtro-categoria");
const filtroDisponibilidad = document.getElementById("filtro-disponibilidad");
const filtroPromocion = document.getElementById("filtro-promocion");
const precioMinimo = document.getElementById("precio-min");
const precioMaximo = document.getElementById("precio-max");
const ordenProductos = document.getElementById("orden-productos");
const listaCatalogo = document.getElementById("lista-productos");
const resumenCatalogo = document.getElementById("resumen-catalogo");
const contadorCarrito = document.getElementById("contador-carrito");

let productosCatalogo = [];
let promocionesCatalogo = [];


/*
Carga los productos visibles desde MySQL.
Este GET es público.
*/
async function cargarProductos() {

    try {

        const respuestas = await Promise.all([
            fetch(PRODUCTOS_URL),
            fetch(PROMOCIONES_URL)
        ]);

        const respuestaProductos = respuestas[0];
        const respuestaPromociones = respuestas[1];

        const datosProductos =
            await respuestaProductos.json();

        const datosPromociones =
            await respuestaPromociones.json();

        if (!respuestaProductos.ok) {
            TodoTala.toast(
                datosProductos.error ||
                "No se pudieron cargar los productos"
            );
            return;
        }

        if (!respuestaPromociones.ok) {
            TodoTala.toast(
                datosPromociones.error ||
                "No se pudieron cargar las promociones"
            );
            return;
        }

        promocionesCatalogo =
            datosPromociones;

        productosCatalogo =
            datosProductos.map(function (producto) {

                const precioBase =
                    Number(producto.precio);

                const promocion =
                    promocionesCatalogo.find(
                        function (promo) {
                            return (
                                Number(promo.id_producto) ===
                                Number(producto.id_producto)
                            );
                        }
                    );

                let precioFinal = precioBase;

                if (promocion) {

                    const valor =
                        Number(promocion.valor);

                    if (
                        promocion.tipo ===
                        "porcentaje"
                    ) {
                        precioFinal =
                            precioBase *
                            (
                                1 -
                                valor / 100
                            );

                        precioFinal =
                            Math.round(
                                precioFinal * 100
                            ) / 100;
                    }

                    if (
                        promocion.tipo ===
                        "precio"
                    ) {
                        precioFinal = valor;
                    }
                }

                return {
                    id:
                        Number(
                            producto.id_producto
                        ),

                    id_comercio:
                        Number(
                            producto.id_comercio
                        ),

                    id_categoria:
                        Number(
                            producto.id_categoria
                        ),

                    nombre:
                        producto.nombre,

                    marca:
                        producto.marca || "",

                    precio_base:
                        precioBase,

                    precio:
                        precioFinal,

                    descripcion:
                        producto.descripcion || "",

                    stock:
                        Number(producto.stock),

                    imagen:
                        producto.imagen,

                    visible:
                        Number(
                            producto.visible
                        ) === 1,

                    comercio:
                        producto.comercio || "",

                    categoria:
                        producto.categoria || "",

                    promocion:
                        promocion || null
                };
            });

        cargarFiltros();
        renderizarCatalogo();

    } catch (error) {

        console.error(error);

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Carga comercios y categorías en los filtros.
*/
function cargarFiltros() {

    filtroComercio.innerHTML =
        '<option value="">Todos los comercios</option>';

    filtroCategoria.innerHTML =
        '<option value="">Todas las categorías</option>';

    const comercios = [
        ...new Set(
            productosCatalogo.map(function (producto) {
                return producto.comercio;
            })
        )
    ].filter(Boolean).sort();

    const categorias = [
        ...new Set(
            productosCatalogo.map(function (producto) {
                return producto.categoria;
            })
        )
    ].filter(Boolean).sort();

    comercios.forEach(function (comercio) {

        const opcion =
            document.createElement("option");

        opcion.value = comercio;
        opcion.textContent = comercio;

        filtroComercio.appendChild(opcion);
    });

    categorias.forEach(function (categoria) {

        const opcion =
            document.createElement("option");

        opcion.value = categoria;
        opcion.textContent = categoria;

        filtroCategoria.appendChild(opcion);
    });
}


/*
Por ahora promociones todavía no están conectadas
al catálogo real.
*/
function tienePromocion(producto) {
    return producto.promocion !== null;
}


function mostrarPrecio(producto) {

    if (!tienePromocion(producto)) {

        return (
            '<p class="product-price-row">' +
                '<span class="product-price">' +
                    TodoTala.formatearPrecio(
                        producto.precio
                    ) +
                '</span>' +
            '</p>'
        );
    }

    let textoPromocion =
        producto.promocion.nombre;

    if (
        producto.promocion.tipo ===
        "porcentaje"
    ) {
        textoPromocion +=
            " (" +
            Number(
                producto.promocion.valor
            ) +
            "%)";
    }

    return (
        '<p class="product-price-row">' +

            '<span ' +
            'style="' +
                'text-decoration: line-through;' +
                'opacity: 0.6;' +
                'margin-right: 8px;' +
            '">' +

                TodoTala.formatearPrecio(
                    producto.precio_base
                ) +

            '</span>' +

            '<span class="product-price">' +

                TodoTala.formatearPrecio(
                    producto.precio
                ) +

            '</span>' +

        '</p>' +

        '<p class="muted">' +
            textoPromocion +
        '</p>'
    );
}


/*
Filtra por disponibilidad.
*/
function coincideDisponibilidad(producto) {

    if (!filtroDisponibilidad.value) {
        return true;
    }

    if (filtroDisponibilidad.value === "disponible") {
        return producto.stock > 0;
    }

    if (filtroDisponibilidad.value === "bajo") {
        return producto.stock > 0 &&
            producto.stock <= 5;
    }

    if (filtroDisponibilidad.value === "sin-stock") {
        return producto.stock <= 0;
    }

    return true;
}


/*
Ordena los productos.
*/
function ordenarLista(productos) {

    const copia = productos.slice();

    if (ordenProductos.value === "precio-asc") {

        copia.sort(function (a, b) {
            return a.precio - b.precio;
        });

    } else if (
        ordenProductos.value === "precio-desc"
    ) {

        copia.sort(function (a, b) {
            return b.precio - a.precio;
        });

    } else if (
        ordenProductos.value === "nombre"
    ) {

        copia.sort(function (a, b) {
            return a.nombre.localeCompare(
                b.nombre,
                "es"
            );
        });

    } else {

        copia.sort(function (a, b) {

            if ((a.stock > 0) !== (b.stock > 0)) {
                return a.stock > 0 ? -1 : 1;
            }

            return a.id - b.id;
        });
    }

    return copia;
}


/*
Obtiene el carrito real desde MySQL
y actualiza el contador.
*/
async function actualizarContadorCarrito() {

    const token = obtenerToken();

    if (!token) {
        contadorCarrito.textContent = "0";
        return;
    }

    try {

        const respuesta = await fetch(
            CARRITO_URL,
            {
                method: "GET",
                headers: {
                    "Authorization":
                        "Bearer " + token
                }
            }
        );

        if (!respuesta.ok) {
            contadorCarrito.textContent = "0";
            return;
        }

        const carrito =
            await respuesta.json();

        const cantidadTotal =
            carrito.reduce(function (total, item) {

                return total +
                    Number(item.cantidad);

            }, 0);

        contadorCarrito.textContent =
            cantidadTotal;

    } catch (error) {

        contadorCarrito.textContent = "0";
    }
}


/*
Agrega una unidad al carrito real.
*/
async function agregarRapido(idProducto) {

    const token = obtenerToken();

    if (!token) {

        TodoTala.toast(
            "Iniciá sesión para agregar productos"
        );

        return;
    }

    try {

        const respuesta = await fetch(
            CARRITO_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({
                    id_producto: idProducto,
                    cantidad: 1
                })
            }
        );

        const datos =
            await respuesta.json();

        if (!respuesta.ok) {

            TodoTala.toast(
                datos.error ||
                "No se pudo agregar el producto"
            );

            return;
        }

        TodoTala.toast(
            "Producto agregado al carrito"
        );

        actualizarContadorCarrito();

    } catch (error) {

        TodoTala.toast(
            "No se pudo conectar con el servidor"
        );
    }
}


/*
Filtra y muestra el catálogo.
*/
function renderizarCatalogo() {

    const texto =
        buscadorCatalogo.value
            .trim()
            .toLowerCase();

    const minimo =
        precioMinimo.value === ""
            ? null
            : Number(precioMinimo.value);

    const maximo =
        precioMaximo.value === ""
            ? null
            : Number(precioMaximo.value);

    let productos =
        productosCatalogo.filter(
            function (producto) {

                const contenido = [
                    producto.nombre,
                    producto.marca,
                    producto.comercio,
                    producto.categoria
                ]
                    .join(" ")
                    .toLowerCase();

                return (
                    producto.visible &&

                    contenido.includes(texto) &&

                    (
                        !filtroComercio.value ||
                        producto.comercio ===
                        filtroComercio.value
                    ) &&

                    (
                        !filtroCategoria.value ||
                        producto.categoria ===
                        filtroCategoria.value
                    ) &&

                    coincideDisponibilidad(
                        producto
                    ) &&

                    (
                        minimo === null ||
                        producto.precio >= minimo
                    ) &&

                    (
                        maximo === null ||
                        producto.precio <= maximo
                    ) &&

                    (
                        !filtroPromocion.checked ||
                        tienePromocion(producto)
                    )
                );
            }
        );

    productos = ordenarLista(productos);

    resumenCatalogo.textContent =
        productos.length +
        (
            productos.length === 1
                ? " producto encontrado"
                : " productos encontrados"
        );

    if (productos.length === 0) {

        listaCatalogo.innerHTML =
            '<p class="empty-state">' +
            'No encontramos productos con esos filtros.' +
            '</p>';

        return;
    }

    listaCatalogo.innerHTML =
        productos.map(function (producto) {

            const stock =
                TodoTala.estadoStock(producto);

            const imagenTexto = producto.imagen
                ? '<img src="' + UPLOADS_URL + encodeURIComponent(producto.imagen) + '" alt="Foto del producto" loading="lazy">' 
                : '<span aria-label="Sin foto">📷</span>';

            return (
                '<article class="product-card" ' +
                'data-id="' + producto.id + '">' +

                    '<section class="product-image" data-detalle>' +
                        imagenTexto +
                    '</section>' +

                    '<section class="product-card__body">' +

                        '<p class="product-stock-row">' +
                            '<span class="' +
                            stock.clase +
                            '">' +
                            stock.texto +
                            '</span>' +
                        '</p>' +

                        '<strong class="product-card__title" data-detalle>' +
                            producto.nombre +
                        '</strong>' +

                        '<p class="product-store">' +
                            producto.comercio +
                        '</p>' +

                        '<p class="muted">' +
                            producto.marca +
                            ' · ' +
                            producto.categoria +
                        '</p>' +

                        mostrarPrecio(producto) +

                        '<nav class="product-card__actions">' +

                            '<button ' +
                            'class="btn btn--primary" ' +
                            'data-agregar ' +
                            'type="button" ' +
                            (
                                producto.stock <= 0
                                    ? 'disabled'
                                    : ''
                            ) +
                            '>' +

                            (
                                producto.stock > 0
                                    ? 'Agregar'
                                    : 'Sin stock'
                            ) +

                            '</button>' +

                            '<button ' +
                            'class="btn btn--secondary" ' +
                            'data-detalle ' +
                            'type="button">' +
                            'Ver' +
                            '</button>' +

                        '</nav>' +

                    '</section>' +

                '</article>'
            );
        }).join("");


    document
        .querySelectorAll(".product-card")
        .forEach(function (tarjeta) {

            const id =
                Number(tarjeta.dataset.id);

            tarjeta
                .querySelectorAll("[data-detalle]")
                .forEach(function (elemento) {

                    elemento.addEventListener(
                        "click",
                        function () {

                            TodoTala.irA(
                                "../detalle_producto/" +
                                "todo_tala_detalle_producto.html" +
                                "?id=" + id
                            );
                        }
                    );
                });

            tarjeta
                .querySelector("[data-agregar]")
                .addEventListener(
                    "click",
                    function () {
                        agregarRapido(id);
                    }
                );
        });
}


/*
Limpia todos los filtros.
*/
function limpiarFiltros() {

    buscadorCatalogo.value = "";
    filtroComercio.value = "";
    filtroCategoria.value = "";
    filtroDisponibilidad.value = "";
    filtroPromocion.checked = false;
    precioMinimo.value = "";
    precioMaximo.value = "";
    ordenProductos.value = "relevancia";

    renderizarCatalogo();
}


[
    buscadorCatalogo,
    precioMinimo,
    precioMaximo
].forEach(function (campo) {

    campo.addEventListener(
        "input",
        renderizarCatalogo
    );
});


[
    filtroComercio,
    filtroCategoria,
    filtroDisponibilidad,
    filtroPromocion,
    ordenProductos
].forEach(function (campo) {

    campo.addEventListener(
        "change",
        renderizarCatalogo
    );
});


document
    .getElementById("btn-limpiar")
    .addEventListener(
        "click",
        limpiarFiltros
    );


/*
Inicio de la pantalla.
*/
cargarProductos();
actualizarContadorCarrito();