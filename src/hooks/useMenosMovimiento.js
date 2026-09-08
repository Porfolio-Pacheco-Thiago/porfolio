import { MENOS_MOVIMIENTO } from '../lib/medidas';
import { useMediaQuery } from './useMediaQuery';

/**
 * Si el usuario pidió menos movimiento.
 *
 * Estaba leído a mano en once lugares, con tres modismos distintos: una lectura suelta,
 * una lectura con suscripción al cambio, y una lectura dentro del manejador del click.
 * Los dos primeros son este hook; el tercero es `prefiereMenosMovimiento()` de
 * `lib/medidas`, que no puede ser un hook porque corre en medio de un evento.
 *
 * Escucha el cambio a propósito: el sistema operativo permite activar la preferencia con
 * la página abierta, y un carrusel que sigue girando después de eso es justo lo que la
 * preferencia viene a evitar.
 *
 * @returns {boolean}
 */
export function useMenosMovimiento() {
    return useMediaQuery(MENOS_MOVIMIENTO);
}
