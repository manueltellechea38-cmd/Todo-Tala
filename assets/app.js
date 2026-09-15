window.TodoTala = window.TodoTala || {};

TodoTala.STORAGE_KEY = "todoTalaDataV11";

TodoTala.crearDatosIniciales = function () {
    return {
        sesion: {
            usuarioId: null,
            rol: null,
            iniciada: false
        },

        usuarios: [
            {
                id: 1,
                nombre: "Juan Perez",
                cedula: "45678901",
                correo: "juan@gmail.com",
                password: "Juan1234",
                fechaNacimiento: "2005-03-15",
                rol: "cliente"
            },
            {
                id: 2,
                nombre: "Sofia Silva",
                cedula: "50123456",
                correo: "sofia@gmail.com",
                password: "Sofia1234",
                fechaNacimiento: "2004-12-02",
                rol: "jefe",
                comercioId: 1
            },
            {
                id: 3,
                nombre: "Valentina Diaz",
                cedula: "52345678",
                correo: "valentina@gmail.com",
                password: "Vale1234",
                fechaNacimiento: "2005-06-30",
                rol: "empleado",
                comercioId: 1
            }
        ],

        comercios: [
            {
                id: 1,
                jefeId: 2,
                nombre: "Almacén La Plaza",
                ruc: "217654320019",
                telefono: "099 123 456",
                direccion: "Av. Artigas 123, Tala",
                horario: "08:00 a 18:00",
                descripcion: "Almacén local con productos de consumo diario.",
                whatsapp: "099123456",
                correo: "contacto@laplaza.uy"
            }
        ],

        cliente: {
            id: 1,
            nombre: "Juan Perez",
            email: "juan@gmail.com",
            telefono: ""
        },

        productos: [
            {
                id: 1,
                comercioId: 1,
                comercio: "Almacén La Plaza",
                categoria: "Alimentos",
                nombre: "Arroz 1 kg",
                marca: "La Abundancia",
                precio: 65,
                precioAnterior: null,
                descripcion: "Paquete de arroz de 1 kilogramo.",
                stock: 30,
                visible: true,
                imagenTexto: "AR"
            },
            {
                id: 2,
                comercioId: 1,
                comercio: "Almacén La Plaza",
                categoria: "Alimentos",
                nombre: "Fideos 500 g",
                marca: "Las Acacias",
                precio: 45,
                precioAnterior: null,
                descripcion: "Paquete de fideos de 500 gramos.",
                stock: 25,
                visible: true,
                imagenTexto: "FI"
            },
            {
                id: 3,
                comercioId: 1,
                comercio: "Almacén La Plaza",
                categoria: "Limpieza",
                nombre: "Detergente 750 ml",
                marca: "Brillo",
                precio: 119,
                precioAnterior: 139,
                descripcion: "Detergente concentrado para vajilla.",
                stock: 5,
                visible: true,
                imagenTexto: "DE"
            },
            {
                id: 4,
                comercioId: 1,
                comercio: "Almacén La Plaza",
                categoria: "Alimentos",
                nombre: "Yerba 1 kg",
                marca: "Campo Sur",
                precio: 198,
                precioAnterior: null,
                descripcion: "Yerba mate tradicional de 1 kilogramo.",
                stock: 0,
                visible: true,
                imagenTexto: "YE"
            }
        ],

        carrito: [],
        reservas: [],
        favoritos: [],
        comerciosFavoritos: [],

        pedidos: [
            {
                id: 1001,
                clienteId: 1,
                comercioId: 1,
                comercio: "Almacén La Plaza",
                estado: "Listo para retirar",
                codigo: "TT-A7K4P2",
                fecha: "14/09/2026",
                listoDesde: "2026-09-14T12:00:00",
                venceRetiro: "2026-09-16T12:00:00",
                total: 110,
                items: ["Arroz 1 kg x1", "Fideos 500 g x1"]
            }
        ],

        promociones: [
            {
                id: 1,
                comercioId: 1,
                nombre: "Oferta en limpieza",
                tipo: "porcentaje",
                valor: 15,
                productoId: 3,
                inicio: "2026-09-10",
                fin: "2026-09-30",
                activa: true
            }
        ],

        notificaciones: [
            {
                id: 1,
                usuarioId: 1,
                mensaje: "Tu pedido #1001 está listo para retirar.",
                fecha: "14/09/2026",
                leida: false
            }
        ]
    };
};

