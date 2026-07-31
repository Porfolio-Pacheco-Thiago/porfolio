import { SiReact } from 'react-icons/si';
import { useLang } from '../context/lang-context';
import Logo from './ui/Logo';
import ContactButton from './ui/ContactButton';
import './Footer.css';

export default function Footer({ contactoAbierto, onContacto }) {
    const { t } = useLang();

    return (
        <footer id="contact" className="footer">
            <div className="footer-inner reveal-fade">
                <div className="footer-top">
                    <div className="footer-brand">
                        <span className="footer-logo"><Logo className="footer-logo-img" /></span>
                        <p className="footer-tagline">{t('hero.role')}</p>
                    </div>
                    {/* Vuelve a llenar el hueco que dejaron los enlaces sociales
                        al mudarse al riel, y cierra la página con la misma
                        llamada con la que abre el hero. */}
                    <ContactButton
                        abierto={contactoAbierto}
                        onCambio={onContacto}
                        className="btn btn-primary"
                    />
                </div>
                <div className="footer-bottom">
                    <p>{t('footer.copyright')}</p>
                    <p className="footer-built">{t('footer.madeWith')} <SiReact style={{ verticalAlign: '-0.125em' }} /></p>
                </div>
            </div>
        </footer>
    );
}
