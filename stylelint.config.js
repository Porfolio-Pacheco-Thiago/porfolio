/**
 * Stylelint para lo que stylelint hace bien: formato, sintaxis y nombres.
 *
 * El bug de cascada que este proyecto se comió dos veces —una regla que le gana en
 * silencio a un `@media`— **no lo mira stylelint**, lo mira `scripts/check-css.js`.
 * Ver la nota de ese archivo y la de `no-duplicate-selectors`, más abajo.
 *
 * La configuración es `standard` con las excepciones que el CSS de acá necesita de
 * verdad, cada una anotada. Nada de apagar reglas "para que pase".
 */
export default {
    extends: ['stylelint-config-standard'],
    ignoreFiles: ['dist/**', 'node_modules/**', '.claude/**'],
    rules: {
        // Apagada, y con motivo medido. Marcaba 53 casos en este proyecto:
        //
        //  · 33 eran `disallowInList` — un selector que aparece suelto y además dentro de
        //    una lista. Pero eso no es un duplicado: `.wire-ring { … }` más
        //    `.wire-ring, .wire-face, .wire-bar { transition: … }` es una regla propia y
        //    una compartida entre cinco elementos, el patrón más normal que hay.
        //  · De los 20 restantes, 19 declaraban propiedades **distintas**, así que ni
        //    siquiera podían pisarse.
        //  · Quedaba **uno** de verdad, y ya está arreglado: `.wire-decor.at-left` tenía
        //    dos `left` a 350 líneas de distancia.
        //
        // Un aviso que es 96% ruido se aprende a ignorar, y entonces deja de ser una red.
        // Lo que sí queda de esa revisión: los 6 duplicados que estaban en la misma
        // sección se juntaron, y los 14 que quedan son separaciones deliberadas entre
        // secciones rotuladas. El bug que importaba lo vigila `scripts/check-css.js`, que
        // corre en CI y falla en rojo.
        'no-duplicate-selectors': null,

        // Nombres en español y con guiones: `.timeline-item`, `.fono-barra`, `.es-monitor`.
        // El patrón de `standard` acepta esto, pero también deja pasar camelCase; acá se
        // exige el guion, que es lo que usa todo el proyecto sin excepción.
        'selector-class-pattern': [
            '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
            { message: s => `La clase "${s}" tiene que ir en minúsculas y con guiones` },
        ],
        // Las custom properties siguen la misma convención, y algunas llevan tilde en
        // el comentario pero nunca en el nombre.
        'custom-property-pattern': [
            '^[a-z][a-z0-9]*(-[a-z0-9]+)*$',
            { message: s => `La variable "${s}" tiene que ir en minúsculas y con guiones` },
        ],

        // Los comentarios de este proyecto son párrafos con mayúscula inicial y punto
        // final: son la documentación, no una nota al margen.
        'comment-empty-line-before': null,

        // Apagadas a conciencia, no por comodidad:
        //
        // `no-descending-specificity` marcaría decenas de casos que acá son
        // deliberados —un estado (`.expanded`, `.is-demo`) declarado después de una
        // regla más específica es el patrón que usa toda la sección de Proyectos—.
        // Prenderla obligaría a reordenar CSS que funciona para callar al linter.
        'no-descending-specificity': null,

        // Los prefijos que quedan son los que Safari todavía necesita:
        // `-webkit-backdrop-filter` para el desenfoque de la barra, `-webkit-mask-*`
        // para las siluetas de la fila de marcas y `-webkit-background-clip` para el
        // degradado de los títulos. Sacarlos rompe Safari; la regla no distingue.
        'property-no-vendor-prefix': null,

        // `rgba()` contra `rgb()`: son la misma función desde hace años y el proyecto usa
        // las dos formas —`rgba(0, 230, 118, 0.08)` para un color literal y
        // `rgb(var(--sombra-rgb) / 0.55)` para uno armado—. Unificarlas es reescribir 20
        // colores para que se vean exactamente igual.
        'color-function-alias-notation': null,

        // Estas dos las apago porque su autocorrección **rompe cosas**, comprobado:
        //
        // - `value-keyword-case` pasa a minúsculas los nombres del stack de sistema
        //   —`BlinkMacSystemFont`, `SFMono-Regular`—, que se escriben así por convención.
        // - `selector-not-notation` convierte `:not(a):not(b)` en `:not(a, b)`, que **no
        //   tiene la misma especificidad**: la primera suma dos clases y la segunda una.
        //   La regla de la pantalla de carga en `index.css` compite con CSS de componente,
        //   así que ese punto cambia quién gana.
        'value-keyword-case': null,
        'selector-not-notation': null,

        // Formato puro. Apagadas porque este CSS ya está escrito —6795 líneas— y
        // reformatearlo entero para callar al linter sería un diff enorme que no cambia
        // ni un píxel, y que además taparía en el historial los cambios que sí importan.
        // Lo que se busca acá es atrapar errores, no imponer un estilo.
        'declaration-empty-line-before': null,
        'custom-property-empty-line-before': null,
        'at-rule-empty-line-before': null,
        'rule-empty-line-before': null,
        'comment-whitespace-inside': null,
        'media-feature-range-notation': null,
        'alpha-value-notation': null,
        'color-function-notation': null,
        'declaration-block-no-redundant-longhand-properties': null,
    },
};
