(function () {
    "use strict";

    const token = obtenerToken();
    const usuario = obtenerUsuario();

    const lista = document.getElementById("lista-notificaciones");
    const contador = document.getElementById("contador-no-leidas");
    const estado = document.getElementById("estado-notificaciones");
    const botonLeerTodas = document.getElementById("btn-leer-todas");
    const estadoPreferencias = document.getElementById("estado-preferencias");

    const camposPreferencias = {
        pedidos_nuevos: document.getElementById("pref-pedidos-nuevos"),
        pedidos_cancelados: document.getElementById("pref-pedidos-cancelados"),
        estados_pedido: document.getElementById("pref-estados-pedido")
    };

    let guardandoPreferencias = false;

    function escaparHTML(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, function (caracter) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[caracter];
        });
    }

    function fechaLegible(fecha) {
        const valor = new Date(fecha);

        if (Number.isNaN(valor.getTime())) {
            return "Fecha no disponible";
        }

        return valor.toLocaleString("es-UY", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    }

    function nombreTipo(tipo) {
        const nombres = {
            pedido_nuevo: "Pedido nuevo",
            pedido_cancelado: "Pedido cancelado",
            estado_pedido: "Cambio de estado",
            general: "Aviso"
        };

        return nombres[tipo] || "Aviso";
    }

    function crearNavegacion() {
        const nav = document.getElementById("notificaciones-nav");

        const enlacesCliente = [
            ["Inicio", "../pantalla_inicio/todo_tala_pantalla_inicio.html"],
            ["Buscar", "../resultados_busqueda/todo_tala_resultados_busqueda.html"],
            ["Catálogo", "../catalogo_cliente/todo_tala_catalogo_cliente.html"],
            ["Pedidos", "../mis_pedidos/todo_tala_mis_pedidos.html"],
            ["Favoritos", "../favoritos_cliente/todo_tala_favoritos.html"],
            ["Notificaciones", "todo_tala_notificaciones.html"],
            ["Perfil", "../perfil_cliente/tala_perfil_cliente.html"]
        ];

        const enlacesComercio = [
            ["Panel", "../panel_comercio/todo_tala_panel_comercio.html"],
            ["Productos", "../gestionar_productos/todo_tala_gestion_productos.html"],
            ["Pedidos", "../pedidos_recibidos/todo_tala_pedidos_recibidos.html"],
            ["Categorías", "../gestionar_categorias/todo_tala_gestion_categorias.html"],
            ["Promociones", "../gestionar_promociones/todo_tala_gestion_promociones.html"],
            ["Notificaciones", "todo_tala_notificaciones.html"]
        ];

        const enlaces = usuario.rol === "cliente"
            ? enlacesCliente
            : enlacesComercio;

        nav.innerHTML = enlaces.map(function (enlace) {
            const activo = enlace[0] === "Notificaciones";

            return '<a href="' + enlace[1] + '"' +
                (activo ? ' class="active" aria-current="page"' : "") +
                '>' + enlace[0] + '</a>';
        }).join("");
    }

    async function solicitarAPI(metodo, datos) {
        const opciones = {
            method: metodo,
            headers: {
                "Authorization": "Bearer " + token
            }
        };

        if (datos) {
            opciones.headers["Content-Type"] = "application/json";
            opciones.body = JSON.stringify(datos);
        }

        const respuesta = await fetch(NOTIFICACIONES_URL, opciones);
        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(resultado.error || "No se pudo completar la solicitud.");
        }

        return resultado;
    }

    function mostrarNotificaciones(notificaciones) {
        if (!notificaciones.length) {
            lista.innerHTML =
                '<p class="notification-empty">Todavía no tenés notificaciones.</p>';
            return;
        }

        lista.innerHTML = notificaciones.map(function (notificacion) {
            const leida = Number(notificacion.leida) === 1;

            return `
                <article class="notification-item ${leida ? "" : "unread"}">
                    <div class="notification-heading">
                        <strong>${escaparHTML(nombreTipo(notificacion.tipo))}</strong>
                        ${leida ? "" : '<span class="notification-type">Sin leer</span>'}
                    </div>
                    <p class="notification-message">${escaparHTML(notificacion.mensaje)}</p>
                    <div class="notification-meta">
                        <time>${escaparHTML(fechaLegible(notificacion.fecha))}</time>
                        ${leida ? "" : `
                            <button class="btn btn--secondary"
                                type="button"
                                data-leer="${Number(notificacion.id_notificacion)}">
                                Marcar como leída
                            </button>
                        `}
                    </div>
                </article>
            `;
        }).join("");
    }

    function mostrarPreferencias(preferencias) {
        Object.keys(camposPreferencias).forEach(function (campo) {
            camposPreferencias[campo].checked =
                Number(preferencias[campo]) === 1;
        });
    }

    async function cargarNotificaciones(mostrarCarga) {
        if (mostrarCarga) {
            estado.textContent = "Cargando notificaciones...";
        }

        try {
            const datos = await solicitarAPI("GET");

            mostrarNotificaciones(datos.notificaciones || []);

            const cantidad = Number(datos.sin_leer || 0);
            contador.textContent = cantidad + (cantidad === 1 ? " sin leer" : " sin leer");

            botonLeerTodas.disabled = cantidad === 0;

            mostrarPreferencias(datos.preferencias || {
                pedidos_nuevos: 1,
                pedidos_cancelados: 1,
                estados_pedido: 1
            });

            estado.textContent = "";
        } catch (error) {
            estado.textContent = error.message;
        }
    }

    async function marcarLeida(id) {
        try {
            await solicitarAPI("PUT", {
                accion: "leer",
                id_notificacion: id
            });

            await cargarNotificaciones(false);
        } catch (error) {
            estado.textContent = error.message;
        }
    }

    async function marcarTodasLeidas() {
        botonLeerTodas.disabled = true;

        try {
            await solicitarAPI("PUT", {
                accion: "leer_todas"
            });

            await cargarNotificaciones(false);
        } catch (error) {
            estado.textContent = error.message;
            botonLeerTodas.disabled = false;
        }
    }

    async function guardarPreferencias() {
        if (guardandoPreferencias) {
            return;
        }

        guardandoPreferencias = true;
        estadoPreferencias.textContent = "Guardando preferencias...";

        const valores = {
            accion: "preferencias",
            pedidos_nuevos: camposPreferencias.pedidos_nuevos.checked,
            pedidos_cancelados: camposPreferencias.pedidos_cancelados.checked,
            estados_pedido: camposPreferencias.estados_pedido.checked
        };

        try {
            await solicitarAPI("PUT", valores);
            estadoPreferencias.textContent = "Preferencias guardadas.";
        } catch (error) {
            estadoPreferencias.textContent = error.message;
            await cargarNotificaciones(false);
        } finally {
            guardandoPreferencias = false;
        }
    }

    if (!token || !usuario) {
        estado.textContent = "No hay una sesión activa.";
        return;
    }

    crearNavegacion();

    // Cada rol ve únicamente las preferencias que le corresponden.
    const opcionesPreferencias = document.querySelectorAll(".preference-option");

    if (usuario.rol === "cliente") {
        opcionesPreferencias[0].style.display = "none";

        opcionesPreferencias[1].querySelector("strong").textContent =
            "Cancelaciones y rechazos";

        opcionesPreferencias[1].querySelector("small").textContent =
            "Cuando el comercio cancela o rechaza tu pedido.";

        opcionesPreferencias[2].querySelector("small").textContent =
            "Cuando el comercio actualiza el estado de tu pedido.";
    } else {
        opcionesPreferencias[2].style.display = "none";

        opcionesPreferencias[1].querySelector("small").textContent =
            "Cuando un cliente cancela un pedido o el comercio lo rechaza.";
    }
    lista.addEventListener("click", function (evento) {
        const boton = evento.target.closest("[data-leer]");

        if (boton) {
            marcarLeida(Number(boton.dataset.leer));
        }
    });

    botonLeerTodas.addEventListener("click", marcarTodasLeidas);

    Object.values(camposPreferencias).forEach(function (campo) {
        campo.addEventListener("change", guardarPreferencias);
    });

    cargarNotificaciones(true);

    // Actualiza el historial y el contador cada 30 segundos.
    window.setInterval(function () {
        if (!document.hidden && !guardandoPreferencias) {
            cargarNotificaciones(false);
        }
    }, 30000);
})();