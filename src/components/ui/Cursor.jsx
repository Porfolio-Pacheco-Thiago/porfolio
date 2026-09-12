import { useEffect, useRef } from 'react';
import { escalaLienzo, prefiereMenosMovimiento } from '../../lib/medidas';
import './Cursor.css';

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
 * - El anillo **crece sobre lo tocable**. No es adorno: `styles/primitivas.css` oculta el cursor
 *   del sistema en todo el documento, así que sin esto no quedaría ninguna señal
 *   de que algo se puede clickear.
 * - Se posiciona dentro de un `requestAnimationFrame`, así hay como mucho una
 *   escritura por frame por más eventos de mouse que lleguen.
 * - Con `prefers-reduced-motion` no se activa.
 */
export default function Cursor() {
    const ref = useRef(null);

    useEffect(() => {
        // Se leen una vez al montar y no se escucha el cambio: el efecto arma y
        // desarma escuchas de mouse y una clase en `<html>`, y no hay ningún caso real
        // en el que un puntero pase de grueso a fino con la página abierta.
        const fino = window.matchMedia('(pointer: fine)').matches;
        if (!fino || prefiereMenosMovimiento()) return;

        const el = ref.current;
        if (!el) return;

        document.documentElement.classList.add('tiene-cursor-propio');

        // Qué cuenta como "tocable". Al ocultar el cursor del sistema se perdió la
        // señal de que algo se puede clickear, y el anillo la reemplaza creciendo.
        const TOCABLE = 'a, button, [role="button"], input, select, summary, label';

        // El lienzo escalado obliga a dividir. `<html>` lleva `zoom: var(--escala)`, así
        // que el sistema de coordenadas de este elemento está multiplicado por esa escala
        // — pero `clientX`/`clientY` vienen en píxeles reales de la ventana, sin escalar.
        // Poniéndolos tal cual, el anillo se dibuja en `clientX * escala`: a escala 1 no
        // se nota nada, y a 0.71 —un portátil de 1366— queda 289px a la izquierda del
        // puntero de verdad en el borde derecho de la pantalla. El error crece con la
        // distancia al origen, que es lo que lo hacía ver como un puntero suelto.
        //
        // Se divide acá y no con un `zoom` inverso en el CSS a propósito: el `zoom`
        // arreglaría la posición pero también desharía el escalado del anillo, y el
        // anillo tiene que achicarse con la página como todo lo demás.
        //
        // Se lee una vez y en cada `resize` en vez de en cada cuadro: `getComputedStyle`
        // fuerza un recálculo de estilo, y acá se pinta hasta 60 veces por segundo.
        let escala = 1;
        const leerEscala = () => { escala = escalaLienzo(); };
        leerEscala();
        window.addEventListener('resize', leerEscala);

        let x = 0, y = 0, frame = 0, objetivo = null;
        const pintar = () => {
            frame = 0;
            // Solo traslación: el escalado vive en el hijo.
            el.style.transform = `translate3d(${x / escala}px, ${y / escala}px, 0)`;
            // El `closest` corre una vez por frame y no por evento de mouse, que
            // llegan de a decenas.
            el.classList.toggle('is-control', !!objetivo?.closest?.(TOCABLE));
        };
        const mover = (e) => {
            x = e.clientX;
            y = e.clientY;
            objetivo = e.target;
            if (!el.hasAttribute('data-vivo')) el.setAttribute('data-vivo', '');
            if (!frame) frame = requestAnimationFrame(pintar);
        };

        const irse = () => el.removeAttribute('data-vivo');

        window.addEventListener('mousemove', mover, { passive: true });
        document.addEventListener('mouseleave', irse);

        return () => {
            window.removeEventListener('mousemove', mover);
            window.removeEventListener('resize', leerEscala);
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
