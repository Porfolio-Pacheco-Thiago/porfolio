/* eslint-disable react-refresh/only-export-components */
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

/**
 * Los 27 trazos del circuito, en orden de dibujo.
 * `k` va de 0 a 1: el factor de duración, sublineal sobre el largo real. A
 * velocidad de pluma constante el trazo más largo tardaría 40 veces más que el
 * más corto (312 contra 8 unidades); elevar a 0.6 comprime eso a unas 9 veces,
 * que se lee como una mano rápida y no como dos animaciones distintas.
 */
export const TRAZOS = [
    { d: "M72.3 64.7L75.5 56.5L14.0 57.0L13.5 76.5L14.5 77.5L14.5 87.5L16.5 89.5L63.5 89.5L64.5 90.5C64.5 90.5 64.3 146.5 64.5 158.5C64.7 170.5 65.5 161.3 65.5 162.5C65.5 163.7 64.7 157.8 64.5 165.5C64.3 173.2 64.5 208.5 64.5 208.5L66.5 210.5C66.5 210.5 87.5 210.9 92.5 210.5C97.5 210.1 96.4 207.9 96.4 207.9", k: 1.0 },
    { d: "M72.3 64.7L82.5 56.5L157.5 56.5L159.5 58.5L159.5 71.5L160.5 72.5L183.5 72.5L184.5 73.5C184.5 73.5 192.7 73.3 196.5 74.5C200.3 75.7 205.2 79.0 207.5 80.5C209.8 82.0 210.5 83.5 210.5 83.5L206.2 90.2", k: 0.686 },
    { d: "M181.5 56.5C181.5 56.5 188.8 56.0 192.5 56.5C196.2 57.0 200.7 58.5 203.5 59.5C206.3 60.5 206.5 60.3 209.5 62.5C212.5 64.7 217.9 69.0 221.7 72.9C225.6 76.7 230.2 82.4 232.5 85.5C234.8 88.6 234.5 88.7 235.5 91.5C236.5 94.3 237.9 98.8 238.5 102.5C239.1 106.2 239.2 113.5 239.2 113.5", k: 0.478 },
    { d: "M72.3 64.7L78.5 57.5L72.3 64.7", k: 0.186 },
    { d: "M72.3 64.7L75.5 60.5L72.3 64.7", k: 0.131 },
    { d: "M32.5 72.5L63.5 72.5L72.3 64.7", k: 0.304 },
    { d: "M96.4 207.9L81.5 192.5C81.5 192.5 81.3 108.2 81.5 90.5C81.7 72.8 82.2 87.7 82.5 86.5C82.8 85.3 82.6 84.8 83.5 83.5C84.4 82.2 85.8 80.1 87.6 78.4C89.5 76.8 92.2 74.3 94.5 73.5C96.8 72.7 101.5 73.5 101.5 73.5L102.5 72.5L138.5 72.5", k: 0.765 },
    { d: "M222.5 113.5C222.5 113.5 222.7 106.7 221.5 102.5C220.3 98.3 217.0 91.2 215.5 88.5C214.0 85.8 212.5 86.5 212.5 86.5L206.2 90.2", k: 0.28 },
    { d: "M96.4 207.9L99.5 198.5C99.5 198.5 98.7 203.0 98.5 196.5C98.3 190.0 98.5 159.5 98.5 159.5L99.5 158.5L99.5 151.5L98.5 150.5L98.5 114.5L99.5 113.5C99.5 113.5 98.4 100.4 98.5 96.5C98.6 92.6 100.0 90.0 100.0 90.0L163.5 89.5L164.8 90.8", k: 0.739 },
    { d: "M206.2 90.2L199.5 94.5C199.5 94.5 193.7 91.2 191.5 90.5C189.3 89.8 186.5 90.5 186.5 90.5L185.5 89.5C185.5 89.5 171.9 89.3 168.5 89.5C165.1 89.7 164.8 90.8 164.8 90.8", k: 0.31 },
    { d: "M206.2 90.2C206.2 90.2 203.1 94.9 202.5 96.5C201.9 98.1 202.2 98.5 202.5 99.5C202.8 100.5 203.9 100.0 204.5 102.5C205.1 105.0 206.4 114.5 206.4 114.5", k: 0.227 },
    { d: "M164.8 90.8C164.8 90.8 167.1 89.4 163.5 93.5C159.9 97.6 143.3 115.2 143.3 115.2", k: 0.264 },
    { d: "M222.5 113.5C222.5 113.5 211.2 113.3 208.5 113.5C205.8 113.7 206.4 114.5 206.4 114.5", k: 0.172 },
    { d: "M207.0 145.2C207.0 145.2 212.2 141.3 214.5 138.5C216.8 135.7 219.3 131.5 220.5 128.5C221.7 125.5 221.2 122.0 221.5 120.5C221.8 119.0 222.5 119.5 222.5 119.5L222.5 113.5", k: 0.281 },
    { d: "M239.2 113.5L222.5 113.5", k: 0.173 },
    { d: "M239.2 113.5L239.5 117.5C239.5 117.5 239.0 116.0 238.5 118.5C238.0 121.0 239.0 127.1 236.5 132.5C234.0 137.9 223.8 150.8 223.8 150.8", k: 0.304 },
    { d: "M206.4 114.5C206.4 114.5 205.4 120.2 204.5 122.5C203.6 124.8 202.2 126.7 200.7 128.5C199.2 130.3 197.0 132.3 195.5 133.5C194.0 134.7 193.8 135.0 191.5 135.5C189.2 136.0 181.5 136.5 181.5 136.5L180.5 137.5L165.5 137.8", k: 0.347 },
    { d: "M143.3 115.2L121.5 136.5L121.5 153.5L132.3 148.2", k: 0.37 },
    { d: "M143.3 115.2L122.5 134.5L143.3 115.2", k: 0.359 },
    { d: "M132.3 148.2C132.3 148.2 139.6 142.3 142.5 140.5C145.4 138.7 145.7 138.0 149.5 137.5C153.3 137.0 165.5 137.8 165.5 137.8", k: 0.276 },
    { d: "M165.5 137.8L165.5 153.2", k: 0.164 },
    { d: "M207.0 145.2L210.5 143.5L207.0 145.2", k: 0.109 },
    { d: "M207.0 145.2C207.0 145.2 199.6 150.3 196.5 151.5C193.4 152.7 190.0 152.2 188.5 152.5C187.0 152.8 187.5 153.5 187.5 153.5L165.5 153.2", k: 0.309 },
    { d: "M223.8 150.8C223.8 150.8 213.5 160.7 209.5 163.5C205.5 166.3 202.7 166.7 199.5 167.5C196.3 168.3 190.5 168.5 190.5 168.5L189.5 169.5C189.5 169.5 164.2 169.3 158.5 169.5C152.8 169.7 156.2 170.2 155.5 170.5C154.8 170.8 154.5 171.5 154.5 171.5L154.5 207.5L151.5 210.5L123.5 210.5L121.5 208.5C121.5 208.5 121.3 169.2 121.5 160.5C121.7 151.8 120.7 158.6 122.5 156.5C124.3 154.4 132.3 148.2 132.3 148.2", k: 0.801 },
    { d: "M132.3 148.2L126.5 153.5L132.3 148.2", k: 0.166 },
    { d: "M223.8 150.8L220.5 155.5L223.8 150.8", k: 0.138 },
    { d: "M138.5 192.5C138.5 192.5 137.7 173.8 138.5 168.5C139.3 163.2 141.7 162.7 143.2 160.7C144.7 158.7 145.8 157.7 147.5 156.5C149.2 155.3 150.5 154.0 153.5 153.5C156.5 153.0 165.5 153.2 165.5 153.2", k: 0.365 },
];

/** Los 26 nodos redondos, ordenados igual que los trazos. */
export const NODOS = [
    [181.3, 56.0], [159.5, 56.1], [14.2, 56.2], [80.9, 56.4], [138.4, 72.6], [64.6, 72.9],
    [32.3, 73.0], [212.1, 85.0], [14.2, 88.8], [99.2, 89.2], [181.1, 89.4], [147.0, 111.5],
    [207.0, 113.2], [239.7, 113.2], [82.0, 129.5], [121.3, 136.8], [181.2, 137.1], [212.8,
    140.3], [99.0, 151.0], [65.1, 160.8], [181.0, 170.0], [138.3, 192.3], [82.0, 192.7], [97.9,
    209.6], [121.3, 210.3], [65.1, 210.5]
];
