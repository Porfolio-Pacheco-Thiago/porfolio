import { useRef } from 'react';
import { useLang } from '../context/lang-context';
import { scrollToSection } from '../lib/scroll';
import SocialLinks from './ui/SocialLinks';
import AnimatedText from './ui/AnimatedText';
import heroVideoVp9 from '../assets/hero-vp9-alpha.webm';
import heroVideoVp8 from '../assets/hero-vp8-alpha.webm';
import heroPoster from '../assets/hero-poster-alpha.webp';
import './Hero.css';

export default function Hero({ loading }) {
    const { t } = useLang();
    const videoRef = useRef(null);

    const restartVideo = () => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = 0;
        v.play().catch(() => {});
    };

    return (
        <section id="about" className="hero">
            <div className="hero-bg-glow" />
            <div className="hero-content">
                <div className="hero-text">
                    <p className="hero-greeting reveal">{t('hero.greeting')}</p>
                    <h1 className="hero-name reveal" style={{ transitionDelay: '80ms' }}>{t('hero.name')}</h1>
                    {/* Se monta recién cuando cae el loader: la animación arranca al montar
                        y detrás del loader no se vería. `key` la reinicia al cambiar idioma. */}
                    {loading
                        ? <p className="hero-role" aria-hidden="true">{t('hero.role')}</p>
                        : <AnimatedText key={t('hero.role')} text={t('hero.role')} className="hero-role" />}
                    <p className="hero-bio reveal" style={{ transitionDelay: '240ms' }}>{t('hero.bio')}</p>
                    <div className="hero-buttons reveal" style={{ transitionDelay: '320ms' }}>
                        <button className="btn btn-primary" onClick={() => scrollToSection('projects')}>
                            {t('hero.cta')}
                        </button>
                        <button className="btn btn-outline" onClick={() => scrollToSection('contact')}>
                            {t('hero.contact')}
                        </button>
                    </div>
                    <SocialLinks className="hero-socials reveal" style={{ transitionDelay: '400ms' }} />
                </div>
                <div className="hero-visual">
                    <div className="hero-video-wrapper reveal" style={{ transitionDelay: '200ms' }}>
                        <video
                            ref={videoRef}
                            className="hero-video"
                            autoPlay
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
            <div className="scroll-indicator">
                <div className="scroll-line" />
            </div>
        </section>
    );
}
