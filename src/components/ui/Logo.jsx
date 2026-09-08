import { TRAZOS, NODOS } from '../../data/logo-trazos';
import './Logo.css';

/**
 * El logo, vectorizado.
 *
 * Antes eran dos PNG de 256px —uno por tema— y por eso no se podía animar ni
 * escalaba: en el pie se dibuja a 64px y en una pantalla 2x se veía blando.
 *
 * No había vector de origen, así que se trazó **desde el PNG** por línea media:
 * binarizar, adelgazar (Zhang-Suen), armar el grafo del esqueleto, podar las
 * barbas, simplificar con Ramer-Douglas-Peucker y suavizar a bézier respetando
 * las esquinas. Por línea media y no por contorno porque el logo son trazos de
 * ancho parejo: un contorno rodearía cada trazo, y al animarlo se vería dibujar
 * el **borde** del trazo en vez del trazo.
 *
 * Contra el PNG original da 0.94 de IoU, cubriendo el 96.9% de sus píxeles. El
 * medio píxel que llevan sumado las coordenadas no es un ajuste a ojo: el
 * esqueleto son índices de píxel y el centro real del trazo cae en el centro del
 * píxel — sin corregirlo el IoU baja a 0.85.
 *
 * El color sale de `currentColor`: lo pone `--logo`, que cambia con el tema.
 *
 * **Lo que necesita la animación de dibujado** (la pantalla de carga, Fase 2) y
 * por eso vive acá y no allá:
 *
 * - Los trazos están **ordenados de arriba-izquierda a abajo-derecha**, para que
 *   el escalonado se lea como un trazo que avanza y no como parpadeos sueltos.
 * - `pathLength="100"` normaliza el largo de cada trazo, así el
 *   `stroke-dashoffset` es un porcentaje y no un número medido a mano.
 * - Cada elemento lleva su índice en `--i`, y cada trazo además su `--k`: cuánto
 *   tiene que durar, relativo al más largo. Sin eso todos tardarían lo mismo y
 *   los trazos cortos se verían arrastrarse.
 *
 * Los tres son inertes fuera del loader: nadie más los mira.
 *
 * @param {{className?: string, alt?: string}} props
 *   `alt` vacío marca el logo como decorativo, para cuando ya hay texto al lado.
 */
export default function Logo({ className, alt = 'Thiago Pacheco' }) {
    const decorativo = !alt;
    return (
        <svg
            className={['logo-marca', className].filter(Boolean).join(' ')}
            viewBox="0 0 256 256"
            role={decorativo ? undefined : 'img'}
            aria-hidden={decorativo || undefined}
            aria-label={decorativo ? undefined : alt}
        >
            <g
                className="logo-trazos"
                fill="none"
                stroke="currentColor"
                strokeWidth="7.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {TRAZOS.map(({ d, k }, i) => (
                    <path key={i} d={d} pathLength="100" style={{ '--i': i, '--k': k }} />
                ))}
            </g>
            <g className="logo-nodos" fill="currentColor">
                {NODOS.map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="7.4" style={{ '--i': i }} />
                ))}
            </g>
        </svg>
    );
}
