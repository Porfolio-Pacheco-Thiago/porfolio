import { useCallback, useState } from 'react';

/**
 * "Cuál de estos está abierto", más el juego de props que hace que un elemento
 * cualquiera se comporte como un interruptor accesible.
 *
 * Lo usan la galería ampliable (`ui/Gallery`) y la tapa de un proyecto
 * (`secciones/Projects`), que tenían el mismo bloque de seis props copiado, con las
 * mismas tres decisiones detrás:
 *
 * - **Sin envolver en un `<button>`.** En los dos casos el CSS posiciona el contenido en
 *   absoluto contra este elemento, y meter otro en el medio le cambiaría el bloque
 *   contenedor. Con `role` y `tabIndex` acá la estructura no se mueve y el control sigue
 *   siendo alcanzable por teclado.
 * - **`stopPropagation` siempre.** Los dos viven dentro de una tarjeta que tiene su
 *   propio `onClick` para plegarse: sin esto, ampliar algo cerraba la tarjeta en el
 *   mismo gesto y se iba con ella.
 * - **El espacio se frena con `preventDefault`.** Si no, además de activar scrollea la
 *   página.
 *
 * Una sola a la vez: dos abiertas se pisarían, porque al crecer cada una se sale de su
 * hueco.
 *
 * @returns {{
 *   activo: string|null,
 *   alternar: (clave: string) => void,
 *   cerrar: () => void,
 *   props: (clave: string, habilitado?: boolean) => object,
 * }}
 *   `props(clave)` devuelve el juego listo para desparramar sobre el elemento. Con
 *   `habilitado` en `false` devuelve un objeto vacío, que es como se apaga el gesto
 *   donde no hay nada que ampliar —una franja que ya se ve entera— sin escribir un
 *   ternario en el JSX.
 */
export function useAlternable() {
    const [activo, setActivo] = useState(null);

    const alternar = useCallback(
        clave => setActivo(a => (a === clave ? null : clave)),
        [],
    );
    const cerrar = useCallback(() => setActivo(null), []);

    const props = useCallback((clave, habilitado = true) => {
        if (!habilitado) return {};
        const disparar = e => {
            e.stopPropagation();
            alternar(clave);
        };
        return {
            role: 'button',
            tabIndex: 0,
            'aria-pressed': activo === clave,
            onClick: disparar,
            onKeyDown: e => {
                if (e.key !== 'Enter' && e.key !== ' ') return;
                e.preventDefault();
                disparar(e);
            },
        };
    }, [activo, alternar]);

    return { activo, alternar, cerrar, props };
}
