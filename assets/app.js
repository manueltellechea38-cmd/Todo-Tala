/* Crea un espacio global para agrupar las funciones compartidas del MVP. */
window.TodoTala = window.TodoTala || {};

/* Define la clave donde se guardan los datos simulados dentro de localStorage. */
TodoTala.STORAGE_KEY = "todoTalaMvpData";

/* Devuelve un objeto con datos iniciales para poder probar la interfaz sin base de datos. */
TodoTala.crearDatosIniciales = function () {
    /* Retorna todos los datos demo usados por las diferentes ventanas. */
    return {
        /* Guarda datos básicos del cliente de demostración. */
        cliente: {
            /* Nombre visible del cliente. */
            nombre: "Manuel Rodríguez",
            /* Correo de demostración. */
            email: "manuel.rodriguez@correo.com",
            /* Teléfono de demostración. */
            telefono: "099 123 456"
        },
        /* Guarda el rol seleccionado en el inicio de sesión demo. */
        sesion: {
            /* El MVP comienza sin un usuario autenticado. */
            rol: null
        },
        /* Lista de productos demo compartida entre catálogo y comercio. */
        productos: [
            {
                /* Identificador único del producto. */
                id: 1,
                /* Nombre del producto. */
                nombre: "Auriculares BT",
                /* Marca del producto. */
                marca: "SoundGo",
                /* Comercio que lo publica. */
                comercio: "TecnoTala",
                /* Categoría utilizada por los filtros. */
                categoria: "Tecnología",
                /* Precio actual. */
                precio: 722,
                /* Precio anterior para mostrar promoción. */
                precioAnterior: 850,
                /* Cantidad disponible. */
                stock: 12,
                /* Indica si el producto está visible para clientes. */
                visible: true,
                /* Texto descriptivo del producto. */
                descripcion: "Auriculares inalámbricos con Bluetooth, batería de larga duración y micrófono integrado.",
                /* Sigla usada como imagen provisoria dentro del MVP. */
                imagenTexto: "BT"
            },
            {
                /* Identificador único del producto. */
                id: 2,
                /* Nombre del producto. */
                nombre: "Torta de chocolate",
                /* Marca del producto. */
                marca: "El Sol",
                /* Comercio que lo publica. */
                comercio: "Panadería El Sol",
                /* Categoría utilizada por los filtros. */
                categoria: "Repostería",
                /* Precio actual. */
                precio: 950,
                /* No posee precio anterior. */
                precioAnterior: null,
                /* Stock bajo para probar el aviso al comercio. */
                stock: 3,
                /* Indica que el producto está publicado. */
                visible: true,
                /* Descripción breve. */
                descripcion: "Torta casera de chocolate, ideal para cumpleaños y reuniones.",
                /* Sigla visual provisoria. */
                imagenTexto: "TC"
            },
            {
                /* Identificador único del producto. */
                id: 3,
                /* Nombre del producto. */
                nombre: "Martillo carpintero",
                /* Marca del producto. */
                marca: "Forte",
                /* Comercio que lo publica. */
                comercio: "Ferretería Tala",
                /* Categoría utilizada por los filtros. */
                categoria: "Ferretería",
                /* Precio actual. */
                precio: 490,
                /* No posee promoción. */
                precioAnterior: null,
                /* No hay unidades disponibles para probar el estado sin stock. */
                stock: 0,
                /* Se mantiene visible aunque no tenga stock. */
                visible: true,
                /* Descripción breve. */
                descripcion: "Martillo con mango antideslizante para trabajos generales.",
                /* Sigla visual provisoria. */
                imagenTexto: "MC"
            },
            {
                /* Identificador único del producto. */
                id: 4,
                /* Nombre del producto. */
                nombre: "Bizcochos surtidos",
                /* Marca del producto. */
                marca: "El Sol",
                /* Comercio que lo publica. */
                comercio: "Panadería El Sol",
                /* Categoría utilizada por los filtros. */
                categoria: "Panadería",
                /* Precio actual. */
                precio: 280,
                /* No posee precio anterior. */
                precioAnterior: null,
                /* Unidades disponibles. */
                stock: 18,
                /* Está publicado. */
                visible: true,
                /* Descripción breve. */
                descripcion: "Surtido de bizcochos frescos preparado durante la mañana.",
                /* Sigla visual provisoria. */
                imagenTexto: "BS"
            }
        ],
        /* El carrito comienza vacío. */
        carrito: [],
        /* Pedidos demo para mostrar diferentes estados desde el primer inicio. */
        pedidos: [
            {
                /* Identificador del pedido. */
                id: 1001,
                /* Comercio asociado. */
                comercio: "Panadería El Sol",
                /* Estado actual. */
                estado: "Listo para retirar",
                /* Código que el cliente presenta en el local. */
                codigo: "TT-4821",
                /* Fecha corta para la demostración. */
                fecha: "12/08/2026",
                /* Total del pedido. */
                total: 1230,
                /* Lista resumida de artículos. */
                items: ["Torta de chocolate x1", "Bizcochos surtidos x1"]
            },
            {
                /* Identificador del pedido. */
                id: 1002,
                /* Comercio asociado. */
                comercio: "TecnoTala",
                /* Estado actual. */
                estado: "Pendiente",
                /* Código de retiro reservado para cuando el pedido sea aceptado. */
                codigo: "TT-7354",
                /* Fecha corta para la demostración. */
                fecha: "13/08/2026",
                /* Total del pedido. */
                total: 722,
                /* Lista resumida de artículos. */
                items: ["Auriculares BT x1"]
            }
        ],
        /* Lista de identificadores de productos favoritos. */
        favoritos: [],
        /* Promociones de ejemplo para la pantalla del comercio. */
        promociones: [
            {
                /* Identificador de la promoción. */
                id: 1,
                /* Nombre visible. */
                nombre: "2x1 en bizcochos",
                /* Tipo simple de alcance. */
                alcance: "Producto",
                /* Fecha inicial. */
                inicio: "2026-08-10",
                /* Fecha final. */
                fin: "2026-08-20",
                /* Indica si se muestra activa. */
                activa: true
            },
            {
                /* Identificador de la promoción. */
                id: 2,
                /* Nombre visible. */
                nombre: "15% en repostería",
                /* Tipo simple de alcance. */
                alcance: "Categoría",
                /* Fecha inicial. */
                inicio: "2026-08-15",
                /* Fecha final. */
                fin: "2026-08-31",
                /* Indica si se muestra activa. */
                activa: false
            }
        ]
    };
};

