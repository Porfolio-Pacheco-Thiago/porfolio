import { useLang } from '../../context/lang-context';
import GalleryPlaceholder from '../ui/GalleryPlaceholder';
import NestedClients from './NestedClients';
import NestedNodes from './NestedNodes';

/**
 * Una entrada del timeline. Tiene tres modos excluyentes para el cuerpo
 * desplegado, en este orden: clientes, nodos, o descripción larga con galería.
 *
 * @param {object} props
 * @param {object} props.item          Entrada ya combinada con su metadata.
 * @param {boolean} props.isCollapsed  Su eje está oculto.
 * @param {boolean} props.isExpanded
 * @param {() => void} props.onToggle
 * @param {Record<string, boolean>} props.openClients
 * @param {(id: string) => void} props.onToggleClient
 */
export default function TimelineItem({
    item, isCollapsed, isExpanded, onToggle, openClients, onToggleClient,
}) {
    const { t } = useLang();
    const clients = item.clients ?? [];
    const nodes = item.nodes ?? [];
    const tags = item.tags ?? [];
    const extraId = `journey-extra-${item.id}`;

    return (
        // El div lleva onClick como atajo de mouse, no como control: el control
        // real es el botón de abajo, que sí es enfocable y tiene nombre. Por eso
        // no lleva role ni tabIndex, que crearían un botón dentro de otro.
        <div
            className={`timeline-item reveal-fade cat-${item.category} ${isCollapsed ? 'collapsed' : ''} ${isExpanded ? 'expanded' : ''} ${clients.length ? 'has-nested' : ''}`}
            onClick={onToggle}
        >
            <div className="timeline-dot">
                <div className="timeline-dot-inner" />
            </div>
            <div className="timeline-card">
                <div className="timeline-card-image">
                    <div className="timeline-img-placeholder">
                        <span aria-hidden="true">{item.title.charAt(0)}</span>
                    </div>
                </div>
                <div className="timeline-card-content">
                    <span className={`timeline-cat-label cat-${item.category}`}>
                        {item.category === 'work' ? t('nav.experience') : t('nav.academic')}
                    </span>
                    <span className="timeline-period">
                        {item.period}{item.location ? ` · ${item.location}` : ''}
                    </span>
                    <h3 className="timeline-company">{item.title}</h3>
                    <p className="timeline-role">{item.subtitle}</p>
                    {item.desc && <p className="timeline-desc">{item.desc}</p>}

                    <div className="timeline-extra" id={extraId} inert={!isExpanded}>
                        {clients.length > 0 ? (
                            <NestedClients
                                clients={clients}
                                abiertos={openClients}
                                onToggle={onToggleClient}
                            />
                        ) : nodes.length > 0 ? (
                            <NestedNodes nodes={nodes} />
                        ) : (
                            <>
                                {item.body && <p className="timeline-fulldesc">{item.body}</p>}
                                <GalleryPlaceholder className="timeline-gallery" />
                            </>
                        )}
                    </div>

                    {tags.length > 0 && (
                        <div className="timeline-tags">
                            {tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}
                    <button
                        type="button"
                        className="timeline-read-more"
                        onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        aria-expanded={isExpanded}
                        aria-controls={extraId}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        <span>{isExpanded ? t('projects.showLess') : t('projects.viewMore')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
