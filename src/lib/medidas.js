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

/** La escala viva. La escribe `aplicarLienzo`, la leen todos con `escalaLienzo`. */
let escala = 1;

/**
 * La escala a la que se está dibujando el lienzo, o 1 si no hay ninguna.
 *
 * Hace falta cada vez que se cruzan **píxeles reales de la ventana** con **unidades del
 * lienzo**, que son dos sistemas distintos desde que `<html>` lleva `zoom`:
 *
 *  - `clientX`, `clientY` y `getBoundingClientRect()` vienen del navegador ya escalados,
 *    o sea en píxeles reales;
 *  - todo lo que se escribe en un `style` o en el CSS se interpreta en unidades del
 *    lienzo, que el `zoom` va a multiplicar después.
 *
 * Pasar un número del primer grupo al segundo sin dividir es un error que **no se ve a
 * escala 1** —el monitor de 1920, donde está afinado el diseño— y crece cuanto más se
 * aparta de ahí. Nos pasó dos veces: el anillo del cursor dibujándose lejos del puntero,
 * y el alto de la grilla de Proyectos quedando un 30% corto en un portátil de 1366, que
 * le sacaba el piso a la tarjeta abierta.
 *
 * Devuelve la variable del módulo y **no** lee `--escala` con `getComputedStyle`, como
 * hacía antes. Leerla del CSS tenía dos fallas, y las dos daban el mismo síntoma —el
 * anillo lejos del puntero— dejando la división de arriba sin efecto:
 *
 *  - la variable no existe hasta que corre el efecto que la escribe, y eso pasaba
 *    **después** de montar los hijos, porque React corre los efectos de abajo hacia
 *    arriba. El cursor arrancaba leyendo nada, caía en el 1 de descarte, y se quedaba
 *    en 1 mientras nadie tocara la ventana. O sea: el error se veía entero en cada
 *    carga limpia, y se tapaba al achicar la ventana para ir a mirarlo;
 *  - y quien la releía en `resize` competía por el orden de los oyentes contra quien la
 *    escribía en `resize`. El cursor registraba el suyo primero —hijo antes que padre,
 *    otra vez— así que leía siempre el valor del tamaño anterior. Invisible arrastrando
 *    el borde, donde cada paso es de píxeles; permanente al maximizar, al ajustar a
 *    media pantalla, o al arrastrar la ventana a un monitor con otro DPI, que en Windows
 *    cambia el ancho en píxeles CSS de una sola vez.
 *
 * Con la escala guardada acá y escrita antes de que React monte nada (ver
 * `iniciarLienzo`) no hay ni carrera ni orden que respetar. De regalo, la lectura sale
 * gratis: `getComputedStyle` fuerza un recálculo de estilo, y el cursor la pide hasta 60
 * veces por segundo.
 *
 * @returns {number}
 */
export function escalaLienzo() {
    return escala;
}

/**
 * Mide la ventana y escribe las dos variables de las que cuelga el lienzo.
 *
 * `--escala`: ancho de la ventana sobre {@link LIENZO}, que `index.css` le pasa al `zoom`
 * de `<html>`. Debajo del corte de {@link SIN_RIEL} vale 1: ahí manda el diseño adaptable,
 * que está hecho a medida de esos anchos. Escalar el de escritorio en un teléfono sería
 * mostrarlo al 20%, con el texto en 3px.
 *
 * `clientWidth` y no `innerWidth`: el segundo **incluye la barra de scroll**, así que
 * donde la barra ocupa lugar —Windows y Linux con barras clásicas, ~17px— el lienzo se
 * escalaba para llenar un ancho que no existía y se salía por la derecha esos píxeles,
 * que el `overflow-x: clip` recortaba. Con barras superpuestas (macOS, Windows 11 por
 * defecto) los dos valores coinciden y no cambia nada.
 *
 * `--alto-lienzo`: el alto de una pantalla medido **en unidades del lienzo**, que
 * escalado por `zoom` vuelve a dar la ventana entera. No se usa `100dvh` para esto porque
 * no está claro que todos los navegadores midan un `dvh` contra el lienzo y no contra la
 * ventana real, y de eso depende que el hero llene la pantalla o se quede al 70%.
 *
 * En angosto la variable se **borra**, y el CSS cae en el `100dvh` de siempre. No es un
 * detalle: en iOS `dvh` es lo que evita el salto cuando se retrae la barra de direcciones,
 * y un número fijo en píxeles perdería eso.
 */
function aplicarLienzo() {
    const raiz = document.documentElement;
    const angosto = window.matchMedia(SIN_RIEL).matches;
    escala = angosto ? 1 : raiz.clientWidth / LIENZO;
    raiz.style.setProperty('--escala', String(escala));
    if (angosto) raiz.style.removeProperty('--alto-lienzo');
    else raiz.style.setProperty('--alto-lienzo', `${window.innerHeight / escala}px`);
}

/**
 * Enciende el lienzo: lo mide una vez y lo vuelve a medir en cada `resize`.
 *
 * Lo llama `main.jsx` **antes** de montar React, y no un efecto de `App`, por dos razones.
 * La que importa es que así la escala ya está puesta cuando monta el primer componente,
 * y nadie puede leerla antes de tiempo —era eso lo que dejaba al cursor clavado en 1, ver
 * {@link escalaLienzo}—. La otra es que evita el cuadro que la página pasaba dibujada a
 * tamaño de lienzo antes de que el efecto la escalara.
 *
 * Escucha `resize` y no el corte de {@link SIN_RIEL}: no le alcanza con saber de qué lado
 * está, necesita el ancho exacto en cada cuadro del arrastre. Y es el **único** oyente de
 * `resize` que toca la escala, así que no hay orden que pueda salir mal.
 */
export function iniciarLienzo() {
    aplicarLienzo();
    window.addEventListener('resize', aplicarLienzo);
}

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
