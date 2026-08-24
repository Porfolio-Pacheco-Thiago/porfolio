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
// El logo de la institución, frente a las fotos del evento. Se distingue por el
// nombre porque es lo único que se sabe de un archivo sin cargarlo.
const ES_LOGO = /^logo/i;
// Y entre los logos, cuál es cuál. Hay dos formas de nombrarlos y las dos aparecen en
// las carpetas: marcando el apaisado (`logo-grande`, `logo-fiuba-largo`) o marcando el
// cuadrado (`logo-chico-toyota` contra `logo-toyota`). Se aceptan las dos porque el
// nombre es la única señal que hay —las medidas no se conocen sin cargar el archivo— y
// forzar una sola convención significaba renombrar archivos ya subidos.
const ES_APAISADO = /(grande|largo)/i;
const ES_CHICO = /(chico|cuadrado)/i;
// Y, aparte del hueco, el tema. Mismo sufijo que ya usan las tapas (`portada-claro`):
// el archivo sin marcar es el del tema oscuro y `-claro` el del claro.
const ES_CLARO = /claro/i;
// La tapa de un proyecto puede venir en tres versiones —una por tema y una animada—
// y ninguna de las tres es un elemento más de la galería.
const ES_PORTADA = /^portada/i;

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
 *
 * Los logos quedan afuera aunque sean videos: tienen su lugar propio —el recuadro de
 * la tarjeta cerrada, ver `getMarca`— y colarlos acá los mandaba a la pantalla del
 * celular, mezclados con las demos y con un botón cada uno en la botonera.
 *
 * @param {string} carpeta
 */
export function getVideos(carpeta) {
    return getMedia(carpeta).filter(m => m.tipo === 'video' && !ES_LOGO.test(m.nombre));
}

/**
 * La marca de un proyecto: lo que se ve en la ventana **con la tarjeta cerrada**, en
 * lugar de la captura. Sale de los archivos que empiezan con `logo`, la misma
 * convención que ya usaba la línea de tiempo.
 *
 * Puede venir en dos formas y son excluyentes:
 *
 *  - una imagen suelta (`logo.png`, `logo.svg`), que es el caso normal;
 *  - varios videos numerados (`logo-1-nube.mp4`, `logo-2-base.mp4`, …), que se turnan
 *    en bucle. Los usa el proyecto de sistemas distribuidos, donde una sola pieza
 *    quieta no alcanzaba para contar que son tres cosas distintas coordinándose.
 *
 * Cualquiera de las dos imágenes puede venir además en dos versiones, una por tema,
 * con el mismo sufijo que las tapas: `logo.png` es la del tema oscuro y `logo-claro.png`
 * la del claro. Hace falta cuando el logo trae texto de un solo color, que contra uno de
 * los dos fondos queda ilegible —el caso de Cassandra, cuyo wordmark es gris oscuro—.
 *
 * @param {string} carpeta
 * @returns {{imagen?: string, grande?: string, claro?: string, grandeClaro?: string,
 *            videos: Array<{src: string, poster?: string}>}}
 */
