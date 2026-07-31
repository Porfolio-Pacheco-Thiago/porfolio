import { useLang } from '../../context/lang-context';
import { getMedia } from '../../lib/media';
import GalleryPlaceholder from './GalleryPlaceholder';

/**
 * La galería de una tarjeta: muestra lo que haya en su carpeta de
 * `src/assets/media/`, distinguiendo imagen de video por la extensión.
 *
 * Mientras la carpeta esté vacía cae en `GalleryPlaceholder`, así que se puede
 * conectar tarjeta por tarjeta sin dejar huecos rotos en las demás.
 *
 * @param {object} props
 * @param {string} props.carpeta          Ruta dentro de `assets/media`. Ej.: `'projects/melodia'`.
 * @param {Array}  [props.medios]         Lista ya filtrada, si quien llama necesita
 *                                        mostrar solo una parte —por ejemplo las
 *                                        imágenes, cuando los videos se van al
 *                                        celular—. Por defecto, la carpeta entera.
 * @param {string} props.label            Nombre de la tarjeta, para el texto alternativo.
 * @param {string} props.className        Clase del contenedor.
 * @param {string} [props.itemClassName]  Clase de cada hueco. Por defecto, `${className}-item`.
 * @param {number} [props.count=3]        Huecos del marcador, si la carpeta está vacía.
 *
 * @remarks
 * - `preload="none"` + `poster`: sin esto, cada video empezaría a bajarse con la
 *   página aunque su tarjeta esté cerrada. Así el costo inicial es solo el
 *   poster —decenas de KB— y los MB del video se piden recién al darle play.
 * - Los videos son grabaciones verticales de celular y las capturas son
 *   apaisadas, así que cada hueco se marca con `is-video` para que el CSS
 *   decida cómo acomodar cada cosa.
 */
export default function Gallery({ carpeta, medios: propios, label, className, itemClassName, count = 3, ...props }) {
    const { t } = useLang();
    const medios = propios ?? getMedia(carpeta);
    const claseHueco = itemClassName ?? `${className}-item`;

    if (medios.length === 0) {
        return (
            <GalleryPlaceholder
                className={className}
                itemClassName={itemClassName}
                count={count}
                {...props}
            />
        );
    }

    return (
        // `ul`/`li` y no divs: es una colección, y así un lector de pantalla la
        // anuncia como "lista, 4 elementos" en vez de leer las capturas sueltas sin
        // decir cuántas hay ni dónde termina.
        <ul className={className} {...props}>
            {medios.map((medio, i) => (
                <li
                    key={medio.nombre}
                    className={`${claseHueco} is-media ${medio.tipo === 'video' ? 'is-video' : ''}`}
                >
                    {medio.tipo === 'video' ? (
                        // No hay archivo de subtítulos para estas grabaciones. Un
                        // <track> vacío sería peor que ninguno: le promete a un
                        // lector de pantalla algo que no está. Cuando exista el
                        // .vtt se agrega acá y se saca esta línea.
                        // eslint-disable-next-line jsx-a11y/media-has-caption
                        <video
                            src={medio.src}
                            poster={medio.poster}
                            preload="none"
                            controls
                            playsInline
                            aria-label={`${t('media.videoOf')} ${label} ${i + 1}`}
                        />
                    ) : (
                        <img
                            src={medio.src}
                            alt={`${t('media.imageOf')} ${label} ${i + 1}`}
                            loading="lazy"
                            decoding="async"
                        />
                    )}
                </li>
            ))}
        </ul>
    );
}
