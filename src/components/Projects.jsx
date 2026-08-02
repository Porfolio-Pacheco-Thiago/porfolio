import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import { SiGithub } from 'react-icons/si';
import { useLang } from '../context/lang-context';
import { projectMeta } from '../data/projects';
import Gallery from './ui/Gallery';
import PhoneDemo from './ui/PhoneDemo';
import { getCover, getVideos, getImagenes } from '../lib/media';
import WireFigure from './ui/WireFigure';
import './Projects.css';

export default function Projects() {
    const { t, getList } = useLang();
    const [expandedId, setExpandedId] = useState(null);
    // Qué proyecto está reproduciendo una demo. Mientras lo haga, su foto se
    // contrae y el celular se queda con ese espacio.
    const [reproduciendoId, setReproduciendoId] = useState(null);
    const activaRef = useRef(null);
    const grillaRef = useRef(null);
    const items = getList('projects.items');

    const toggle = (id) => {
        const cerrando = expandedId === id;
        // Se le clava el alto a la grilla antes de tocar nada. Las tarjetas que no se
        // abren quedan ocultas **pero en su lugar** (ver Projects.css), pero la que sí
        // se abre pasa a posición absoluta y sale del flujo: sin eso la grilla se queda
        // con seis tarjetas, o sea dos filas en vez de tres, y se acorta igual. Es la
        // única medición que quedó, y reemplaza a todo el scroll de recentrado.
        const grilla = grillaRef.current;
        if (grilla && !cerrando && expandedId === null) {
            grilla.style.height = `${grilla.getBoundingClientRect().height}px`;
        }
        const soltarGrilla = () => {
            if (grilla && cerrando) grilla.style.height = '';
        };
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

        // Acá iba un scroll de reacomodo —centrar la tarjeta al abrir, encuadrar la
        // sección al cerrar—. Ya no hace falta: la grilla no cambia de alto, así que la
        // tarjeta abierta aparece exactamente sobre el lugar que ya estabas mirando y
        // la página no se mueve. Ver la regla de `visibility` en Projects.css.
        if (!document.startViewTransition || reduced) {
            run();
            soltarGrilla();
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
            soltarGrilla();
        });
    };

    return (
        // `is-compact` fija y sin botón de vista: esta sección tiene una sola
        // densidad. La clase queda porque es la que gobierna todo el CSS de la
        // grilla —Journey sigue usándola con su toggle—, pero acá ya no alterna.
        <section id="projects" className="projects has-decor is-compact">
            <WireFigure kind="tetrahedron" detail={3} spin="flat" className="wire-decor at-right" size={720} line={7} seconds={115} tiltX={14} tiltZ={16} />
            <div className="section-header reveal">
                <h2 className="section-title">{t('projects.title')}</h2>
                <p className="section-subtitle">{t('projects.subtitle')}</p>
            </div>

            <div className="projects-grid" ref={grillaRef}>
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
