import { useState } from 'react';
import { useLang } from '../context/lang-context';
import { journeyMeta } from '../data/journey';
import TimelineItem from './journey/TimelineItem';
import WireFigure from './ui/WireFigure';
import './Journey.css';

// Entrada sin metadata: al fondo del timeline, sobre el eje académico.
const DEFAULT_META = { sort: 0, category: 'academic' };

export default function Journey() {
    const { t, getList } = useLang();
    const [activeId, setActiveId] = useState(null);
    // null | 'academic' | 'work' — solo una línea puede ocultarse a la vez
    const [hidden, setHidden] = useState(null);

    const toggleHidden = (side) =>
        setHidden(prev => (prev === side ? null : side));

    const toggleItem = (id) =>
        setActiveId(prev => (prev === id ? null : id));

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

            <div className="timeline">
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
                    />
                ))}
            </div>
        </section>
    );
}
