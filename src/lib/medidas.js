// Las medidas y media queries del proyecto, en un solo lugar, y la lectura suelta de la
// preferencia de movimiento para el código que no es un componente.
//
// Los componentes no importan de acá: usan `hooks/useMediaQuery` y
// `hooks/useMenosMovimiento`, que además escuchan el cambio.

/**
 * Debajo de esto no hay riel de contacto: sus enlaces se mudan al final del pie, la
 * tarjeta de proyecto abierta vuelve al flujo y el lienzo escalado se apaga.
 *
 * El número está también en el CSS, porque CSS no tiene forma portable de leer una
 * constante de acá. Si se mueve, se mueven todos: están marcados con el comentario
 * `corte SIN_RIEL`, así que `grep -rn "corte SIN_RIEL" src` los encuentra a los cinco.
 */
export const SIN_RIEL = '(max-width: 900px)';

/**
 * Debajo de esto el hero se apila y el video se reemplaza por el póster. Es **otro**
 * umbral que `SIN_RIEL`, no un duplicado: uno decide una maqueta y el otro decide si se
 * bajan 1,2 MB. Antes los dos se llamaban `ANGOSTO`, en archivos distintos y con valores
 * distintos, que es exactamente cómo se confunden.
 */
export const SIN_VIDEO = '(max-width: 768px)';

/** Quien pidió menos movimiento. */
export const MENOS_MOVIMIENTO = '(prefers-reduced-motion: reduce)';

/**
 * Ancho del lienzo. El diseño se dibuja **siempre** a esta medida y después se escala
 * entero con `zoom`, así que dos monitores distintos ven exactamente la misma página,
 * solo que más grande o más chica. 1920 y no otro número porque es el ancho sobre el que
 * está afinado todo lo de acá —los topes de columna, los anchos de los aparatos, el
 * renglón del rol— y ponerlo de referencia deja esa vista intacta.
 *
 * Efecto de regalo: con la raíz escalada, un `vw` de adentro vale `ancho real / escala`,
 * que es siempre 1920. O sea que todas las medidas en `vw` del CSS se vuelven constantes
 * solas y no hubo que tocarlas. Los `vh` no corren esa suerte —siguen al alto de la
 * ventana, que no entra en la cuenta— y por eso están congelados en el CSS.
 */
export const LIENZO = 1920;

/**
 * Si el usuario pidió menos movimiento, leído en el momento.
 *
 * Para el código que **no** es un componente y por lo tanto no puede usar un hook:
 * `lib/scroll.js`, `lib/vista-transicion.js`, y los manejadores de evento que deciden
 * en el instante del click. Estaba escrito once veces a lo largo del proyecto.
 *
 * @returns {boolean}
 */
export function prefiereMenosMovimiento() {
    return window.matchMedia(MENOS_MOVIMIENTO).matches;
}
