/**
 * Un enlace de contacto: GitHub, LinkedIn, mail o el CV.
 *
 * Lo usan el riel de la izquierda y el bloque del final del pie, que tenían la misma
 * ancla escrita dos veces —comentarios incluidos—. Lo que se comparte es **el
 * comportamiento del ancla**, no la maqueta: cada uno le da su clase y decide qué va
 * adentro, porque en el riel cada enlace es un renglón que se despliega con su nombre al
 * costado y en el pie son cuatro botones en fila con el nombre debajo.
 *
 * Las dos reglas que estaban duplicadas:
 *
 * - **Una descarga no abre pestaña.** El navegador baja el archivo y la pestaña en
 *   blanco quedaría dando vueltas. Un `mailto:` tampoco: abre el cliente de correo.
 * - **`rel="noopener noreferrer"` en todo lo que sí abre pestaña.**
 *
 * @param {object} props
 * @param {{href: string, label: string, descarga?: string}} props.social  Una entrada de
 *   `data/socials`.
 * @param {string} props.className
 * @param {boolean} [props.nombraPorAria]  Con `true`, el nombre accesible sale de un
 *   `aria-label` en vez del texto visible. Es lo que necesita el riel, donde plegado el
 *   nombre está recortado y no se ve.
 * @param {React.Ref<HTMLAnchorElement>} [props.ref]
 * @param {React.ReactNode} props.children  El ícono y el nombre, como los quiera cada uno.
 */
export default function EnlaceSocial({
    social, className, nombraPorAria = false, ref, children,
}) {
    const { href, label, descarga } = social;
    const abrePestana = !descarga && !href.startsWith('mailto:');

    return (
        <a
            ref={ref}
            className={className}
            href={href}
            download={descarga}
            target={abrePestana ? '_blank' : undefined}
            rel="noopener noreferrer"
            aria-label={nombraPorAria ? label : undefined}
        >
            {children}
        </a>
    );
}