/* Obtiene todos los datos del MVP desde localStorage. */
TodoTala.obtenerDatos = function () {
    /* Lee el texto guardado en el navegador. */
    const guardado = localStorage.getItem(TodoTala.STORAGE_KEY);
    /* Si todavía no hay datos, crea el conjunto inicial. */
    if (!guardado) {
        /* Crea los datos de demostración. */
        const iniciales = TodoTala.crearDatosIniciales();
        /* Los guarda para las próximas pantallas. */
        TodoTala.guardarDatos(iniciales);
        /* Devuelve los datos recién creados. */
        return iniciales;
    }
    /* Intenta convertir el texto JSON en un objeto de JavaScript. */
    try {
        /* Devuelve el objeto almacenado. */
        return JSON.parse(guardado);
    } catch (error) {
        /* Si el almacenamiento se corrompe, crea nuevamente los datos demo. */
        const iniciales = TodoTala.crearDatosIniciales();
        /* Sobrescribe el contenido inválido. */
        TodoTala.guardarDatos(iniciales);
        /* Devuelve un estado válido. */
        return iniciales;
    }
};

/* Guarda el objeto completo del MVP dentro de localStorage. */
TodoTala.guardarDatos = function (datos) {
    /* Convierte el objeto en texto JSON y lo almacena en el navegador. */
    localStorage.setItem(TodoTala.STORAGE_KEY, JSON.stringify(datos));
};

/* Formatea un número como precio simple en pesos uruguayos. */
TodoTala.formatearPrecio = function (valor) {
    /* Convierte el valor a número y agrega separadores de miles. */
    return "$" + Number(valor || 0).toLocaleString("es-UY");
};

/* Lee un parámetro de la URL, por ejemplo ?id=2. */
TodoTala.parametro = function (nombre) {
    /* Crea un lector de parámetros con la URL actual. */
    const parametros = new URLSearchParams(window.location.search);
    /* Devuelve el valor solicitado. */
    return parametros.get(nombre);
};

/* Navega a otra ventana usando una ruta relativa. */
TodoTala.irA = function (ruta) {
    /* Cambia la ubicación actual del navegador. */
    window.location.href = ruta;
};

/* Muestra un aviso pequeño sin interrumpir el flujo con alert. */
TodoTala.toast = function (mensaje) {
    /* Busca un toast existente en la página. */
    let elemento = document.getElementById("toast-global");
    /* Si no existe, lo crea. */
    if (!elemento) {
        /* Crea un elemento div. */
        elemento = document.createElement("div");
        /* Le asigna el identificador reutilizable. */
        elemento.id = "toast-global";
        /* Le aplica la clase visual. */
        elemento.className = "toast";
        /* Lo agrega al final del body. */
        document.body.appendChild(elemento);
    }
    /* Coloca el mensaje recibido. */
    elemento.textContent = mensaje;
    /* Muestra el toast. */
    elemento.classList.add("is-visible");
    /* Programa su ocultamiento después de un breve tiempo. */
    window.setTimeout(function () {
        /* Quita la clase visible. */
        elemento.classList.remove("is-visible");
    }, 2200);
};

/* Genera un código simple de retiro para pedidos del MVP. */
TodoTala.generarCodigo = function () {
    /* Crea un número aleatorio entre 1000 y 9999. */
    const numero = Math.floor(1000 + Math.random() * 9000);
    /* Devuelve el código con el prefijo del proyecto. */
    return "TT-" + numero;
};

/* Devuelve una clase de badge según el estado de un pedido. */
TodoTala.claseEstado = function (estado) {
    /* Usa verde para pedidos listos o entregados. */
    if (estado === "Listo para retirar" || estado === "Entregado") return "badge badge--success";
    /* Usa rojo para pedidos rechazados o cancelados. */
    if (estado === "Rechazado" || estado === "Cancelado") return "badge badge--danger";
    /* Usa amarillo para estados en proceso. */
    if (estado === "Pendiente" || estado === "En preparación") return "badge badge--warning";
    /* Usa el badge azul para el resto. */
    return "badge";
};

/* Restablece los datos de demostración cuando sea necesario durante la defensa. */
TodoTala.reiniciarDemo = function () {
    /* Reemplaza los datos actuales por los datos iniciales. */
    TodoTala.guardarDatos(TodoTala.crearDatosIniciales());
    /* Informa al usuario que el MVP volvió a su estado inicial. */
    TodoTala.toast("Datos de demostración reiniciados");
};
