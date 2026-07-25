// Desplazamiento suave a una sección por id. Lo usan el Hero y el Navbar.
export function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}
