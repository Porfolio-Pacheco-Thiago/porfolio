import { useEffect, useRef, useState } from 'react';
import { useMenosMovimiento } from './useMenosMovimiento';

/**
 * Un índice que avanza solo cada `segundos`, en bucle.
 *
 * Lo usan la terminal de SpecForge (`ui/Shell`) y la pantalla del aparato de demos
 * (`ui/DemoDispositivo`), que tenían el mismo bloque escrito dos veces con las mismas
 * dos sutilezas:
 *
 * - **El índice vive además en un ref.** El intervalo lee el ref y no el estado: leyendo
 *   el estado, el efecto tendría que depender de él y se reiniciaría en cada relevo, y
 *   eso hacía que la primera pieza durase el doble que las demás.
 * - **Se apaga con `prefers-reduced-motion`.** Un carrusel que avanza solo es movimiento
 *   que nadie pidió y del que no se puede salir. Ahí se queda en la primera.
 *
 * `saliente` es la pieza que se está yendo, para quien anime el relevo: se devuelve solo
 * si `conSaliente` está puesto, porque a corte no hay nada que se vaya —la imagen se
 * reemplaza en el mismo elemento— y una saliente que nadie anima no recibe el
 * `animationend` que la limpia, así que se acumularían capas viejas sobre la buena.
 *
 * @param {object} opciones
 * @param {number} opciones.cantidad   Cuántas piezas hay. Con menos de 2 no arranca.
 * @param {number} [opciones.segundos=3]  Cuánto se queda cada una.
 * @param {boolean} [opciones.activo=true]  Con `false` se para y no avanza. Lo usan las
 *   tarjetas cerradas —que siguen en el DOM, tapadas— y el aparato con una demo puesta.
 * @param {boolean} [opciones.conSaliente=false]  Si además de la que entra hay que
 *   informar cuál se va.
 * @returns {{indice: number, saliente: number|null, limpiarSaliente: () => void}}
 */
export function useCarrusel({ cantidad, segundos = 3, activo = true, conSaliente = false }) {
    const [indice, setIndice] = useState(0);
    const [saliente, setSaliente] = useState(null);
    const indiceRef = useRef(0);
    const quieto = useMenosMovimiento();

    useEffect(() => {
        if (!activo || quieto || cantidad < 2) return undefined;
        const id = window.setInterval(() => {
            const viejo = indiceRef.current;
            const proximo = (viejo + 1) % cantidad;
            indiceRef.current = proximo;
            if (conSaliente) setSaliente(viejo);
            setIndice(proximo);
        }, segundos * 1000);
        return () => window.clearInterval(id);
    }, [activo, quieto, cantidad, segundos, conSaliente]);

    return {
        indice,
        saliente,
        limpiarSaliente: () => setSaliente(null),
    };
}
