import { useState, useEffect } from 'react';
import { useTheme } from '../context/theme-context';
import { useLang } from '../context/lang-context';
import { scrollToSection } from '../lib/scroll';
import Logo from './ui/Logo';
import WireFigure from './ui/WireFigure';
import './Navbar.css';

// Ids de las secciones observadas, en orden de aparición. Cada uno tiene su
// clave `nav.<id>` en los archivos de i18n.
const SECTIONS = ['about', 'journey', 'projects', 'skills'];

// Cada sección tiene su figura, la misma que decora esa zona de la página.
// En el navbar van diminutas y con muy pocos aros: a 18px, más detalle es
// geometría que nadie ve y que igual hay que rasterizar.
const FIGURA = {
    about: { kind: 'pyramid' },
    journey: { kind: 'cube' },
    projects: { kind: 'tetrahedron' },
    skills: { kind: 'sphere', meridians: 5, parallels: 3 },
};

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLang, t } = useLang();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(SECTIONS[0]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // Tomar la sección más visible en pantalla
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible) setActiveSection(visible.target.id);
            },
            { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
        );

        SECTIONS.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const goTo = (id) => {
        scrollToSection(id);
        setMenuOpen(false);
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} aria-label={t('nav.label')}>
            <div className="navbar-inner">
                <button className="navbar-logo" onClick={() => goTo('about')} aria-label={t('hero.name')}>
                    <Logo className="navbar-logo-img" alt="" />
                </button>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    {SECTIONS.map(s => (
                        <button
                            key={s}
                            className={`nav-link ${activeSection === s ? 'active' : ''}`}
                            onClick={() => goTo(s)}
                            aria-current={activeSection === s ? 'true' : undefined}
                        >
                            <WireFigure
                                className="nav-figure"
                                size={28}
                                line={3}
                                seconds={11}
                                autoSpin={false}
                                {...FIGURA[s]}
                            />
                            {t(`nav.${s}`)}
                        </button>
                    ))}
                </div>

                <div className="navbar-actions">
                    <button
                        className="toggle-btn lang-toggle"
                        onClick={toggleLang}
                        aria-label={lang === 'en' ? 'Cambiar a español' : 'Switch to English'}
                    >
                        {lang === 'en' ? 'ES' : 'EN'}
                    </button>
                    <button
                        className="toggle-btn theme-toggle"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                    >
                        {theme === 'dark' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        )}
                    </button>
                    <button
                        className={`hamburger ${menuOpen ? 'open' : ''}`}
                        onClick={() => setMenuOpen(p => !p)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </div>
        </nav>
    );
}
