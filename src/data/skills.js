import {
    SiPython, SiRust, SiGo, SiTypescript, SiJavascript, SiC,
    SiReact, SiNodedotjs, SiFastapi, SiTensorflow, SiPytorch, SiPandas, SiScikitlearn,
    SiApachespark,
    SiPostgresql, SiMongodb, SiApachecassandra, SiNeo4J,
    SiApachehbase, SiApachehive, SiApache,
    SiDatabricks, SiRabbitmq,
    SiDocker, SiGooglecloud, SiGit, SiGithubactions, SiVercel, SiSupabase,
} from 'react-icons/si';
import { FaJava, FaAws, FaRobot, FaFlask, FaBrain } from 'react-icons/fa';
// Azure sale de `vsc` y AWS de `fa` porque simple-icons dejó de publicar esas dos
// marcas, igual que ya había pasado con LinkedIn en `socials.js`. Java viene de `fa`
// desde siempre por lo mismo.
import { VscAzure } from 'react-icons/vsc';
import {
    FiDatabase, FiCpu, FiBox, FiRefreshCw, FiGlobe, FiLayers, FiServer,
    FiShare2, FiHash, FiZap, FiRadio, FiActivity,
} from 'react-icons/fi';

// Nombres propios: no se traducen. Los títulos de cada categoría sí, vía
// `skills.categories.<clave>` en los archivos de i18n.
//
// Las que no tienen logo propio llevan un ícono genérico que dice qué son: Assembly el
// del procesador, SQL y DynamoDB el de una base, Kinesis el de una emisión —es un flujo—,
// arquitectura orientada a eventos el del rayo y MLOps el del monitoreo, que es su ciclo.
// Impala y Kudu llevan la pluma de Apache a secas: simple-icons no publica la marca de
// ninguno de los dos, y decir de qué familia son es más que un cuadradito neutro.
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
        { name: 'PyTorch', icon: SiPytorch },
        { name: 'Pandas', icon: SiPandas },
        { name: 'Scikit-learn', icon: SiScikitlearn },
        { name: 'NLTK', icon: FiBox },
        { name: 'Apache Spark', icon: SiApachespark },
    ],
    tools: [
        { name: 'AWS', icon: FaAws },
        { name: 'Azure', icon: VscAzure },
        { name: 'Google Cloud', icon: SiGooglecloud },
        { name: 'Databricks', icon: SiDatabricks },
        { name: 'AWS Kinesis', icon: FiRadio },
        { name: 'RabbitMQ', icon: SiRabbitmq },
        { name: 'Docker', icon: SiDocker },
        { name: 'Git', icon: SiGit },
        { name: 'GitHub Actions', icon: SiGithubactions },
        { name: 'CI/CD', icon: FiRefreshCw },
        { name: 'Vercel', icon: SiVercel },
        { name: 'Supabase', icon: SiSupabase },
    ],
    databases: [
        { name: 'PostgreSQL', icon: SiPostgresql },
        { name: 'MongoDB', icon: SiMongodb },
        { name: 'Cassandra', icon: SiApachecassandra },
        { name: 'Neo4j', icon: SiNeo4J },
        { name: 'DynamoDB', icon: FiDatabase },
        { name: 'Apache HBase', icon: SiApachehbase },
        { name: 'Apache Hive', icon: SiApachehive },
        { name: 'Apache Impala', icon: SiApache },
        { name: 'Apache Kudu', icon: SiApache },
    ],
    concepts: [
        { name: 'Distributed Systems', icon: FiGlobe },
        { name: 'Event-Driven Architecture', icon: FiZap },
        { name: 'System Design', icon: FiLayers },
        { name: 'Data Engineering', icon: FiServer },
        { name: 'Machine Learning', icon: FaRobot },
        { name: 'MLOps', icon: FiActivity },
        { name: 'LLM Engineering', icon: FaBrain },
        { name: 'Property-Based Testing', icon: FaFlask },
        { name: 'Gossip Protocol', icon: FiShare2 },
        { name: 'Consistent Hashing', icon: FiHash },
    ],
};
