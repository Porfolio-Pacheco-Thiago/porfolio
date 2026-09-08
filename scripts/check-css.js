#!/usr/bin/env node
/**
 * Busca la clase de bug de cascada que este proyecto ya se comió dos veces.
 *
 * **El patrón.** Dos reglas con la **misma especificidad** que declaran la **misma
 * propiedad** sobre los **mismos elementos**. Entre iguales gana la última del archivo,
 * así que la que uno lee primero no hace nada — y no hay forma de darse cuenta leyendo,
 * porque están a cientos de líneas de distancia.
 *
 * Las dos veces que pasó acá:
 *
 *  1. `.hero-role` tenía un `font-size` al final de `Hero.css` que le ganaba en silencio
 *     al del bloque de `@media (max-width: 768px)`. El rol no se achicaba nunca.
 *  2. Al juntar los bloques duplicados de `.hero-role`, su `animation` quedó **después**
 *     del `@media (prefers-reduced-motion: reduce)` que la apaga. Con la preferencia
 *     puesta, la animación volvía a correr.
 *
 * El caso 2 es el que más importa y el que ninguna regla de stylelint mira: **un
 * `@media` cuya intención es anular algo, anulado a su vez por una regla de después**.
 * Por eso este script y no una regla más de `stylelint.config.js`.
 *
 * `no-duplicate-selectors` de stylelint no sirve para esto. Marcaba 53 casos en este
 * proyecto, de los cuales 33 eran una regla compartida entre varios elementos más la
 * específica de uno —un patrón normal y correcto— y de los 20 restantes, 19 declaraban
 * propiedades distintas, o sea que no podían pisarse. Un aviso que es 96% ruido se
 * aprende a ignorar, y entonces no sirve de red.
 *
 * **Qué NO mira**, a propósito: dos reglas de distinta especificidad. Ahí el orden no
 * decide nada y la más específica gana esté donde esté, que es como tiene que ser.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Todos los `.css` de `src/`, en cualquier subcarpeta. */
function hojas(dir) {
    return readdirSync(dir).flatMap(f => {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) return hojas(p);
        return p.endsWith('.css') ? [p] : [];
    });
}

/**
 * Las reglas de una hoja: selector, propiedades declaradas, línea y en qué `@media`
 * está, si está en alguno.
 */
