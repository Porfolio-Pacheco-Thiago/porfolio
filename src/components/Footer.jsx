import { SiReact } from 'react-icons/si';
import { useLang } from '../context/lang-context';
import Logo from './ui/Logo';
import SocialLinks from './ui/SocialLinks';
import './Footer.css';

export default function Footer() {
    const { t } = useLang();

    return (
        <footer id="contact" className="footer">
            <div className="footer-inner reveal-fade">
                <div className="footer-top">
                    <div className="footer-brand">
                        <span className="footer-logo"><Logo className="footer-logo-img" /></span>
                        <p className="footer-tagline">{t('hero.role')}</p>
                    </div>
                    <SocialLinks className="footer-socials" size={18} />
                </div>
                <div className="footer-bottom">
                    <p>{t('footer.copyright')}</p>
                    <p className="footer-built">{t('footer.madeWith')} <SiReact style={{ verticalAlign: '-0.125em' }} /></p>
                </div>
            </div>
        </footer>
    );
}
