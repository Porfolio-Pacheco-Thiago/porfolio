import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * El estado de un `<video>` con controles propios, y los manejadores que lo mueven.
 *
 * Existe porque **el video de las demos es intocable y sus controles viven afuera**: el
 * elemento no lleva `controls` y el CSS le saca los eventos de puntero, así que la barra
 * del navegador no aparece nunca encima de la pantalla del aparato. En su lugar hay una
 * barra propia. Eso obliga a mantener acá si va, dónde va, cuánto dura y cómo está el
 * volumen, sincronizado con los eventos del elemento — no alcanza con leerlo una vez.
 *
 * Sale de `ui/DemoDispositivo.jsx`, que llevaba esto mezclado con el chasis, el carrusel
 * de capturas y el empalme del giro con la View Transition.
 *
 * Se lleva también los subtítulos: el interruptor de CC vive en la barra y lo único que
 * hace es elegir qué pista del elemento se muestra, así que es del reproductor.
 *
 * @param {object} [opciones]
 * @param {string} [opciones.idioma]  El de la página. Decide qué pista se ve.
 * @param {string} [opciones.clave]   Cambia cuando cambia el video puesto: el `<video>`
 *   lleva `key`, así que al cambiar de demo se remonta con sus pistas nuevas y hay que
 *   volver a elegir.
 *
 * @returns {{
 *   videoRef: React.RefObject<HTMLVideoElement>,
 *   va: boolean, tiempo: number, duracion: number, volumen: number, mudo: boolean,
 *   subtitulos: boolean, alternarSubtitulos: () => void,
 *   propsVideo: object,
 *   saltar: (seg: number) => void,
 *   alternarPausa: () => void,
 *   alternarMudo: () => void,
 *   ponerVolumen: (v: number) => void,
 *   buscar: (seg: number) => void,
 *   pantallaCompleta: () => void,
 *   marcarPausado: () => void,
 * }}
 *   `propsVideo` se desparrama sobre el `<video>`: son los oyentes que mantienen el
 *   estado al día. `marcarPausado` es para quien lo desmonta a mano — ver abajo.
 */
export function useReproductor({ idioma, clave } = {}) {
    const videoRef = useRef(null);

    const [va, setVa] = useState(false);
    const [tiempo, setTiempo] = useState(0);
    const [duracion, setDuracion] = useState(0);
    const [volumen, setVolumen] = useState(1);
    const [mudo, setMudo] = useState(false);
    // Si los subtítulos están puestos. Es del reproductor y no del video: se conserva al
    // cambiar de demo y al cambiar de idioma —lo que cambia ahí es **qué** pista se
    // muestra, no si se muestran—, que es lo que uno espera de un interruptor de CC.
    const [subtitulos, setSubtitulos] = useState(false);

    // Qué pista se ve. **Todas** las que tiene el video están montadas y acá se decide
    // cuál se muestra: así cambiar de idioma es tocar una propiedad del elemento y no
    // montar y desmontar `<track>`, que reinicia la carga de la pista y la haría
    // parpadear —o desaparecer un rato— con el video andando.
    //
    // `disabled` y no `hidden` para las otras: `hidden` sigue cargando el archivo y
    // emitiendo eventos de cue por una pista que nadie mira.
    //
    // Depende de `clave` porque el `<video>` lleva `key`: cambiar de demo lo remonta con
    // sus pistas nuevas y hay que volver a elegir.
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        for (const pista of v.textTracks) {
            pista.mode = subtitulos && pista.language === idioma ? 'showing' : 'disabled';
        }
    }, [subtitulos, idioma, clave]);

    // En pantalla completa el video queda solo: nuestra barra no viaja con él, y como lo
    // dejamos sin `controls` y sin eventos de puntero, salía una imagen muerta que no se
    // podía ni pausar. Ahí y solo ahí se le devuelven los controles nativos. El puntero y
    // el encuadre los arregla el CSS con `:fullscreen`; `controls` es un atributo y hay
    // que ponerlo desde acá.
    useEffect(() => {
        const alCambiar = () => {
            const v = videoRef.current;
            if (v) v.controls = document.fullscreenElement === v;
        };
        document.addEventListener('fullscreenchange', alCambiar);
        return () => document.removeEventListener('fullscreenchange', alCambiar);
    }, []);

    /** Salta `seg` segundos, acotado a los extremos del video. */
    const saltar = useCallback(seg => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + seg));
    }, []);

    const alternarPausa = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) v.play().catch(() => {});
        else v.pause();
    }, []);

    const alternarMudo = useCallback(() => {
        const v = videoRef.current;
        if (v) v.muted = !v.muted;
    }, []);

    /** El cero apaga: bajar la barra hasta el fondo silencia, que es lo que uno espera. */
    const ponerVolumen = useCallback(nivel => {
        const v = videoRef.current;
        if (!v) return;
        v.volume = nivel;
        v.muted = nivel === 0;
    }, []);

    const buscar = useCallback(seg => {
        const v = videoRef.current;
        if (v) v.currentTime = seg;
    }, []);

    const pantallaCompleta = useCallback(() => {
        videoRef.current?.requestFullscreen?.();
    }, []);

    /**
     * Para cuando el `<video>` se desmonta sin llegar a disparar `pause` — al sacar la
     * demo, o al pasar de un video a una imagen. Sin esto quien escucha se queda creyendo
     * que sigue andando.
     */
    const marcarPausado = useCallback(() => setVa(false), []);

    const alternarSubtitulos = useCallback(() => setSubtitulos(x => !x), []);

    const propsVideo = {
        ref: videoRef,
        // `va` es solo el ícono del botón de la barra. El acomodo de la tarjeta **no**
        // cuelga de esto: lo decide quien elige la demo, así una pausa no lo desarma.
        onPlay: () => setVa(true),
        onPause: () => setVa(false),
        onTimeUpdate: e => setTiempo(e.currentTarget.currentTime),
        onLoadedMetadata: e => setDuracion(e.currentTarget.duration),
        // Pone la aguja en cero al cambiar de demo, antes de que llegue la duración del
        // archivo nuevo, y sincroniza `va` **leyendo el elemento**, que es el único que
        // sabe si está andando. Antes lo forzaba a `false` suponiendo que un elemento
        // recién montado está en pausa. Es cierto al montarlo, pero `loadstart` no es solo
        // eso: el `play()` que arranca la demo sale de un efecto, y si el evento llega
        // después el `false` pisa al `true` que puso `play` y el botón queda en triángulo
        // con el video andando. Leerlo cubre los dos casos, incluido el que motivó el
        // `false`: al reabrir la tarjeta el elemento está pausado de verdad, así que sigue
        // diciendo "Reproducir".
        onLoadStart: e => { setTiempo(0); setDuracion(0); setVa(!e.currentTarget.paused); },
        onVolumeChange: e => {
            setVolumen(e.currentTarget.volume);
            setMudo(e.currentTarget.muted);
        },
    };

    return {
        videoRef, va, tiempo, duracion, volumen, mudo, subtitulos,
        propsVideo, saltar, alternarPausa, alternarMudo, ponerVolumen,
        buscar, pantallaCompleta, marcarPausado, alternarSubtitulos,
    };
}
