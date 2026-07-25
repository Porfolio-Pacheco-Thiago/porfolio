import { SiGithub } from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';

// Fuente única de los perfiles: los usan Hero y Footer.
// (LinkedIn sale de `fa` porque simple-icons dejó de publicar su marca.)
export const socials = [
    { id: 'github', label: 'GitHub', href: 'https://github.com/', Icon: SiGithub },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/', Icon: FaLinkedin },
    { id: 'email', label: 'Email', href: 'mailto:thiago@example.com', Icon: FiMail },
];
