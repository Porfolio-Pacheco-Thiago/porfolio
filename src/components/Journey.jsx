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

    // Las filas que de verdad ocupan lugar: si una rama está oculta las suyas miden
    // 0 y no cuentan. La tarjeta abierta se estira desde su fila hasta los dos
    // extremos del timeline, y para eso necesita saber cuántas filas tiene encima y
    // cuántas debajo — todas del mismo alto, así que alcanza con contarlas.
    const visibles = items.filter(item => hidden !== item.category);
    const abierta = visibles.find(item => item.id === activeId);

    return (
        // El lado abierto lo mira todo lo que tiene que correrse: la línea y sus
        // puntos, los dos bloques y los rótulos de rama.
        <section id="journey" className="experience has-decor" data-abierto={abierta?.category}>
            <WireFigure kind="cube" detail={3} spin="flat" className="wire-decor at-left" size={880} line={7} seconds={150} tiltX={20} tiltZ={-10} />
            <div className="section-header reveal">
                <h2 className="section-title">{t('journey.title')}</h2>
            </div>

            {/* Los rótulos van **arriba de la línea y en el flujo**, no flotando
                adentro. Cuando estaban posicionados en absoluto había que reservarles
                lugar con un `padding-top` a ojo, y en modo compacto ese relleno
                quedaba más chico que ellos: el rótulo "Académico" pisaba la esquina
                de la primera tarjeta. Así el alto lo reservan ellos mismos. */}
            <div className="timeline-ramas">
                {['academic', 'work'].map(side => (
                    <button
                        key={side}
                        type="button"
                        className={`timeline-axis-label rama-${side} ${hidden === side ? 'is-collapsed' : ''}`}
                        onClick={() => toggleHidden(side)}
                        aria-pressed={hidden === side}
                    >
                        {t(side === 'work' ? 'nav.experience' : 'nav.academic')}
                    </button>
                ))}
            </div>

            <div className="timeline" ref={timelineRef}>
                {/* Una sola línea en el medio: lo académico cae a la izquierda y lo
                    laboral a la derecha. */}
                <div className="timeline-axis" />

                {items.map(item => (
                    <TimelineItem
                        key={item.id}
                        item={item}
                        fila={visibles.indexOf(item)}
                        filas={visibles.length}
                        esUltima={item.id === visibles[visibles.length - 1]?.id}
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
