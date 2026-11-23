
"use strict";

// ==========================================
// 1. ANIMACIONES AL HACER SCROLL
// ==========================================

(function () {
    const elementos = document.querySelectorAll(
        ".rows, .dl, .proj, .tl, .edu"
    );

    const secciones = document.querySelectorAll("section[id]");

    // Compatibilidad con navegadores antiguos
    if (!("IntersectionObserver" in window)) {
        elementos.forEach((elemento) => {
            elemento.classList.add("in");
        });

        secciones.forEach((seccion) => {
            seccion.classList.add("in");
        });

        return;
    }

    // Crea un observador reutilizable
    function crearObservador(opciones) {
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("in");
                    observador.unobserve(entrada.target);
                }
            });
        }, opciones);

        return observador;
    }

    // Observador para elementos
    const observadorElementos = crearObservador({
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px"
    });

    // Observador para secciones
    const observadorSecciones = crearObservador({
        threshold: 0,
        rootMargin: "0px 0px -12% 0px"
    });

    elementos.forEach((elemento) => {
        observadorElementos.observe(elemento);
    });

    secciones.forEach((seccion) => {
        observadorSecciones.observe(seccion);
    });
})();


// ==========================================
// 2. CAMBIO DE TEMA CLARO / OSCURO
// ==========================================

(function () {
    const botonTema = document.getElementById("tg");

    if (!botonTema) return;

    const raiz = document.documentElement;

    // Obtiene el tema actual
    function obtenerTema() {
        const tema = raiz.getAttribute("data-theme");

        if (tema) return tema;

        const prefiereOscuro =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;

        return prefiereOscuro ? "dark" : "light";
    }

    // Actualiza el estado visual del botón
    function actualizarBoton() {
        botonTema.setAttribute("data-mode", obtenerTema());
    }

    actualizarBoton();

    // Alterna entre modo claro y oscuro
    botonTema.addEventListener("click", () => {
        const nuevoTema =
            obtenerTema() === "dark" ? "light" : "dark";

        raiz.setAttribute("data-theme", nuevoTema);

        // Guarda la preferencia del usuario
        try {
            localStorage.setItem("tema", nuevoTema);
        } catch (error) {
            // El almacenamiento puede estar deshabilitado
        }

        actualizarBoton();
    });
})();


// ==========================================
// 3. EFECTO DE FONDO SEGÚN EL SCROLL
// ==========================================

(function () {
    const fondo = document.querySelector(".bgfx");

    if (!fondo) return;

    // Respeta las preferencias de accesibilidad
    const movimientoReducido =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (movimientoReducido) return;

    let actualizacionPendiente = false;

    // Calcula el progreso del desplazamiento
    function actualizarFondo() {
        actualizacionPendiente = false;

        const documento = document.documentElement;

        const alturaTotal =
            documento.scrollHeight - window.innerHeight;

        const posicion =
            window.pageYOffset || documento.scrollTop;

        const progreso = alturaTotal > 0
            ? Math.min(1, Math.max(0, posicion / alturaTotal))
            : 0;

        fondo.style.setProperty(
            "--p",
            progreso.toFixed(4)
        );
    }

    // Optimiza las actualizaciones con requestAnimationFrame
    function solicitarActualizacion() {
        if (actualizacionPendiente) return;

        actualizacionPendiente = true;
        requestAnimationFrame(actualizarFondo);
    }

    window.addEventListener("scroll", solicitarActualizacion, {
        passive: true
    });

    window.addEventListener("resize", solicitarActualizacion);

    actualizarFondo();
})();


// ==========================================
// 4. NAVEGACIÓN ACTIVA SEGÚN LA SECCIÓN
// ==========================================

(function () {
    if (!("IntersectionObserver" in window)) return;

    const enlaces = document.querySelectorAll("nav a");

    const secciones = document.querySelectorAll(
        ".hero, section[id]"
    );

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;

            const id = entrada.target.id || "hero";

            // Identifica la sección visible
            document.body.setAttribute("data-sec", id);

            // Actualiza los enlaces de navegación
            enlaces.forEach((enlace) => {
                const esActivo =
                    enlace.getAttribute("href") === `#${id}`;

                if (esActivo) {
                    enlace.setAttribute("aria-current", "true");
                } else {
                    enlace.removeAttribute("aria-current");
                }
            });
        });
    }, {
        rootMargin: "-45% 0px -54% 0px"
    });

    secciones.forEach((seccion) => {
        observador.observe(seccion);
    });
})();

/* ==========================================
   5. SCROLL HORIZONTAL AUTOMÁTICO DEL NAVBAR
   ========================================== */

(function () {
    const nav = document.querySelector("nav[aria-label='Principal']");
    if (!nav) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = null;
    let direction = 0;
    let lastTime = null;

    function stop() {
        direction = 0;
        lastTime = null;

        if (frame !== null) {
            cancelAnimationFrame(frame);
        }

        frame = null;
    }

    function tick(time) {
        if (
            !direction ||
            reducedMotion.matches ||
            nav.scrollWidth <= nav.clientWidth + 1
        ) {
            stop();
            return;
        }

        const dt = lastTime === null
            ? 0
            : Math.min(time - lastTime, 50);

        lastTime = time;

        const max = nav.scrollWidth - nav.clientWidth;

        nav.scrollLeft = Math.max(
            0,
            Math.min(
                max,
                nav.scrollLeft + direction * 110 * dt / 1000
            )
        );

        if (
            (direction < 0 && nav.scrollLeft <= 0) ||
            (direction > 0 && nav.scrollLeft >= max - 1)
        ) {
            stop();
            return;
        }

        frame = requestAnimationFrame(tick);
    }

    nav.addEventListener("pointermove", (event) => {
        if (
            event.pointerType === "touch" ||
            reducedMotion.matches ||
            nav.scrollWidth <= nav.clientWidth + 1
        ) {
            stop();
            return;
        }

        const rect = nav.getBoundingClientRect();
        const edge = Math.min(85, rect.width * 0.25);
        const x = event.clientX - rect.left;

        const next = x < edge
            ? -1
            : x > rect.width - edge
                ? 1
                : 0;

        if (next === direction) return;

        stop();
        direction = next;

        if (direction) {
            frame = requestAnimationFrame(tick);
        }
    });

    nav.addEventListener("pointerleave", stop);
    nav.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);

    window.addEventListener("resize", () => {
        if (nav.scrollWidth <= nav.clientWidth + 1) {
            stop();
        }
    });

    reducedMotion.addEventListener?.("change", stop);
})();

/* ==========================================
   ALTURA DINÁMICA DE CONTACTO
   ========================================== */

(function () {
    const navbar = document.querySelector(".bar");

    if (!navbar) return;

    function actualizarAltura() {
        const altura = navbar.getBoundingClientRect().height;

        document.documentElement.style.setProperty(
            "--navbar-height",
            `${altura}px`
        );
    }

    actualizarAltura();

    window.addEventListener("resize", actualizarAltura);

    if ("ResizeObserver" in window) {
        new ResizeObserver(actualizarAltura).observe(navbar);
    }
})();
