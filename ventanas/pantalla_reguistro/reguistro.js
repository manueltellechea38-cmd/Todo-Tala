// Busca el botón "Cliente" en el HTML y guarda una referencia para poder manipularlo.
const btnCliente = document.getElementById("btn-cliente");

// Busca el botón "Comercio" en el HTML y guarda una referencia.
const btnComercio = document.getElementById("btn-comercio");

// Busca el contenedor que contiene los campos exclusivos para comercios.
const camposComercio = document.getElementById("campos-comercio");

// Cuando el usuario hace clic en el botón "Cliente",
// se llama a la función cambiarTipo() enviando "cliente".
btnCliente.addEventListener("click", () => cambiarTipo("cliente"));

// Cuando el usuario hace clic en el botón "Comercio",
// se llama a la función cambiarTipo() enviando "comercio".
btnComercio.addEventListener("click", () => cambiarTipo("comercio"));

// Función encargada de cambiar la interfaz según
// el tipo de usuario seleccionado.
function cambiarTipo(tipo){

    // Comprueba si el tipo seleccionado es "cliente".
    if(tipo === "cliente"){

        // Agrega la clase "active" al botón Cliente
        // para indicar que está seleccionado.
        btnCliente.classList.add("active");

        // Quita la clase "active" del botón Comercio.
        btnComercio.classList.remove("active");

        // Oculta los campos exclusivos para comercios.
        camposComercio.style.display = "none";

    }else{

        // Agrega la clase "active" al botón Comercio.
        btnComercio.classList.add("active");

        // Quita la clase "active" del botón Cliente.
        btnCliente.classList.remove("active");

        // Muestra los campos exclusivos para comercios.
        camposComercio.style.display = "block";

    }

}

// Arreglo que almacena los correos ya registrados.
// Se utiliza para simular una validación de duplicados.
const correosExistentes = [
    "manueltellechea38@gmail.com",
    "elias141744388@gmail.com"
];

// Obtiene el campo donde el usuario escribe el correo.
const email = document.getElementById("email-input");

// Obtiene el elemento que mostrará el mensaje de error.
const error = document.getElementById("email-error");

// Cada vez que el usuario escribe, borra o pega texto
// en el campo de correo, se ejecuta esta función.
email.addEventListener("input", () => {

    // Obtiene el correo ingresado, elimina espacios al
    // principio y al final y lo convierte a minúsculas.
    const valor = email.value.trim().toLowerCase();

    // Comprueba si el correo ingresado ya existe
    // dentro del arreglo de correos registrados.
    if(correosExistentes.includes(valor)){

        // Si existe, muestra el mensaje de error.
        error.style.display = "flex";

    }else{

        // Si no existe, oculta el mensaje de error.
        error.style.display = "none";

    }

});
