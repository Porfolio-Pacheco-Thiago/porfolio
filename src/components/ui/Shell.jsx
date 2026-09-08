import { useLang } from '../../context/lang-context';
import { useCarrusel } from '../../hooks/useCarrusel';
import './Shell.css';

/**
 * Una terminal flotando, con el proyecto corriendo adentro.
 *
 * Es el tercer chasis de la sección, hermano del celular y del monitor de
 * `DemoDispositivo`, pero componente aparte y no un `dispositivo` más de aquel: los
 * otros dos son aparatos con botonera, reproductor y una pose "de frente" a la que van
 * al elegir una demo. Acá no hay nada que elegir —SpecForge es una CLI, sus capturas
 * son de sí misma— así que todo ese código sobraba, y la única pieza que sí necesita
 * —la ventana con su barra de título— no existe allá.
 *
 * Lo que se ve adentro son las capturas recortadas a su área de texto: la ventana del
 * sistema que las rodeaba —barra de título, borde, barra de scroll— la vuelve a dibujar
 * el CSS, así que dejarla en el archivo la mostraba dos veces, una de ellas torcida.
 *
 * @param {object} props
 * @param {Array}  props.medios   Las capturas, en el orden en que se turnan.
 * @param {string} props.titulo   Lo que va en la barra de título.
 * @param {string} props.label    Nombre del proyecto, para el texto alternativo.
 * @param {number} [props.segundos=4]  Cuánto se queda cada captura.
 * @param {React.ReactNode} props.children  La columna de al lado: descripción, tags y repo.
 *
 * @remarks
 * - **Flota y gira a la vez, sin envoltorio.** Son dos animaciones sobre el mismo
 *   elemento, y no se pisan porque tocan propiedades distintas: el giro va en
 *   `transform` y el flote en `translate`, que desde las transformaciones individuales
 *   de CSS es una propiedad propia. Con las dos en `transform` la segunda ganaba y el
 *   flote se comía el giro; con un `div` de por medio, la `perspective` de la escena
 *   —que solo alcanza a los hijos directos— dejaba de llegarle a la ventana. De ahí que
 *   la perspectiva viaje dentro del propio `transform`.
 * - Los períodos son distintos a propósito (19s y 7.5s): con el mismo, las dos vueltas
 *   caen siempre juntas y el conjunto se lee como un solo vaivén repetido.
 * - Sin `transform-style: preserve-3d`, como el resto de la sección: la ventana es
 *   plana, así que viaja como una sola capa compuesta en vez de re-rasterizar cada hijo
 *   por fotograma.
 */
export default function Shell({ medios, titulo, label, segundos = 4, children }) {
    const { t } = useLang();
    // Sin saliente: las capturas se cruzan con un fundido, no con un desplazamiento, así
    // que la que se va no tiene que quedarse en pantalla — la de abajo ya está ahí.
    const { indice: actual } = useCarrusel({ cantidad: medios.length, segundos });

    return (
        <div className="shell-bloque">
            <div className="shell-escena">
                <div className="shell">
                    {/* La barra de título: los tres botones son ornamento —no hacen
                        nada— y el nombre es el del directorio, como en una terminal
                        de verdad. Todo el renglón queda fuera del árbol accesible. */}
                    <div className="shell-barra" aria-hidden="true">
                        <span className="shell-boton es-cerrar" />
                        <span className="shell-boton es-minimizar" />
                        <span className="shell-boton es-agrandar" />
                        <span className="shell-titulo">{titulo}</span>
                    </div>
                    <div className="shell-pantalla">
                        {/* Las dos conviven en el DOM y el CSS elige cuál se ve, igual
                            que las tapas: cambiar el `src` haría que la que entra
                            empiece a bajar recién en ese momento, con la pantalla
                            vacía mientras tanto. */}
                        {medios.map((medio, i) => (
                            <img
                                key={medio.nombre}
                                className={`shell-captura ${i === actual ? 'is-actual' : ''}`}
                                src={medio.src}
                                // Solo la que está puesta se nombra. Las otras siguen en
                                // el DOM pero invisibles, y describirlas igual hacía que
                                // un lector de pantalla leyera las tres capturas seguidas
                                // como si estuvieran todas a la vista.
                                alt={i === actual ? `${t('media.imageOf')} ${label} ${i + 1}` : ''}
                                aria-hidden={i === actual ? undefined : 'true'}
                                loading="lazy"
                                decoding="async"
                            />
                        ))}
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
}
