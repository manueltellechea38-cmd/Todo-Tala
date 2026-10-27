const CLAVE_TEMA =
    "tema-todo-tala";


function obtenerTema() {

    const guardado =
        localStorage.getItem(
            CLAVE_TEMA
        );

    if (
        guardado === "claro" ||
        guardado === "oscuro"
    ) {
        return guardado;
    }

    return "oscuro";
}


function actualizarBotonTema(
    boton,
    tema
) {

    if (tema === "oscuro") {

        boton.textContent =
            "☀ Modo claro";

        boton.setAttribute(
            "aria-label",
            "Activar modo claro"
        );

    } else {

        boton.textContent =
            "☾ Modo oscuro";

        boton.setAttribute(
            "aria-label",
            "Activar modo oscuro"
        );
    }
}


function aplicarTema(
    tema,
    boton
) {

    document.documentElement
        .setAttribute(
            "data-tema",
            tema
        );

    localStorage.setItem(
        CLAVE_TEMA,
        tema
    );

    if (boton) {
        actualizarBotonTema(
            boton,
            tema
        );
    }
}


function crearBotonTema() {

    const existente =
        document.getElementById(
            "btn-tema-global"
        );

    if (existente) {
        return existente;
    }


    const boton =
        document.createElement(
            "button"
        );

    boton.id =
        "btn-tema-global";

    boton.type =
        "button";

    boton.className =
        "theme-toggle";


    const barra =
        document.createElement(
            "section"
        );

    barra.className =
        "theme-toolbar";


    barra.appendChild(
        boton
    );


    const tarjeta =
        document.querySelector(
            ".app-card"
        );


    if (tarjeta) {

        tarjeta.insertBefore(
            barra,
            tarjeta.firstChild
        );

    } else {

        document.body.prepend(
            barra
        );
    }


    boton.addEventListener(
        "click",
        function () {

            const actual =
                document.documentElement
                    .getAttribute(
                        "data-tema"
                    );

            const nuevo =
                actual === "oscuro"
                    ? "claro"
                    : "oscuro";

            aplicarTema(
                nuevo,
                boton
            );
        }
    );


    return boton;
}


function iniciarTema() {

    const boton =
        crearBotonTema();

    aplicarTema(
        obtenerTema(),
        boton
    );
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarTema
    );

} else {

    iniciarTema();
}