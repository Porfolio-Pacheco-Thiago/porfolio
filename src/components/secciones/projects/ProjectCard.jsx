import { SiGithub } from 'react-icons/si';
import { useLang } from '../../../context/lang-context';
import { projectMeta } from '../../../data/projects';
import { getCover, getPortada, getVideos, getImagenes, getMarca } from '../../../lib/media';
import BarraVentana from '../../ui/BarraVentana';
import DemoDispositivo from '../../ui/DemoDispositivo';
import Gallery from '../../ui/Gallery';
import LogoBucle from '../../ui/LogoBucle';
import LogoFila from '../../ui/LogoFila';
import Shell from '../../ui/Shell';

/**
 * Una tarjeta de Proyectos: la ventana con su marca o su tapa, el título que la abre y,
 * desplegado, el aparato con las demos más la descripción y la galería.
 *
 * Sale de `Projects.jsx`, donde era un `map` de 286 líneas y ocho niveles de anidado
 * dentro de una función que además llevaba el estado de la sección. Es el mismo reparto
 * que Trayectoria ya usaba con `journey/TimelineItem`: la sección se queda con la grilla,
 * el estado y las transiciones, y la tarjeta con lo suyo.
 *
 * **Nada de esto es estado propio.** La tarjeta no decide si está abierta ni si está
 * reproduciendo: eso vive en la sección, porque solo una puede estarlo a la vez y porque
 * la grilla entera se reacomoda alrededor. Acá llegan ya resueltos.
 *
 * @param {object} props
 * @param {object} props.item            La entrada de i18n: título, descripción, tags.
 * @param {number} props.index           Su lugar en la grilla, para escalonar la entrada.
 * @param {boolean} props.abierta
 * @param {boolean} props.reproduciendo  Hay una demo de video puesta.
 * @param {boolean} props.ampliada       La tapa está ampliada.
 * @param {(clave: string, habilitado: boolean) => object} props.propsTapa
 *   El juego de props que hace de la tapa un interruptor accesible. Viene de
 *   `useAlternable`, en la sección, porque solo una tapa puede estar ampliada a la vez.
 * @param {() => void} props.onAlternar  Abre y cierra.
 * @param {(va: boolean) => void} props.onReproducir
 * @param {(cambio: () => void) => void} props.conTransicion
 */
