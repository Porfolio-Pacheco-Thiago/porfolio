// Desplazamiento suave a una sección por id. Lo usan el Hero y el Navbar.
export function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

/** Cancela el desplazamiento en curso, si hay uno. */
let cancelarEnCurso = null;

/**
 * Lleva la ventana hasta `destino` en `ms`, con una curva que entra y sale suave.
 *
 * Existe porque **la duración del `behavior: 'smooth'` nativo la fija el
 * navegador**: no se puede alargar ni por CSS ni por la API. En Chrome son unos
 * 300ms, que sobre saltos largos se siente un tirón más que un desplazamiento.
 *
 * Cada llamada cancela la anterior, así dos clicks seguidos no se pelean por la
 * posición de la página.
 *
 * @param {number} destino  Posición final, en px desde el tope del documento.
 * @param {number} [ms=900]
 * @returns {() => void} Para cancelarlo desde afuera.
 */
export function desplazarA(destino, ms = 900) {
    cancelarEnCurso?.();

    const desde = window.scrollY;
    const delta = destino - desde;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Sin animación para quien pidió menos movimiento, y tampoco para saltos de
    // dos píxeles: animar eso solo agrega demora.
    if (reducido || Math.abs(delta) < 2) {
        window.scrollTo({ top: destino, behavior: 'instant' });
        return () => {};
    }

    // easeInOutCubic: sin tirón al arrancar ni frenazo al llegar.
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2);
    const inicio = performance.now();
    let frame = 0;
    let cancelado = false;

    const paso = ahora => {
        if (cancelado) return;
        const t = Math.min(1, (ahora - inicio) / ms);
        // `'instant'` en cada paso: si no, el `scroll-behavior: smooth` de
        // `index.css` intentaría suavizar cada micro-salto y pelearía con la curva.
        window.scrollTo({ top: desde + delta * curva(t), behavior: 'instant' });
        if (t < 1) frame = requestAnimationFrame(paso);
        else cancelarEnCurso = null;
    };
    frame = requestAnimationFrame(paso);

    const cancelar = () => {
        cancelado = true;
        cancelAnimationFrame(frame);
        if (cancelarEnCurso === cancelar) cancelarEnCurso = null;
    };
    cancelarEnCurso = cancelar;
    return cancelar;
}
