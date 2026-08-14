import { useCallback, useEffect, useRef, useState } from 'react';
import {
    FiFastForward, FiImage, FiMaximize, FiPause, FiPlay, FiRewind, FiVolume2, FiVolumeX,
} from 'react-icons/fi';
import { useLang } from '../../context/lang-context';

/**
 * El aparato de la referencia tamalsen: en diagonal, girando sobre su eje y
 * mostrando algo en la pantalla. Al elegir un medio se endereza y lo pone de
 * frente; al volver a tocar el mismo botón, vuelve a girar.
 *
 * Viene en dos chasis, que es lo **único** que los diferencia:
 *
 *  - `fono`    — un iPhone vertical. Lo usa Melodía, que es una app de celular y
 *                cuyas grabaciones son 720×1440.
 *  - `monitor` — una pantalla apaisada sobre un pie. La usan los proyectos de
 *                escritorio y web, cuyas capturas son apaisadas y en un celular
 *                entrarían de canto.
 *
 * Todo lo demás —el giro, el enderezado, la botonera, la barra del reproductor—
 * es el mismo código, porque es el mismo comportamiento.
 *
 * Acepta imágenes y videos mezclados. Un video trae la barra del reproductor; una
 * imagen no, porque no hay nada que controlar. En reposo la pantalla muestra la
 * primera imagen, o si no hay ninguna, la portada del primer video.
 *
 * Reemplaza a la galería: metidos en el hueco 4/3 los medios entraban completos
 * pero chicos, y acá la pantalla tiene la proporción del aparato.
 *
 * @param {object} props
 * @param {Array<{nombre: string, tipo: 'video'|'imagen', src: string, poster?: string}>} props.medios
 * @param {'fono'|'monitor'} [props.dispositivo]  Chasis. Por defecto `fono`.
 * @param {string} props.label  Nombre del proyecto, para los textos accesibles.
 * @param {React.ReactNode} [props.children]  Va en la columna derecha, debajo de
 *   la barra del reproductor. Lo usa `Projects` para poner ahí los tags y el link
 *   al repo, que en la referencia van al costado del celular y no abajo.
 * @param {(reproduciendo: boolean) => void} [props.onPlayingChange]  Avisa cuando
 *   el video arranca o se detiene. `Projects` lo usa para contraer la foto de la
 *   tarjeta y darle ese espacio al celular mientras se está viendo una demo.
 * @param {string} [props.className]  Se suma a la clase propia, no la reemplaza.
 *
 * El resto de props va al contenedor, igual que en `ui/Gallery.jsx`: así se le
 * puede dar `id` o atributos ARIA sin envolverlo en otro elemento.
 *
 * **No tiene prop para "volver al estado inicial".** Quien lo usa lo resetea
 * remontándolo con un `key` distinto —así lo hace `Projects` al cerrar la
 * tarjeta—, que es la forma idiomática de resetear estado en React. Eso además
 * apaga el video de raíz, porque el elemento deja de existir: no hace falta
 * pausarlo desde afuera ni limpiar nada en un efecto.
 *
 * @remarks
 * **El video es intocable y los controles viven afuera.** El `<video>` no lleva
 * `controls` y el CSS le saca los eventos de puntero, así que la barra del
 * navegador no aparece nunca encima de la pantalla del celular. En su lugar hay
 * una barra propia debajo de los botones de demo. Eso obliga a mantener acá el
 * estado del reproductor (si va, dónde va, cuánto dura, volumen), sincronizado
 * con los eventos del elemento — no alcanza con leerlo una vez.
 *
 * Tres decisiones que son de rendimiento, no de gusto:
 *
 * - **En reposo la pantalla es una imagen, no un video.** Girar un video obliga a
 *   recomponer la capa en cada frame; una imagen se rasteriza una vez y después
 *   solo se transforma.
 * - **Sin `transform-style: preserve-3d`.** El celular se dibuja plano y su
 *   grosor es un `box-shadow` sólido, así que alcanza con rotar un elemento y
 *   dejar que sus hijos se aplanen en su plano. Con `preserve-3d` cada hijo se
 *   re-rasterizaría por frame — lo que causó el problema térmico de las figuras.
 * - **El video se monta recién al elegir una demo.** Sin interacción no baja un
 *   solo byte: lo único que se pide son los posters.
 *
 * Las dos barras llevan `aria-valuetext` porque sin él un lector de pantalla lee
 * el número crudo —"38 de 0 a 63,8", "0,65"—, que no es ni un tiempo ni un
 * porcentaje.
 *
 * El giro se apaga con `prefers-reduced-motion` desde el CSS.
 */
