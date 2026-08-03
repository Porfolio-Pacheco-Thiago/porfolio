import { useLang } from '../context/lang-context';
import { skillsByCategory } from '../data/skills';
import WireFigure from './ui/WireFigure';
import './Skills.css';

export default function Skills() {
    const { t } = useLang();

    return (
        <section id="skills" className="skills has-decor">
            {/* Decorativo: la malla de un globo evoca los sistemas distribuidos
                que atraviesan estos proyectos. Va detrás del contenido. */}
            <WireFigure kind="sphere" spin="flat" className="wire-decor at-right" size={860} line={6} seconds={135} tiltX={22} tiltZ={-14} />

            <div className="section-header reveal">
                <h2 className="section-title">{t('skills.title')}</h2>
                <p className="section-subtitle">{t('skills.subtitle')}</p>
            </div>

            <div className="skills-container">
                {Object.entries(skillsByCategory).map(([category, skills], index) => (
                    <div
                        key={category}
                        className={`skills-category reveal-fade ${category === 'concepts' ? 'is-wide' : ''}`}
                        style={{ transitionDelay: `${index * 80}ms` }}
                    >
                        {/* La misma ventana que Trayectoria y Proyectos: barra de título
                            con los tres cuadraditos de contorno —ornamento, no botones,
                            de ahí el `aria-hidden`— y el contenido adentro del marco. */}
                        <div className="skills-barra" aria-hidden="true">
                            <span /><span /><span />
                        </div>
                        <div className="skills-cuerpo">
                            <h3 className="skills-category-title">
                                {t(`skills.categories.${category}`)}
                            </h3>
                            <div className="skills-list">
                                {skills.map(({ name, icon: Icon }) => (
                                    <div key={name} className="skill-item">
                                        <span className="skill-icon"><Icon /></span>
                                        <span className="skill-name">{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
