import { useLang } from '../../context/lang-context';
import Gallery from '../ui/Gallery';
import { getLogo, getLogoApaisado, getFotos } from '../../lib/media';
import NestedClients from './NestedClients';
import NestedNodes from './NestedNodes';

/**
 * Una entrada del timeline. Tiene tres modos excluyentes para el cuerpo
 * desplegado, en este orden: clientes, nodos, o descripción larga con galería.
 *
 * @param {object} props
 * @param {object} props.item          Entrada ya combinada con su metadata.
 * @param {boolean} props.isCollapsed  Su eje está oculto.
 * @param {number} props.fila          Su posición entre las entradas visibles.
 * @param {number} props.filas         Cuántas entradas visibles hay.
 * @param {boolean} props.esUltima     Es la última visible: no lleva aire debajo.
 * @param {boolean} props.isExpanded
 * @param {() => void} props.onToggle
 */
export default function TimelineItem({
    item, isCollapsed, isExpanded, onToggle,
    fila = 0, filas = 1, esUltima = false,
}) {
    const { t } = useLang();
    const clients = item.clients ?? [];
    const nodes = item.nodes ?? [];
    const tags = item.tags ?? [];
    const extraId = `journey-extra-${item.id}`;
    const carpeta = `timeline/${item.id}`;
    const apaisado = getLogoApaisado(carpeta);
    const fotos = getFotos(carpeta);

    // Se define una vez y se ubica según el modo, siempre **arriba de las fotos**.
    const etiquetas = tags.length > 0 && (
        <div className="timeline-tags">
            {tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
            ))}
        </div>
    );

    // Las fotos de la carpeta, **solo si las hay**. No queda marcador de posición: la
    // única entrada sin fotos es la Olimpiada, que no va a tener, y tres recuadros
    // punteados ahí se leen como que algo falló y no como "todavía sin subir".
    const galeria = fotos.length > 0 && (
        <Gallery
            className="timeline-gallery"
            carpeta={carpeta}
            medios={fotos}
            label={item.title}
        />
    );

    return (
        // El div lleva onClick como atajo de mouse, no como control: el control real es
        // la barra de título, que es un <button> enfocable y con nombre. Por eso este
        // div no lleva role ni tabIndex, que crearían un botón dentro de otro.
        // La alternativa canónica sería estirar el botón sobre la tarjeta con un
        // ::after, pero eso impide seleccionar el texto y hay que pelear el
        // z-index con los acordeones anidados.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
            className={`timeline-item reveal-fade cat-${item.category} ${isCollapsed ? 'collapsed' : ''} ${isExpanded ? 'expanded' : ''} ${clients.length ? 'has-nested' : ''} ${esUltima ? 'es-ultima' : ''}`}
            onClick={onToggle}
            // Cuántas filas tiene encima y cuántas debajo. Al abrirse, la ventana se
            // estira esas filas hacia arriba y hacia abajo hasta cubrir el timeline.
            style={{ '--i': fila, '--j': Math.max(0, filas - 1 - fila) }}
        >
            <div className="timeline-dot">
                <div className="timeline-dot-inner" />
            </div>
            {/* La foto va **fuera** de la ventana, a su costado externo. Por eso
                el bloque: la ventana y la foto son hermanas, no una adentro de la
                otra. Sale del índice de medios, así que aparece sola en cuanto haya
                un archivo en `src/assets/media/timeline/<id>/`; mientras tanto queda
                la inicial. */}
            <div className="timeline-bloque">
                <div className="timeline-card-image">
                    {(() => {
                        const tapa = getLogo(`timeline/${item.id}`);
                        return tapa
                            ? <img src={tapa} alt="" loading="lazy" />
                            : (
                                <div className="timeline-img-placeholder">
                                    <span aria-hidden="true">{item.title.charAt(0)}</span>
                                </div>
                            );
                    })()}
                </div>

                <div className="timeline-card">
                    {/* La barra de título de la ventana, igual que en Proyectos, y a la
                        vez **el control que abre y cierra la entrada**. Es el único lugar
                        donde podía ir un botón de verdad: el resto de la tarjeta tiene
                        adentro otros botones —los acordeones por cliente— y un control
                        dentro de otro es inválido.

                        Su nombre accesible es el título de la entrada y su estado lo dice
                        `aria-expanded`, que es el patrón de "divulgación" de siempre. Los
                        tres cuadraditos son decoración: de contorno y no rellenos, porque
                        rellenos se leerían como los botones de verdad de una ventana. */}
                    <button
                        type="button"
                        className="timeline-barra"
                        onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        aria-expanded={isExpanded}
                        aria-controls={extraId}
                        aria-label={item.title}
                    >
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                        <span aria-hidden="true" />
                    </button>
                    <div className="timeline-card-content">
                    <span className={`timeline-cat-label cat-${item.category}`}>
                        {item.category === 'work' ? t('nav.experience') : t('nav.academic')}
                    </span>
                    <span className="timeline-period">
                        {item.period}{item.location ? ` · ${item.location}` : ''}
                    </span>
                    {/* Va entre el renglón verde y el título, no adentro de `timeline-extra`
                        como el resto de lo que aparece al abrir. Se esconde en reposo por CSS,
                        igual que la descripción y las etiquetas.

                        Sin texto alternativo a propósito: es el logo de la institución que el
                        título de acá abajo ya nombra, así que leerlo de nuevo solo estorba. */}
                    {apaisado && (
                        <img
                            className="timeline-banner"
                            style={{ '--banner-fondo': item.bannerFondo }}
                            src={apaisado}
                            alt=""
                            loading="lazy"
                            decoding="async"
                        />
                    )}
                    <h3 className="timeline-company">{item.title}</h3>
                    <p className="timeline-role">{item.subtitle}</p>
                    {item.desc && <p className="timeline-desc">{item.desc}</p>}

                    <div className="timeline-extra" id={extraId} inert={!isExpanded}>
                        {clients.length > 0 ? (
                            <>
                                <NestedClients clients={clients} carpeta={carpeta} />
                                {etiquetas}
                                {galeria}
                            </>
                        ) : nodes.length > 0 ? (
                            <>
                                <NestedNodes nodes={nodes} />
                                {etiquetas}
                                {galeria}
                            </>
                        ) : (
                            <>
                                {item.body && <p className="timeline-fulldesc">{item.body}</p>}
                                {etiquetas}
                                {galeria}
                            </>
                        )}
                    </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
