import { FiMusic, FiTerminal } from 'react-icons/fi';
import { FaPlane, FaMicroscope, FaBrain, FaDice } from 'react-icons/fa';
import { SiApachecassandra } from 'react-icons/si';

// Metadata no traducible de cada proyecto, indexada por el mismo `id` que projects.items
// en los archivos de i18n. `repo: '#'` = todavía sin repositorio público.
export const projectMeta = {
    // Melodía se desarrolló en equipo, en su propia organización: el link va a
    // la org y no a un fork nuestro, para no romper la atribución de los commits.
    melodia: { Icon: FiMusic, repo: 'https://github.com/Melodia-ID2' },
    vibetrip: { Icon: FaPlane, repo: '#' },
    'cassandra-engine': { Icon: SiApachecassandra, repo: '#' },
    specforge: { Icon: FaMicroscope, repo: '#' },
    'predictive-models': { Icon: FaBrain, repo: '#' },
    monopoly: { Icon: FaDice, repo: '#' },
    'zorro-ocas': { Icon: FiTerminal, repo: '#' },
};
