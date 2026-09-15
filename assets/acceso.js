/* Calcula la carpeta principal del proyecto para poder navegar desde cualquier pantalla. */
TodoTala.RAIZ = new URL("../", document.currentScript.src).href;

/* Abre una ruta tomando como base la carpeta principal de Todo Tala. */
TodoTala.abrir = function (ruta) {
    window.location.href = new URL(ruta, TodoTala.RAIZ).href;
};

/* Envía a cada usuario a la pantalla principal de su rol. */
TodoTala.irSegunRol = function (usuario) {
    if (usuario.rol === "cliente") {
        TodoTala.abrir("pantalla_inicio/todo_tala_pantalla_inicio.html");
        return;
    }

    TodoTala.abrir("panel_comercio/todo_tala_panel_comercio.html");
};

/* Protege las pantallas para que nadie use la aplicación sin iniciar sesión. */
TodoTala.controlarAcceso = function () {
    const ruta = window.location.pathname.toLowerCase();
    const usuario = TodoTala.usuarioActual();
    const esLogin = ruta.includes("/pantalla_login/");
    const esRegistro = ruta.includes("/pantalla_registro/");
    const esRaiz = ruta.endsWith("/index.html") || ruta.endsWith("/");

    /* Login y registro son las únicas pantallas públicas. */
    if (esLogin || esRegistro) {
        if (usuario) {
            TodoTala.irSegunRol(usuario);
        }
        return;
    }

    /* Si no hay sesión, cualquier otra pantalla vuelve al login. */
    if (!usuario) {
        TodoTala.abrir("pantalla_login/todo_tala_pantalla_login.html");
        return;
    }

    if (esRaiz) {
        TodoTala.irSegunRol(usuario);
        return;
    }

    const paginasCliente = [
        "pantalla_inicio",
        "catalogo_cliente",
        "detalle_producto",
        "resultados_busqueda",
        "carrito_pedidos",
        "mis_pedidos",
        "perfil_cliente"
    ];

    const paginasComercio = [
        "panel_comercio",
        "agregar_editar_producto",
        "editar_producto",
        "gestionar_productos",
        "gestionar_promociones",
        "pedidos_recibidos",
        "gestionar_empleados"
    ];

    const estaEnCliente = paginasCliente.some(function (carpeta) {
        return ruta.includes("/" + carpeta + "/");
    });

    const estaEnComercio = paginasComercio.some(function (carpeta) {
        return ruta.includes("/" + carpeta + "/");
    });

    /* Un cliente no puede abrir herramientas internas del comercio. */
    if (usuario.rol === "cliente" && estaEnComercio) {
        TodoTala.abrir("pantalla_inicio/todo_tala_pantalla_inicio.html");
        return;
    }

    /* Jefe y empleado no usan las pantallas exclusivas del cliente. */
    if (usuario.rol !== "cliente" && estaEnCliente) {
        TodoTala.abrir("panel_comercio/todo_tala_panel_comercio.html");
        return;
    }

    /* La administración de empleados pertenece solamente al jefe. */
    if (usuario.rol === "empleado" && ruta.includes("/gestionar_empleados/")) {
        TodoTala.abrir("panel_comercio/todo_tala_panel_comercio.html");
    }
};

TodoTala.controlarAcceso();
TodoTala.ajustarNavegacionComercio();