function reglas(css) {
    // Los comentarios se vacían conservando los saltos, así los números de línea siguen
    // siendo los del archivo de verdad.
    const txt = css.replace(/\/\*[\s\S]*?\*\//g, c => '\n'.repeat((c.match(/\n/g) ?? []).length));
    const salida = [];
    const pila = [];
    let i = 0, buf = '', linea = 1;

    while (i < txt.length) {
        const ch = txt[i];
        if (ch === '\n') linea += 1;
        if (ch === '{') {
            const sel = buf.trim().replace(/\s+/g, ' ');
            buf = '';
            if (sel.startsWith('@')) {
                pila.push(sel);
            } else {
                let prof = 1, j = i + 1;
                while (prof) {
                    if (txt[j] === '{') prof += 1;
                    else if (txt[j] === '}') prof -= 1;
                    j += 1;
                }
                const cuerpo = txt.slice(i + 1, j - 1);
                const props = new Set(
                    [...cuerpo.matchAll(/(^|[;{])\s*(-{0,2}[a-z][\w-]*)\s*:/g)].map(m => m[2]),
                );
                salida.push({ sel, props, linea, media: pila.filter(Boolean).join(' | ') });
                pila.push(null);
            }
        } else if (ch === '}') {
            pila.pop();
            buf = '';
        } else {
            buf += ch;
        }
        i += 1;
    }
    return salida;
}

/**
 * La especificidad de un selector simple, como `a,b,c`.
 *
 * Alcanza con contar: `#id`, luego clases / atributos / pseudo-clases, luego elementos y
 * pseudo-elementos. `:not()`, `:is()` y `:has()` toman la de su argumento más específico;
 * acá se aproxima contando lo de adentro, que para este CSS da el mismo resultado y no
 * necesita un parser de verdad.
 */
function especificidad(sel) {
    const limpio = sel.replace(/::?[a-z-]+\(/g, '(');
    const ids = (limpio.match(/#[\w-]+/g) ?? []).length;
    const clases = (limpio.match(/\.[\w-]+|\[[^\]]+\]|:[a-z-]+(?![\w(-])/g) ?? []).length;
    const elems = (limpio.match(/(^|[\s>+~(,])[a-z][\w-]*/g) ?? []).length;
    return `${ids}-${String(clases).padStart(3, '0')}-${String(elems).padStart(3, '0')}`;
}

/** Los selectores de una lista `a, b, c`, respetando los paréntesis. */
function partes(sel) {
    const out = [];
    let buf = '', prof = 0;
    for (const ch of sel) {
        if (ch === '(') prof += 1;
        else if (ch === ')') prof -= 1;
        if (ch === ',' && prof === 0) { out.push(buf.trim()); buf = ''; }
        else buf += ch;
    }
    out.push(buf.trim());
    return out.filter(Boolean);
}

const hallazgos = [];

for (const archivo of hojas(join(RAIZ, 'src'))) {
    const rs = reglas(readFileSync(archivo, 'utf8'));
    // Se indexa por selector **simple**: así `.hero-role` y `.hero-ventana, .hero-role`
    // caen en el mismo grupo, que es justamente el caso 2 de la nota de arriba.
    const porSelector = new Map();
    for (const r of rs) {
        for (const p of partes(r.sel)) {
            if (!porSelector.has(p)) porSelector.set(p, []);
            porSelector.get(p).push(r);
        }
    }

    for (const [simple, grupo] of porSelector) {
        if (grupo.length < 2) continue;
        const espec = especificidad(simple);
        for (let a = 0; a < grupo.length; a += 1) {
            for (let b = a + 1; b < grupo.length; b += 1) {
                const [antes, despues] = [grupo[a], grupo[b]];
                const comunes = [...antes.props].filter(p => despues.props.has(p));
                if (!comunes.length) continue;
                // **Solo** el caso peligroso: algo dentro de un `@media` y algo de
                // después fuera de él. Cuando la condición se cumple valen los dos, y
                // gana el de abajo — o sea que el `@media` no hace nada, que es
                // justamente lo contrario de para qué se escribió.
                //
                // Dos reglas de nivel superior declarando lo mismo **no** se marcan: eso
                // es una base y un override deliberado, el patrón más común de CSS. Acá
                // hay cinco así y los cinco son correctos —`.timeline-tags` pasa a
                // `display: none` en reposo, `.hero-fig[data-entered]` afina su opacidad—.
                // Marcarlos sería volver al aviso que nadie mira.
                if (!(antes.media && !despues.media)) continue;
                hallazgos.push({ archivo: relative(RAIZ, archivo), simple, espec, antes, despues, comunes });
            }
        }
    }
}

if (hallazgos.length) {
    console.error(`\n${hallazgos.length} choque(s) de cascada:\n`);
    for (const h of hallazgos) {
        console.error(`  ${h.archivo}`);
        console.error(`    "${h.simple}" declara ${h.comunes.map(c => `"${c}"`).join(', ')} dos veces, con la misma especificidad:`);
        console.error(`      L${h.antes.linea}${h.antes.media ? `  dentro de ${h.antes.media}` : ''}`);
        console.error(`      L${h.despues.linea}   ← fuera del @media, y va después: gana esta`);
        console.error('    Cuando la condición del @media se cumple valen las dos, así que el @media no hace nada.');
        console.error('    Se arregla moviendo el @media debajo de la regla que anula, o subiéndole la especificidad.');
        console.error('');
    }
    process.exit(1);
}

const total = hojas(join(RAIZ, 'src')).length;
console.log(`CSS OK: ${total} hojas, ningún @media anulado por una regla posterior.`);
