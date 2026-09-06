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
//  - WebP rojo sobre blanco (CDW): el canal verde ya es la distancia al fondo
//    invertida —255 en el blanco, 0 en el centro del trazo—, así que el alfa sale de
//    `255 - G` y los bordes conservan su antialias sin inventar un umbral.
//  - JPEG con fondo plano (FIUBA, FIUBAtón): alfa por distancia al color de fondo,
//    con borde suave para que no queden dentados.
//  - Escudo lleno (la Olimpiada): siluetearlo daba una elipse maciza, así que el alfa
//    sale de la **luminancia** —tinta donde el original es oscuro— y así se recuperan el
//    aro con el texto y el monograma. Ese logo ya no está en la fila, pero el archivo
//    sigue en `assets/marcas/olimpiada.png` por si vuelve.
import lovelytics from '../assets/marcas/lovelytics.png';
import cdw from '../assets/marcas/cdw.png';
import toyota from '../assets/marcas/toyota.png';
import grupoPetersen from '../assets/marcas/grupo-petersen.png';
import fiuba from '../assets/marcas/fiuba.png';
import fiubaton from '../assets/marcas/fiubaton.png';

/** @type {Array<{id: string, nombre: string, src: string}>} */
export const marcas = [
    { id: 'lovelytics', nombre: 'Lovelytics (a CDW company)', src: lovelytics },
    // Va pegado a Lovelytics y no en otro lugar de la fila: es la casa matriz que la
    // compró, y separados se leen como dos respaldos que no tienen nada que ver.
    { id: 'cdw', nombre: 'CDW', src: cdw },
    { id: 'toyota', nombre: 'Toyota', src: toyota },
    { id: 'grupo-petersen', nombre: 'Grupo Petersen', src: grupoPetersen },
    { id: 'fiuba', nombre: 'Universidad de Buenos Aires — FIUBA', src: fiuba },
    { id: 'fiubaton', nombre: 'FIUBAtón', src: fiubaton },
];
