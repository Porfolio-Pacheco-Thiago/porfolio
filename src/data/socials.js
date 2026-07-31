import { SiGithub } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa';
import { FiMail, FiFileText } from 'react-icons/fi';

// Fuente única de los accesos de contacto: los usa la barra lateral.
// (LinkedIn sale de `fa` porque simple-icons dejó de publicar su marca.)
//
// `href: null` significa "todavía no hay a dónde apuntar": esas entradas no se
// renderizan, para no repetir lo de los repos, que apuntaban todos a '#'.
export const socials = [
    { id: 'github', label: 'GitHub', href: 'https://github.com/', Icon: SiGithub },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/', Icon: FaLinkedin },
    { id: 'email', label: 'Email', href: 'mailto:thiago@example.com', Icon: FiMail },
    // El PDF vive en `public/`, así que la ruta se arma con `BASE_URL` y no a mano:
    // el sitio se sirve desde el subpath '/porfolio/' y un '/cv...' absoluto
    // apuntaría a la raíz del dominio.
    // `descarga` hace que el navegador lo baje en vez de abrirlo en una pestaña.
    {
        id: 'cv',
        label: 'CV',
        href: `${import.meta.env.BASE_URL}cv-thiago-pacheco.pdf`,
        descarga: 'CV-Thiago-Pacheco.pdf',
        Icon: FiFileText,
    },
];

/** Solo los que tienen destino real. */
export const socialsActivos = socials.filter(s => s.href);
