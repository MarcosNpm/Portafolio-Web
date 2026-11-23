
"use strict";

/* ==========================================
   SELLO CV - MANO PIXEL ART
   ========================================== */

(() => {
    if (window.__selloCVInicializado) return;
    window.__selloCVInicializado = true;

    const movimientoReducido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    let animando = false;

    const esperar = (ms) =>
        new Promise(resolve => setTimeout(resolve, ms));

    /* ==========================================
       DESCARGAR CV
       ========================================== */

    function descargarCV(boton) {
        const enlace = document.createElement("a");

        enlace.href = boton.href;
        enlace.download =
            boton.getAttribute("download") || "CV.pdf";

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
    }

    /* ==========================================
       CREAR MANO PIXEL ART
       ========================================== */

    function crearMano() {
        const mano = document.createElement("div");

        mano.className = "cv-escena";

        const sombra = mano.attachShadow({
            mode: "open"
        });

        sombra.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 64px;
                    height: 90px;
                    pointer-events: none;
                }

                svg {
                    display: block;
                    width: 100%;
                    height: 100%;
                    overflow: visible;
                    image-rendering: pixelated;
                    filter: drop-shadow(
                        2px 2px 0 #101021
                    );
                }

                @media (max-width: 600px) {
                    :host {
                        width: 48px;
                        height: 68px;
                    }
                }
            </style>

            <svg
                viewBox="0 0 128 180"
                xmlns="http://www.w3.org/2000/svg"
                shape-rendering="crispEdges"
                aria-hidden="true"
            >
                <!-- Manga -->
                <path
                    fill="#101021"
                    d="M42 0H94V72H42Z"
                />

                <path
                    fill="#8B5CF6"
                    d="M42 0H50V72H42ZM86 0H94V72H86Z"
                />

                <!-- Puño -->
                <path
                    fill="#2DD4BF"
                    d="M38 64H98V80H38Z"
                />

                <!-- Contorno de la mano -->
                <path
                    fill="#101021"
                    d="M38 78H94V88H106V116H96V132H46V122H34V94H38Z"
                />

                <!-- Piel -->
                <path
                    fill="#F0B78D"
                    d="M46 80H88V92H98V114H88V124H50V114H42V94H46Z"
                />

                <!-- Dedos -->
                <path
                    fill="#D68C68"
                    d="M50 92H58V116H50ZM64 92H72V116H64ZM78 92H86V112H78Z"
                />

                <!-- Mango del sello -->
                <path
                    fill="#101021"
                    d="M58 116H78V150H58Z"
                />

                <path
                    fill="#8B5CF6"
                    d="M62 120H74V146H62Z"
                />

                <!-- Base del sello -->
                <path
                    fill="#101021"
                    d="M28 146H108V174H28Z"
                />

                <path
                    fill="#2DD4BF"
                    d="M32 150H104V170H32Z"
                />

                <path
                    fill="#101021"
                    d="M38 156H98V164H38Z"
                />
            </svg>
        `;

        return mano;
    }

    /* ==========================================
       CAMBIAR BOTÓN A OBTENIDO
       ========================================== */

    function marcarObtenido(boton) {
        if (!boton.dataset.textoOriginal) {
            boton.dataset.textoOriginal =
                boton.textContent.trim();
        }

        boton.textContent = "★ OBTENIDO ★";
        boton.classList.add("cv-obtenido");
    }

    /* ==========================================
       ANIMACIÓN PRINCIPAL
       ========================================== */

    async function animarDescarga(boton) {
        const rect = boton.getBoundingClientRect();

        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const mano = crearMano();

        Object.assign(mano.style, {
            position: "fixed",
            zIndex: "99999",
            left: `${x}px`,
            top: `${y}px`,
            pointerEvents: "none"
        });

        document.body.appendChild(mano);

        const alturaMano =
            mano.getBoundingClientRect().height;

        /*
         * El SVG mide 180 unidades de alto.
         * La base visible del sello termina en Y = 174.
         *
         * El objetivo es que esa base coincida
         * con el centro vertical del botón.
         */

        const porcentajeBase = (174 / 180) * 100;

        // Posición inicial: fuera de la pantalla.
        const inicio =
            `translate(-50%, ${-(y + alturaMano)}px)`;

        // Posición de impacto: base sobre el botón.
        const impacto =
            `translate(-50%, -${porcentajeBase}%)`;

        let descargado = false;

        function descargarUnaVez() {
            if (descargado) return;

            descargado = true;
            descargarCV(boton);
        }

        try {
            /* ==================================
               1. BAJAR LA MANO
               ================================== */

            const bajada = mano.animate(
                [
                    {
                        transform: inicio,
                        opacity: 1
                    },
                    {
                        transform: impacto,
                        opacity: 1
                    }
                ],
                {
                    duration: 850,
                    easing: "steps(12, end)",
                    fill: "forwards"
                }
            );

            await bajada.finished;

            /* ==================================
               2. IMPACTO EN EL BOTÓN
               ================================== */

            boton.classList.add("cv-temblor");

            marcarObtenido(boton);

            await esperar(350);

            boton.classList.remove("cv-temblor");

            /* ==================================
               3. RETIRAR LA MANO
               ================================== */

            // Cancelar la bajada antes de iniciar
            // la animación de retirada.
            bajada.cancel();

            const retirada = mano.animate(
                [
                    {
                        transform: impacto,
                        opacity: 1
                    },
                    {
                        transform: inicio,
                        opacity: 1
                    }
                ],
                {
                    duration: 500,
                    easing: "steps(10, end)",
                    fill: "forwards"
                }
            );

            await retirada.finished;

            /* ==================================
               4. DESCARGAR CV
               ================================== */

            await esperar(200);

            descargarUnaVez();

        } catch (error) {
            console.error(
                "[Sello CV] Error en la animación:",
                error
            );

            marcarObtenido(boton);
            descargarUnaVez();

        } finally {
            boton.classList.remove("cv-temblor");

            mano.remove();

            animando = false;
        }
    }

    /* ==========================================
       CONTROLADOR DE CLICS
       ========================================== */

    document.addEventListener(
        "click",
        async (evento) => {
            const boton = evento.target.closest(
                "a.dl-cv"
            );

            if (!boton) return;

            // Permitir clic derecho y combinaciones
            // de teclado normales del navegador.
            if (
                evento.button !== 0 ||
                evento.ctrlKey ||
                evento.metaKey ||
                evento.shiftKey ||
                evento.altKey
            ) {
                return;
            }

            evento.preventDefault();

            // Evitar animaciones simultáneas.
            if (animando) return;

            // Accesibilidad: sin animación.
            if (movimientoReducido.matches) {
                marcarObtenido(boton);
                descargarCV(boton);
                return;
            }

            animando = true;

            await animarDescarga(boton);
        },
        true
    );

    console.log(
        "[Sello CV] Sistema inicializado correctamente"
    );
})();
