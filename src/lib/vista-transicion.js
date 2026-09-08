import { prefiereMenosMovimiento } from './medidas';

/**
 * Corre un cambio de estado dentro de una View Transition, para que el navegador anime
 * el reacomodo en vez de saltar. Sin soporte —o con movimiento reducido— lo corre
 * directo.
 *
 * Existe porque esa guarda de tres condiciones estaba escrita cuatro veces: en el
 * cambio de tema, en abrir y cerrar una tarjeta de proyecto, en el paso a reproducción y
 * en elegir una demo. Cada copia decidía lo mismo y ninguna sabía de las otras.
 *
 * Lo que las View Transitions resuelven acá es lo que **no** es animable con
 * transiciones: no se mueve una propiedad sino el acomodo entero —el reparto de
 * columnas, la posición de cada pieza en la grilla, un `display: contents` que aparece—.
 * Sin esto, todo se teletransporta mientras una sola medida viaja sola.
 *
 * @param {() => void} cambio  El cambio de estado. Se corre tal cual; quien necesite que
 *   caiga entero en un mismo commit lo envuelve en `flushSync` desde afuera —es decisión
 *   de quien llama, no de acá—.
 * @param {object} [opciones]
 * @param {{current: ViewTransition|null}} [opciones.activaRef]  Dónde guardar la
 *   transición en curso. Con esto, cada llamada corta la anterior: las View Transitions
 *   no se interrumpen solas, y sin cortarla dos clicks seguidos encadenan morphs sobre
 *   capturas viejas y el acomodo salta.
 * @param {() => void} [opciones.alEmpezar]  Antes de arrancar, solo si de verdad va a
 *   haber morph. Lo usa Proyectos para apagar sus propias transiciones mientras dura.
 * @param {() => void} [opciones.alTerminar]  Cuando el morph termina —o enseguida, si no
 *   hubo—. Siempre corre, así el que limpia no depende de si había soporte.
 * @returns {void}
 */
export function conVistaTransicion(cambio, { activaRef, alEmpezar, alTerminar } = {}) {
    if (!soportaVistaTransicion()) {
        cambio();
        alTerminar?.();
        return;
    }

    activaRef?.current?.skipTransition();
    alEmpezar?.();

    const transicion = document.startViewTransition(cambio);
    if (activaRef) activaRef.current = transicion;
    transicion.finished.finally(() => {
        if (activaRef && activaRef.current === transicion) activaRef.current = null;
        alTerminar?.();
    });
}

/**
 * Si el navegador va a animar el cambio.
 *
 * Va aparte porque hay un caso que necesita saberlo **antes** de llamar: al elegir una
 * demo, el corte del giro tiene que ir adentro del morph si lo hay y afuera si no —la
 * captura del "antes" ya se tomó con el aparato girado, y sacándolo afuera las dos
 * capturas salen iguales y el enderezado se pierde—.
 *
 * @returns {boolean}
 */
export function soportaVistaTransicion() {
    return Boolean(document.startViewTransition) && !prefiereMenosMovimiento();
}
