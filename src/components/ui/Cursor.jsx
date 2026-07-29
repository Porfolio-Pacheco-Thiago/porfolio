import { useEffect, useRef } from 'react';

/**
 * Cursor propio: un círculo que sigue al mouse y reemplaza al puntero del
 * sistema.
 *
 * @remarks
 * - Son dos elementos anidados: el de afuera lo posiciona el JS, el de adentro
 *   dibuja el anillo. Se mantiene la separación porque mezclar traslación y
 *   escala en la misma caja desvía el círculo — las propiedades individuales
 *   se aplican antes que `transform` y terminan multiplicando las coordenadas.
 * - Solo se activa con punteros finos. En pantallas táctiles no hay cursor que
 *   reemplazar, y ocultar el del sistema ahí sería un error.
 * - Se posiciona dentro de un `requestAnimationFrame`, así hay como mucho una
 *   escritura por frame por más eventos de mouse que lleguen.
 * - Con `prefers-reduced-motion` no se activa.
 */
export default function Cursor() {
    const ref = useRef(null);

    useEffect(() => {
        const fino = window.matchMedia('(pointer: fine)').matches;
        const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!fino || quieto) return;

        const el = ref.current;
        if (!el) return;

        document.documentElement.classList.add('tiene-cursor-propio');

        let x = 0, y = 0, frame = 0;
        const pintar = () => {
            frame = 0;
            // Solo traslación: el escalado vive en el hijo.
            el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        };
        const mover = (e) => {
            x = e.clientX;
            y = e.clientY;
            if (!el.hasAttribute('data-vivo')) el.setAttribute('data-vivo', '');
            if (!frame) frame = requestAnimationFrame(pintar);
        };

        const irse = () => el.removeAttribute('data-vivo');

        window.addEventListener('mousemove', mover, { passive: true });
        document.addEventListener('mouseleave', irse);

        return () => {
            window.removeEventListener('mousemove', mover);
            document.removeEventListener('mouseleave', irse);
            document.documentElement.classList.remove('tiene-cursor-propio');
            cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <div className="cursor" ref={ref} aria-hidden="true">
            <span className="cursor-anillo" />
        </div>
    );
}