export default function ProjectCard({
    item, index, abierta, reproduciendo, ampliada, propsTapa,
    onAlternar, onReproducir, conTransicion,
}) {
    const { t } = useLang();
    const { Icon, repo, pantalla, carrusel, bucle } = projectMeta[item.id] ?? {};
    const carpeta = `projects/${item.id}`;
    // Un proyecto puede traer una tapa en tres versiones —quieta por
    // tema y animada— o una imagen común. Ver `getPortada`.
    const portada = getPortada(carpeta);
    const cover = portada.oscuro ?? getCover(carpeta);
    // La marca —el logo, o los videítos que se turnan— se ve con la
    // tarjeta cerrada y le deja el lugar a la captura al abrirla.
    const marca = getMarca(carpeta);
    const hayMarca = Boolean(marca.imagen || marca.videos.length);
    // Los videos se van al aparato y la galería se queda con las
    // imágenes, sin repetir la que ya se ve como tapa.
    const videos = getVideos(carpeta);
    const imagenes = getImagenes(carpeta, cover);
    // En un monitor van también las capturas, no solo los videos: son
    // proyectos de escritorio y de web, y una captura apaisada dentro de
    // la pantalla del aparato se lee mucho mejor que en la grilla de la
    // galería.
    //
    // Se piden sin excluir la tapa —a diferencia de `imagenes`— porque
    // acá esa exclusión estorba: la tapa de Monopoly y la de Zorro son
    // capturas del programa, y dejarlas afuera le sacaba al monitor
    // justo la principal. Lo que sí se saca es la tapa explícita
    // (`cover.*`), que no es una captura sino la pieza de portada.
    const medios = pantalla === 'monitor' || pantalla === 'shell'
        ? [
            ...getImagenes(carpeta).filter(m => !/^cover\./i.test(m.nombre)),
            ...videos,
        ]
        : videos;

    // Descripción larga, tags y repo. Se arma una vez y se coloca en la
    // columna del celular o suelto, según el proyecto tenga videos o no.
    const aparte = (
        <div className="project-aparte">
            {/* Un `<p>` por párrafo, separados por una línea en blanco en
                el JSON. Como texto plano dentro de un solo `<p>` los saltos
                los come el HTML y los párrafos se pegan en un bloque. Los
                que traen una sola parte —que son casi todos— siguen dando
                un único `<p>`, igual que antes. */}
            {item.fullDesc.split('\n\n').map(parrafo => (
                <p className="project-fulldesc" key={parrafo.slice(0, 40)}>{parrafo}</p>
            ))}
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
        // que es un botón. Ver la nota en `secciones/journey/TimelineItem.jsx`.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <div
            key={item.id}
            // La placa sobre la que se apoya la marca depende del logo, y
            // el logo del proyecto: ver `--marca-placa` en Projects.css.
            data-proyecto={item.id}
            className={`project-card reveal-fade ${abierta ? 'expanded' : ''} ${reproduciendo ? 'is-reproduciendo' : ''}`}
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
                onAlternar();
            }}
        >
            {/* La ventana de larson: barra de título arriba, foto abajo, y la
                esquina de abajo a la izquierda recortada en diagonal para que el
                recuadro chico se apoye ahí. Los tres cuadraditos son ornamento
                de ventana —no son botones ni hacen nada—, de ahí el
                `aria-hidden` en toda la barra. */}
            <div className="project-marco">
                <BarraVentana className="project-barra" />
                {/* Con medios, la tapa es la captura elegida del proyecto; el
                    ícono queda como respaldo para los que todavía no tienen.
                    `alt` vacío a propósito: el título está al lado, así que
                    nombrarla otra vez solo repite. */}
                <div
                    className={`project-media ${hayMarca ? 'con-marca' : ''} ${ampliada ? 'is-ampliada' : ''}`}
                    // Solo donde hay algo que ver mejor: la franja que
                    // muestra un logo ya se ve entera. Es el mismo
                    // recorte que tenía la regla de `:hover`.
                    {...propsTapa(item.id, abierta && !hayMarca)}
                >
                    {/* La marca va primero y en absoluto, encima de la
                        tapa. Las dos conviven en el DOM y el CSS decide
                        cuál se ve según la tarjeta esté abierta o
                        cerrada — el mismo mecanismo que ya usaban las
                        tres versiones de `portada`. */}
                    {marca.videos.length > 0 ? (
                        <LogoBucle className="project-marca" videos={marca.videos} />
                    ) : marca.imagen && (
                        <img className={`project-marca ${marca.claro ? 'es-oscuro' : ''}`} src={marca.imagen} alt="" loading="lazy" decoding="async" />
                    )}
                    {/* Y su versión para el tema claro, cuando el logo trae
                        una. Conviven en el DOM como las tapas, por lo mismo:
                        que la que entra ya esté decodificada, así cambiar de
                        tema no deja el hueco vacío mientras baja. */}
                    {marca.claro && (
                        <img className="project-marca es-claro" src={marca.claro} alt="" loading="lazy" decoding="async" />
                    )}
                    {/* El logo apaisado, para la franja de la tarjeta
                        abierta. Es un archivo aparte del chico porque los
                        dos huecos tienen proporciones muy distintas —2.3:1
                        cerrada contra más de 5:1 abierta— y una sola pieza
                        no sirve para los dos. */}
                    {marca.videos.length > 0 ? (
                        // Con videos de marca no hay archivo apaisado que
                        // poner: la marca **son** ellos. En el hueco chico
                        // se turnan —`LogoBucle`—, pero acá la franja da
                        // para los tres en fila, y turnarlos escondería dos
                        // tercios de la pieza sin ganar nada.
                        <LogoFila className="project-marca-grande es-fila" videos={marca.videos} />
                    ) : marca.grande && (
                        <img className={`project-marca-grande ${marca.grandeClaro ? 'es-oscuro' : ''}`} src={marca.grande} alt="" loading="lazy" decoding="async" />
                    )}
                    {marca.grandeClaro && (
                        <img className="project-marca-grande es-claro" src={marca.grandeClaro} alt="" loading="lazy" decoding="async" />
                    )}
                    {portada.animada || portada.claro ? (
                        // Las tres conviven en el DOM y el CSS elige: la
                        // quieta que corresponda al tema mientras la
                        // tarjeta está cerrada, la animada al abrirla.
                        // Cambiar el `src` por JS al expandir haría que
                        // la animación empiece recién ahí, con un
                        // parpadeo mientras baja.
                        <>
                            <img className="project-cover es-oscuro" src={portada.oscuro} alt="" loading="lazy" decoding="async" />
                            {/* La clara es opcional: sin ella la oscura sirve
                                a los dos temas, y el CSS lo detecta por si
                                está o no en el DOM. Sin esta guarda quedaba
                                una `img` sin `src`, que en tema claro tapaba
                                la buena con su fondo blanco. */}
                            {portada.claro && (
                                <img className="project-cover es-claro" src={portada.claro} alt="" loading="lazy" decoding="async" />
                            )}
                            <img className="project-cover es-animada" src={portada.animada} alt="" loading="lazy" decoding="async" />
                        </>
                    ) : cover ? (
                        <img
                            className="project-cover"
                            src={cover}
                            alt=""
                            loading="lazy"
                            decoding="async"
                        />
                    ) : hayMarca ? null : (
                        // El ícono es el último recurso, para cuando no hay
                        // ni captura ni logo. Antes se dibujaba igual detrás
                        // de la marca y se le colaba encima: le pasaba a
                        // SpecForge, cuyo único archivo es su logo, así que
                        // `getCover` no devuelve nada y este bloque entraba.
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
                        onClick={e => { e.stopPropagation(); onAlternar(); }}
                        aria-expanded={abierta}
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
                <div className="project-extra" id={`proj-extra-${item.id}`} inert={!abierta}>
                    {/* Con celular, la descripción, los tags y el repo van en su
                        columna derecha; sin celular, uno debajo del otro. En los
                        dos casos viven dentro del bloque expandible, así que en
                        la vista chica no existen ni reciben foco. */}
                    {pantalla === 'shell' ? (
                        // La terminal es su propio chasis: no tiene demo
                        // que elegir ni video que reproducir, así que no
                        // pasa por `DemoDispositivo` —ver la nota de
                        // `ui/Shell.jsx`—. El título es el directorio del
                        // proyecto, como en una terminal de verdad.
                        <Shell medios={medios} titulo={`~/${item.id}`} label={item.title}>
                            {aparte}
                        </Shell>
                    ) : medios.length > 0 ? (
                        // `key` atado a si está abierta: al cerrar, el
                        // componente se **remonta** y vuelve solo a su
                        // estado inicial —sin demo elegida, aparato
                        // girando, video desmontado y por lo tanto en
                        // silencio—. Es la forma idiomática de resetear
                        // estado en React: nada de apagar cosas una por
                        // una desde afuera ni de efectos de limpieza.
                        <DemoDispositivo
                            key={abierta ? 'abierta' : 'cerrada'}
                            medios={medios}
                            dispositivo={pantalla === 'monitor' ? 'monitor' : 'fono'}
                            auto={Boolean(carrusel)}
                            segundos={carrusel?.segundos}
                            corte={carrusel?.corte}
                            bucle={bucle}
                            visible={abierta}
                            label={item.title}
                            onPlayingChange={onReproducir}
                            conTransicion={conTransicion}
                        >
                            {aparte}
                        </DemoDispositivo>
                    ) : (
                        aparte
                    )}

                    {/* La galería aparece **solo si hay imágenes que
                        mostrar**. Antes, sin aparato, se renderizaba
                        igual y `Gallery` caía en su marcador: SpecForge,
                        cuyo único archivo es el logo, terminaba con tres
                        recuadros punteados vacíos colgando abajo, que se
                        leen como que algo falló y no como "todavía sin
                        subir". Es la misma decisión que ya había tomado
                        Trayectoria para la Olimpiada.

                        Con monitor tampoco va, ni con la terminal: esos
                        dos chasis se llevan las capturas además de los
                        videos, así que no queda ninguna y repetirlas
                        sería mostrarlas dos veces. */}
                    {imagenes.length > 0 && pantalla !== 'monitor' && pantalla !== 'shell' && (
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
}
