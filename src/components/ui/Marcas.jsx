import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '../../context/lang-context';
import { marcas } from '../../data/marcas';
import './Marcas.css';

/** Cuántos se ven a la vez. La cuenta del CSS depende de esto. */
const VISIBLES = 3;
/** Cada cuánto avanza un lugar solo. */
const ESPERA = 3800;
/** Lo que tarda el desplazamiento. Tiene que ser el mismo que el de `Marcas.css`;
 *  va como variable para que no se puedan desincronizar. */
const TRANSICION = 550;

const TOTAL = marcas.length;
/** La lista se dibuja **tres veces** y el índice vive en la copia del medio, así
 *  hay lugar para salirse por cualquiera de los dos lados antes de reacomodar. */
const COPIAS = 3;

/**
 * La fila de respaldo del hero: un rótulo, los logos de dónde trabajé y estudié, y
 * las flechas para pasarlos a mano.
 *
 * Se ven tres y avanza de a uno, en loop, como en la referencia (tamalsen, que usa
 * Swiper con `slidesPerView` y `autoplay`). Acá no hace falta la librería: son seis
 * logos y un `translateX` por paso.
 *
 * El loop no se corta porque cuando el índice se sale de la copia del medio, la de
 * al lado ya está mostrando lo mismo en el mismo lugar: ahí se lo devuelve al medio
 * **sin transición** y el salto cae sobre dos fotogramas idénticos.
 *
 * Los logos no se dibujan como imagen: la imagen es la máscara y el color lo pone la
 * caja. Ver `data/marcas.js` para cómo se prepararon los archivos.
 */
export default function Marcas() {
    const { t } = useLang();
    const [paso, setPaso] = useState(TOTAL);
    const [saltando, setSaltando] = useState(false);
    const relojRef = useRef(null);

    // Arranca —o rearranca— la espera. Se rearranca al tocar una flecha: si no, el
    // avance automático podía caer justo después del click y pasar dos de una.
    const programar = useCallback(() => {
        clearInterval(relojRef.current);
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        relojRef.current = setInterval(() => setPaso(p => p + 1), ESPERA);
    }, []);

    useEffect(() => {
        programar();
        return () => clearInterval(relojRef.current);
    }, [programar]);

    const mover = (direccion) => {
        setPaso(p => p + direccion);
        programar();
    };

    // Devolver el índice a la copia del medio, una vez terminado el desplazamiento.
    // Va por reloj y no por `transitionend`: si la transición no llega a correr —una
    // pestaña en segundo plano, por ejemplo— el evento no se dispara nunca y la pista
    // se sigue yendo hasta quedar vacía.
    useEffect(() => {
        if (paso >= TOTAL && paso < TOTAL * 2) return;
        const id = setTimeout(() => {
            setSaltando(true);
            setPaso(p => (p < TOTAL ? p + TOTAL : p - TOTAL));
        }, TRANSICION);
        return () => clearTimeout(id);
    }, [paso]);

    // Devuelve la transición un fotograma después, ya reposicionado.
    useEffect(() => {
        if (!saltando) return;
        const id = requestAnimationFrame(() => setSaltando(false));
        return () => cancelAnimationFrame(id);
    }, [saltando]);

    return (
        <div className="marcas">
            <p className="marcas-titulo">{t('hero.marcas')}</p>
            <div className="marcas-carrusel">
                <Flecha lado="prev" etiqueta={t('hero.marcasPrev')} onClick={() => mover(-1)} />
                <div className="marcas-ventana">
                    {/* Lista y no un montón de divs: es una colección, y así un lector
                        de pantalla la anuncia como tal. Las copias son decorativas
                        —repiten lo mismo— así que se las esconde para que no las lea. */}
                    <ul
                        className={`marcas-pista ${saltando ? 'sin-transicion' : ''}`}
                        style={{ '--paso': paso, '--visibles': VISIBLES, '--transicion': `${TRANSICION}ms` }}
                    >
                        {Array.from({ length: COPIAS }, () => marcas).flat().map((marca, i) => (
                            <li
                                key={`${marca.id}-${i}`}
                                className="marcas-item"
                                aria-hidden={i < TOTAL || i >= TOTAL * 2 ? 'true' : undefined}
                            >
                                <span
                                    className="marcas-logo"
                                    style={{ '--marca': `url(${marca.src})` }}
                                    role="img"
                                    aria-label={marca.nombre}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
                <Flecha lado="next" etiqueta={t('hero.marcasNext')} onClick={() => mover(1)} />
            </div>
        </div>
    );
}

/** Una de las dos flechas. El chevron se dibuja una vez y se espeja por CSS. */
function Flecha({ lado, etiqueta, onClick }) {
    return (
        <button type="button" className={`marcas-flecha es-${lado}`} onClick={onClick} aria-label={etiqueta}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
            </svg>
        </button>
    );
}
