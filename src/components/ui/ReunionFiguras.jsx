import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { alCambiarFiguras } from '../../lib/figuras';
import './ReunionFiguras.css';

/**
 * El punto de reunión de las figuras del hero, con el logo que se dibuja encima.
 *
 * Las figuras siguen viviendo donde estaban —cada una posicionada en su lugar del
 * hero— y no se mudan a una capa común: mudarlas obligaría a rehacer su posición y
 * su animación de entrada, que es justamente lo que ya funciona. Lo que se hace es
 * medir, **una vez por convocatoria**, cuánto hay entre el centro de cada figura y
 * este punto, y escribirlo como dos variables. De ahí en adelante se mueve el CSS.
 *
 * Medir en el momento y no al montar: las figuras entran desde fuera de la pantalla
 * con una transición de 3s, así que su posición al montar no es la definitiva.
 */
export default function ReunionFiguras() {
    const puntoRef = useRef(null);
    const [activa, setActiva] = useState(false);

    useEffect(() => alCambiarFiguras((figura) => {
        setActiva(!!figura);
        const punto = puntoRef.current;
        if (!punto) return;
        const destino = punto.getBoundingClientRect();
        const cx = destino.left + destino.width / 2;
        const cy = destino.top + destino.height / 2;

        for (const fig of document.querySelectorAll('.hero-fig')) {
            if (!figura) {
                fig.style.removeProperty('--dx');
                fig.style.removeProperty('--dy');
                continue;
            }
            // Se lee la caja **sin** el desplazamiento anterior: si se midiera con la
            // figura ya corrida, cada convocatoria sumaría sobre la anterior.
            fig.style.removeProperty('--dx');
            fig.style.removeProperty('--dy');
            const caja = fig.getBoundingClientRect();
            fig.style.setProperty('--dx', `${Math.round(cx - (caja.left + caja.width / 2))}px`);
            fig.style.setProperty('--dy', `${Math.round(cy - (caja.top + caja.height / 2))}px`);
        }
    }), []);

    return (
        <div className={`reunion ${activa ? 'esta-activa' : ''}`} ref={puntoRef} aria-hidden="true">
            <Logo className="reunion-logo" alt="" />
        </div>
    );
}
