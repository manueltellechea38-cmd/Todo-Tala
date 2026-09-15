TodoTala.RAIZ = new URL("../", document.currentScript.src).href;

TodoTala.abrir = function (ruta) {
    window.location.href = new URL(ruta, TodoTala.RAIZ).href;
};

TodoTala.irSegunRol = function (usuario) {
    if (usuario.rol === "cliente") {
        TodoTala.abrir("pantalla_inicio/todo_tala_pantalla_inicio.html");
    } else {
        TodoTala.abrir("panel_comercio/todo_tala_panel_comercio.html");
    }
};

TodoTala.controlarAcceso = function () {
    const ruta = window.location.pathname.toLowerCase();
    const usuario = TodoTala.usuarioActual();
    const login = ruta.includes("/pantalla_login/");
    const registro = ruta.includes("/pantalla_reguistro/") || ruta.includes("/pantalla_registro/");
    const inicioRaiz = ruta.endsWith("/index.html") || ruta.endsWith("/");

    if (login || registro) {
        if (usuario) TodoTala.irSegunRol(usuario);
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

    if (usuario.rol === "cliente" && esComercio) {
        TodoTala.abrir("pantalla_inicio/todo_tala_pantalla_inicio.html");
        return;
    }

    if (usuario.rol !== "cliente" && esCliente) {
        TodoTala.abrir("panel_comercio/todo_tala_panel_comercio.html");
        return;
    }

    if (usuario.rol === "empleado" && ruta.includes("/gestionar_empleados/")) {
        TodoTala.abrir("panel_comercio/todo_tala_panel_comercio.html");
    }
};

TodoTala.controlarAcceso();