import { SiReact } from 'react-icons/si';
import { FiUser } from 'react-icons/fi';
import { useLang } from '../context/lang-context';
import { socialsActivos } from '../data/socials';
import { perfil } from '../data/perfil';
import Logo from './ui/Logo';
import ContactButton from './ui/ContactButton';
import './Footer.css';

/**
 * El pie de la página.
 *
 * Con `sinRiel` —o sea en angosto, donde `App` no monta el riel de contacto— se lleva
 * también lo que el riel mostraba: la foto de perfil y los cuatro enlaces, al final de
 * todo. Es el destino al que baja el botón "Contactame" del hero, de ahí que el `id` de
 * contacto sea el del pie.
 *
 * @remarks
 * - El botón "Contactame" del pie desaparece en ese caso. Su única función era abrir el
 *   riel; con los enlaces a la vista dos centímetros más abajo, no le queda ninguna.
 * - Los enlaces no se sacan a un componente compartido con `SideBar` aunque salgan de la
 *   misma lista: allá cada uno es un renglón que se despliega con su nombre al costado, y
 *   acá son cuatro botones en fila con el nombre debajo. Lo único que comparten es
 *   `socialsActivos`, que ya es la fuente única.
 *
 * @param {boolean} sinRiel
 * @param {boolean} contactoAbierto
 * @param {(v: boolean) => void} onContacto
 */
export default function Footer({ sinRiel, contactoAbierto, onContacto }) {
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
                    {!sinRiel && (
                        <ContactButton
                            abierto={contactoAbierto}
                            onCambio={onContacto}
                            className="btn btn-primary"
                        />
                    )}
                </div>
                <div className="footer-bottom">
                    <p>{t('footer.copyright')}</p>
                    <p className="footer-built">{t('footer.madeWith')} <SiReact style={{ verticalAlign: '-0.125em' }} /></p>
                </div>

                {/* Lo último de la página. Solo en angosto: en ancho esto mismo vive en
                    el riel de la izquierda y repetirlo sería mostrarlo dos veces. */}
                {sinRiel && (
                    <section className="footer-contacto" aria-labelledby="footer-contacto-titulo">
                        <h2 className="footer-contacto-titulo" id="footer-contacto-titulo">
                            {t('nav.contact')}
                        </h2>
                        <div className="footer-contacto-foto">
                            {perfil.foto
                                ? <img src={perfil.foto} alt={perfil.alt} />
                                : <FiUser size={34} aria-hidden="true" />}
                        </div>
                        <ul className="footer-contacto-lista">
                            {socialsActivos.map(({ id, label, href, descarga, Icon }) => (
                                <li key={id}>
                                    <a
                                        className="footer-contacto-link"
                                        href={href}
                                        /* Una descarga no abre pestaña: el navegador baja
                                           el archivo y la pestaña en blanco quedaría dando
                                           vueltas. Igual que en el riel. */
                                        download={descarga}
                                        target={href.startsWith('mailto:') || descarga ? undefined : '_blank'}
                                        rel="noopener noreferrer"
                                    >
                                        <Icon size={20} aria-hidden="true" />
                                        {/* Acá el nombre sí se ve, así que nombra al
                                            enlace por sí solo y no hace falta `aria-label`
                                            —que además lo taparía—. */}
                                        <span>{label}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </footer>
    );
}
