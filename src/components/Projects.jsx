import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import { SiGithub } from 'react-icons/si';
import { useLang } from '../context/lang-context';
import { projectMeta } from '../data/projects';
import GalleryPlaceholder from './ui/GalleryPlaceholder';
import WireFigure from './ui/WireFigure';
import './Projects.css';

export default function Projects() {
    const { t, getList } = useLang();
    const [expandedId, setExpandedId] = useState(null);
    const activaRef = useRef(null);
    const items = getList('projects.items');

    const toggle = (id) => {
        const run = () => flushSync(() => setExpandedId(prev => (prev === id ? null : id)));
        // View Transitions API: anima el reacomodo (posiciones + tamaños) en vez
        // de saltar por el cambio de `order`. Si no está soportada, cambia directo.
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!document.startViewTransition || reduced) {
            run();
            return;
        }
        // Las View Transitions no se interrumpen solas: sin esto, clickear
        // rápido encadena morphs sobre snapshots viejos y la grilla salta.
        activaRef.current?.skipTransition();
        const transicion = document.startViewTransition(run);
        activaRef.current = transicion;
        transicion.finished.finally(() => {
            if (activaRef.current === transicion) activaRef.current = null;
        });
    };

    // En la grilla de 2 columnas (con el primero a ancho completo), los índices
    // pares >= 2 caen en la columna derecha. Si se expande uno de la derecha, lo
    // adelantamos para que ocupe su fila y su vecino de la izquierda baje.
    const expandedIndex = items.findIndex(i => i.id === expandedId);
    const expandedIsRight = expandedIndex >= 2 && expandedIndex % 2 === 0;

    return (
        <section id="projects" className="projects has-decor">
            <WireFigure kind="tetrahedron" detail={3} spin="flat" className="wire-decor at-right" size={720} line={7} seconds={115} tiltX={14} tiltZ={16} />
            <div className="section-header reveal">
                <h2 className="section-title">{t('projects.title')}</h2>
                <p className="section-subtitle">{t('projects.subtitle')}</p>
            </div>

            <div className="projects-grid">
                {items.map((item, index) => {
                    const { Icon, repo } = projectMeta[item.id] ?? {};
                    const isExpanded = expandedId === item.id;
                    // Swap de orden entre el expandido (derecha) y su vecino izquierdo
                    let order = index;
                    if (expandedIsRight) {
                        if (index === expandedIndex) order = expandedIndex - 1;
                        else if (index === expandedIndex - 1) order = expandedIndex;
                    }
                    return (
                        // onClick como atajo de mouse; el control accesible es el botón
                        // "ver más" de abajo. Ver la nota en journey/TimelineItem.jsx.
                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                        <div
                            key={item.id}
                            className={`project-card reveal-fade ${index === 0 ? 'featured' : ''} ${isExpanded ? 'expanded' : ''}`}
                            style={{
                                // Escalonado acotado: cada tarjeta se revela por su cuenta al
                                // entrar en pantalla, así que sin el tope la última esperaba
                                // 540ms aunque scrollearas directo hasta ella.
                                transitionDelay: `${Math.min(index, 2) * 90}ms`,
                                order,
                                viewTransitionName: `proj-${item.id}`,
                                viewTransitionClass: 'proj-card',
                            }}
                            onClick={() => toggle(item.id)}
                        >
                            <div className="project-media">
                                <div className="project-img-placeholder">
                                    <span className="project-icon">{Icon && <Icon />}</span>
                                </div>
                            </div>
                            <div className="project-info">
                                <h3 className="project-title">{item.title}</h3>
                                <p className="project-desc">{item.shortDesc}</p>

                                {/* `inert` mientras está colapsado: el bloque sigue en el DOM
                                    para poder animarlo, pero así no lo leen los lectores de
                                    pantalla ni recibe foco. `aria-hidden` no serviría, porque
                                    la skill prohíbe ocultar elementos enfocables. */}
                                <div className="project-extra" id={`proj-extra-${item.id}`} inert={!isExpanded}>
                                    <p className="project-fulldesc">{item.fullDesc}</p>
                                    <GalleryPlaceholder className="project-gallery" />
                                </div>

                                <div className="project-tags">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                                <div className="project-actions">
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
                                    <button
                                        className="project-toggle"
                                        onClick={(e) => { e.stopPropagation(); toggle(item.id); }}
                                        aria-expanded={isExpanded}
                                        aria-controls={`proj-extra-${item.id}`}
                                    >
                                        {isExpanded ? t('projects.showLess') : t('projects.viewMore')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
