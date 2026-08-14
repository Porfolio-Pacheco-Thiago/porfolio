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
    vibetrip: { Icon: FaPlane, repo: 'https://github.com/Porfolio-Pacheco-Thiago/vibe-trip', pantalla: 'monitor' },
    'cassandra-engine': { Icon: SiApachecassandra, repo: 'https://github.com/Porfolio-Pacheco-Thiago/cassandra-flight-app' },
    // RabbitMQ y no un ícono genérico de red: el middleware es lo que define al
    // proyecto —los latidos, la elección de líder y el reparto por hash van todos
    // por ahí—, igual que Cassandra define al de al lado.
    'distributed-systems': { Icon: SiRabbitmq, repo: 'https://github.com/Porfolio-Pacheco-Thiago/distributed-systems' },
    specforge: { Icon: FaMicroscope, repo: '#' },
    'predictive-models': { Icon: FaBrain, repo: 'https://github.com/Porfolio-Pacheco-Thiago/machine-learning' },
    monopoly: { Icon: FaDice, repo: 'https://github.com/Porfolio-Pacheco-Thiago/monopoly', pantalla: 'monitor' },
    'zorro-ocas': { Icon: FiTerminal, repo: 'https://github.com/Porfolio-Pacheco-Thiago/assembly-game', pantalla: 'monitor' },
};
