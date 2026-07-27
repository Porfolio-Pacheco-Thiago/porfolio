import { FiImage } from 'react-icons/fi';

/**
 * Marcador de posición para una galería, hasta conectar las carpetas de
 * `src/assets/media/<sección>/<id>/` con `import.meta.glob`.
 *
 * @param {object} props
 * @param {string} props.className        Clase del contenedor.
 * @param {string} [props.itemClassName]  Clase de cada hueco. Por defecto,
 *                                        `${className}-item`.
 * @param {number} [props.count=3]        Cantidad de huecos.
 *
 * @example
 * <GalleryPlaceholder className="project-gallery" />
 * <GalleryPlaceholder className="nested-gallery" count={2} inert />
 *
 * @remarks
 * El resto de props se pasa al contenedor, así se le puede dar `id`, `inert`
 * o atributos ARIA sin envolverlo en otro elemento.
 */
export default function GalleryPlaceholder({ className, itemClassName, count = 3, ...props }) {
    const claseHueco = itemClassName ?? `${className}-item`;
    return (
        <div className={className} {...props}>
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className={claseHueco}>
                    <FiImage aria-hidden="true" />
                </div>
            ))}
        </div>
    );
}
