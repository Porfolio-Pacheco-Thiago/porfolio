import { useEffect, useRef, useState } from 'react';
import { useLang } from '../context/lang-context';
import { scrollToSection } from '../lib/scroll';
import Marcas from './ui/Marcas';
import WireFigure from './ui/WireFigure';
import AnimatedText from './ui/AnimatedText';
import ContactButton from './ui/ContactButton';
import NombreTrazado from './ui/NombreTrazado';
import heroVideoVp9 from '../assets/hero-vp9-alpha.webm';
import heroVideoVp8 from '../assets/hero-vp8-alpha.webm';
import heroPoster from '../assets/hero-poster-alpha.webp';
import './Hero.css';

export default function Hero({ loading, contactoAbierto, onContacto }) {
    const { t, getList } = useLang();
    const videoRef = useRef(null);
    const flechaRef = useRef(null);
    // La flecha se dibuja con `stroke-dashoffset`, que no se compone en GPU:
    // repinta en cada cuadro. Es chica, pero corría también con el hero fuera de
    // pantalla, y este proyecto ya tuvo un problema térmico con animaciones
    // permanentes. Se pausa cuando sale de vista.
    const [flechaVisible, setFlechaVisible] = useState(true);

    useEffect(() => {
        const el = flechaRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entrada]) => setFlechaVisible(entrada.isIntersecting),
            { rootMargin: '80px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Sin `autoPlay`: con el atributo, el video corría detrás de la pantalla de
    // carga y para cuando esta se levantaba ya iba por la mitad. Arranca —desde
    // cero— recién cuando el loader se va.
    useEffect(() => {
        if (loading) return;
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = 0;
        v.play().catch(() => {});
    }, [loading]);

    const restartVideo = () => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = 0;
        v.play().catch(() => {});
    };

    return (
        <section id="about" className="hero">
            <div className="hero-bg-glow" />

            {/* Las tres figuras que decoran las secciones de abajo, en chico y
                repartidas por los márgenes: anticipan lo que viene. */}
            <WireFigure kind="cube" detail={2} spin="flat" className="hero-fig fig-a" size={150} line={3} seconds={70} tiltX={20} tiltZ={-10} />
            <WireFigure kind="tetrahedron" detail={2} spin="flat" className="hero-fig fig-b" size={120} line={3} seconds={95} tiltX={14} tiltZ={18} />
            <WireFigure kind="sphere" spin="flat" className="hero-fig fig-c" size={165} line={3} seconds={110} tiltX={24} tiltZ={-14} meridians={8} parallels={6} />
            <div className="hero-content">
                <div className="hero-text">
                    {/* La misma ventana que las tarjetas de Proyectos, con tres
                        diferencias pedidas: el marco va en degradado, no lleva el
                        recuadro de la esquina —eso identifica a un proyecto— y
                        detrás va un segundo contorno corrido que hace de sombra. */}
                    <div className="hero-ventana reveal" style={{ transitionDelay: '80ms' }}>
                        <span className="hero-ventana-sombra" aria-hidden="true" />
                        <div className="hero-marco">
                            <div className="hero-barra" aria-hidden="true">
                                <span /><span /><span />
                            </div>
                            <div className="hero-ventana-cuerpo">
                                <div className="hero-nombre-fila">
                                    {/* Los seis puntos en paralelogramo, como en la
                                        referencia. Decorativos: no dicen nada que el
                                        nombre de al lado no diga ya. */}
                                    <span className="hero-puntos" aria-hidden="true" />
                                    {/* `data-nombre` alimenta el `content: attr()` de la
                                        capa que dibuja el contorno del nombre. */}
                                    {/* El nombre visible es un SVG que se dibuja trazo a
                                        trazo. El texto de verdad queda acá para lectores de
                                        pantalla y para que el `h1` siga siendo un `h1`. */}
                                    <h1 className="hero-name">
                                        <span className="visually-hidden">{t('hero.name')}</span>
                                        <NombreTrazado />
                                    </h1>
                                </div>
                                {/* Se monta recién cuando cae el loader: la animación arranca al montar
                                    y detrás del loader no se vería. `key` la reinicia al cambiar idioma. */}
                                {loading
                                    ? <p className="hero-role" aria-hidden="true">{t('hero.role')}</p>
                                    : <AnimatedText
                                        key={t('hero.role')}
                                        text={t('hero.role')}
                                        className="hero-role"
                                        style={{ '--letras-rol': t('hero.role').replace(/\s/g, '').length }}
                                    />}
                            </div>
                        </div>
                    </div>

                    {/* Una frase por renglón: `bio` es una lista y no un texto suelto
                        justamente para eso. Antes era un párrafo corrido y el ajuste de
                        línea partía las oraciones por la mitad —"…a los 21 años — un /
                        hito histórico…"—, que es donde el ojo pierde el hilo. Cada
                        idioma corta donde le corresponde a **sus** frases. */}
                    <p className="hero-bio reveal" style={{ transitionDelay: '240ms' }}>
                        {getList('hero.bio').map(frase => (
                            <span key={frase} className="hero-bio-frase">{frase}</span>
                        ))}
                    </p>
                    <div className="hero-buttons reveal" style={{ transitionDelay: '320ms' }}>
                        <button className="btn btn-primary" onClick={() => scrollToSection('projects')}>
                            {t('hero.cta')}
                        </button>
                        {/* Abre y cierra el riel de la izquierda, donde ahora
                            viven los enlaces de contacto, en lugar de bajar al pie */}
                        <ContactButton abierto={contactoAbierto} onCambio={onContacto} />
                    </div>
                    {/* Debajo de los botones, en la misma columna: es el respaldo de lo
                        que dice el hero, así que se lee junto con él. Entran tres a la
                        vez y van rotando, como en la referencia. */}
                    <div className="reveal" style={{ transitionDelay: '400ms' }}>
                        <Marcas />
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-video-wrapper reveal" style={{ transitionDelay: '200ms' }}>
                        <video
                            ref={videoRef}
                            className="hero-video"
                            muted
                            playsInline
                            preload="auto"
                            poster={heroPoster}
                            onClick={restartVideo}
                            title="Click to replay"
                        >
                            {/* Los dos WebM llevan transparencia (alpha_mode=1). El VP8 no es
                                un duplicado: es el fallback de alfa para navegadores que no
                                soportan alfa en VP9. No recomprimir estos archivos con ffmpeg:
                                su decodificador vp9 no lee el canal alfa de WebM y lo descarta
                                silenciosamente, dejando el video con fondo opaco. */}
                            <source src={heroVideoVp9} type="video/webm; codecs=vp9" />
                            <source src={heroVideoVp8} type="video/webm; codecs=vp8" />
                            <img src={heroPoster} alt="Thiago Pacheco" className="hero-video" />
                        </video>
                    </div>
                </div>
            </div>
            {/* Puerto a SVG + CSS del Lottie que usa la referencia (tamalsen,
                `lf30_editor_axlyflyi`): un mouse de contorno que se dibuja solo,
                con la rueda y el chevron rebotando dentro. Las medidas y los
                tiempos salen del JSON —composición de 72×72, 25 fps, 125 cuadros
                = 5 s—, así que la animación es la misma; lo único que cambia es
                el color, que era violeta.

                Va portado y no con `lottie-web` porque el reproductor pesa ~250 KB
                para dibujar tres trazos, y todo el hero pesa menos que eso. */}
            <button
                ref={flechaRef}
                type="button"
                className="scroll-indicator"
                data-animando={flechaVisible ? 'true' : 'false'}
                onClick={() => scrollToSection('journey')}
                aria-label={t('hero.scroll')}
            >
                <svg
                    className="scroll-mouse"
                    aria-hidden="true"
                    viewBox="0 0 72 72"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* `pathLength=100` normaliza el largo de cada trazo, así los
                        `stroke-dashoffset` de los keyframes son porcentajes y no
                        números medidos a mano que se rompen al tocar la forma. */}
                    <rect className="scroll-cuerpo" x="17.71" y="3.5" width="36.58" height="65" rx="18.29" pathLength="100" />
                    <rect className="scroll-trazo" x="17.71" y="3.5" width="36.58" height="65" rx="18.29" pathLength="100" />
                    <g className="scroll-rueda">
                        <line className="scroll-linea" x1="36" y1="17.5" x2="36" y2="34.5" pathLength="100" />
                        <polyline className="scroll-chevron" points="29.55,47.25 35.96,53.75 42.45,47.25" pathLength="100" />
                    </g>
                </svg>
            </button>
        </section>
    );
}
