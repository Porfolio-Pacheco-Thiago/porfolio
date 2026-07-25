import { useTheme } from '../../context/theme-context';
import logoDark from '../../assets/logo_tema_oscuro.png';
import logoLight from '../../assets/logo_tema_claro.png';

// El logo cambia con el tema. `alt` vacío donde ya hay texto equivalente al lado.
export default function Logo({ className, alt = 'Thiago Pacheco' }) {
    const { theme } = useTheme();
    return (
        <img
            src={theme === 'dark' ? logoDark : logoLight}
            alt={alt}
            className={className}
        />
    );
}
