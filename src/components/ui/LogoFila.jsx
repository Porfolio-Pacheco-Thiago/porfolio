import { useEffect, useState } from 'react';

/**
 * Los videos de marca de un proyecto, **los tres a la vez y en fila**, cada uno
 * repitiéndose por su cuenta.
 *
 * Es el hermano de `LogoBucle`, que los turna de a uno. La diferencia es el hueco:
 * el de la tarjeta cerrada es casi cuadrado y ahí solo entra una pieza, pero el de
 * la tarjeta abierta es una franja de más de 5:1 donde los tres entran cómodos, y
 * turnarlos ahí escondería dos tercios de la marca sin ganar nada.
 *
 * @remarks
 * - Van con `loop` y sin escuchar `ended`: acá no hay turnos que contar, así que no
 *   existe el motivo por el que `LogoBucle` tiene que prescindir del atributo.
 * - La lectura de `prefers-reduced-motion` está repetida de `LogoBucle` a propósito:
 *   sacarla a un hook compartido pide un módulo nuevo para ocho líneas, porque
 *   `react-refresh/only-export-components` no deja exportar un hook desde el archivo
 *   de un componente.
 */
export default function LogoFila({ videos, className }) {
    // Con movimiento reducido se muestran los tres quietos, en su portada. Se lee una
    // vez y se escucha el cambio, porque el sistema operativo permite activarlo con la
    // página abierta.
    const [quieto, setQuieto] = useState(
        () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const alCambiar = e => setQuieto(e.matches);
        mq.addEventListener('change', alCambiar);
        return () => mq.removeEventListener('change', alCambiar);
    }, []);

    return (
        // Es ornamento: lo que nombra a la tarjeta es su título, que está al lado.
        <div className={className} aria-hidden="true">
            {videos.map(({ src, poster }) => (
                <video
                    key={src}
                    className="logo-fila-pieza"
                    src={src}
                    // El cuadro que se ve mientras el video no reproduce: al arrancar,
                    // con movimiento reducido, o si el navegador difiere el autoplay.
                    poster={poster}
                    autoPlay={!quieto}
                    loop={!quieto}
                    muted
                    playsInline
                    // `metadata` y no `auto`. Los tres viven en la franja de la tarjeta
                    // **abierta**, que existe en el DOM desde que carga la página con
                    // `opacity: 0` — o sea que con `auto` se bajaban enteros y se les
                    // reservaba un decoder a cada uno para algo que nadie está mirando, y
                    // eso por cada tarjeta con videos de marca. El póster tapa el hueco
                    // hasta que arrancan.
                    preload="metadata"
                />
            ))}
        </div>
    );
}
