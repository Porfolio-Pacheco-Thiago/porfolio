import { useState, useRef, useLayoutEffect } from 'react';
import { useLang } from '../context/lang-context';
import { journeyMeta } from '../data/journey';
import TimelineItem from './journey/TimelineItem';
import WireFigure from './ui/WireFigure';
import './Journey.css';

// Entrada sin metadata: al fondo del timeline, sobre el eje académico.
const DEFAULT_META = { sort: 0, category: 'academic' };

export default function Journey() {
    const { t, getList } = useLang();
    const timelineRef = useRef(null);
    const [activeId, setActiveId] = useState(null);
    // Regla de diseño: cada sección entra en una pantalla. El modo compacto es
    // el estado normal; expandir es una acción explícita del usuario.
    const [compacto, setCompacto] = useState(true);
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
        <section id="journey" className={`experience has-decor ${compacto ? 'is-compact' : ''}`}>
            <WireFigure kind="cube" detail={3} spin="flat" className="wire-decor at-left" size={880} line={7} seconds={150} tiltX={20} tiltZ={-10} />
            <div className="section-header reveal">
                <h2 className="section-title">{t('journey.title')}</h2>
                <p className="section-subtitle">{t('journey.subtitle')}</p>
                <button
                    type="button"
                    className="section-toggle"
                    onClick={() => setCompacto(c => !c)}
                    aria-expanded={!compacto}
                >
                    {compacto ? t('section.expand') : t('section.collapse')}
                </button>
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

                {items.map(item => (
                    <TimelineItem
                        key={item.id}
                        item={item}
                        isCollapsed={hidden === item.category}
                        isExpanded={activeId === item.id && hidden !== item.category}
                        onToggle={() => toggleItem(item.id)}
                        openClients={openClients}
                        onToggleClient={toggleClient}
                    />
                ))}
            </div>
        </section>
    );
}
