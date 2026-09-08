import { useEffect, useRef, useState } from 'react';
import { FiImage, FiPlay } from 'react-icons/fi';
import { useLang } from '../../context/lang-context';
import { useCarrusel } from '../../hooks/useCarrusel';
import { useReproductor } from '../../hooks/useReproductor';
import BarraReproductor from './BarraReproductor';
import { soportaVistaTransicion } from '../../lib/vista-transicion';
import './DemoDispositivo.css';

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
 * En modo `auto` los medios se parten en dos roles: las **capturas** se turnan solas en
 * la pantalla cada `SEGUNDOS_POR_PIEZA`, subiendo una sobre otra, y los **videos** son
 * lo único que queda en la botonera. De ahí salen los dos casos que hay hoy:
 *
 *  - Con videos (Cassandra) el aparato sigue girando entre demo y demo, con sus
 *    capturas pasando en la pantalla, y la botonera queda con el botón de la demo.
 *  - Sin videos (VibeTrip) no hay nada que elegir, así que no hay botonera ni línea de
 *    ayuda, y el aparato se queda quieto y de frente: girar sin motivo distrae de lo
 *    único que está pasando, que es el carrusel.
 *
 * @param {object} props
 * @param {Array<{nombre: string, tipo: 'video'|'imagen', src: string, poster?: string}>} props.medios
 * @param {'fono'|'monitor'} [props.dispositivo]  Chasis. Por defecto `fono`.
 * @param {boolean} [props.visible]  Si la tarjeta que lo contiene está abierta. Con la
 *                                    tarjeta cerrada el bloque sigue en el DOM —se anima
 *                                    su despliegue— así que sin esto un video en bucle se
 *                                    reproduce tapado y a nadie le consta.
 * @param {number} [props.segundos]  Cuánto se queda cada captura en pantalla.
 * @param {boolean} [props.corte]  Cambia de captura de golpe, sin el relevo deslizado.
 * @param {boolean} [props.auto]  Las capturas pasan solas y la botonera queda solo con
 *   los videos.
 * @param {string} props.label  Nombre del proyecto, para los textos accesibles.
 * @param {React.ReactNode} [props.children]  Va en la columna derecha, debajo de
 *   la barra del reproductor. Lo usa `Projects` para poner ahí los tags y el link
 *   al repo, que en la referencia van al costado del celular y no abajo.
 * @param {(enDemo: boolean) => void} [props.onPlayingChange]  Avisa cuando se pone o
 *   se saca una demo de video. Ojo que **no** es "el video está corriendo": una pausa
 *   no lo baja, porque la demo sigue puesta. `Projects` lo usa para contraer la foto de
 *   la tarjeta y reacomodar el resto mientras se está viendo una demo, y desarmar todo
 *   eso cada vez que alguien aprieta pausa sería un salto.
 * @param {(cambio: () => void) => void} [props.conTransicion]  Corre un cambio de estado
 *   dentro de una View Transition. Sin esto el empalme se hace con transiciones de CSS,
 *   que alcanzan cuando solo se mueve la pose del aparato pero no cuando cambia el
 *   acomodo entero. Lo pasa `Projects`.
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
 * **Qué quedó acá y qué no.** Este archivo es el chasis: el giro, el enderezado al elegir
 * una demo, el carrusel de capturas de la pantalla y el empalme con la View Transition.
 * El reproductor se fue en dos partes —el estado y las acciones a
 * `hooks/useReproductor`, la barra a `ui/BarraReproductor`— porque era la mitad del
 * archivo y no tenía nada que ver con el aparato: la misma barra serviría dentro de
 * cualquier otra cosa.
 *
 * **El video es intocable y los controles viven afuera.** El `<video>` no lleva
 * `controls` y el CSS le saca los eventos de puntero, así que la barra del navegador no
 * aparece nunca encima de la pantalla del celular. En su lugar hay una barra propia
 * debajo de los botones de demo.
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
 * El giro se apaga con `prefers-reduced-motion` desde el CSS.
 */
