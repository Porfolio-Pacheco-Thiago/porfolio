import { useLang } from '../../context/lang-context';
import GalleryPlaceholder from '../ui/GalleryPlaceholder';

/**
 * Acordeones por cliente dentro de una tarjeta del timeline (hoy, Lovelytics).
 *
 * @param {object} props
 * @param {Array<{id: string, label: string, period?: string, desc: string}>} props.clients
 * @param {Record<string, boolean>} props.abiertos  Qué cliente está desplegado.
 * @param {(id: string) => void} props.onToggle
 */
export default function NestedClients({ clients, abiertos, onToggle }) {
    const { t } = useLang();

    return (
        <ul className="nested-timeline">
            {clients.map(c => {
                const open = !!abiertos[c.id];
                const galeriaId = `cliente-galeria-${c.id}`;
                return (
                    <li key={c.id} className={`nested-item ${open ? 'open' : ''}`}>
                        <span className="nested-dot" />
                        <div className="nested-content">
                            <div className="nested-head">
                                <span className="nested-label">{c.label}</span>
                                {c.period && <span className="nested-period">{c.period}</span>}
                            </div>
                            <p className="nested-desc">{c.desc}</p>
                            <button
                                type="button"
                                className="nested-more"
                                onClick={(e) => { e.stopPropagation(); onToggle(c.id); }}
                                aria-expanded={open}
                                aria-controls={galeriaId}
                            >
                                <span>{open ? t('projects.showLess') : t('projects.viewMore')}</span>
                                <svg className="nested-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                            </button>
                            {/* inert mientras está cerrada: sigue en el DOM para animarse,
                                pero no recibe foco ni la leen los lectores de pantalla */}
                            <GalleryPlaceholder
                                className="nested-gallery"
                                count={2}
                                id={galeriaId}
                                inert={!open}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
