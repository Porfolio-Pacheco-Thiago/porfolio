// Estado de la pantalla de carga, para lo que necesita esperarla desde fuera de
// `App`.
//
// Existe porque el resto del sitio no puede animarse **detrás** del loader: si
// arranca en paralelo, para cuando la pantalla se levanta las figuras ya están
// colocadas y el video ya empezó, o sea que la entrada se perdió. Lo que hay
// abajo deja que cada cosa se prepare y arranque recién cuando el loader se va.
//
// Va por un atributo en `<html>` y un evento en vez de un contexto: el único que
// escribe es `App`, los que leen son componentes sueltos y hondos —cada figura de
// alambre— y pasarles un prop obligaría a enhebrarlo por media docena de
// componentes que no tienen nada que ver.

/** Marca en `<html>` mientras la pantalla de carga está arriba. */
export const ATRIBUTO_CARGA = 'data-cargando';

/** Se dispara en `window` cuando la pantalla de carga se va, una sola vez. */
export const EVENTO_CARGA = 'carga-lista';

/** @returns {boolean} Si la pantalla de carga ya se fue. */
export function cargaLista() {
    return !document.documentElement.hasAttribute(ATRIBUTO_CARGA);
}

/**
 * Llama a `cb` cuando la pantalla de carga se va — o ya mismo, si no está.
 *
 * El caso "ya mismo" importa: un componente que monta tarde (o un re-render tras
 * cambiar de idioma) no vería nunca el evento y se quedaría esperando para
 * siempre.
 *
 * @param {() => void} cb
 * @returns {() => void} Para desuscribirse.
 */
export function alTerminarCarga(cb) {
    if (cargaLista()) {
        cb();
        return () => {};
    }
    window.addEventListener(EVENTO_CARGA, cb, { once: true });
    return () => window.removeEventListener(EVENTO_CARGA, cb);
}
