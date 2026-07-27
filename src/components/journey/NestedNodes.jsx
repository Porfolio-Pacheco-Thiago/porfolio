/**
 * Lista anidada estática dentro de una tarjeta del timeline: la usa la entrada
 * de docencia para mostrar su trayectoria interna.
 *
 * @param {object} props
 * @param {Array<{id: string, label: string, period?: string, desc: string}>} props.nodes
 */
export default function NestedNodes({ nodes }) {
    return (
        <ul className="nested-timeline">
            {nodes.map(n => (
                <li key={n.id} className="nested-item">
                    <span className="nested-dot" />
                    <div className="nested-content">
                        <div className="nested-head">
                            <span className="nested-label">{n.label}</span>
                            {n.period && <span className="nested-period">{n.period}</span>}
                        </div>
                        <p className="nested-desc">{n.desc}</p>
                    </div>
                </li>
            ))}
        </ul>
    );
}
