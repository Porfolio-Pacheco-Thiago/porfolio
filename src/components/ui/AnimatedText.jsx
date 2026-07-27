import { Fragment } from 'react';

/**
 * Texto que aparece letra por letra, con CSS puro.
 *
 * Reemplaza al TextAnimate de cult-ui, que costaba ~40 kB gzip por arrastrar
 * `motion` y además renderizaba siempre un `<h2>`, sin importar el contexto.
 *
 * @param {object} props
 * @param {string} props.text       Texto a animar.
 * @param {string} [props.as='p']   Etiqueta a renderizar. El default es `p`
 *                                  porque un subtítulo no es un encabezado.
 * @param {string} [props.className]
 * @param {number} [props.stagger=35] Milisegundos entre letra y letra.
 *
 * @example
 * <AnimatedText text="Software Engineer" className="hero-role" />
 * <AnimatedText text="Hola" as="h2" stagger={50} />
 *
 * @remarks
 * - Las letras se marcan `aria-hidden` y el texto completo va en un span
 *   oculto: si no, un lector de pantalla puede deletrear palabra por palabra.
 * - Solo anima `transform` y `opacity`, y una única vez.
 * - Con `prefers-reduced-motion` el texto aparece sin animación.
 */
export default function AnimatedText({ text, as: Tag = 'p', className, stagger = 35, ...props }) {
    const words = String(text).split(' ');
    // Letras acumuladas antes de cada palabra, para que el retardo siga
    // corriendo entre palabras. Calculado sin mutar nada durante el render.
    const desplazamientos = words.map((_, i) =>
        words.slice(0, i).reduce((n, w) => n + w.length, 0)
    );

    return (
        <Tag className={['animated-text', className].filter(Boolean).join(' ')} {...props}>
            <span className="visually-hidden">{text}</span>
            {words.map((word, w) => {
                const desde = desplazamientos[w];
                return (
                    <Fragment key={w}>
                        {/* Cada palabra es una unidad que no se parte al envolver */}
                        <span className="animated-text-word" aria-hidden="true">
                            {Array.from(word, (ch, c) => (
                                <span key={c} style={{ animationDelay: `${(desde + c) * stagger}ms` }}>
                                    {ch}
                                </span>
                            ))}
                        </span>
                        {w < words.length - 1 && ' '}
                    </Fragment>
                );
            })}
        </Tag>
    );
}
