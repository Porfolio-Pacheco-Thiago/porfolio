import { useCallback, useState, useSyncExternalStore } from 'react';

/**
 * Si una media query se cumple, escuchando el cambio.
 *
 * Existe porque las mismas ocho líneas —leer `matches`, suscribirse al `change`,
 * desuscribirse al desmontar— estaban copiadas en `App`, `LogoBucle` y `LogoFila`.
 * `LogoFila` incluso lo decía en un comentario: la copia estaba ahí porque
 * `react-refresh/only-export-components` no deja exportar un hook desde el archivo de
 * un componente. La respuesta a eso es esta carpeta.
 *
 * Va con `useSyncExternalStore` y no con `useState` + `useEffect`, que es como estaban
 * escritas las tres copias. La diferencia no es de estilo: una media query **es** un
 * store externo, y este hook es el primitivo que React tiene para leerlos. Con el par
 * `useState`/`useEffect` hay una ventana entre el primer render y la suscripción en la
 * que un cambio no le llega a nadie, y taparla releyendo el valor dentro del efecto
 * encadena un render de más —el linter de React lo marca, con razón—. `useSyncExternalStore`
 * vuelve a leer al suscribirse y resuelve las dos cosas.
 *
 * @param {string} consulta  Ej.: `'(max-width: 900px)'`.
 * @returns {boolean}
 */
export function useMediaQuery(consulta) {
    const suscribir = useCallback(alCambiar => {
        const mq = window.matchMedia(consulta);
        mq.addEventListener('change', alCambiar);
        return () => mq.removeEventListener('change', alCambiar);
    }, [consulta]);

    const leer = useCallback(() => window.matchMedia(consulta).matches, [consulta]);

    // El tercer argumento es la instantánea para cuando no hay navegador. El sitio se
    // renderiza solo en el cliente (`createRoot` en `main.jsx`), así que en producción no
    // se llama nunca; está para que la app se pueda montar fuera del navegador —la prueba
    // de humo lo hace— sin que React tire "Missing getServerSnapshot".
    // Devuelve `false` —"no coincide"— que es el valor seguro: la consulta se vuelve a
    // leer de verdad apenas hay ventana.
    return useSyncExternalStore(suscribir, leer, () => false);
}

/**
 * Lo mismo, pero **decidido una sola vez** y sin escuchar el cambio.
 *
 * No es una versión pobre del de arriba: hay preguntas que no se quieren volver a
 * contestar. El hero la usa para decidir si baja el video de 1,2 MB o se queda con el
 * póster; la pregunta que contesta es "¿este aparato gasta eso?", que no cambia porque
 * se gire el teléfono, y escucharla significaría cortarle el video a alguien que apenas
 * achica la ventana. Al ensanchar hay que recargar, que es lo que pasa igual en
 * cualquier navegación.
 *
 * @param {string} consulta
 * @returns {boolean}
 */
export function useMediaQueryInicial(consulta) {
    const [coincide] = useState(() => window.matchMedia(consulta).matches);
    return coincide;
}
