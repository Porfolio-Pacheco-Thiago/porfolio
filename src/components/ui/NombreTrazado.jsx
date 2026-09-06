import './NombreTrazado.css';

/**
 * El nombre del hero, dibujándose letra por letra.
 *
 * Es SVG y no texto porque el pedido era que las letras **se generen como el
 * logo**: trazos que aparecen de a poco y forman cada letra. Eso necesita un
 * contorno que recorrer, y el texto de HTML no lo tiene — `stroke-dashoffset`
 * solo existe sobre `path`.
 *
 * Los contornos salen de la propia Chakra Petch 700, extraídos del `.ttf` con
 * fontTools y colocados con los mismos avances e interletrado (0.03em) que usaba
 * el `<h1>`, así que es tipográficamente el mismo texto y no un dibujo parecido.
 *
 * **Van en dos capas, todos los contornos y después todos los rellenos.** No es
 * un detalle: con una sola capa —cada letra con su contorno y su relleno— el
 * contorno de cada letra tapa el relleno de la anterior y el nombre se ve
 * apelmazado. En HTML esto salía gratis porque el contorno era una capa `::before`
 * entera por detrás del texto.
 *
 * **Lo que se pierde al salir de HTML**, y por eso está anotado acá:
 *
 * - El salto de línea es fijo (THIAGO / PACHECO). SVG no acomoda texto solo.
 * - El nombre está horneado en los `path`. Si cambia, hay que volver a generarlo
 *   — hoy es el mismo en los dos idiomas, así que no hay ramas.
 * - El peso es uno solo (700). Antes el tema claro usaba 600 para afinar el
 *   relleno; ahora esa diferencia la da el grosor del contorno, que sí cambia.
 *
 * El texto de verdad sigue en el `<h1>` para lectores de pantalla: acá el SVG va
 * `aria-hidden`.
 */
/**
 * Aire extra entre letra y letra, en unidades del `viewBox` (1000 = 1em).
 *
 * Hace falta porque el contorno se dibuja **centrado sobre el borde del glifo**, o sea que
 * cada letra se ensancha `stroke-width / 2` de cada lado: 85 unidades en oscuro y 110 en
 * claro. Con los avances propios de Chakra Petch los huecos entre glifos van de 70 a 165
 * unidades, así que los contornos de dos letras vecinas se pisaban y el nombre se leía
 * como un bloque continuo.
 *
 * Con 120 el hueco más chico —el de la P y la A— pasa de 70 a 190. En tema oscuro el
 * contorno se come 170 de esos y quedan 20 de aire; en claro, donde el trazo es 220, ese
 * par se pisa por 30 unidades. Es una decisión, no un descuido: el pedido fue juntarlas y
 * el par más apretado es uno solo de trece, mientras que el resto van de 235 a 285 y
 * respiran en los dos temas.
 *
 * Se suma al avance y no reemplaza a los avances: así el ritmo propio de la tipografía
 * —que no espacia igual una I que una O— se conserva.
 */
const TRACKING = 120;

/** Ancho del `viewBox`. El renglón más largo tiene siete letras, o sea seis huecos. */
const ANCHO = 5006 + 6 * TRACKING;

/** Posición final de una letra, ya con el aire extra de su lugar en el renglón. */
function ubicar({ x, y }, n) {
    return `translate(${x + n * TRACKING} ${y}) scale(1 -1)`;
}

export default function NombreTrazado() {
    return (
        <svg
            className="nombre-trazado"
            viewBox={`-110 -110 ${ANCHO} 2020`}
            // El ancho en `em` tiene que seguir al del `viewBox` o el nombre se deforma.
            // Va como variable y no en el CSS para que los dos salgan del mismo número.
            style={{ '--ancho-nombre': `${ANCHO / 1000}em` }}
            aria-hidden="true"
        >
            <defs>
                {/* Mismo degradado que el marco. Los `stop-color` leen las variables
                    del tema, así que sigue al tema claro/oscuro sin duplicar colores. */}
                <linearGradient id="nombre-degrade" x1="0" y1="0" x2="1" y2="0.6">
                    <stop offset="0" stopColor="var(--degrade-sombra)" />
                    <stop offset="0.2" stopColor="var(--accent)" />
                    <stop offset="0.48" stopColor="var(--degrade-medio)" />
                    <stop offset="0.76" stopColor="var(--accent)" />
                    <stop offset="1" stopColor="var(--degrade-sombra)" />
                </linearGradient>
            </defs>
            {/* `pathLength` normaliza el largo de cada letra para que el dash sea
                un porcentaje y no un número medido a mano. */}
            <g className="nombre-contornos">
                {LETRAS.map((letra, i) => (
                    <path key={i} d={letra.d} transform={ubicar(letra, ORDEN[i])} pathLength="100" style={{ '--i': i }} />
                ))}
            </g>
            <g className="nombre-rellenos">
                {LETRAS.map((letra, i) => (
                    <path key={i} d={letra.d} transform={ubicar(letra, ORDEN[i])} style={{ '--i': i }} />
                ))}
            </g>
        </svg>
    );
}

