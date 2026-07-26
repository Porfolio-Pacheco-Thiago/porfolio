import { useState, useRef, useLayoutEffect } from 'react';
import { useLang } from '../context/lang-context';
import { journeyMeta } from '../data/journey';
import GalleryPlaceholder from './ui/GalleryPlaceholder';
import './Journey.css';

// Entrada sin metadata: al fondo del timeline, sobre el eje académico.
const DEFAULT_META = { sort: 0, category: 'academic' };

export default function Journey() {
    const { t, getList } = useLang();
    const timelineRef = useRef(null);
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

    // Una banda de luz recorre la línea siguiendo el scroll, centrada en la
    // mitad de la pantalla: arriba y abajo la línea queda apagada. Se escribe
    // como variable CSS tocando el DOM directamente en vez de usar estado,
    // para no re-renderizar en cada frame.
    useLayoutEffect(() => {
        const timeline = timelineRef.current;
        if (!timeline) return;

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        // Alto de la banda encendida, en proporción a la ventana
        const BAND_RATIO = 0.34;
        const axes = [...timeline.querySelectorAll('.timeline-axis')];

        let frame = 0;
        let necesitaMedir = true;
        let band = 0;
        // Centro de cada punto relativo al tope del timeline. Solo cambia al
        // expandir/colapsar o al hacer resize, así que se cachea en vez de
        // medirlo por frame.
        let puntos = [];

        const update = () => {
            frame = 0;
            if (reduced.matches) {
                timeline.setAttribute('data-static', '');
                return;
            }

            // --- Fase de lectura: todo el layout se lee junto y primero ---
            const rect = timeline.getBoundingClientRect();
            if (!rect.height) return;
            const vh = window.innerHeight;

            const remidio = necesitaMedir;
            if (remidio) {
                band = vh * BAND_RATIO;
                puntos = [];
                for (const item of timeline.querySelectorAll('.timeline-item')) {
                    const dot = item.querySelector('.timeline-dot');
                    if (!dot) continue;
                    const d = dot.getBoundingClientRect();
                    puntos.push({ item, centro: d.top - rect.top + d.height / 2 });
                }
                necesitaMedir = false;
            }

            // --- Fase de escritura: ni una lectura de layout más abajo ---
            const progress = Math.min(1, Math.max(0, (vh / 2 - rect.top) / rect.height));
            const offset = progress * rect.height;

            timeline.removeAttribute('data-static');
            for (const axis of axes) {
                // El alto de la banda solo cambia con el resize, no por frame
                if (remidio) axis.style.setProperty('--timeline-band', `${Math.round(band)}px`);
                axis.style.setProperty('--timeline-offset', `${offset.toFixed(1)}px`);
            }
            for (const { item, centro } of puntos) {
                item.toggleAttribute('data-lit', Math.abs(centro - offset) <= band / 2);
            }
        };

        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        const remedir = () => {
            necesitaMedir = true;
            schedule();
        };

        // El listener de scroll solo vive mientras el timeline está en pantalla:
        // fuera de ella no hay nada que animar y no tiene sentido recalcular
        // durante todo el scroll de la página.
        const visibilidad = new IntersectionObserver(
            ([entrada]) => {
                if (entrada.isIntersecting) {
                    window.addEventListener('scroll', schedule, { passive: true });
                    schedule();
                } else {
                    window.removeEventListener('scroll', schedule);
                }
            },
            { rootMargin: '25% 0px' }
        );

        // Primera pasada síncrona: si se dejara al rAF, habría un frame con la
        // banda sin posicionar (y en pestañas de fondo el rAF no corre nunca).
        update();
        visibilidad.observe(timeline);
        reduced.addEventListener('change', remedir);
        // Cubre el resize y los cambios de alto al expandir/colapsar tarjetas
        const tamaño = new ResizeObserver(remedir);
        tamaño.observe(timeline);

        return () => {
            window.removeEventListener('scroll', schedule);
            reduced.removeEventListener('change', remedir);
            visibilidad.disconnect();
            tamaño.disconnect();
            cancelAnimationFrame(frame);
        };
    }, []);

    const items = getList('journey.items')
        .map(item => ({ ...DEFAULT_META, ...journeyMeta[item.id], ...item }))
        .sort((a, b) => b.sort - a.sort);

    return (
        <section id="journey" className="experience">
            <div className="section-header reveal">
                <h2 className="section-title">{t('journey.title')}</h2>
                <p className="section-subtitle">{t('journey.subtitle')}</p>
            </div>

            <div className="timeline" ref={timelineRef}>
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
                            className={`timeline-item reveal-fade cat-${item.category} ${isCollapsed ? 'collapsed' : ''} ${isExpanded ? 'expanded' : ''} ${clients.length ? 'has-nested' : ''}`}
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
