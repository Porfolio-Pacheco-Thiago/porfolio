import { convocarFiguras } from '../../lib/figuras';

/**
 * Una palabra que convoca a las figuras. Al pasarle el mouse por encima, las
 * figuras del hero se juntan en el centro y se dibuja el logo sobre ellas; la que
 * queda al frente es la que declara `figura`.
 *
 * Es un `<span>` y no un control: no hace nada al hacer clic y no lleva a ningún
 * lado, así que no va en el orden de tabulación. Para quien no usa mouse el efecto
 * simplemente no ocurre, y no se pierde nada — es decoración.
 *
 * @param {object} props
 * @param {'cube'|'tetrahedron'|'sphere'} props.figura
 * @param {import('react').ReactNode} props.children
 */
export default function PalabraFigura({ figura, children }) {
    return (
        <span
            className="palabra-figura"
            onMouseEnter={() => convocarFiguras(figura)}
            onMouseLeave={() => convocarFiguras(null)}
        >
            {children}
        </span>
    );
}