export function getMarca(carpeta) {
    const logos = getMedia(carpeta).filter(m => ES_LOGO.test(m.nombre));
    const imagenes = logos.filter(m => m.tipo === 'imagen');
    // Un proyecto puede traer dos logos, marcados por el nombre igual que en la línea
    // de tiempo: `logo-grande.png` es el apaisado y `logo.jpeg` el chico. Van a huecos
    // distintos —el chico a la tarjeta cerrada, el grande a la franja de arriba de la
    // abierta— porque los huecos tienen proporciones muy distintas: 2.3:1 el de la
    // cerrada y más de 5:1 el de la abierta.
    const grande = imagenes.find(m => ES_APAISADO.test(m.nombre) && !ES_CLARO.test(m.nombre));
    const grandeClaro = imagenes.find(m => ES_APAISADO.test(m.nombre) && ES_CLARO.test(m.nombre));
    const chico = imagenes.find(m => !ES_APAISADO.test(m.nombre) && !ES_CLARO.test(m.nombre));
    const chicoClaro = imagenes.find(m => !ES_APAISADO.test(m.nombre) && ES_CLARO.test(m.nombre));
    return {
        // El respaldo va en los dos sentidos: con un solo logo, ese cubre los dos
        // huecos. Es el caso de Monopoly, cuyo wordmark sirve igual de bien en la franja
        // apaisada, y el de SpecForge y Cassandra.
        imagen: chico?.src ?? grande?.src,
        grande: grande?.src ?? chico?.src,
        // El par por tema, cuando el proyecto lo trae. Sigue los mismos respaldos que
        // los de arriba, así un proyecto con un solo logo por tema los cubre igual.
        claro: chicoClaro?.src ?? grandeClaro?.src,
        grandeClaro: grandeClaro?.src ?? chicoClaro?.src,
        // Ya vienen ordenados por nombre desde `getMedia`, que es de dónde sale el
        // orden del bucle: el número del archivo es el turno. Se lleva también la
        // portada —`getMedia` la empareja por nombre— porque un video que no llega a
        // arrancar sin portada no dibuja nada.
        videos: logos
            .filter(m => m.tipo === 'video')
            .map(({ src, poster }) => ({ src, poster })),
    };
}

/**
 * Solo las imágenes de una carpeta.
 *
 * @param {string} carpeta
 * @param {string} [excluir] URL a dejar afuera — normalmente la tapa, que ya se
 *                           ve arriba de la tarjeta y repetirla no aporta.
 */
