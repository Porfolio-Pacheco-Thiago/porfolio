import { useCallback, useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import { SiGithub } from 'react-icons/si';
import { useLang } from '../context/lang-context';
import { projectMeta } from '../data/projects';
import Gallery from './ui/Gallery';
import PhoneDemo from './ui/PhoneDemo';
import { getCover, getVideos, getImagenes } from '../lib/media';
import { desplazarA } from '../lib/scroll';
import WireFigure from './ui/WireFigure';
import './Projects.css';

export default function Projects() {
    const { t, getList } = useLang();
    const [expandedId, setExpandedId] = useState(null);
    // Qué proyecto está reproduciendo una demo. Mientras lo haga, su foto se
    // contrae y el celular se queda con ese espacio.
    const [reproduciendoId, setReproduciendoId] = useState(null);
    const activaRef = useRef(null);
    // Los nodos de cada tarjeta, para poder centrar la que se abre, y el de la
    // sección, para centrarla al cerrar.
    const tarjetasRef = useRef(new Map());
    const seccionRef = useRef(null);
    const items = getList('projects.items');

    /**
     * Centra un elemento en el espacio útil: la ventana menos el navbar.
     *
     * No sirve `scrollIntoView({ block: 'center' })`, que centra contra la ventana
     * entera: el navbar es fijo y le come los primeros ~84px, así que el borde de
     * arriba queda tapado. El navbar se mide en vez de hardcodearlo, porque su alto
     * cambia cuando la página está scrolleada.
     *
     * Si el elemento es más alto que ese espacio, `sobra` da negativo y lo que
     * queda es un recorte parejo arriba y abajo — que es lo que se quiere para la
     * grilla, más alta que la pantalla por unos pocos píxeles.
     */
    const centrar = useCallback((el) => {
        if (!el) return;
        const nav = document.querySelector('.navbar');
        const tapa = nav ? nav.getBoundingClientRect().height : 0;
        const caja = el.getBoundingClientRect();
        const sobra = window.innerHeight - tapa - caja.height;
        const destino = caja.top + window.scrollY - tapa - sobra / 2;

        // Con curva propia y no con `behavior: 'smooth'`: la duración del suavizado
        // nativo la fija el navegador —unos 300ms en Chrome— y no hay forma de
        // alargarla, así que sobre estos saltos se sentía abrupto. `desplazarA`
        // también respeta `prefers-reduced-motion` y cancela el anterior si se
        // encadenan dos.
        desplazarA(Math.max(0, destino), 900);
    }, []);

    /**
     * Deja la sección encuadrada igual que el link "Proyectos" del navbar: el tope
     * de la sección contra el tope de la ventana.
     *
     * **No se centra**, aunque parezca lo simétrico: la sección mide 948px contra
     * 953 de ventana, así que a ras de arriba entra entera, y centrarla la corría
     * 24px hacia abajo metiéndole el título debajo del navbar. Es lo mismo que hace
     * `scrollIntoView({ block: 'start' })`, con el desplazamiento propio para que
     * dure lo mismo que el resto.
     */
    const encuadrarSeccion = useCallback(() => {
        const sec = seccionRef.current;
        if (!sec) return;
        desplazarA(Math.max(0, sec.getBoundingClientRect().top + window.scrollY), 900);
    }, []);

    /**
     * Centra la tarjeta abierta. Comprueba la clase en el momento en vez de
     * recordar la intención: si hubo otro click en el medio, esta ya no es la
     * abierta y no hay que tocar nada.
     */
    const centrarTarjeta = useCallback((id) => {
        const el = tarjetasRef.current.get(id);
        if (el?.classList.contains('expanded')) centrar(el);
    }, [centrar]);

    const toggle = (id) => {
        const cerrando = expandedId === id;
        const run = () => flushSync(() => {
            setExpandedId(prev => (prev === id ? null : id));
            // Al cerrar, el `<video>` no se desmonta —el bloque queda en el DOM para
            // poder animarlo— y por eso no llega ningún `pause` que limpie el estado.
            if (cerrando) setReproduciendoId(null);
        });
        // View Transitions API: anima el reacomodo —la tarjeta pasa de celda de la
        // grilla a ancho completo y el resto desaparece— en vez de saltar de golpe.
        // Si no está soportada, cambia directo.
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Al abrir se centra la tarjeta; al cerrar, la sección. Sin lo segundo la
        // página queda donde estaba la tarjeta abierta y, como vuelven las siete, eso
        // cae en un punto cualquiera de la grilla.
        const acomodar = () => (cerrando ? encuadrarSeccion() : centrarTarjeta(id));

        if (!document.startViewTransition || reduced) {
            run();
            // Un frame para que el layout ya esté aplicado cuando se mida.
            requestAnimationFrame(acomodar);
            return;
        }
        // Las View Transitions no se interrumpen solas: sin esto, clickear
        // rápido encadena morphs sobre snapshots viejos y la grilla salta.
        activaRef.current?.skipTransition();
        const transicion = document.startViewTransition(run);
        activaRef.current = transicion;
        // Al terminar el morph, no durante: mientras corre, lo que se ve son capturas
        // superpuestas y scrollear la página por debajo se nota.
        transicion.finished.finally(() => {
            if (activaRef.current === transicion) activaRef.current = null;
            acomodar();
        });
    };

    return (
        // `is-compact` fija y sin botón de vista: esta sección tiene una sola
        // densidad. La clase queda porque es la que gobierna todo el CSS de la
        // grilla —Journey sigue usándola con su toggle—, pero acá ya no alterna.
        <section ref={seccionRef} id="projects" className="projects has-decor is-compact">
            <WireFigure kind="tetrahedron" detail={3} spin="flat" className="wire-decor at-right" size={720} line={7} seconds={115} tiltX={14} tiltZ={16} />
            <div className="section-header reveal">
                <h2 className="section-title">{t('projects.title')}</h2>
                <p className="section-subtitle">{t('projects.subtitle')}</p>
            </div>

            <div className="projects-grid">
                {items.map((item, index) => {
                    const { Icon, repo } = projectMeta[item.id] ?? {};
                    const isExpanded = expandedId === item.id;
                    const carpeta = `projects/${item.id}`;
                    const cover = getCover(carpeta);
                    // Los videos se van al celular y la galería se queda con las
                    // imágenes, sin repetir la que ya se ve como tapa.
                    const videos = getVideos(carpeta);
                    const imagenes = getImagenes(carpeta, cover);

                    // Descripción larga, tags y repo. Se arma una vez y se coloca en la
                    // columna del celular o suelto, según el proyecto tenga videos o no.
                    const aparte = (
                        <div className="project-aparte">
                            <p className="project-fulldesc">{item.fullDesc}</p>
                            <div className="project-tags">
                                {item.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                            {/* Sin repositorio público todavía: mejor ningún link que uno muerto */}
                            {repo && repo !== '#' && (
                                <a
                                    href={repo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="project-link"
                                    onClick={e => e.stopPropagation()}
                                >
                                    <SiGithub size={16} />
                                    <span>{t('projects.viewRepo')}</span>
                                </a>
                            )}
                        </div>
                    );
                    return (
                        // onClick como atajo de mouse; el control accesible es el título,
                        // que es un botón. Ver la nota en journey/TimelineItem.jsx.
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                        <div
                            key={item.id}
                            ref={el => {
                                if (el) tarjetasRef.current.set(item.id, el);
                                else tarjetasRef.current.delete(item.id);
                            }}
                            className={`project-card reveal-fade ${isExpanded ? 'expanded' : ''} ${reproduciendoId === item.id ? 'is-reproduciendo' : ''}`}
                            style={{
                                // Escalonado acotado: cada tarjeta se revela por su cuenta al
                                // entrar en pantalla, así que sin el tope la última esperaba
                                // 540ms aunque scrollearas directo hasta ella.
                                transitionDelay: `${Math.min(index, 2) * 90}ms`,
                                viewTransitionName: `proj-${item.id}`,
                                viewTransitionClass: 'proj-card',
                            }}
                            /* Clickear la tarjeta abre y cierra. La excepción es la barra
                               del reproductor: ahí los controles están pegados y errarle a la
                               aguja por unos píxeles cerraba el proyecto entero. Se filtra por
                               el origen del click en vez de poner un `onClick` en la barra,
                               que es un `div` y no responde al teclado — el linter de a11y lo
                               marca, y con razón. */
                            onClick={e => {
                                if (e.target.closest('.fono-barra')) return;
                                toggle(item.id);
                            }}
                            /* Al poner o sacar una demo, la foto se contrae o vuelve y la
                               tarjeta cambia de alto: el centrado anterior deja de valer y
                               queda descentrada. Se recentra cuando **termina** la
                               transición —no al disparar el cambio—, porque a mitad de la
                               animación el alto todavía no es el final. Las transiciones
                               burbujean, así que alcanza con escuchar en la tarjeta.

                               Se escuchan las **dos** que mueven el alto: la de la foto y
                               la del ancho del celular, que arrastra su alto porque la
                               pantalla es 1:2. Duran lo mismo pero el orden en que llegan
                               no está garantizado, y con una sola el recentrado podía
                               medir un alto que todavía no era el final. Correr dos veces
                               no molesta: el cálculo es idempotente. */
                            onTransitionEnd={e => {
                                const t = e.target;
                                const mueveElAlto =
                                    (e.propertyName === 'height' && t.classList.contains('project-media'))
                                    || (e.propertyName === 'width' && t.classList.contains('fono'));
                                if (!mueveElAlto) return;

                                const el = tarjetasRef.current.get(item.id);
                                if (el?.classList.contains('expanded')) {
                                    centrar(el);
                                } else if (expandedId === null) {
                                    // Acaba de cerrarse. Este es el corrector que faltaba: el
                                    // primer centrado corrió al terminar la View Transition
                                    // (~550ms), cuando la foto todavía se estaba encogiendo
                                    // hasta los 850ms — o sea midiendo una sección más alta
                                    // que la final, y por eso quedaba desencuadrada.
                                    encuadrarSeccion();
                                }
                            }}
                        >
                            {/* La ventana de larson: barra de título arriba, foto abajo, y la
                                esquina de abajo a la izquierda recortada en diagonal para que el
                                recuadro chico se apoye ahí. Los tres cuadraditos son ornamento
                                de ventana —no son botones ni hacen nada—, de ahí el
                                `aria-hidden` en toda la barra. */}
                            <div className="project-marco">
                                <div className="project-barra" aria-hidden="true">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                                {/* Con medios, la tapa es la captura elegida del proyecto; el
                                    ícono queda como respaldo para los que todavía no tienen.
                                    `alt` vacío a propósito: el título está al lado, así que
                                    nombrarla otra vez solo repite. */}
                                <div className="project-media">
                                    {cover ? (
                                        <img
                                            className="project-cover"
                                            src={cover}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : (
                                        <div className="project-img-placeholder">
                                            <span className="project-icon">{Icon && <Icon />}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* El nombre va debajo del marco y **es** el control que abre la
                                tarjeta: en la referencia no hay ningún otro botón a la vista.
                                El `h3` se conserva para que siga siendo un encabezado
                                navegable, y el botón vive adentro — al revés perdería el
                                nivel de título.

                                El recuadro es hermano y ornamento: vacío, con trazo fino, a
                                caballo de la esquina del marco. */}
                            <div className="project-cabecera">
                                <span className="project-notch" aria-hidden="true" />
                                <h3 className="project-title">
                                    <button
                                        type="button"
                                        className="project-title-btn"
                                        onClick={e => { e.stopPropagation(); toggle(item.id); }}
                                        aria-expanded={isExpanded}
                                        aria-controls={`proj-extra-${item.id}`}
                                    >
                                        {item.title}
                                    </button>
                                </h3>
                            </div>

                            <div className="project-info">
                                {/* Sin `shortDesc`: colapsada la referencia no muestra
                                    descripción, y expandida ya está la larga. Tener las dos
                                    era decir lo mismo dos veces. La clave sigue en i18n por si
                                    hace falta en otro lado. */}

                                {/* `inert` mientras está colapsado: el bloque sigue en el DOM
                                    para poder animarlo, pero así no lo leen los lectores de
                                    pantalla ni recibe foco. `aria-hidden` no serviría, porque
                                    la skill prohíbe ocultar elementos enfocables. */}
                                <div className="project-extra" id={`proj-extra-${item.id}`} inert={!isExpanded}>
                                    {/* Con celular, la descripción, los tags y el repo van en su
                                        columna derecha; sin celular, uno debajo del otro. En los
                                        dos casos viven dentro del bloque expandible, así que en
                                        la vista chica no existen ni reciben foco. */}
                                    {videos.length > 0 ? (
                                        // `key` atado a si está abierta: al cerrar, el
                                        // componente se **remonta** y vuelve solo a su
                                        // estado inicial —sin demo elegida, celular
                                        // girando, video desmontado y por lo tanto en
                                        // silencio—. Es la forma idiomática de resetear
                                        // estado en React: nada de apagar cosas una por
                                        // una desde afuera ni de efectos de limpieza.
                                        <PhoneDemo
                                            key={isExpanded ? 'abierta' : 'cerrada'}
                                            videos={videos}
                                            label={item.title}
                                            onPlayingChange={va => setReproduciendoId(va ? item.id : null)}
                                        >
                                            {aparte}
                                        </PhoneDemo>
                                    ) : (
                                        aparte
                                    )}

                                    {/* Con celular, la galería solo aparece si quedan
                                        imágenes que mostrar; sin celular sigue siendo
                                        la de siempre, marcador incluido. */}
                                    {videos.length === 0 ? (
                                        <Gallery
                                            className="project-gallery"
                                            carpeta={carpeta}
                                            label={item.title}
                                        />
                                    ) : imagenes.length > 0 && (
                                        <Gallery
                                            className="project-gallery"
                                            carpeta={carpeta}
                                            medios={imagenes}
                                            label={item.title}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
