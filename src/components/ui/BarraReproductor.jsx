import {
    FiFastForward, FiMaximize, FiPause, FiPlay, FiRewind, FiVolume2, FiVolumeX,
} from 'react-icons/fi';
// Feather no trae ícono de subtítulos; el de Material es el que todo el mundo
// reconoce. Relleno cuando están puestos y contorneado cuando no, que dice el
// estado sin depender solo del color.
import { MdClosedCaption, MdOutlineClosedCaption } from 'react-icons/md';
import { useLang } from '../../context/lang-context';

/**
 * La barra del reproductor: nombre de la demo, transporte, tiempos, volumen, subtítulos,
 * pantalla completa y la aguja.
 *
 * Es solo presentación: no toca el `<video>` ni guarda estado. Todo lo que muestra llega
 * por props y todo lo que hace sale por callbacks, que `ui/DemoDispositivo.jsx` conecta
 * al hook `useReproductor`.
 *
 * @remarks
 * - **Cada control corta la propagación por su cuenta.** La tarjeta que los contiene
 *   tiene su propio `onClick` para expandirse, y si el click subiera, tocar play la
 *   cerraría. Se hace en los controles y no en el contenedor porque un `div` con
 *   `onClick` no es un control y no responde al teclado.
 * - **Las dos barras llevan `aria-valuetext`.** Sin él un lector de pantalla lee el
 *   número crudo —"38 de 0 a 63,8", "0,65"—, que no es ni un tiempo ni un porcentaje.
 * - El nombre del grupo describe qué controla, no de qué proyecto es: con solo `label`
 *   anunciaba "Melodía, grupo", que no dice nada sobre lo que hay adentro.
 *
 * @param {object} props
 * @param {string} props.nombre    El de la demo puesta.
 * @param {string} props.label     El del proyecto.
 * @param {boolean} props.va
 * @param {number} props.tiempo
 * @param {number} props.duracion
 * @param {number} props.volumen
 * @param {boolean} props.mudo
 * @param {boolean} props.subtitulos      Si están puestos.
 * @param {boolean} props.haySubtitulos   Si el video trae alguna pista. Sin ninguna, el
 *   botón de CC directamente no se dibuja: no habría nada que prender.
 * @param {() => void} props.onAlternarSubtitulos
 * @param {(seg: number) => void} props.onSaltar
 * @param {() => void} props.onAlternarPausa
 * @param {() => void} props.onAlternarMudo
 * @param {(nivel: number) => void} props.onVolumen
 * @param {(seg: number) => void} props.onBuscar
 * @param {() => void} props.onPantallaCompleta
 */
export default function BarraReproductor({
    nombre, label, va, tiempo, duracion, volumen, mudo,
    subtitulos, haySubtitulos, onAlternarSubtitulos,
    onSaltar, onAlternarPausa, onAlternarMudo, onVolumen, onBuscar, onPantallaCompleta,
}) {
    const { t } = useLang();

    return (
        <div
            className="fono-barra"
            role="group"
            aria-label={`${t('projects.player.label')} — ${label}`}
        >
            <div className="fono-pista">
                <span className="fono-pista-nombre">{nombre}</span>
                <span className="fono-pista-album">{label}</span>
            </div>

            <div className="fono-transporte">
                <button
                    type="button"
                    className="fono-icono"
                    onClick={e => { e.stopPropagation(); onSaltar(-10); }}
                    aria-label={t('projects.player.back10')}
                >
                    <FiRewind size={16} />
                </button>

                <button
                    type="button"
                    className="fono-icono fono-play"
                    onClick={e => { e.stopPropagation(); onAlternarPausa(); }}
                    aria-label={va ? t('projects.player.pause') : t('projects.player.play')}
                >
                    {va ? <FiPause size={18} /> : <FiPlay size={18} />}
                </button>

                <button
                    type="button"
                    className="fono-icono"
                    onClick={e => { e.stopPropagation(); onSaltar(10); }}
                    aria-label={t('projects.player.forward10')}
                >
                    <FiFastForward size={16} />
                </button>
            </div>

            <p className="fono-tiempos">
                <span className="fono-tiempo-actual">{reloj(tiempo)}</span>
                <span aria-hidden="true"> / </span>
                <span className="fono-tiempo-total">{reloj(duracion)}</span>
            </p>

            <div className="fono-secundarios">
                <button
                    type="button"
                    className="fono-icono"
                    onClick={e => { e.stopPropagation(); onAlternarMudo(); }}
                    aria-label={mudo ? t('projects.player.unmute') : t('projects.player.mute')}
                >
                    {mudo || volumen === 0 ? <FiVolumeX size={15} /> : <FiVolume2 size={15} />}
                </button>

                {/* Solo si el video trae pistas. Va pegado al de silencio
                    porque son los dos interruptores de la barra, y como los
                    dos dice su estado con `aria-pressed` además del ícono. */}
                {haySubtitulos && (
                    <button
                        type="button"
                        className={`fono-icono ${subtitulos ? 'is-activo' : ''}`}
                        onClick={e => { e.stopPropagation(); onAlternarSubtitulos(); }}
                        aria-pressed={subtitulos}
                        aria-label={subtitulos
                            ? t('projects.player.captionsOff')
                            : t('projects.player.captionsOn')}
                    >
                        {subtitulos
                            ? <MdClosedCaption size={17} />
                            : <MdOutlineClosedCaption size={17} />}
                    </button>
                )}

                <input
                    className="fono-rango fono-volumen"
                    /* Igual que la aguja: el tramo activo se pinta con un
                       degradado calculado, porque la pista no tiene forma
                       nativa de mostrar hasta dónde llega el valor. */
                    style={{ '--nivel': `${(mudo ? 0 : volumen) * 100}%` }}
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={mudo ? 0 : volumen}
                    onClick={e => e.stopPropagation()}
                    onChange={e => onVolumen(Number(e.target.value))}
                    aria-label={t('projects.player.volume')}
                    aria-valuetext={`${Math.round((mudo ? 0 : volumen) * 100)} %`}
                />

                <button
                    type="button"
                    className="fono-icono"
                    onClick={e => { e.stopPropagation(); onPantallaCompleta(); }}
                    aria-label={t('projects.player.fullscreen')}
                >
                    <FiMaximize size={15} />
                </button>
            </div>

            {/* La aguja va al ras del borde de abajo, como en la referencia, y
                no entre los tiempos. El relleno se pinta con un degradado
                calculado, porque un `input[type=range]` no tiene forma nativa
                de mostrar cuánto lleva recorrido. */}
            <input
                className="fono-aguja"
                style={{ '--avance': `${duracion ? (tiempo / duracion) * 100 : 0}%` }}
                type="range"
                min="0"
                max={duracion || 0}
                step="0.1"
                value={Math.min(tiempo, duracion || 0)}
                onClick={e => e.stopPropagation()}
                onChange={e => onBuscar(Number(e.target.value))}
                aria-label={t('projects.player.seek')}
                aria-valuetext={`${reloj(tiempo)} ${t('projects.player.of')} ${reloj(duracion)}`}
            />
        </div>
    );
}

/** Segundos a `m:ss`. Sin duración todavía, `0:00`. */
function reloj(segundos) {
    if (!Number.isFinite(segundos)) return '0:00';
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}
