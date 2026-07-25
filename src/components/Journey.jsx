import { useState } from 'react';
import { useLang } from '../context/lang-context';
import { journeyMeta } from '../data/journey';
import GalleryPlaceholder from './ui/GalleryPlaceholder';
import './Journey.css';

// Entrada sin metadata: al fondo del timeline, sobre el eje académico.
const DEFAULT_META = { sort: 0, category: 'academic' };

export default function Journey() {
    const { t, getList } = useLang();
    const [activeId, setActiveId] = useState(null);
    // null | 'academic' | 'work' — solo una línea puede ocultarse a la vez
    const [hidden, setHidden] = useState(null);
    // Acordeones por cliente de la línea de tiempo interna (Lovelytics)
    const [openClients, setOpenClients] = useState({});

    const toggleHidden = (side) =>
        setHidden(prev => (prev === side ? null : side));

    const toggleClient = (id) =>
        setOpenClients(prev => ({ ...prev, [id]: !prev[id] }));

    const toggleItem = (id) =>
        setActiveId(prev => (prev === id ? null : id));

    const items = getList('journey.items')
        .map(item => ({ ...DEFAULT_META, ...journeyMeta[item.id], ...item }))
        .sort((a, b) => b.sort - a.sort);

    return (
        <section id="journey" className="experience">
            <div className="section-header reveal">
                <h2 className="section-title">{t('journey.title')}</h2>
                <p className="section-subtitle">{t('journey.subtitle')}</p>
            </div>

            <div className="timeline reveal-fade">
                {['academic', 'work'].map(side => (
                    <div
                        key={side}
                        className={`timeline-axis line-${side} ${hidden === side ? 'line-hidden' : ''}`}
                    >
                        <button
                            type="button"
                            className={`timeline-axis-label ${hidden === side ? 'is-collapsed' : ''}`}
                            onClick={() => toggleHidden(side)}
                            aria-pressed={hidden === side}
                        >
                            {t(side === 'work' ? 'nav.experience' : 'nav.academic')}
                        </button>
                    </div>
                ))}

                {items.map(item => {
                    const clients = item.clients ?? [];
                    const nodes = item.nodes ?? [];
                    const tags = item.tags ?? [];
                    const isCollapsed = hidden === item.category;
                    const isExpanded = activeId === item.id && !isCollapsed;

                    return (
                        <div
                            key={item.id}
                            className={`timeline-item cat-${item.category} ${isCollapsed ? 'collapsed' : ''} ${isExpanded ? 'expanded' : ''} ${clients.length ? 'has-nested' : ''}`}
                            onClick={() => toggleItem(item.id)}
                        >
                            <div className="timeline-dot">
                                <div className="timeline-dot-inner" />
                            </div>
                            <div className="timeline-card">
                                <div className="timeline-card-image">
                                    <div className="timeline-img-placeholder">
                                        <span>{item.title.charAt(0)}</span>
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

                                    <div className="timeline-extra">
                                        {clients.length > 0 ? (
                                            <div className="nested-timeline">
                                                {clients.map(c => {
                                                    const open = !!openClients[c.id];
                                                    return (
                                                        <div key={c.id} className={`nested-item ${open ? 'open' : ''}`}>
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
                                                                    onClick={(e) => { e.stopPropagation(); toggleClient(c.id); }}
                                                                    aria-expanded={open}
                                                                >
                                                                    <span>{open ? t('projects.showLess') : t('projects.viewMore')}</span>
                                                                    <svg className="nested-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                                                </button>
                                                                <GalleryPlaceholder className="nested-gallery" count={2} />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : nodes.length > 0 ? (
                                            <div className="nested-timeline">
                                                {nodes.map(n => (
                                                    <div key={n.id} className="nested-item">
                                                        <span className="nested-dot" />
                                                        <div className="nested-content">
                                                            <div className="nested-head">
                                                                <span className="nested-label">{n.label}</span>
                                                                {n.period && <span className="nested-period">{n.period}</span>}
                                                            </div>
                                                            <p className="nested-desc">{n.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
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
                                        className="timeline-read-more"
                                        onClick={(e) => { e.stopPropagation(); toggleItem(item.id); }}
                                        aria-expanded={isExpanded}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                        <span>{isExpanded ? t('projects.showLess') : t('projects.viewMore')}</span>
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
