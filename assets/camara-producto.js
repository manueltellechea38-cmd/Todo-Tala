(function () {
    "use strict";

    const inputImagen = document.getElementById("imagen");

    if (!inputImagen) return;

    const estilos = document.createElement("style");

    estilos.textContent = `
        .camera-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 8px 0;
        }

        .camera-actions button,
        .camera-dialog button {
            min-height: 42px;
            padding: 10px 16px;
            border: 1px solid var(--color-border, #ccc);
            border-radius: 9px;
            background: var(--superficie-2, #f3f3f3);
            color: var(--color-texto, inherit);
            font: inherit;
            cursor: pointer;
        }

        .camera-dialog__buttons button {
            color: #172033;
            background: #e8edf5;
            border: 1px solid #b8c3d1;
            font-weight: 600;
            opacity: 1;
        }

        .camera-dialog__buttons .camera-capture,
        .camera-dialog__buttons .camera-confirm {
            color: #ffffff;
            background: #2457c5;
            border-color: #2457c5;
        }

        .camera-dialog__buttons button:hover {
            filter: brightness(0.93);
        }

        .camera-dialog__buttons button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .camera-dialog__buttons button[hidden] {
            display: none;
        }

        .camera-actions .camera-choose,
        .camera-dialog .camera-confirm {
            background: var(--color-primary, #2457c5);
            color: white;
            border-color: transparent;
        }

        .camera-dialog[hidden] {
            display: none;
        }

        .camera-dialog {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: grid;
            place-items: center;
            padding: 16px;
            background: rgba(0, 0, 0, .72);
        }

        .camera-dialog__panel {
            width: min(100%, 560px);
            max-height: 90vh;
            overflow: auto;
            padding: 18px;
            border-radius: 16px;
            background: var(--superficie, white);
            color: var(--color-texto, #222);
        }

        .camera-dialog__panel h2 {
            margin-top: 0;
        }

        .camera-dialog video,
        .camera-dialog canvas {
            display: block;
            width: 100%;
            max-height: 55vh;
            object-fit: contain;
            border-radius: 10px;
            background: #111;
        }

        .camera-dialog__buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 14px;
        }

        .camera-dialog__message {
            min-height: 1.4em;
            color: var(--color-muted, #666);
        }

        @media (max-width: 480px) {
            .camera-actions button,
            .camera-dialog button {
                flex: 1 1 100%;
            }
        }
    `;

    document.head.appendChild(estilos);

    const acciones = document.createElement("div");
    acciones.className = "camera-actions";

    const botonCamara = document.createElement("button");
    botonCamara.type = "button";
    botonCamara.textContent = "Tomar foto";

    const botonElegir = document.createElement("button");
    botonElegir.type = "button";
    botonElegir.className = "camera-choose";
    botonElegir.textContent = "Elegir imagen";

    acciones.append(botonCamara, botonElegir);
    inputImagen.insertAdjacentElement("beforebegin", acciones);

    inputImagen.accept = "image/jpeg,image/png,image/webp";
    inputImagen.hidden = true;

    const dialogo = document.createElement("section");
    dialogo.className = "camera-dialog";
    dialogo.hidden = true;
    dialogo.setAttribute("role", "dialog");
    dialogo.setAttribute("aria-modal", "true");
    dialogo.setAttribute("aria-labelledby", "camera-title");

    dialogo.innerHTML = `
        <div class="camera-dialog__panel">
            <h2 id="camera-title">Tomar foto del producto</h2>
            <video autoplay playsinline muted></video>
            <canvas hidden></canvas>
            <p class="camera-dialog__message" aria-live="polite">
                Preparando cámara...
            </p>
            <div class="camera-dialog__buttons">
                <button type="button" class="camera-capture">Sacar foto</button>
                <button type="button" class="camera-retake" hidden>Volver a intentar</button>
                <button type="button" class="camera-confirm" hidden>Usar esta foto</button>
                <button type="button" class="camera-cancel">Cancelar</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialogo);

    const video = dialogo.querySelector("video");
    const canvas = dialogo.querySelector("canvas");
    const mensaje = dialogo.querySelector(".camera-dialog__message");
    const botonCapturar = dialogo.querySelector(".camera-capture");
    const botonRepetir = dialogo.querySelector(".camera-retake");
    const botonConfirmar = dialogo.querySelector(".camera-confirm");
    const botonCancelar = dialogo.querySelector(".camera-cancel");

    let flujoCamara = null;
    let fotoCapturada = null;

    function detenerCamara() {
        if (flujoCamara) {
            flujoCamara.getTracks().forEach(function (pista) {
                pista.stop();
            });

            flujoCamara = null;
        }

        video.srcObject = null;
    }

    function cerrarCamara() {
        detenerCamara();
        dialogo.hidden = true;
        fotoCapturada = null;
    }

    function mostrarVideo() {
        video.hidden = false;
        canvas.hidden = true;
        botonCapturar.hidden = false;
        botonRepetir.hidden = true;
        botonConfirmar.hidden = true;
        mensaje.textContent = "Enfocá el producto y sacá la foto.";
    }

    async function abrirCamara() {
        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {
            alert(
                "Este navegador no permite acceder a la cámara. " +
                "Probá desde localhost o una página HTTPS, o elegí una imagen."
            );
            return;
        }

        dialogo.hidden = false;
        video.hidden = false;
        canvas.hidden = true;
        botonCapturar.hidden = false;
        botonRepetir.hidden = true;
        botonConfirmar.hidden = true;
        mensaje.textContent = "Solicitando permiso para usar la cámara...";
        botonCapturar.disabled = true;

        try {
            flujoCamara = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            video.srcObject = flujoCamara;
            await video.play();

            botonCapturar.disabled = false;
            mostrarVideo();
        } catch (error) {
            detenerCamara();
            mensaje.textContent =
                "No se pudo acceder a la cámara. Revisá los permisos del navegador.";

            botonCapturar.hidden = true;

            console.error("Error al abrir la cámara:", error);
        }
    }

    botonCamara.addEventListener("click", abrirCamara);

    botonElegir.addEventListener("click", function () {
        inputImagen.click();
    });

    botonCapturar.addEventListener("click", function () {
        if (!video.videoWidth || !video.videoHeight) {
            mensaje.textContent = "La cámara todavía no está lista.";
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const contexto = canvas.getContext("2d");

        contexto.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        video.hidden = true;
        canvas.hidden = false;
        botonCapturar.hidden = true;
        botonRepetir.hidden = false;
        botonConfirmar.hidden = false;

        detenerCamara();

        mensaje.textContent = "Revisá la foto antes de utilizarla.";
    });

    botonRepetir.addEventListener("click", function () {
        abrirCamara();
    });

    botonConfirmar.addEventListener("click", function () {
        canvas.toBlob(function (blob) {
            if (!blob) {
                mensaje.textContent = "No se pudo procesar la foto.";
                return;
            }

            if (blob.size > 2 * 1024 * 1024) {
                mensaje.textContent =
                    "La foto supera los 2 MB permitidos. " +
                    "Volvé a intentarlo con una resolución menor.";
                return;
            }

            fotoCapturada = new File(
                [blob],
                "foto-producto-" + Date.now() + ".jpg",
                { type: "image/jpeg" }
            );

            const transferencia = new DataTransfer();
            transferencia.items.add(fotoCapturada);
            inputImagen.files = transferencia.files;

            inputImagen.dispatchEvent(
                new Event("change", { bubbles: true })
            );

            cerrarCamara();
        }, "image/jpeg", 0.82);
    });

    botonCancelar.addEventListener("click", cerrarCamara);

    dialogo.addEventListener("click", function (evento) {
        if (evento.target === dialogo) {
            cerrarCamara();
        }
    });

    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape" && !dialogo.hidden) {
            cerrarCamara();
        }
    });

    window.addEventListener("pagehide", detenerCamara);
})();


