import foto from '../assets/perfil.webp';

// Foto de perfil del riel de contacto.
//
// Se importa —en vez de escribir la ruta a mano— para que Vite la reescriba con
// el base '/porfolio/' y le ponga hash de cache.
//
// El archivo ya viene recortado en cuadrado y centrado en la cabeza: el riel lo
// dibuja en un círculo de 84px, y encuadrarlo acá evita depender de un
// `object-position` afinado a ojo.
export const perfil = {
    foto,
    alt: 'Thiago Pacheco',
};
