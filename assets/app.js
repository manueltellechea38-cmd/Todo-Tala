window.TodoTala = window.TodoTala || {};

TodoTala.STORAGE_KEY = "todoTalaDataV12";

TodoTala.crearDatosIniciales = function () {
    return {
        version: "1.2",
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
                localidad: "Tala",
                horario: "08:00 a 18:00",
                descripcion: "Almacén local con productos de consumo diario.",
                whatsapp: "099123456",
                correo: "contacto@laplaza.uy"
            },
            {
                id: 2,
                jefeId: null,
                nombre: "Ferretería Central",
                ruc: "219876540011",
                telefono: "098 555 221",
                direccion: "José Alonso y Trelles 245, Tala",
                localidad: "Tala",
                horario: "08:30 a 19:00",
                descripcion: "Herramientas y artículos para el hogar.",
                whatsapp: "098555221",
                correo: "ventas@ferreteriacentral.uy"
            },
            {
                id: 3,
                jefeId: null,
                nombre: "Tienda Horizonte",
                ruc: "216667770014",
                telefono: "092 310 440",
                direccion: "18 de Julio 410, Tala",
                localidad: "Tala",
                horario: "09:00 a 20:00",
                descripcion: "Indumentaria y accesorios de uso diario.",
                whatsapp: "092310440",
                correo: "hola@tiendahorizonte.uy"
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
                imagenTexto: "AR",
                localidad: "Tala"
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
                imagenTexto: "FI",
                localidad: "Tala"
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
                imagenTexto: "DE",
                localidad: "Tala"
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
                imagenTexto: "YE",
                localidad: "Tala"
            },
            {
                id: 5,
                comercioId: 2,
                comercio: "Ferretería Central",
                categoria: "Ferretería",
                nombre: "Martillo carpintero",
                marca: "Forte",
                precio: 490,
                precioAnterior: 560,
                descripcion: "Martillo de uso general con mango antideslizante.",
                stock: 11,
                visible: true,
                imagenTexto: "MC",
                localidad: "Tala"
            },
            {
                id: 6,
                comercioId: 2,
                comercio: "Ferretería Central",
                categoria: "Ferretería",
                nombre: "Cinta métrica 5 m",
                marca: "ProMed",
                precio: 275,
                precioAnterior: null,
                descripcion: "Cinta métrica retráctil de cinco metros.",
                stock: 4,
                visible: true,
                imagenTexto: "CM",
                localidad: "Tala"
            },
            {
                id: 7,
                comercioId: 3,
                comercio: "Tienda Horizonte",
                categoria: "Ropa",
                nombre: "Remera básica",
                marca: "Horizonte",
                precio: 690,
                precioAnterior: 790,
                descripcion: "Remera unisex de algodón, disponible en varios talles.",
                stock: 14,
                visible: true,
                imagenTexto: "RB",
                localidad: "Tala"
            },
            {
                id: 8,
                comercioId: 3,
                comercio: "Tienda Horizonte",
                categoria: "Ropa",
                nombre: "Gorra clásica",
                marca: "Horizonte",
                precio: 520,
                precioAnterior: null,
                descripcion: "Gorra regulable de uso diario.",
                stock: 7,
                visible: true,
                imagenTexto: "GC",
                localidad: "Tala"
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
            },
            {
                id: 2,
                comercioId: 2,
                nombre: "Martillo destacado",
                tipo: "precio",
                valor: 490,
                productoId: 5,
                inicio: "2026-09-12",
                fin: "2026-09-25",
                activa: true
            },
            {
                id: 3,
                comercioId: 3,
                nombre: "Semana de indumentaria",
                tipo: "precio",
                valor: 690,
                productoId: 7,
                inicio: "2026-09-14",
                fin: "2026-09-28",
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

TodoTala.estadoStock = function (producto) {
    if (producto.stock <= 0) {
        return { texto: "Sin stock", clase: "badge badge--danger" };
    }

    if (producto.stock <= 5) {
        return { texto: "Últimas " + producto.stock, clase: "badge badge--warning" };
    }

    return { texto: "Disponible", clase: "badge badge--success" };
};

TodoTala.cantidadCarrito = function () {
    const datos = TodoTala.obtenerDatos();
    return datos.carrito.reduce(function (total, item) {
        return total + item.cantidad;
    }, 0);
};

TodoTala.agregarAlCarrito = function (productoId, cantidad) {
    const datos = TodoTala.obtenerDatos();
    const producto = datos.productos.find(function (item) {
        return item.id === productoId;
    });

    if (!producto || producto.stock <= 0) {
        return false;
    }

    const cantidadSolicitada = Number(cantidad || 1);
    const existente = datos.carrito.find(function (item) {
        return item.id === productoId;
    });

    const cantidadActual = existente ? existente.cantidad : 0;
    const nuevaCantidad = cantidadActual + cantidadSolicitada;

    if (nuevaCantidad > producto.stock) {
        return false;
    }

    if (existente) {
        existente.cantidad = nuevaCantidad;
    } else {
        datos.carrito.push({ id: productoId, cantidad: cantidadSolicitada });
    }

    TodoTala.guardarDatos(datos);
    return true;
};

TodoTala.reiniciarDemo = function () {
    TodoTala.guardarDatos(TodoTala.crearDatosIniciales());
    TodoTala.toast("Datos de demostración reiniciados", "success");
};