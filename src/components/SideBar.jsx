import { useEffect, useRef } from 'react';
import { FiChevronRight, FiUser } from 'react-icons/fi';
import { useLang } from '../context/lang-context';
import { socialsActivos } from '../data/socials';
import { perfil } from '../data/perfil';

/**
 * Riel de contacto sobre el borde izquierdo. Se despliega hacia la derecha
 * mostrando la foto de perfil y el nombre de cada enlace.
 *
 * Es el único lugar donde viven estos enlaces: se los quitó al hero y al pie,
 * donde estaban repetidos.
 *
 * El estado de apertura vive en App porque el botón "Contactame" del hero
 * también lo abre.
 *
 * @remarks
 * - Es un segundo `<nav>` de la página, así que lleva su propio nombre
 *   accesible para que un lector de pantalla pueda distinguirlos.
 * - Lo que se despliega usa `grid-template-columns/rows` de `0fr` a `1fr`, que
 *   sí interpola —a diferencia de `width/height: auto`— y evita inventar
 *   medidas fijas que después no coincidan con el contenido.
 * - En móvil no hay margen lateral que ocupar: pasa a ser una barra horizontal
 *   abajo, sin desplegar. No puede ocultarse, porque al haber sacado los
 *   enlaces del hero y del pie sería quedarse sin forma de contacto.
 *
 * @param {boolean} abierto
 * @param {(v: boolean) => void} onCambio
 */
export default function SideBar({ abierto, onCambio }) {
    const { t } = useLang();
    const primerEnlace = useRef(null);
    const desdeElRiel = useRef(false);

    // Si lo abrió el hero, el foco quedó a media pantalla de distancia: se lo
    // trae al riel. Si lo abrió su propio botón, no hay que moverle nada a
    // nadie —el botón está justo ahí—, de ahí la bandera.
    useEffect(() => {
        if (abierto && !desdeElRiel.current) primerEnlace.current?.focus();
        desdeElRiel.current = false;
    }, [abierto]);

    return (
        <nav className={`riel ${abierto ? 'is-abierto' : ''}`} aria-label={t('nav.contact')}>
            <div className="riel-caja" id="riel-contacto">
                {/* Solo se ve desplegado, así que plegado no lo anuncia nadie */}
                <div className="riel-perfil" aria-hidden={!abierto}>
                    <div className="riel-perfil-hueco">
                        <div className="riel-foto">
                            {perfil.foto
                                ? <img src={perfil.foto} alt={perfil.alt} />
                                : <FiUser size={30} aria-hidden="true" />}
                        </div>
                    </div>
                </div>

                <ul className="riel-lista">
                    {socialsActivos.map(({ id, label, href, descarga, Icon }, i) => (
                        <li key={id}>
                            <a
                                ref={i === 0 ? primerEnlace : undefined}
                                className="riel-link"
                                href={href}
                                /* Una descarga no abre pestaña: el navegador baja el
                                   archivo y la pestaña en blanco quedaría dando vueltas. */
                                download={descarga}
                                target={href.startsWith('mailto:') || descarga ? undefined : '_blank'}
                                rel="noopener noreferrer"
                                /* Plegado el nombre no se ve, así que el nombre
                                   accesible sale del aria-label y el texto
                                   visible se oculta para no duplicarlo */
                                aria-label={label}
                            >
                                <Icon size={18} aria-hidden="true" />
                                <span className="riel-nombre" aria-hidden="true">
                                    <span>{label}</span>
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>

                {/* Va al final, debajo de los enlaces. Sin `aria-controls`: está
                    dentro de la región que abre, y apuntarse a un ancestro no
                    le dice nada a nadie. */}
                <button
                    type="button"
                    className="riel-link riel-toggle"
                    onClick={() => { desdeElRiel.current = true; onCambio(!abierto); }}
                    aria-expanded={abierto}
                >
                    <FiChevronRight size={18} aria-hidden="true" />
                    <span className="riel-nombre">
                        <span>{abierto ? t('contact.close') : t('contact.cta')}</span>
                    </span>
                </button>
            </div>
        </nav>
    );
}
