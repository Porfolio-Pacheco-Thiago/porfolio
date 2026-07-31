// Índice de todo lo que hay en `src/assets/media/`, resuelto en tiempo de build.
//
// El patrón de `import.meta.glob` tiene que ser un literal —no se puede armar
// con una variable—, así que se levanta la carpeta entera de una vez y después
// se agrupa por subcarpeta. Vite emite cada archivo como un asset con hash y
// reescribe la URL con el base '/porfolio/', que es justamente lo que no
// queremos escribir a mano.
const archivos = import.meta.glob(
    '../assets/media/**/*.{png,jpg,jpeg,webp,gif,svg,mp4,webm}',
    { eager: true, query: '?url', import: 'default' },
);

const PREFIJO = '../assets/media/';
const VIDEO = /\.(mp4|webm)$/i;
// `x-poster.webp` no es un elemento de la galería: es la portada de `x.mp4`.
// Sin portada, un `<video preload="none">` se dibuja como un rectángulo negro.
const POSTER = /-poster\.webp$/i;

/**
 * Las rutas agrupadas por carpeta contenedora, para poder pedir una sola.
 * @type {Map<string, Map<string, string>>} 'projects/melodia' → nombre → URL
 */
const porCarpeta = new Map();

for (const [ruta, url] of Object.entries(archivos)) {
    const relativa = ruta.slice(PREFIJO.length);
    const corte = relativa.lastIndexOf('/');
    const carpeta = relativa.slice(0, corte);
    const nombre = relativa.slice(corte + 1);

    if (!porCarpeta.has(carpeta)) porCarpeta.set(carpeta, new Map());
    porCarpeta.get(carpeta).set(nombre, url);
}

/**
 * Los medios de una carpeta, en orden alfabético por nombre de archivo.
 *
 * Devuelve solo los hijos directos: `timeline/lovelytics` no incluye lo que
 * haya en `timeline/lovelytics/gp`, porque esa subcarpeta es la galería de otra
 * tarjeta.
 *
 * @param {string} carpeta  Ruta relativa a `assets/media`, sin barras a los
 *                          costados. Ej.: `'projects/melodia'`.
 * @returns {Array<{nombre: string, tipo: 'video'|'imagen', src: string, poster?: string}>}
 *          Vacío si la carpeta no existe o no tiene archivos, que es lo que
 *          hace que la galería caiga en el marcador de posición.
 */
export function getMedia(carpeta) {
    const contenido = porCarpeta.get(carpeta);
    if (!contenido) return [];

    return [...contenido.entries()]
        .filter(([nombre]) => !POSTER.test(nombre))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([nombre, src]) => {
            const esVideo = VIDEO.test(nombre);
            return {
                nombre,
                tipo: esVideo ? 'video' : 'imagen',
                src,
                poster: esVideo
                    ? contenido.get(nombre.replace(VIDEO, '-poster.webp'))
                    : undefined,
            };
        });
}

/**
 * Solo los videos de una carpeta, en el mismo orden que `getMedia`.
 * @param {string} carpeta
 */
export function getVideos(carpeta) {
    return getMedia(carpeta).filter(m => m.tipo === 'video');
}

/**
 * Solo las imágenes de una carpeta.
 *
 * @param {string} carpeta
 * @param {string} [excluir] URL a dejar afuera — normalmente la tapa, que ya se
 *                           ve arriba de la tarjeta y repetirla no aporta.
 */
export function getImagenes(carpeta, excluir) {
    return getMedia(carpeta).filter(m => m.tipo === 'imagen' && m.src !== excluir);
}

/**
 * La imagen de tapa de una tarjeta: la primera **imagen** de su carpeta, y solo
 * si no hay ninguna, la portada del primer video.
 *
 * Prioriza las imágenes porque la tapa es una franja apaisada y las portadas
 * salen de grabaciones verticales de celular: recortada a esa altura, de una
 * portada se ve una tirita del medio de la pantalla. Un mockup apaisado entra
 * entero. Nunca devuelve el video mismo: la tapa se ve incluso con la tarjeta
 * cerrada y no tiene por qué costar megas.
 *
 * @param {string} carpeta
 * @returns {string|undefined} `undefined` si la carpeta está vacía o solo tiene
 *                             videos sin portada; ahí la tarjeta usa su ícono.
 */
export function getCover(carpeta) {
    const medios = getMedia(carpeta);
    // Una imagen llamada `cover.*` gana sobre el orden alfabético. Sin esto, la
    // tapa de una carpeta con varias capturas depende de cómo se llamen los
    // archivos, que es una forma silenciosa de romperla al subir contenido.
    const elegida = medios.find(m => m.tipo === 'imagen' && /^cover\./i.test(m.nombre));
    if (elegida) return elegida.src;

    const imagen = medios.find(m => m.tipo === 'imagen');
    if (imagen) return imagen.src;
    return medios.find(m => m.tipo === 'video' && m.poster)?.poster;
}
