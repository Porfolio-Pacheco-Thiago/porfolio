import { FiMusic, FiTerminal } from 'react-icons/fi';
import { FaPlane, FaMicroscope, FaBrain, FaDice } from 'react-icons/fa';
import { SiApachecassandra } from 'react-icons/si';

// Metadata no traducible de cada proyecto, indexada por el mismo `id` que projects.items
// en los archivos de i18n. `repo: '#'` = todavía sin repositorio público.
export const projectMeta = {
    melodia: { Icon: FiMusic, repo: '#' },
    vibetrip: { Icon: FaPlane, repo: '#' },
    'cassandra-engine': { Icon: SiApachecassandra, repo: '#' },
    specforge: { Icon: FaMicroscope, repo: '#' },
    'predictive-models': { Icon: FaBrain, repo: '#' },
    monopoly: { Icon: FaDice, repo: '#' },
    'zorro-ocas': { Icon: FiTerminal, repo: '#' },
};