/** Las 13 letras de "THIAGO PACHECO", con su avance dentro de su renglón (`x`) y la
 *  línea de base a la que pertenecen (`y`). Los avances son los de Chakra Petch; el aire
 *  extra entre letras lo agrega `TRACKING`, arriba. */
const LETRAS = [
    { d: "M224.0 585.0H15.0V700.0H569.0V585.0H360.0V0.0H224.0Z", x: 0, y: 700 },
    { d: "M65.0 700.0H201.0V407.0H497.0V700.0H633.0V0.0H497.0V291.0H201.0V0.0H65.0Z", x: 614, y: 700 },
    { d: "M70.0 700.0H206.0V0.0H70.0Z", x: 1342, y: 700 },
    { d: "M261.0 700.0H385.0L641.0 0.0H503.0L446.0 155.0H200.0L143.0 0.0H5.0ZM416.0 267.0 323.0 533.0H321.0L231.0 267.0Z", x: 1648, y: 700 },
    { d: "M55.0 115.0V585.0L170.0 700.0H518.0L631.0 587.0V480.0H495.0V537.0L448.0 584.0H242.0L191.0 533.0V167.0L242.0 116.0H450.0L499.0 165.0V274.0H349.0V390.0H631.0V115.0L516.0 0.0H170.0Z", x: 2324, y: 700 },
    { d: "M55.0 115.0V585.0L170.0 700.0H530.0L645.0 585.0V115.0L530.0 0.0H170.0ZM458.0 116.0 509.0 167.0V533.0L458.0 584.0H242.0L191.0 533.0V167.0L242.0 116.0Z", x: 3030, y: 700 },
    { d: "M65.0 700.0H504.0L611.0 592.0V347.0L503.0 238.0H201.0V0.0H65.0ZM442.0 352.0 477.0 387.0V551.0L442.0 586.0H201.0V352.0Z", x: 0, y: 1800 },
    { d: "M261.0 700.0H385.0L641.0 0.0H503.0L446.0 155.0H200.0L143.0 0.0H5.0ZM416.0 267.0 323.0 533.0H321.0L231.0 267.0Z", x: 676, y: 1800 },
    { d: "M55.0 115.0V585.0L170.0 700.0H512.0L625.0 587.0V480.0H489.0V537.0L442.0 584.0H242.0L191.0 533.0V167.0L242.0 116.0H442.0L489.0 163.0V220.0H625.0V113.0L512.0 0.0H170.0Z", x: 1352, y: 1800 },
    { d: "M65.0 700.0H201.0V407.0H497.0V700.0H633.0V0.0H497.0V291.0H201.0V0.0H65.0Z", x: 2037, y: 1800 },
    { d: "M65.0 700.0H571.0V585.0H201.0V408.0H542.0V295.0H201.0V115.0H571.0V0.0H65.0Z", x: 2765, y: 1800 },
    { d: "M55.0 115.0V585.0L170.0 700.0H512.0L625.0 587.0V480.0H489.0V537.0L442.0 584.0H242.0L191.0 533.0V167.0L242.0 116.0H442.0L489.0 163.0V220.0H625.0V113.0L512.0 0.0H170.0Z", x: 3401, y: 1800 },
    { d: "M55.0 115.0V585.0L170.0 700.0H530.0L645.0 585.0V115.0L530.0 0.0H170.0ZM458.0 116.0 509.0 167.0V533.0L458.0 584.0H242.0L191.0 533.0V167.0L242.0 116.0Z", x: 4086, y: 1800 },
];

/** El índice de cada letra dentro de su renglón, que es contra el que se acumula el aire
 *  extra: la primera de cada renglón no lleva ninguno.
 *
 *  Va **después** de `LETRAS` y no antes: es una constante de módulo, así que se evalúa
 *  al importar el archivo, y declarada arriba leía `LETRAS` todavía en su zona muerta. */
const ORDEN = (() => {
    const vistas = new Map();
    return LETRAS.map(({ y }) => {
        const n = vistas.get(y) ?? 0;
        vistas.set(y, n + 1);
        return n;
    });
})();
