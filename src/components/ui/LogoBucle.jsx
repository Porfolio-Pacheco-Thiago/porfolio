import { useEffect, useRef, useState } from 'react';

/**
 * Los videos de marca de un proyecto, turnándose en bucle: cada uno se repite
 * `VUELTAS` veces y recién ahí entra el siguiente.
 *
 * El conteo va por el evento `ended` y no por un `setTimeout` con la duración del
 * archivo. La diferencia importa: un temporizador se desincroniza en cuanto el video
 * arranca tarde —y arranca tarde, porque `preload` no garantiza nada— y a la tercera
 * vuelta ya va corriendo contra la imagen. El evento, en cambio, lo dispara el propio
 * reproductor cuando de verdad terminó.
 *
 * Por eso también va **sin** `loop`: con el atributo puesto el video vuelve a empezar
 * solo y `ended` no se dispara nunca.
 */
const VUELTAS = 3;

export default function LogoBucle({ videos, className }) {
    const [actual, setActual] = useState(0);
    const vueltas = useRef(0);
    const ref = useRef(null);

    // Con movimiento reducido no hay bucle: se muestra el primero quieto. Se lee una
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

    function alTerminar() {
        vueltas.current += 1;
        if (vueltas.current < VUELTAS) {
            // Rebobinar y volver a arrancar en vez de remontar: es la misma pieza, y
            // remontarla la haría pedirse de nuevo al servidor.
            ref.current.currentTime = 0;
            ref.current.play();
            return;
        }
        vueltas.current = 0;
        setActual(i => (i + 1) % videos.length);
    }

    return (
        <video
            // La `key` fuerza el remonte al cambiar de video. Es lo que hace que el
            // nuevo arranque solo por su `autoPlay`, sin tener que encadenar un
            // `load()` y un `play()` a mano después de que React cambie el `src`.
            key={actual}
            ref={ref}
            className={className}
            src={videos[quieto ? 0 : actual].src}
            // El cuadro que se ve mientras el video no esté reproduciendo: al arrancar,
            // con movimiento reducido, o si el navegador difiere el autoplay.
            poster={videos[quieto ? 0 : actual].poster}
            autoPlay={!quieto}
            muted
            playsInline
            // `auto` y no `metadata`: el autoplay puede quedar diferido —pestaña en
            // segundo plano, ahorro de datos, movimiento reducido— y con solo la
            // metadata bajada no hay ningún cuadro decodificado, así que la ventana se
            // queda en blanco. Con el archivo entero, lo peor que pasa es que se vea el
            // primer cuadro quieto. Pesan menos de 220 KB y se piden de a uno.
            preload="auto"
            onEnded={quieto ? undefined : alTerminar}
            // Es ornamento: lo que nombra a la tarjeta es su título, que está al lado.
            aria-hidden="true"
        />
    );
}
