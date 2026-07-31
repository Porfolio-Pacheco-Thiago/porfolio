import { useLang } from '../../context/lang-context';

/**
 * Botón que abre y cierra el riel de contacto de la izquierda. Lo usan el hero
 * y el pie, los dos extremos de la página.
 *
 * @remarks
 * El texto no cambia entre abierto y cerrado —es el nombre de lo que hace, no
 * una descripción del estado—; de anunciar el estado se encarga `aria-expanded`.
 * El botón que sí alterna su texto es el de adentro del riel, donde "Cerrar"
 * es la única acción que tiene sentido leer.
 *
 * @param {boolean} abierto
 * @param {(v: boolean) => void} onCambio
 * @param {string} [className]
 */
export default function ContactButton({ abierto, onCambio, className = 'btn btn-outline' }) {
    const { t } = useLang();

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