TodoTala.obtenerDatos = function () {
    const guardado = localStorage.getItem(TodoTala.STORAGE_KEY);

    if (!guardado) {
        const datosIniciales = TodoTala.crearDatosIniciales();
        TodoTala.guardarDatos(datosIniciales);
        return datosIniciales;
    }

    try {
        return JSON.parse(guardado);
    } catch (error) {
        const datosIniciales = TodoTala.crearDatosIniciales();
        TodoTala.guardarDatos(datosIniciales);
        return datosIniciales;
    }
};

TodoTala.guardarDatos = function (datos) {
    localStorage.setItem(TodoTala.STORAGE_KEY, JSON.stringify(datos));
};

TodoTala.formatearPrecio = function (valor) {
    return "$" + Number(valor || 0).toLocaleString("es-UY");
};

TodoTala.parametro = function (nombre) {
    return new URLSearchParams(window.location.search).get(nombre);
};

TodoTala.irA = function (ruta) {
    window.location.href = ruta;
};

TodoTala.toast = function (mensaje, tipo) {
    let elemento = document.getElementById("toast-global");

    if (!elemento) {
        elemento = document.createElement("div");
        elemento.id = "toast-global";
        elemento.className = "toast";
        document.body.appendChild(elemento);
    }

    elemento.textContent = mensaje;
    elemento.className = "toast is-visible";

    if (tipo) {
        elemento.classList.add("toast--" + tipo);
    }

    window.setTimeout(function () {
        elemento.classList.remove("is-visible");
    }, 2600);
};

TodoTala.usuarioActual = function () {
    const datos = TodoTala.obtenerDatos();

    if (!datos.sesion || !datos.sesion.iniciada) {
        return null;
    }

    return datos.usuarios.find(function (usuario) {
        return usuario.id === datos.sesion.usuarioId;
    }) || null;
};

TodoTala.iniciarSesion = function (correo, password) {
    const datos = TodoTala.obtenerDatos();
    const correoNormalizado = correo.trim().toLowerCase();

    const usuario = datos.usuarios.find(function (item) {
        return item.correo.toLowerCase() === correoNormalizado && item.password === password;
    });

    if (!usuario) {
        return null;
    }

    datos.sesion = {
        usuarioId: usuario.id,
        rol: usuario.rol,
        iniciada: true
    };

    TodoTala.guardarDatos(datos);
    return usuario;
};

TodoTala.cerrarSesion = function () {
    const datos = TodoTala.obtenerDatos();
    datos.sesion = {
        usuarioId: null,
        rol: null,
        iniciada: false
    };
    TodoTala.guardarDatos(datos);
};

TodoTala.correoRegistrado = function (correo) {
    const datos = TodoTala.obtenerDatos();
    const correoNormalizado = correo.trim().toLowerCase();

    return datos.usuarios.some(function (usuario) {
        return usuario.correo.toLowerCase() === correoNormalizado;
    });
};

TodoTala.rucRegistrado = function (ruc) {
    const datos = TodoTala.obtenerDatos();
    const limpio = ruc.replace(/\D/g, "");

    return datos.comercios.some(function (comercio) {
        return String(comercio.ruc || "").replace(/\D/g, "") === limpio;
    });
};

TodoTala.registrarUsuario = function (nuevoUsuario, nuevoComercio) {
    const datos = TodoTala.obtenerDatos();
    const nuevoId = datos.usuarios.reduce(function (mayor, usuario) {
        return Math.max(mayor, usuario.id);
    }, 0) + 1;

    nuevoUsuario.id = nuevoId;
    datos.usuarios.push(nuevoUsuario);

    if (nuevoUsuario.rol === "jefe" && nuevoComercio) {
        const nuevoComercioId = datos.comercios.reduce(function (mayor, comercio) {
            return Math.max(mayor, comercio.id);
        }, 0) + 1;

        nuevoComercio.id = nuevoComercioId;
        nuevoComercio.jefeId = nuevoId;
        datos.comercios.push(nuevoComercio);
        nuevoUsuario.comercioId = nuevoComercioId;
    }

    TodoTala.guardarDatos(datos);
    return nuevoUsuario;
};

TodoTala.generarCodigo = function () {
    const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let codigo = "TT-";

    for (let i = 0; i < 6; i += 1) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    return codigo;
};

TodoTala.claseEstado = function (estado) {
    if (estado === "Listo para retirar" || estado === "Entregado") {
        return "badge badge--success";
    }

    if (estado === "Rechazado" || estado === "Cancelado") {
        return "badge badge--danger";
    }

    if (estado === "Pendiente" || estado === "Aceptado" || estado === "En preparación") {
        return "badge badge--warning";
    }

    return "badge";
};

TodoTala.reiniciarDemo = function () {
    TodoTala.guardarDatos(TodoTala.crearDatosIniciales());
    TodoTala.toast("Datos de demostración reiniciados", "success");
};