/** Cuánto se queda cada pieza en pantalla en el carrusel automático. */
const SEGUNDOS_POR_PIEZA = 3;
export default function DemoDispositivo({
    medios, dispositivo = 'fono', auto = false, segundos = SEGUNDOS_POR_PIEZA,
    corte = false, bucle = null, label, children, onPlayingChange,
    conTransicion, visible = true, className = '', ...props
}) {
    const { t, lang } = useLang();
    // En modo `auto` los medios se parten en dos roles distintos: las capturas pasan
    // solas en la pantalla y los videos son lo único que se puede elegir. Sin `auto`
    // todo es elegible, que es como funcionaba antes.
    // En modo `bucle` el video no se elige: está puesto desde el principio y se repite
    // solo. Así que no queda nada en la botonera —de ahí el arreglo vacío— y el aparato
    // no tiene ningún motivo para girar, igual que un carrusel sin videos.
    const enBucle = Boolean(bucle);
    const piezas = auto ? medios.filter(m => m.tipo === 'imagen') : [];
    const elegibles = enBucle ? [] : (auto ? medios.filter(m => m.tipo === 'video') : medios);
    // El video del bucle solo existe con la tarjeta abierta. Sin la condición de
    // `visible` se montaba siempre: `.project-extra` no desmonta su contenido —lo tapa
    // con `max-height: 0` para poder animarlo— así que el efecto de más abajo le hacía
    // `play()` desde que cargaba la página y quedaba un 1080p decodificando en un
    // elemento de alto cero, con su decoder y sus buffers vivos, que nadie veía.
    const videoEnBucle = enBucle && visible ? medios.find(m => m.tipo === 'video') : undefined;

    // `null` = en reposo. Un número = esa demo, quieta y de frente.
    const [activa, setActiva] = useState(null);
    // Qué captura está en pantalla, y cuál se está yendo mientras dura el relevo. La
    // saliente se limpia sola cuando termina su animación de salida.
    //
    // El carrusel se para en dos casos: con una demo puesta —el video tapa la pantalla,
    // así que serían relevos que nadie ve— y con la tarjeta cerrada. Lo segundo no es
    // teórico: `.project-extra` no desmonta su contenido, lo tapa con `max-height: 0`
    // para poder animarlo, así que cuatro proyectos estaban cambiando de captura y
    // animando dos imágenes cada uno, uno de ellos cada segundo, para una pantalla de
    // alto cero.
    const {
        indice: pieza, saliente, limpiarSaliente,
    } = useCarrusel({
        cantidad: piezas.length,
        segundos,
        activo: auto && visible && activa === null,
        // A corte no hay relevo, así que no hay saliente: la pieza vieja no tiene que
        // quedarse en pantalla porque nada se desplaza por encima de ella. Y conviene
        // que no quede: sin animación no llega el `animationend` que la desmonta, y se
        // acumularían capturas viejas encima de la buena.
        conSaliente: !corte,
    });
    // Mientras vuelve al giro: corta la animación para que la transición pueda
    // llevarlo de frente hasta la pose inicial. Ver `elegir`.
    const [volviendo, setVolviendo] = useState(false);
    const fonoRef = useRef(null);

    // Quieto y de frente: porque se eligió una demo, o —con carrusel y nada que
    // elegir— porque no hay ningún motivo para que gire. Lo primero es VibeTrip, que
    // no tiene videos; Cassandra sí los tiene, así que sigue girando entre demo y demo
    // mientras sus capturas se turnan en la pantalla.
    const enDemo = activa !== null || enBucle || (auto && elegibles.length === 0);
    const medio = activa !== null ? elegibles[activa] : videoEnBucle;
    // Las pistas del video puesto, por idioma. Vacío si no tiene ninguna: ahí el botón
    // de CC directamente no se dibuja, porque no habría nada que prender.
    const pistas = medio?.subtitulos ?? {};
    const idiomasPista = Object.keys(pistas);

    // Solo un video trae reproductor. Una imagen se pone de frente y ya está: no hay
    // aguja que mover ni volumen que bajar.
    const video = medio?.tipo === 'video' ? medio : undefined;

    // El reproductor entero —estado, oyentes, acciones y subtítulos— en
    // `hooks/useReproductor`.
    //
    // Va **después** de `medio` y no antes: `clave` es el nombre del video puesto, y
    // declarado más arriba leía `medio` todavía en su zona muerta —`const` no se iza con
    // valor— así que tiraba un ReferenceError en cada render y la página no cargaba. Es
    // el mismo tropiezo que ya había pasado con `ORDEN` y `LETRAS` en `NombreTrazado`.
    //
    // `clave` existe porque el `<video>` lleva `key`: al cambiar de demo se remonta con
    // sus pistas nuevas y hay que volver a elegir cuál se muestra.
    const reproductor = useReproductor({ idioma: lang, clave: medio?.nombre });
    const { videoRef, va, propsVideo, marcarPausado } = reproductor;
    // Lo que va en la pantalla sin ninguna demo puesta: la captura que le toca al
    // carrusel, o —sin carrusel— la primera imagen, y si el proyecto solo tiene videos
    // (Melodía) el poster del primero que tenga uno.
    const enPantalla = auto ? piezas[pieza] : undefined;
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
    }, [activa, videoRef]);

    // El bucle arranca solo, sin que nadie lo elija, y corre más rápido que la grabación
    // original. Lo que habilita el arranque automático es `muted`: con audio los
    // navegadores lo bloquean salvo que haya un gesto del usuario detrás. Acá no se
    // pierde nada, porque el archivo directamente no tiene pista de audio —se la sacamos
    // al comprimirlo, que además es de donde salió la mayor parte del ahorro—.
    //
    // La velocidad se vuelve a poner en `canplay` y no solo acá: `playbackRate` es del
    // elemento, no del archivo, y vuelve a 1 cada vez que el navegador recarga la fuente.
    useEffect(() => {
        const el = videoRef.current;
        if (!enBucle || !visible || !el) return;
        el.playbackRate = bucle.velocidad ?? 1;
        el.play().catch(() => { /* si lo rechazan, el póster queda a la vista */ });
    }, [enBucle, visible, bucle, videoRef]);

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

        // Con morph, **todos** los cambios de estado tienen que caer en el mismo commit.
        // El aviso al padre arranca la View Transition, y esta saca su captura del
        // "después" en ese mismo instante: si `setActiva` se aplicara más tarde, lo que
        // se captura es el acomodo grande pero sin demo puesta —aparato girando, sin
        // barra, con la botonera de siempre— y el morph termina en esa pantalla
        // intermedia antes de saltar a la de verdad.
        //
        // El corte del giro también va adentro, y no antes: la captura del "antes" ya se
        // tomó con el aparato girado, así que el morph lo lleva de esa pose a la de
        // frente. Sacándolo afuera, las dos capturas salen iguales y el enderezado se
        // pierde.
        const morfando = Boolean(conTransicion) && soportaVistaTransicion();

        if (morfando) {
            conTransicion(() => {
                el?.getAnimations().forEach(a => {
                    try { a.cancel(); } catch { /* nada que cancelar */ }
                });
                if (el) el.style.transform = '';
                if (apagando) {
                    setActiva(null);
                    marcarPausado();
                    onPlayingChange?.(false);
                    return;
                }
                if (elegibles[i].tipo === 'video') {
                    onPlayingChange?.(true);
                } else if (va) {
                    marcarPausado();
                    onPlayingChange?.(false);
                }
                setActiva(i);
            });
            return;
        }

        if (apagando) {
            // Volviendo al giro: se corta la animación con una clase mientras la
            // transición lleva el celular de frente hasta la pose inicial, que es
            // exactamente el fotograma 0% del giro. Al sacarla, el giro arranca en
            // esa misma pose y el empalme no se ve.
            setVolviendo(true);
            setActiva(null);
            marcarPausado();
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
        // El aviso sale de **elegir**, no de que el video arranque: mientras haya una
        // demo puesta la tarjeta se queda en su acomodo grande, aunque esté en pausa.
        // Antes salía del evento `play`/`pause` del elemento, y entonces darle pausa
        // devolvía la tarjeta al acomodo anterior de golpe.
        if (elegibles[i].tipo === 'video') {
            onPlayingChange?.(true);
        } else if (va) {
            // Y pasar de un video a una imagen desmonta el `<video>` sin que dispare
            // `pause`, así que el apagado hay que avisarlo a mano.
            marcarPausado();
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
                            // antes de que llegue la duración del nuevo archivo, y
                            // sincroniza `va` **leyendo el elemento**, que es el único
                            // que sabe si está andando. Antes lo forzaba a `false`
                            // suponiendo que un elemento recién montado está en pausa.
                            // Es cierto al montarlo, pero `loadstart` no es solo eso: el
                            // `play()` que arranca la demo sale de un efecto, y si el
                            // evento llega después el `false` pisa al `true` que puso
                            // `play` y el botón queda en triángulo con el video andando.
                            // Leerlo cubre los dos casos, incluido el que motivó el
                            // `false`: al reabrir la tarjeta el elemento está pausado de
                            // verdad, así que sigue dando "Reproducir".
                            // El `disable` sigue siendo necesario aunque ya haya
                            // subtítulos: los tienen las demos con narración, no los
                            // videos mudos —los de marca, el bucle de Monopoly—, y la
                            // regla no distingue.
                            // eslint-disable-next-line jsx-a11y/media-has-caption
                            <video
                                key={video.nombre}
                                src={video.src}
                                poster={video.poster}
                                playsInline
                                loop={enBucle}
                                muted={enBucle}
                                onCanPlay={enBucle
                                    ? e => { e.currentTarget.playbackRate = bucle.velocidad ?? 1; }
                                    : undefined}
                                aria-label={`${nombreDemo(t, video.nombre)} — ${label}`}
                                {...propsVideo}
                            >
                                {/* Van las dos, y el efecto de más arriba elige cuál se
                                    ve. Sin `default`: dejar que el navegador prenda una
                                    haría que los subtítulos aparecieran solos, y acá los
                                    prende el botón. */}
                                {idiomasPista.map(idioma => (
                                    <track
                                        key={idioma}
                                        kind="subtitles"
                                        srcLang={idioma}
                                        src={pistas[idioma]}
                                        label={t(`projects.player.captionsIn.${idioma}`)}
                                    />
                                ))}
                            </video>
                        ) : medio ? (
                            // Una imagen elegida a mano: se pone de frente y ya está, sin
                            // barra debajo. `alt` vacío porque el botón que la puso ya la
                            // nombra y el nombre está a la vista.
                            <img key={medio.nombre} src={medio.src} alt="" decoding="async" />
                        ) : enPantalla ? (
                            // El carrusel. Las `key` remontan cada imagen al cambiar de
                            // pieza, que es lo que hace arrancar las dos animaciones del
                            // relevo sin coordinar nada desde JS.
                            <>
                                {/* La que se va, todavía en pantalla mientras sube. Sin
                                    ella el relevo dejaría ver el fondo negro por detrás
                                    durante medio segundo, y lo que se lee entonces no es
                                    un desplazamiento sino un parpadeo. */}
                                {saliente !== null && piezas[saliente] && (
                                    <img
                                        key={`sale-${piezas[saliente].nombre}`}
                                        className="fono-pieza is-saliente"
                                        src={piezas[saliente].src}
                                        alt=""
                                        aria-hidden="true"
                                        onAnimationEnd={limpiarSaliente}
                                    />
                                )}
                                {/* A corte la `key` es fija a propósito: es justo lo
                                    contrario del relevo. Con la `key` por nombre React
                                    desmonta la `img` y monta otra en su lugar, y ese
                                    remonte es lo que arranca la animación; fija, en
                                    cambio, parchea el `src` sobre el mismo elemento, que
                                    ya tiene la imagen decodificada del ciclo anterior.
                                    El cambio es un solo cuadro, sin blanco en el medio. */}
                                <img
                                    key={corte ? 'carrusel' : enPantalla.nombre}
                                    className={`fono-pieza ${corte ? 'es-corte' : ''}`}
                                    src={enPantalla.src}
                                    alt=""
                                    decoding="async"
                                />
                            </>
                        ) : (
                            reposo && <img src={reposo} alt="" loading="lazy" decoding="async" />
                        )}
                    </div>
                </div>
            </div>

            <div className="fono-controles">
                {/* Sin línea de ayuda: los botones traen su ícono —un play o una imagen—
                    y con eso se explican solos. El renglón que había arriba costaba unos
                    30px de alto en una tarjeta que no puede crecer, y ese alto le hacía
                    falta a la descripción. */}

                {elegibles.length > 0 && (
                <div className="fono-botones">
                    {elegibles.map((m, i) => (
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
                )}

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
                {/* La barra del reproductor, debajo de los botones de selección. Solo
                    aparece cuando hay algo que controlar: en bucle no hay nada que elegir
                    ni que pausar. Es presentación pura —ver `ui/BarraReproductor.jsx`— y
                    todo lo que hace sale del hook. */}
                {video && !enBucle && (
                    <BarraReproductor
                        nombre={nombreDemo(t, video.nombre)}
                        label={label}
                        va={reproductor.va}
                        tiempo={reproductor.tiempo}
                        duracion={reproductor.duracion}
                        volumen={reproductor.volumen}
                        mudo={reproductor.mudo}
                        subtitulos={reproductor.subtitulos}
                        haySubtitulos={idiomasPista.length > 0}
                        onAlternarSubtitulos={reproductor.alternarSubtitulos}
                        onSaltar={reproductor.saltar}
                        onAlternarPausa={reproductor.alternarPausa}
                        onAlternarMudo={reproductor.alternarMudo}
                        onVolumen={reproductor.ponerVolumen}
                        onBuscar={reproductor.buscar}
                        onPantallaCompleta={reproductor.pantallaCompleta}
                    />
                )}

                {children}
            </div>
        </div>
    );
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