export default function DemoDispositivo({
    medios, dispositivo = 'fono', label, children, onPlayingChange, className = '', ...props
}) {
    const { t } = useLang();
    // `null` = en reposo, girando. Un número = esa demo, quieta y de frente.
    const [activa, setActiva] = useState(null);
    // Mientras vuelve al giro: corta la animación para que la transición pueda
    // llevarlo de frente hasta la pose inicial. Ver `elegir`.
    const [volviendo, setVolviendo] = useState(false);
    const videoRef = useRef(null);
    const fonoRef = useRef(null);

    // Estado del reproductor. Existe porque los controles son propios: sin esto
    // los botones no sabrían qué ícono mostrar ni dónde está la aguja.
    const [va, setVa] = useState(false);
    const [tiempo, setTiempo] = useState(0);
    const [duracion, setDuracion] = useState(0);
    const [volumen, setVolumen] = useState(1);
    const [mudo, setMudo] = useState(false);

    const enDemo = activa !== null;
    const medio = enDemo ? medios[activa] : undefined;
    // Solo un video trae reproductor. Una imagen se pone de frente y ya está: no hay
    // aguja que mover ni volumen que bajar.
    const video = medio?.tipo === 'video' ? medio : undefined;
    // En reposo la pantalla muestra la primera imagen; si el proyecto solo tiene
    // videos —el caso de Melodía— el poster del primero que tenga uno.
    const reposo = medios.find(m => m.tipo === 'imagen')?.src
        ?? medios.find(m => m.poster)?.poster;

    // Arranca la demo al elegirla. Va acá y no en el atributo `autoplay` porque
    // con audio los navegadores lo bloquean salvo que haya un gesto del usuario
    // detrás, y el atributo no se ata al click; este efecto sí corre dentro de
    // esa ventana. Si igual lo rechazan, queda en pausa y el botón de play de la
    // barra lo arranca: no hay nada que reintentar ni que avisar.
    useEffect(() => {
        if (activa === null) return;
        videoRef.current?.play().catch(() => { /* sin permiso de audio, queda en pausa */ });
    }, [activa]);

    /**
     * Tocar la demo que ya está puesta la saca; tocar otra, cambia de video.
     *
     * Al apagar hay que avisar a mano: el `<video>` se desmonta sin disparar
     * `pause`, así que sin esto quien escucha se quedaría creyendo que sigue.
     *
     * El resto es el empalme entre el giro y la pose de frente. Una animación de
     * keyframes **gana sobre el `transform` declarado**, así que en cuanto se la
     * saca el valor salta a la base y la transición recién arranca desde ahí: eso
     * es el tirón. Cada sentido se resuelve distinto.
     */
    const elegir = i => {
        const el = fonoRef.current;
        const apagando = activa === i;

        if (apagando) {
            // Volviendo al giro: se corta la animación con una clase mientras la
            // transición lleva el celular de frente hasta la pose inicial, que es
            // exactamente el fotograma 0% del giro. Al sacarla, el giro arranca en
            // esa misma pose y el empalme no se ve.
            setVolviendo(true);
            setActiva(null);
            setVa(false);
            onPlayingChange?.(false);
            // La duración se lee del elemento en vez de repetirla acá: vive en
            // `--demo-anim`, en el CSS.
            const ms = el ? (parseFloat(getComputedStyle(el).transitionDuration) || 0.85) * 1000 : 850;
            window.setTimeout(() => setVolviendo(false), ms);
            return;
        }

        // Yendo al frente: se fija la pose actual del giro como estilo en línea
        // antes de que la clase `is-demo` mate la animación. Así el punto de
        // partida de la transición es donde el celular está de verdad.
        el?.getAnimations().forEach(a => {
            try { a.commitStyles(); a.cancel(); } catch { /* navegador sin commitStyles */ }
        });
        // Pasar de un video a una imagen desmonta el `<video>` sin que dispare `pause`,
        // igual que al apagar. Sin este aviso la tarjeta se quedaría con la ventana
        // contraída, creyendo que todavía hay algo reproduciéndose.
        if (medios[i].tipo !== 'video' && va) {
            setVa(false);
            onPlayingChange?.(false);
        }
        setActiva(i);
        // Dos frames: al segundo ya está aplicada `is-demo`. Recién ahí se saca el
        // estilo en línea —que si no le ganaría a la regla— y la transición corre
        // desde la pose congelada hasta el frente.
        requestAnimationFrame(() => requestAnimationFrame(() => {
            if (fonoRef.current) fonoRef.current.style.transform = '';
        }));
    };

    // En pantalla completa el video queda solo: nuestra barra no viaja con él, y
    // como lo dejamos sin `controls` y sin eventos de puntero, salía una imagen
    // muerta que no se podía ni pausar. Ahí y solo ahí se le devuelven los
    // controles nativos. El puntero y el encuadre los arregla el CSS con
    // `:fullscreen`; `controls` es un atributo y hay que ponerlo desde acá.
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

    return (
        <div className={`fono-bloque ${className}`.trim()} {...props}>
            <div className="fono-escena">
                {/* El grosor del celular es un `box-shadow` sólido y los botones
                    laterales son dos spans: no hay caras 3D de verdad, porque eso
                    exigiría `preserve-3d` y su costo por frame. */}
                <div
                    ref={fonoRef}
                    className={`fono es-${dispositivo} ${enDemo ? 'is-demo' : ''} ${volviendo ? 'is-volviendo' : ''}`}
                >
                    {/* El chasis. En el celular son los dos botones del canto; en el
                        monitor, el cuello y la base del pie. En los dos casos son
                        elementos planos: el volumen lo da el `box-shadow`, porque caras
                        3D de verdad exigirían `preserve-3d`. */}
                    {dispositivo === 'monitor' ? (
                        <span className="fono-pie" aria-hidden="true" />
                    ) : (
                        <>
                            <span className="fono-lateral fono-lateral-izq" aria-hidden="true" />
                            <span className="fono-lateral fono-lateral-der" aria-hidden="true" />
                        </>
                    )}
                    <div className="fono-pantalla">
                        {video ? (
                            // Sin `controls` y sin subtítulos: los controles son los de
                            // abajo, y no hay .vtt para estas grabaciones —un <track>
                            // vacío le prometería a un lector de pantalla algo que no
                            // está—. Ver la misma nota en ui/Gallery.jsx.
                            // `onLoadStart` pone la aguja en cero al cambiar de demo,
                            // antes de que llegue la duración del nuevo archivo, y baja
                            // `va`: un elemento recién montado está en pausa, y si no,
                            // al reabrir la tarjeta el botón decía "Pausar" sobre un
                            // video detenido.
                            // eslint-disable-next-line jsx-a11y/media-has-caption
                            <video
                                key={video.nombre}
                                ref={videoRef}
                                src={video.src}
                                poster={video.poster}
                                playsInline
                                aria-label={`${nombreDemo(t, video.nombre)} — ${label}`}
                                onPlay={() => { setVa(true); onPlayingChange?.(true); }}
                                onPause={() => { setVa(false); onPlayingChange?.(false); }}
                                onTimeUpdate={e => setTiempo(e.currentTarget.currentTime)}
                                onLoadedMetadata={e => setDuracion(e.currentTarget.duration)}
                                onLoadStart={() => { setTiempo(0); setDuracion(0); setVa(false); }}
                                onVolumeChange={e => {
                                    setVolumen(e.currentTarget.volume);
                                    setMudo(e.currentTarget.muted);
                                }}
                            />
                        ) : medio ? (
                            // Una imagen elegida: se pone de frente en la pantalla, sin
                            // barra debajo. `alt` vacío porque el botón que la puso ya
                            // la nombra, y el nombre está a la vista.
                            <img key={medio.nombre} src={medio.src} alt="" decoding="async" />
                        ) : (
                            reposo && <img src={reposo} alt="" loading="lazy" decoding="async" />
                        )}
                    </div>
                </div>
            </div>

            <div className="fono-controles">
                {/* La ayuda nombra el aparato que hay a la vista: "en el celular" sobre
                    un monitor era una instrucción falsa. */}
                <p className="fono-ayuda">
                    {t(dispositivo === 'monitor' ? 'projects.demoHintMonitor' : 'projects.demoHint')}
                </p>

                <div className="fono-botones">
                    {medios.map((m, i) => (
                        <button
                            key={m.nombre}
                            type="button"
                            className={`fono-boton ${activa === i ? 'is-activa' : ''}`}
                            onClick={e => { e.stopPropagation(); elegir(i); }}
                            aria-pressed={activa === i}
                        >
                            {/* El ícono dice qué va a pasar al tocarlo: reproducir algo,
                                o traer una captura al frente. */}
                            {m.tipo === 'video'
                                ? <FiPlay size={13} aria-hidden="true" />
                                : <FiImage size={13} aria-hidden="true" />}
                            <span>{nombreDemo(t, m.nombre)}</span>
                        </button>
                    ))}
                </div>

                {/* La barra del reproductor, debajo de los botones de selección. Solo
                    aparece cuando hay algo que controlar.

                    Cada control corta la propagación por su cuenta: la tarjeta que los
                    contiene tiene su propio onClick para expandirse, y si el click
                    subiera, tocar play la cerraría. Se hace en los controles y no en el
                    contenedor porque un `div` con onClick no es un control y no
                    responde al teclado.

                    El nombre del grupo describe qué controla, no de qué proyecto es:
                    con solo `label` anunciaba "Melodía, grupo", que no dice nada sobre
                    lo que hay adentro. */}
                {video && (
                    <div
                        className="fono-barra"
                        role="group"
                        aria-label={`${t('projects.player.label')} — ${label}`}
                    >
                        <div className="fono-pista">
                            <span className="fono-pista-nombre">{nombreDemo(t, video.nombre)}</span>
                            <span className="fono-pista-album">{label}</span>
                        </div>

                        <div className="fono-transporte">
                            <button
                                type="button"
                                className="fono-icono"
                                onClick={e => { e.stopPropagation(); saltar(-10); }}
                                aria-label={t('projects.player.back10')}
                            >
                                <FiRewind size={16} />
                            </button>

                            <button
                                type="button"
                                className="fono-icono fono-play"
                                onClick={e => { e.stopPropagation(); alternarPausa(); }}
                                aria-label={va ? t('projects.player.pause') : t('projects.player.play')}
                            >
                                {va ? <FiPause size={18} /> : <FiPlay size={18} />}
                            </button>

                            <button
                                type="button"
                                className="fono-icono"
                                onClick={e => { e.stopPropagation(); saltar(10); }}
                                aria-label={t('projects.player.forward10')}
                            >
                                <FiFastForward size={16} />
                            </button>
                        </div>

                        <p className="fono-tiempos">
                            <span className="fono-tiempo-actual">{reloj(tiempo)}</span>
                            <span aria-hidden="true"> / </span>
                            <span className="fono-tiempo-total">{reloj(duracion)}</span>
                        </p>

                        <div className="fono-secundarios">
                            <button
                                type="button"
                                className="fono-icono"
                                onClick={e => {
                                    e.stopPropagation();
                                    const v = videoRef.current;
                                    if (v) v.muted = !v.muted;
                                }}
                                aria-label={mudo ? t('projects.player.unmute') : t('projects.player.mute')}
                            >
                                {mudo || volumen === 0 ? <FiVolumeX size={15} /> : <FiVolume2 size={15} />}
                            </button>

                            <input
                                className="fono-rango fono-volumen"
                                /* Igual que la aguja: el tramo activo se pinta con un
                                   degradado calculado, porque la pista no tiene forma
                                   nativa de mostrar hasta dónde llega el valor. */
                                style={{ '--nivel': `${(mudo ? 0 : volumen) * 100}%` }}
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={mudo ? 0 : volumen}
                                onClick={e => e.stopPropagation()}
                                onChange={e => {
                                    const v = videoRef.current;
                                    if (!v) return;
                                    v.volume = Number(e.target.value);
                                    v.muted = Number(e.target.value) === 0;
                                }}
                                aria-label={t('projects.player.volume')}
                                aria-valuetext={`${Math.round((mudo ? 0 : volumen) * 100)} %`}
                            />

                            <button
                                type="button"
                                className="fono-icono"
                                onClick={e => { e.stopPropagation(); videoRef.current?.requestFullscreen?.(); }}
                                aria-label={t('projects.player.fullscreen')}
                            >
                                <FiMaximize size={15} />
                            </button>
                        </div>

                        {/* La aguja va al ras del borde de abajo, como en la referencia, y
                            no entre los tiempos. El relleno se pinta con un degradado
                            calculado, porque un `input[type=range]` no tiene forma nativa
                            de mostrar cuánto lleva recorrido. */}
                        <input
                            className="fono-aguja"
                            style={{ '--avance': `${duracion ? (tiempo / duracion) * 100 : 0}%` }}
                            type="range"
                            min="0"
                            max={duracion || 0}
                            step="0.1"
                            value={Math.min(tiempo, duracion || 0)}
                            onClick={e => e.stopPropagation()}
                            onChange={e => {
                                const v = videoRef.current;
                                if (v) v.currentTime = Number(e.target.value);
                            }}
                            aria-label={t('projects.player.seek')}
                            aria-valuetext={`${reloj(tiempo)} ${t('projects.player.of')} ${reloj(duracion)}`}
                        />
                    </div>
                )}

                {children}
            </div>
        </div>
    );
}

/** Segundos a `m:ss`. Sin duración todavía, `0:00`. */
function reloj(segundos) {
    if (!Number.isFinite(segundos)) return '0:00';
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * El nombre visible de una demo. Sale de `projects.demos.<archivo sin
 * extensión>`; si no está traducido, se usa el nombre del archivo prolijeado en
 * lugar de la ruta de la clave, que es lo que devuelve `t()` cuando no encuentra.
 *
 * @param {(path: string) => string} t
 * @param {string} archivo  Ej.: `'cover-ai.mp4'`.
 */
function nombreDemo(t, archivo) {
    const base = archivo.replace(/\.[^.]+$/, '');
    const clave = `projects.demos.${base}`;
    const texto = t(clave);
    if (texto !== clave) return texto;
    // Sin traducción, el nombre del archivo prolijeado. El índice de adelante se cae:
    // está para ordenar las capturas (`1-tablero`, `2-fichas`), no para leerse.
    return base
        .replace(/^\d+[-_]/, '')
        .replace(/[-_]/g, ' ')
        .replace(/^./, c => c.toUpperCase());
}
