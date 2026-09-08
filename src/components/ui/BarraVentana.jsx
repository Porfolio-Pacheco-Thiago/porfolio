/**
 * La barra de título de una ventana: los tres cuadraditos de contorno.
 *
 * Es el motivo que más se repite en el sitio. Estaba escrito cuatro veces —el hero, cada
 * tarjeta de proyecto, cada categoría de habilidades y cada entrada de la trayectoria—
 * con el mismo `<span /><span /><span />` y cuatro bloques de CSS casi iguales.
 *
 * **Los cuadraditos son de contorno y no rellenos.** Rellenos se leerían como los botones
 * de verdad de una ventana —cerrar, minimizar, agrandar— y estos no hacen nada.
 *
 * Lo que cambia entre los cuatro usos son cinco medidas y dos colores, y van por custom
 * properties sobre el contenedor de cada uno; ver `.ventana-barra` en
 * `styles/primitivas.css`. Lo que **no** cambia —el acomodo, la forma del cuadradito, el
 * hecho de ser decoración— vive acá y allá, una sola vez.
 *
 * @param {object} props
 * @param {'div'|'button'} [props.as='div']  Qué elemento renderiza.
 *   - `div` es el caso normal: la barra es adorno y se va entera del árbol accesible.
 *   - `button` es la entrada de la trayectoria, donde la barra **es** el control que abre
 *     y cierra la tarjeta. Fue el único lugar donde podía ir un botón de verdad: el resto
 *     de esa tarjeta tiene adentro otros botones —los acordeones por cliente— y un
 *     control dentro de otro es inválido. Ahí quien la usa le pasa su `onClick`,
 *     `aria-expanded`, `aria-controls` y `aria-label`, que llegan por `...props`.
 * @param {string} [props.className]  Se suma a la clase propia, no la reemplaza.
 *
 * @example
 * <BarraVentana className="hero-barra" />
 * <BarraVentana as="button" className="timeline-barra" onClick={…} aria-label={título} />
 */
export default function BarraVentana({ as: Tag = 'div', className = '', ...props }) {
    const esControl = Tag === 'button';

    return (
        <Tag
            className={`ventana-barra ${className}`.trim()}
            // De control lleva `type` para no enviar formularios que no existen; de
            // adorno se esconde entero, que es más barato que esconder cada hijo.
            {...(esControl ? { type: 'button' } : { 'aria-hidden': 'true' })}
            {...props}
        >
            {/* Vacíos y marcados: un `<span>` sin contenido no aporta nada al árbol
                accesible, pero con la barra como control el `aria-hidden` del contenedor
                no está, así que acá sí hace falta decirlo. */}
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
        </Tag>
    );
}
