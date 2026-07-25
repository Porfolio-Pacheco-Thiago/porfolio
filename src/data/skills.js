import {
    SiPython, SiRust, SiGo, SiTypescript, SiJavascript, SiC,
    SiReact, SiNodedotjs, SiFastapi, SiTensorflow, SiPandas, SiScikitlearn,
    SiPostgresql, SiMongodb, SiApachecassandra, SiNeo4J,
    SiDocker, SiGooglecloud, SiGit, SiGithubactions, SiVercel, SiSupabase,
} from 'react-icons/si';
import { FaJava, FaRobot, FaFlask, FaBrain } from 'react-icons/fa';
import { FiDatabase, FiCpu, FiBox, FiTrendingUp, FiRefreshCw, FiGlobe, FiLayers, FiServer, FiShare2, FiHash } from 'react-icons/fi';

// Nombres propios: no se traducen. Los títulos de cada categoría sí, vía
// `skills.categories.<clave>` en los archivos de i18n.
export const skillsByCategory = {
    languages: [
        { name: 'Python', icon: SiPython },
        { name: 'Rust', icon: SiRust },
        { name: 'Java', icon: FaJava },
        { name: 'Assembly', icon: FiCpu },
        { name: 'Go', icon: SiGo },
        { name: 'TypeScript', icon: SiTypescript },
        { name: 'JavaScript', icon: SiJavascript },
        { name: 'SQL', icon: FiDatabase },
        { name: 'C', icon: SiC },
    ],
    frameworks: [
        { name: 'React', icon: SiReact },
        { name: 'React Native', icon: SiReact },
        { name: 'Node.js', icon: SiNodedotjs },
        { name: 'FastAPI', icon: SiFastapi },
        { name: 'TensorFlow', icon: SiTensorflow },
        { name: 'Pandas', icon: SiPandas },
        { name: 'Scikit-learn', icon: SiScikitlearn },
        { name: 'NLTK', icon: FiBox },
        { name: 'XGBoost', icon: FiTrendingUp },
    ],
    tools: [
        { name: 'Docker', icon: SiDocker },
        { name: 'Google Cloud', icon: SiGooglecloud },
        { name: 'Git', icon: SiGit },
        { name: 'GitHub Actions', icon: SiGithubactions },
        { name: 'Vercel', icon: SiVercel },
        { name: 'Supabase', icon: SiSupabase },
        { name: 'CI/CD', icon: FiRefreshCw },
    ],
    databases: [
        { name: 'PostgreSQL', icon: SiPostgresql },
        { name: 'MongoDB', icon: SiMongodb },
        { name: 'Cassandra', icon: SiApachecassandra },
        { name: 'Neo4j', icon: SiNeo4J },
    ],
    concepts: [
        { name: 'Distributed Systems', icon: FiGlobe },
        { name: 'Machine Learning', icon: FaRobot },
        { name: 'System Design', icon: FiLayers },
        { name: 'Property-Based Testing', icon: FaFlask },
        { name: 'LLM Engineering', icon: FaBrain },
        { name: 'Data Engineering', icon: FiServer },
        { name: 'Gossip Protocol', icon: FiShare2 },
        { name: 'Consistent Hashing', icon: FiHash },
    ],
};
