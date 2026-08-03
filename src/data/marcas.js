// Los logos de la fila de respaldo del hero. No son traducibles —son nombres
// propios— así que viven acá y no en i18n; lo único traducible es el título de la
// fila, que está en `hero.marcas`.
//
// Los archivos son **siluetas monocromas con alfa**, no los logos originales: la
// fila se pinta entera de un color con `background` + `mask`, así sigue al tema y
// se lee igual sobre el verde claro y sobre el negro. Seis logos con sus colores
// de marca en una fila se leen como un collage, no como un sello de respaldo.
//
// Cómo se sacaron, por si hay que sumar uno:
//  - PNG con alfa (Lovelytics, Toyota, Grupo Petersen): se usa el alfa que ya traen.
//  - JPEG con fondo plano (FIUBA, FIUBAtón): alfa por distancia al color de fondo,
//    con borde suave para que no queden dentados.
//  - La Olimpiada es un caso aparte: su logo es un escudo lleno, y siluetearlo daba
//    una elipse maciza. Ahí el alfa sale de la **luminancia** —tinta donde el
//    original es oscuro— así se recuperan el aro con el texto y el monograma.
import lovelytics from '../assets/marcas/lovelytics.png';
import toyota from '../assets/marcas/toyota.png';
import grupoPetersen from '../assets/marcas/grupo-petersen.png';
import fiuba from '../assets/marcas/fiuba.png';
import fiubaton from '../assets/marcas/fiubaton.png';
import olimpiada from '../assets/marcas/olimpiada.png';

/** @type {Array<{id: string, nombre: string, src: string}>} */
export const marcas = [
    { id: 'lovelytics', nombre: 'Lovelytics', src: lovelytics },
    { id: 'toyota', nombre: 'Toyota', src: toyota },
    { id: 'grupo-petersen', nombre: 'Grupo Petersen', src: grupoPetersen },
    { id: 'fiuba', nombre: 'Universidad de Buenos Aires — FIUBA', src: fiuba },
    { id: 'fiubaton', nombre: 'FIUBAtón', src: fiubaton },
    { id: 'olimpiada', nombre: 'Olimpiada Informática Argentina', src: olimpiada },
];
