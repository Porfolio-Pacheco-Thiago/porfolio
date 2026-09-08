import { useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useLang } from '../../context/lang-context';
import { useAlternable } from '../../hooks/useAlternable';
import { SIN_RIEL } from '../../lib/medidas';
import { conVistaTransicion } from '../../lib/vista-transicion';
import ProjectCard from './projects/ProjectCard';
import WireFigure from '../ui/WireFigure';
import './Projects.css';

export default function Projects() {
    const { t, getList } = useLang();
    const [expandedId, setExpandedId] = useState(null);
    // Qué proyecto está reproduciendo una demo. Mientras lo haga, su foto se
    // contrae y el celular se queda con ese espacio.
    const [reproduciendoId, setReproduciendoId] = useState(null);
    // Qué tapa está ampliada, por id de proyecto. Antes esto era un `:hover`: alcanzaba
    // con que el puntero cruzara la franja para que la captura se abriera sola encima
    // del título y del aparato. Ahora se abre y se cierra con click.
    const { activo: tapaAmpliada, cerrar: cerrarTapa, props: propsTapa } = useAlternable();
    const activaRef = useRef(null);
    const grillaRef = useRef(null);
    const items = getList('projects.items');

    /**
     * Corre un cambio de estado dentro de una View Transition, para que el navegador
     * anime el reacomodo en vez de saltar.
     *
     * Lo necesita sobre todo el paso a reproducción: ahí no se mueve una propiedad sino
     * el acomodo entero —el reparto de columnas, la posición de cada pieza en la grilla,
     * el `display: contents` de los controles—, y nada de eso es animable con
     * transiciones. Sin esto, todo se teletransporta mientras el ancho del monitor va
     * viajando solo, que es lo que se veía mal.
     */
    const conTransicion = (cambio) => conVistaTransicion(
        () => flushSync(cambio),
        {
            activaRef,
            // Mientras dura el morph, la sección apaga sus propias transiciones. Son
            // seis, de 0.85s, sobre las mismas propiedades que la View Transition ya está
            // moviendo: la altura de la foto, el ancho y la pose del aparato, la opacidad
            // del marco. La VT pinta capturas, así que esas transiciones siguen corriendo
            // por debajo sin verse, y cuando la VT termina —a los 0.5s— todavía van por
            // la mitad: el acomodo salta a un estado intermedio y recién ahí sigue
            // deslizándose. Con un solo reloj el movimiento es uno solo.
            alEmpezar: () => document.documentElement.classList.add('morfando'),
            alTerminar: () => document.documentElement.classList.remove('morfando'),
        },
    );

    const toggle = (id) => {
        cerrarTapa();
        const cerrando = expandedId === id;
        // Se le clava el alto a la grilla antes de tocar nada. Las tarjetas que no se
        // abren quedan ocultas **pero en su lugar** (ver Projects.css), pero la que sí
        // se abre pasa a posición absoluta y sale del flujo: sin eso la grilla se queda
        // con seis tarjetas, o sea dos filas en vez de tres, y se acorta igual. Es la
        // única medición que quedó, y reemplaza a todo el scroll de recentrado.
        //
        // Salvo en angosto, donde la tarjeta abierta vuelve al flujo (ver el bloque de
        // 900 en Projects.css). Ahí clavar el alto sería contraproducente por partida
        // doble: lo que se clavaría es el alto de las ocho apiladas, y además la abierta
        // ya no sale del flujo, así que no hay nada que compensar. El umbral sale de
        // `lib/medidas`, y en el CSS está el mismo número marcado con `corte SIN_RIEL`.
        const grilla = grillaRef.current;
        const angosto = window.matchMedia(SIN_RIEL).matches;
        if (grilla && !cerrando && expandedId === null && !angosto) {
            grilla.style.height = `${grilla.getBoundingClientRect().height}px`;
        }
        const soltarGrilla = () => {
            if (grilla && cerrando) grilla.style.height = '';
        };
        const run = () => flushSync(() => {
            setExpandedId(prev => (prev === id ? null : id));
            // Al cerrar, el `<video>` no se desmonta —el bloque queda en el DOM para
            // poder animarlo— y por eso no llega ningún `pause` que limpie el estado.
            if (cerrando) setReproduciendoId(null);
        });
        // View Transitions API: anima el reacomodo —la tarjeta pasa de celda de la
        // grilla a ancho completo y el resto desaparece— en vez de saltar de golpe.
        //
        // Acá iba un scroll de reacomodo —centrar la tarjeta al abrir, encuadrar la
        // sección al cerrar—. Ya no hace falta: la grilla no cambia de alto, así que la
        // tarjeta abierta aparece exactamente sobre el lugar que ya estabas mirando y
        // la página no se mueve. Ver la regla de `visibility` en Projects.css.
        //
        // La grilla se suelta al **terminar** el morph, no durante: mientras corre, lo
        // que se ve son capturas superpuestas y reacomodar por debajo se nota.
        conVistaTransicion(run, { activaRef, alTerminar: soltarGrilla });
    };

    return (
        <section id="projects" className="projects has-decor">
            <WireFigure kind="tetrahedron" detail={3} spin="flat" className="wire-decor at-right" size={720} line={7} seconds={115} tiltX={14} tiltZ={16} />
            <div className="section-header reveal">
                <h2 className="section-title">{t('projects.title')}</h2>
                {/* Sin subtítulo: "Proyectos de Ingeniería Destacados" debajo de
                    "Proyectos" no agregaba nada que el título no dijera ya. La clave
                    sigue en i18n por si hace falta en otro lado, igual que `shortDesc`. */}
            </div>

            <div className="projects-grid" ref={grillaRef}>
                {items.map((item, index) => (
                    <ProjectCard
                        key={item.id}
                        item={item}
                        index={index}
                        abierta={expandedId === item.id}
                        reproduciendo={reproduciendoId === item.id}
                        ampliada={tapaAmpliada === item.id}
                        propsTapa={propsTapa}
                        onAlternar={() => toggle(item.id)}
                        onReproducir={va => setReproduciendoId(va ? item.id : null)}
                        conTransicion={conTransicion}
                    />
                ))}
            </div>
        </section>
    );
}
