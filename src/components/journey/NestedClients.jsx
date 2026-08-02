import { getLogoApaisado } from '../../lib/media';
import { journeyClientMeta } from '../../data/journey';

/**
 * Los puntos de la línea de tiempo interna de una tarjeta (hoy, Lovelytics).
 *
 * Cada punto muestra su logo apaisado si su subcarpeta tiene uno. Antes cada uno era
 * un acordeón con un "Más Información" que desplegaba una galería: se fue el botón y
 * con él el estado de qué punto estaba abierto, porque lo único que había detrás era
 * el logo y no hace falta esconderlo.
 *
 * @param {object} props
 * @param {Array<{id: string, label: string, period?: string, desc: string, tags?: string[]}>} props.clients
 * @param {string} props.carpeta  Carpeta de medios de la tarjeta que los contiene;
 *                                cada punto usa una subcarpeta suya con su `id`.
 */
export default function NestedClients({ clients, carpeta }) {
    return (
        <ul className="nested-timeline">
            {clients.map(c => {
                const logo = getLogoApaisado(`${carpeta}/${c.id}`);
                const fondo = journeyClientMeta[c.id]?.bannerFondo;
                const etiquetas = c.tags ?? [];
                return (
                    <li key={c.id} className="nested-item">
                        <span className="nested-dot" />
                        <div className="nested-content">
                            <div className="nested-head">
                                <span className="nested-label">{c.label}</span>
                                {c.period && <span className="nested-period">{c.period}</span>}
                            </div>
                            <p className="nested-desc">{c.desc}</p>
                            {/* El logo y las etiquetas del punto, uno al lado del otro.
                                Sin texto alternativo en la imagen: es el logo de quien el
                                rótulo de arriba ya nombra. Los puntos sin logo no muestran
                                recuadro —vacío se leería como que algo falló— y las
                                etiquetas se corren solas a ocupar el lugar. */}
                            {(logo || etiquetas.length > 0) && (
                                <div className="nested-medios">
                                    {logo && (
                                        <img
                                            className="nested-banner"
                                            style={{ '--banner-fondo': fondo }}
                                            src={logo}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    )}
                                    {etiquetas.length > 0 && (
                                        <div className="nested-tags">
                                            {etiquetas.map(tag => (
                                                <span key={tag} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
