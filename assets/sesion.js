const CLAVE_SESION = "sesion-todo-tala";

const ROLES = ["cliente", "empleado", "jefe"];

/*
Estos permisos solamente sirven para decidir qué mostrar en el frontend.
La seguridad real siempre la controla PHP.
*/
const PERMISOS = {
    verCatalogo: ["cliente", "empleado", "jefe"],
    gestionarProductos: ["empleado", "jefe"],
    gestionarPromociones: ["empleado", "jefe"],
    gestionarPedidos: ["empleado", "jefe"],
    gestionarEmpleados: ["jefe"]
};

/* Guarda el token, el usuario y cuándo vence la sesión. */
function guardarSesion(datos) {
    const sesion = {
        token: datos.token,
        usuario: datos.usuario,
        vence: Date.now() + datos.expira_en * 1000
    };

    localStorage.setItem(
        CLAVE_SESION,
        JSON.stringify(sesion)
    );
}

/* Devuelve la sesión si existe y todavía no venció. */
function leerSesion() {
    try {
        const sesion = JSON.parse(
            localStorage.getItem(CLAVE_SESION)
        );

        if (
            sesion &&
            sesion.token &&
            sesion.usuario &&
            Date.now() < sesion.vence
        ) {
            return sesion;
        }
    } catch (error) {
        /* Si el contenido está dañado se considera que no hay sesión. */
    }

    localStorage.removeItem(CLAVE_SESION);

    return null;
}

function obtenerToken() {
    const sesion = leerSesion();

    return sesion ? sesion.token : null;
}

function obtenerUsuario() {
    const sesion = leerSesion();

    return sesion ? sesion.usuario : null;
}

function cerrarSesionLocal() {
    localStorage.removeItem(CLAVE_SESION);
}

function puede(accion) {
    const usuario = obtenerUsuario();

    return (
        usuario !== null &&
        (PERMISOS[accion] || []).includes(usuario.rol)
    );
}