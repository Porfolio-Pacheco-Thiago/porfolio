import { FiMusic, FiTerminal } from 'react-icons/fi';
import { FaPlane, FaMicroscope, FaBrain, FaDice } from 'react-icons/fa';
import { SiApachecassandra, SiRabbitmq } from 'react-icons/si';

// Metadata no traducible de cada proyecto, indexada por el mismo `id` que projects.items
// en los archivos de i18n. `repo: '#'` = todavía sin repositorio público.
//
// `pantalla` elige el chasis del aparato que muestra los medios (ver
// `ui/DemoDispositivo.jsx`), y se decide por la forma de lo que hay que mostrar, no por
// gusto: `'monitor'` para lo apaisado —capturas de escritorio y de web—, y el celular
// por defecto, que es lo que le sirve a Melodía porque sus grabaciones son verticales.
// Sin medios que mostrar no aparece ningún aparato.
export const projectMeta = {
    // Melodía se desarrolló en equipo, en su propia organización: el link va a
    // la org y no a un fork nuestro, para no romper la atribución de los commits.
    melodia: { Icon: FiMusic, repo: 'https://github.com/Melodia-ID2' },
    // `carrusel`: el monitor se queda quieto y derecho, y las capturas pasan solas.
    // Sin botonera. Acepta `true` para el ritmo de siempre —tres segundos por pieza,
    // con las dos deslizándose como el rodillo de una tragamonedas— o un objeto para
    // apartarse de ese ritmo: `segundos` cuánto dura cada una y `corte` para cambiarlas
    // de golpe, sin relevo.
    vibetrip: { Icon: FaPlane, repo: 'https://github.com/Porfolio-Pacheco-Thiago/vibe-trip', pantalla: 'monitor', carrusel: true },
    // Con carrusel y video a la vez: las capturas se turnan solas en la pantalla
    // mientras el monitor gira, y la botonera queda con el único botón que importa,
    // el de la demo.
    'cassandra-engine': { Icon: SiApachecassandra, repo: 'https://github.com/Porfolio-Pacheco-Thiago/cassandra-flight-app', pantalla: 'monitor', carrusel: true },
    // RabbitMQ y no un ícono genérico de red: el middleware es lo que define al
    // proyecto —los latidos, la elección de líder y el reparto por hash van todos
    // por ahí—, igual que Cassandra define al de al lado.
    'distributed-systems': { Icon: SiRabbitmq, repo: 'https://github.com/Porfolio-Pacheco-Thiago/distributed-systems', pantalla: 'monitor' },
    specforge: { Icon: FaMicroscope, repo: '#' },
    'predictive-models': { Icon: FaBrain, repo: 'https://github.com/Porfolio-Pacheco-Thiago/machine-learning', pantalla: 'monitor', carrusel: true },
    // `bucle`: en vez de una botonera con una demo para elegir, el video queda puesto en
    // el monitor desde el principio, mudo y repitiéndose. El aparato se planta de frente
    // como con `carrusel`, y sin nada que controlar tampoco va la barra del reproductor.
    // `velocidad` es el `playbackRate`: la partida grabada se juega despacio y a 1.3 se
    // sigue igual pero no se hace larga.
    monopoly: { Icon: FaDice, repo: 'https://github.com/Porfolio-Pacheco-Thiago/monopoly', pantalla: 'monitor', bucle: { velocidad: 1.3 } },
    // El único con carrusel a corte: son cuatro estados de la misma partida, y pasar
    // uno por segundo sin relevo se lee como el juego avanzando. Con el deslizamiento
    // de las otras, a un segundo por pieza, la pantalla no llega a quedarse quieta.
    'zorro-ocas': { Icon: FiTerminal, repo: 'https://github.com/Porfolio-Pacheco-Thiago/assembly-game', pantalla: 'monitor', carrusel: { segundos: 1, corte: true } },
};
