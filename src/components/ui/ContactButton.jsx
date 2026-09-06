import { useLang } from '../../context/lang-context';
import { scrollToSection } from '../../lib/scroll';

/**
 * Botón que abre y cierra el riel de contacto de la izquierda. Lo usan el hero
 * y el pie, los dos extremos de la página.
 *
 * Con `destino` hace otra cosa: en vez de abrir el riel baja hasta esa sección. Es lo
 * que hace falta en angosto, donde el riel no se monta y los enlaces están al final del
 * pie — sin esto el botón quedaba apretando un interruptor que no controla nada.
 *
 * @remarks
 * El texto no cambia entre abierto y cerrado —es el nombre de lo que hace, no
 * una descripción del estado—; de anunciar el estado se encarga `aria-expanded`.
 * El botón que sí alterna su texto es el de adentro del riel, donde "Cerrar"
 * es la única acción que tiene sentido leer.
 *
 * En la variante con `destino` no va ningún `aria-expanded` ni `aria-controls`: no abre
 * nada, mueve la página. Y sigue siendo un `<button>` y no un `<a href="#...">` porque
 * es lo que ya hace su hermano de al lado en el hero, el que baja a Proyectos.
 *
 * @param {boolean} abierto
 * @param {(v: boolean) => void} onCambio
 * @param {string} [className]
 * @param {string} [destino]  Id de la sección a la que baja, si no hay riel que abrir.
 */
export default function ContactButton({ abierto, onCambio, className = 'btn btn-outline', destino }) {
    const { t } = useLang();

    if (destino) {
        return (
            <button
                type="button"
                className={className}
                onClick={() => scrollToSection(destino)}
            >
                {t('hero.contact')}
            </button>
        );
    }

    return (
        <button
            type="button"
            className={className}
            onClick={() => onCambio(!abierto)}
            aria-expanded={abierto}
            aria-controls="riel-contacto"
        >
            {t('hero.contact')}
        </button>
    );
}
