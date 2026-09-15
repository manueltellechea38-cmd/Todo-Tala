TodoTala.RAIZ = new URL("../", document.currentScript.src).href;

/* Abre una ruta tomando como base la carpeta principal del proyecto. */
TodoTala.abrir = function (ruta) {
    window.location.href = new URL(ruta, TodoTala.RAIZ).href;
};

/* Envía al usuario a la pantalla principal que corresponde según su rol. */
TodoTala.irSegunRol = function (usuario) {
    if (usuario.rol === "cliente") {
        TodoTala.abrir("pantalla_inicio/todo_tala_pantalla_inicio.html");
    } else {
        TodoTala.abrir("panel_comercio/todo_tala_panel_comercio.html");
    }
};

/* Protege las pantallas para que solo entren usuarios con sesión iniciada. */
TodoTala.controlarAcceso = function () {
    const ruta = window.location.pathname.toLowerCase();
    const usuario = TodoTala.usuarioActual();
    const login = ruta.includes("/pantalla_login/");
    const registro = ruta.includes("/pantalla_reguistro/") || ruta.includes("/pantalla_registro/");
    const inicioRaiz = ruta.endsWith("/index.html") || ruta.endsWith("/");

    /* Login y registro son las únicas pantallas disponibles sin sesión. */
    if (login || registro) {
        if (usuario) {
            TodoTala.irSegunRol(usuario);
        }
        return;
    }

    if (!usuario) {
        TodoTala.abrir("pantalla_login/todo_tala_pantalla_login.html");
        return;
    }

    if (inicioRaiz) {
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
        "gestioinar_productos",
        "gestionar_promociones",
        "pedidos_recibidos",
        "gestionar_empleados"
    ];

    const esCliente = paginasCliente.some(function (carpeta) {
        return ruta.includes("/" + carpeta + "/");
    });

    const esComercio = paginasComercio.some(function (carpeta) {
        return ruta.includes("/" + carpeta + "/");
    });

    /* Un cliente no puede entrar a las herramientas internas del comercio. */
    if (usuario.rol === "cliente" && esComercio) {
        TodoTala.abrir("pantalla_inicio/todo_tala_pantalla_inicio.html");
        return;
    }

    /* Jefe y empleado no usan las pantallas exclusivas del cliente. */
    if (usuario.rol !== "cliente" && esCliente) {
        TodoTala.abrir("panel_comercio/todo_tala_panel_comercio.html");
        return;
    }

    /* Solo el jefe puede administrar empleados. */
    if (usuario.rol === "empleado" && ruta.includes("/gestionar_empleados/")) {
        TodoTala.abrir("panel_comercio/todo_tala_panel_comercio.html");
    }
};

TodoTala.controlarAcceso();