export function getImagenes(carpeta, excluir) {
    // Las portadas quedan afuera: ya se ven arriba de la tarjeta y las tres son la
    // misma imagen, así que en la galería serían tres repeticiones. Los logos también:
    // se ven en la ventana con la tarjeta cerrada, y de paso un wordmark apaisado
    // metido entre capturas cuadradas descuadraba la grilla de la galería.
    return getMedia(carpeta).filter(
        m => m.tipo === 'imagen'
            && m.src !== excluir
            && !ES_PORTADA.test(m.nombre)
            && !ES_LOGO.test(m.nombre),
    );
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
/**
 * El logo de una entrada, para la miniatura cuadrada del costado.
 *
 * Prefiere un archivo cuyo nombre empiece con `logo`, que es como quedaron
 * cargados: cada carpeta tiene el logo de la institución más las fotos del
 * evento, y en un cuadrado chico una foto de multitud no se lee. Si no hay
 * ninguno cae en `getCover`, así una carpeta sin logo igual muestra algo.
 *
 * @param {string} carpeta
 * @returns {string|undefined}
 */
export function getLogo(carpeta) {
    const logos = getMedia(carpeta).filter(
        m => m.tipo === 'imagen' && ES_LOGO.test(m.nombre) && !ES_APAISADO.test(m.nombre),
    );
    if (!logos.length) return getCover(carpeta);
    // Si alguno se declara cuadrado, ese es y no hay nada que adivinar.
    const chico = logos.find(m => ES_CHICO.test(m.nombre));
    if (chico) return chico.src;
    // Descarta la versión apaisada explícitamente: en un cuadrado queda con dos franjas
    // vacías. Antes se elegía "el de nombre más corto", que funcionaba de casualidad;
    // al unificarse las carpetas en `logo-grande.*`, en Olimpiada ese nombre pasó a ser
    // más corto que `logo-olimpiadas.png` y el apaisado se colaba en la miniatura. El
    // nombre sigue siendo la única señal —las medidas no se conocen sin cargar el
    // archivo—, pero ahora la regla dice lo que quiere decir. El más corto queda solo
    // como desempate entre cuadrados.
    logos.sort((a, b) => a.nombre.length - b.nombre.length);
    return logos[0].src;
}

/**
 * El logo apaisado de una entrada, para la tarjeta abierta: `logo-grande.jpeg`,
 * `logo-fiuba-largo.png`. Va solo, ocupando todo el ancho, porque un logo largo con
 * una foto al lado queda diminuto.
 *
 * Devuelve `undefined` si la carpeta no tiene uno: no cae en el cuadrado, que ya se
 * ve en la miniatura y estirado a todo el ancho sería una mancha.
 *
 * @param {string} carpeta
 * @returns {string|undefined}
 */
export function getLogoApaisado(carpeta) {
    const logos = getMedia(carpeta).filter(
        m => m.tipo === 'imagen' && ES_LOGO.test(m.nombre),
    );
    const apaisado = logos.find(m => ES_APAISADO.test(m.nombre));
    if (apaisado) return apaisado.src;
    // Nadie se declaró apaisado. Si en cambio alguno se declaró cuadrado, entonces el
    // otro es el apaisado por descarte —así funciona `logo-toyota` contra
    // `logo-chico-toyota`—. Sin ninguna de las dos marcas no se devuelve nada: un logo
    // suelto es el cuadrado, y estirarlo a todo el ancho sería una mancha.
    if (!logos.some(m => ES_CHICO.test(m.nombre))) return undefined;
    return logos.find(m => !ES_CHICO.test(m.nombre))?.src;
}

/**
 * Los medios de una carpeta **sin los logos**: las fotos del evento, que son las que
 * pueden ir de a varias por renglón. Los logos tienen su lugar propio —el cuadrado al
 * costado de la tarjeta cerrada y el apaisado arriba de la abierta— y repetirlos en la
 * galería los mostraba una tercera vez.
 *
 * @param {string} carpeta
 */
export function getFotos(carpeta) {
    return getMedia(carpeta).filter(m => !ES_LOGO.test(m.nombre));
}

/**
 * La tapa de un proyecto, en sus tres versiones, cuando las hay.
 *
 * Existe porque una sola imagen no alcanza para este caso: la tarjeta cerrada tiene
 * que mostrar un cuadro quieto —y el fondo del dibujo depende del tema— mientras que
 * la abierta muestra la animación corriendo. Se distinguen por el nombre, como el
 * resto de las convenciones de esta carpeta:
 *
 *  - `portada.webp`          el cuadro quieto sobre fondo oscuro
 *  - `portada-claro.webp`    el mismo, sobre fondo claro — opcional: un dibujo que
 *                            sólo funciona sobre uno de los dos fondos no la trae, y
 *                            entonces la oscura sirve a los dos temas
 *  - `portada-animada.webp`  la animación, con transparencia para servir a los dos
 *
 * @param {string} carpeta
 * @returns {{oscuro?: string, claro?: string, animada?: string}}
 */
export function getPortada(carpeta) {
    const busca = (re) => getMedia(carpeta).find(
        m => m.tipo === 'imagen' && ES_PORTADA.test(m.nombre) && re.test(m.nombre),
    )?.src;
    return {
        oscuro: getMedia(carpeta).find(
            m => m.tipo === 'imagen' && /^portada\.[a-z]+$/i.test(m.nombre),
        )?.src,
        claro: busca(/claro/i),
        animada: busca(/animada/i),
    };
}

export function getCover(carpeta) {
    const medios = getMedia(carpeta);
    // Una imagen llamada `cover.*` gana sobre el orden alfabético. Sin esto, la
    // tapa de una carpeta con varias capturas depende de cómo se llamen los
    // archivos, que es una forma silenciosa de romperla al subir contenido.
    const elegida = medios.find(m => m.tipo === 'imagen' && /^cover\./i.test(m.nombre));
    if (elegida) return elegida.src;

    // El logo queda afuera: es la marca de la tarjeta cerrada, no una captura. Sin esto,
    // un proyecto cuyo único archivo es su logo —SpecForge— lo mostraba dos veces, y la
    // segunda recortada por el `cover` de la tapa.
    const imagen = medios.find(m => m.tipo === 'imagen' && !ES_LOGO.test(m.nombre));
    if (imagen) return imagen.src;
    return medios.find(m => m.tipo === 'video' && m.poster)?.poster;
}
