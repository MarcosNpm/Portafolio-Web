
"use strict";

/* ==========================================
   DESTORNILLADOR PIXEL ART - EMAIL
   ========================================== */

(() => {
    if (window.__destornilladorMail) return;
    window.__destornilladorMail = true;

    const esperar = (ms) =>
        new Promise(resolve => setTimeout(resolve, ms));

    let animando = false;

    /* ==========================================
       CREAR DESTORNILLADOR
       ========================================== */

    function crearDestornillador() {
        const elemento = document.createElement("div");

        elemento.className = "mail-destornillador";

        const sombra = elemento.attachShadow({ mode: "open" });

        sombra.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 64px;
                    height: 150px;
                    pointer-events: none;
                }

                svg {
                    display: block;
                    width: 100%;
                    height: 100%;
                    image-rendering: pixelated;
                    overflow: visible;
                    filter: drop-shadow(3px 3px 0 #101021);
                }

                @media (max-width: 600px) {
                    :host {
                        width: 44px;
                        height: 105px;
                    }
                }
            </style>

            <svg
                viewBox="0 0 64 150"
                xmlns="http://www.w3.org/2000/svg"
                shape-rendering="crispEdges"
                aria-hidden="true"
            >
                <!-- Mango -->
                <path
                    fill="#101021"
                    d="M17 0H47V9H53V55H47V65H17V55H11V9H17Z"
                />

                <path
                    fill="#8B5CF6"
                    d="M19 4H45V12H49V53H45V61H19V53H15V12H19Z"
                />

                <!-- Agarre -->
                <path
                    fill="#5B21B6"
                    d="M15 17H49V24H15ZM15 37H49V44H15Z"
                />

                <path
                    fill="#2DD4BF"
                    d="M19 8H26V56H19Z"
                />

                <!-- Cuello -->
                <path
                    fill="#101021"
                    d="M24 65H40V76H24Z"
                />

                <path
                    fill="#C7D2E0"
                    d="M28 65H36V76H28Z"
                />

                <!-- Varilla metálica -->
                <path
                    fill="#101021"
                    d="M26 76H38V132H26Z"
                />

                <path
                    fill="#94A3B8"
                    d="M29 76H35V132H29Z"
                />

                <path
                    fill="#E2E8F0"
                    d="M29 76H31V132H29Z"
                />

                <!-- Punta -->
                <path
                    fill="#101021"
                    d="M26 132H38V140H35V148H29V140H26Z"
                />

                <path
                    fill="#CBD5E1"
                    d="M29 132H35V140H33V146H31V140H29Z"
                />
            </svg>
        `;

        return elemento;
    }

    /* ==========================================
       CREAR GRIETAS
       ========================================== */

    function crearGrietas(rect) {
        const grietas = document.createElement("div");

        grietas.className = "mail-grietas";

        Object.assign(grietas.style, {
            position: "fixed",
            left: `${rect.left}px`,
            top: `${rect.top}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            zIndex: "99998",
            pointerEvents: "none"
        });

        grietas.innerHTML = `
            <svg
                viewBox="0 0 200 60"
                preserveAspectRatio="none"
                width="100%"
                height="100%"
                aria-hidden="true"
            >
                <path
                    d="M100 0 L91 17 L108 25 L87 40 L98 60
                       M91 17 L65 10 L55 0
                       M108 25 L143 13 L165 17
                       M87 40 L52 48 L38 60
                       M108 25 L132 43 L155 60"
                    fill="none"
                    stroke="#F3F1FF"
                    stroke-width="2.5"
                    stroke-linecap="square"
                />
                <path
                    d="M100 0 L91 17 L108 25 L87 40 L98 60"
                    fill="none"
                    stroke="#101021"
                    stroke-width="1"
                />
            </svg>
        `;

        return grietas;
    }

    /* ==========================================
       ABRIR CORREO
       ========================================== */

   function abrirCorreo(enlace) {
    const correo = enlace.href.replace(/^mailto:/i, "").split("?")[0];

    const gmail = new URL(
        "https://mail.google.com/mail/?view=cm&fs=1"
    );

    gmail.searchParams.set("to", correo);
    gmail.searchParams.set("su", "Consulta por reparación");
    gmail.searchParams.set(
        "body",
        "¡Hola! Quisiera consultar por una reparación."
    );

    window.location.href = gmail.toString();
}

    /* ==========================================
       ANIMACIÓN PRINCIPAL
       ========================================== */

    async function animarMail(enlace) {
        const rect = enlace.getBoundingClientRect();

        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const destornillador = crearDestornillador();

        Object.assign(destornillador.style, {
            position: "fixed",
            left: `${x}px`,
            top: `${y}px`,
            zIndex: "99999",
            pointerEvents: "none"
        });

        document.body.appendChild(destornillador);

        const altura =
            destornillador.getBoundingClientRect().height;

        const inicio = `translate(-50%, ${-(y + altura)}px)`;
        const impacto = "translate(-50%, -100%)";

        let abierto = false;

        function abrirUnaVez() {
            if (abierto) return;
            abierto = true;
            abrirCorreo(enlace);
        }

        let grietas = null;

        try {
            /* 1. CAE EL DESTORNILLADOR */

            await destornillador.animate(
                [
                    { transform: inicio },
                    { transform: impacto }
                ],
                {
                    duration: 650,
                    easing: "cubic-bezier(.5, 0, .9, .5)",
                    fill: "forwards"
                }
            ).finished;

            /* 2. IMPACTO */

            enlace.classList.add("mail-impacto");

            grietas = crearGrietas(
                enlace.getBoundingClientRect()
            );

            document.body.appendChild(grietas);

            await grietas.animate(
                [
                    { opacity: 0, transform: "scale(.4)" },
                    { opacity: 1, transform: "scale(1)" }
                ],
                {
                    duration: 220,
                    easing: "steps(5, end)",
                    fill: "forwards"
                }
            ).finished;

            /* 3. EFECTO DE ROTURA */

            enlace.classList.add("mail-roto");

            await esperar(300);

            /* 4. ABRIR EMAIL */

            abrirUnaVez();

        } catch (error) {
            console.error("[Destornillador mail]", error);
            abrirUnaVez();

        } finally {
            enlace.classList.remove(
                "mail-impacto",
                "mail-roto"
            );

            destornillador.remove();
            grietas?.remove();

            animando = false;
        }
    }

    /* ==========================================
       CONTROLADOR DE CLIC
       ========================================== */

    document.addEventListener("click", async evento => {
        const enlace = evento.target.closest(
            "a.mail-reparacion"
        );

        if (!enlace) return;

        if (
            evento.button !== 0 ||
            evento.ctrlKey ||
            evento.metaKey ||
            evento.shiftKey ||
            evento.altKey
        ) return;

        if (!enlace.href.startsWith("mailto:")) return;

        evento.preventDefault();

        if (animando) return;

        if (
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {
            abrirCorreo(enlace);
            return;
        }

        animando = true;

        await animarMail(enlace);

    }, true);

    console.log(
        "[Destornillador mail] Inicializado correctamente"
    );
})();
