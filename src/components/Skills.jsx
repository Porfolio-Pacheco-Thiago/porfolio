import { useLang } from '../context/lang-context';
import { skillsByCategory } from '../data/skills';
import './Skills.css';

export default function Skills() {
    const { t } = useLang();

    return (
        <section id="skills" className="skills">
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
                ))}
            </div>
        </section>
    );
}
