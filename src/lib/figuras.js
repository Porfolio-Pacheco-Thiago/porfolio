// Qué figura está "convocada" en este momento, para que las figuras de alambre
// dejen de ser adorno por sección y se reúnan a formar el logo.
//
// Va por un atributo en `<html>` y un evento, igual que `lib/carga.js` y por el
// mismo motivo: el que escribe es una palabra suelta del hero y los que leen son
// las figuras, que están en otra rama del árbol. Pasarlo por props obligaría a
// enhebrar el estado por media docena de componentes que no tienen nada que ver.

/** Marca en `<html>` con la figura convocada: `cube`, `tetrahedron`, `sphere`. */
export const ATRIBUTO_FIGURAS = 'data-figuras';

/** Se dispara en `window` cada vez que cambia la figura convocada. */
export const EVENTO_FIGURAS = 'figuras-cambio';

/**
 * Convoca una figura, o las despide si se pasa `null`.
 * @param {'cube'|'tetrahedron'|'sphere'|null} figura
 */
export function convocarFiguras(figura) {
    const raiz = document.documentElement;
    if (figura) raiz.setAttribute(ATRIBUTO_FIGURAS, figura);
    else raiz.removeAttribute(ATRIBUTO_FIGURAS);
    window.dispatchEvent(new CustomEvent(EVENTO_FIGURAS, { detail: figura }));
}

/** @returns {string|null} La figura convocada, si hay alguna. */
export function figuraConvocada() {
    return document.documentElement.getAttribute(ATRIBUTO_FIGURAS);
}

/**
 * Llama a `cb(figura)` cada vez que cambia.
 * @param {(figura: string|null) => void} cb
 * @returns {() => void} Para desuscribirse.
 */
export function alCambiarFiguras(cb) {
    const manejar = (e) => cb(e.detail ?? null);
    window.addEventListener(EVENTO_FIGURAS, manejar);
    return () => window.removeEventListener(EVENTO_FIGURAS, manejar);
}
