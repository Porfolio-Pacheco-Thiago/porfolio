#!/usr/bin/env node
/**
 * Verifica que el contenido esté sincronizado. Corre en CI, junto al lint y al build.
 *
 * El proyecto parte cada cosa en dos: lo traducible en `i18n/{es,en}.json` y la metadata
 * en `data/*.js`, ligados por el mismo `id`. Eso funciona bien mientras las dos mitades
 * coincidan, y **nada las obligaba a coincidir**: un `id` mal escrito o una clave que
 * quedó en un idioma solo no rompen el build. La tarjeta simplemente sale sin metadata,
 * o el texto sale en el otro idioma, o `t()` devuelve la ruta de la clave como si fuera
 * el texto —que es literalmente lo que hace cuando no encuentra—.
 *
 * Cuatro comprobaciones:
 *
 *  1. `es.json` y `en.json` tienen exactamente las mismas claves.
 *  2. Cada entrada de `projects.items` tiene su `id` en `projectMeta`, y al revés.
 *  3. Lo mismo entre `journey.items` y `journeyMeta` — salvo que acá la metadata es
 *     opcional (`Journey` tiene un `DEFAULT_META`), así que solo se mira que no sobre.
 *  4. Cada `id` de `journeyClientMeta` existe como cliente de alguna entrada.
 *
 * Sale con código 1 y lista todo lo que encontró; no se corta en el primer problema.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const leerJson = p => JSON.parse(readFileSync(join(RAIZ, p), 'utf8'));

const es = leerJson('src/i18n/es.json');
const en = leerJson('src/i18n/en.json');

// La metadata se lee con un regex y no importándola: `data/projects.js` importa íconos de
// `react-icons`, y arrastrar eso a Node para leer una lista de claves es traer medio
// paquete de React a un script de 60 líneas. Lo único que hace falta son los `id` de
// primer nivel del objeto, que están escritos uno por línea.
function clavesDeObjeto(archivo, nombre) {
    const txt = readFileSync(join(RAIZ, archivo), 'utf8');
    const desde = txt.indexOf(`export const ${nombre} = {`);
    if (desde === -1) throw new Error(`No encontré "${nombre}" en ${archivo}`);
    const cuerpo = txt.slice(desde);
    const claves = [];
    let prof = 0;
    for (const linea of cuerpo.split('\n').slice(1)) {
        const m = prof === 0 && linea.match(/^\s{4}'?([\w-]+)'?\s*:/);
        if (m) claves.push(m[1]);
        prof += (linea.match(/\{/g) ?? []).length - (linea.match(/\}/g) ?? []).length;
        if (prof < 0) break;
    }
    return claves;
}

/** Todas las rutas de puntos de un objeto, hasta las hojas. */
function rutas(obj, prefijo = '') {
    return Object.entries(obj).flatMap(([k, v]) => (
        v && typeof v === 'object' && !Array.isArray(v)
            ? rutas(v, `${prefijo}${k}.`)
            : [`${prefijo}${k}`]
    ));
}

const problemas = [];
const falta = (a, b) => a.filter(x => !b.includes(x));

// 1 — las claves de los dos idiomas
const rutasEs = rutas(es);
const rutasEn = rutas(en);
for (const [donde, sobran] of [['en.json', falta(rutasEs, rutasEn)], ['es.json', falta(rutasEn, rutasEs)]]) {
    for (const k of sobran) problemas.push(`i18n: la clave "${k}" no está en ${donde}`);
}

// 2 — proyectos
const metaProyectos = clavesDeObjeto('src/data/projects.js', 'projectMeta');
for (const idioma of ['es', 'en']) {
    const items = (idioma === 'es' ? es : en).projects.items.map(p => p.id);
    for (const id of falta(items, metaProyectos)) {
        problemas.push(`projects: "${id}" está en ${idioma}.json pero no en projectMeta`);
    }
}
for (const id of falta(metaProyectos, es.projects.items.map(p => p.id))) {
    problemas.push(`projects: "${id}" está en projectMeta pero no en i18n`);
}

// 3 — trayectoria. La metadata es opcional (Journey tiene DEFAULT_META), así que solo se
// mira que no sobre: una entrada con metadata y sin texto es un id mal escrito.
const metaTrayectoria = clavesDeObjeto('src/data/journey.js', 'journeyMeta');
const idsTrayectoria = es.journey.items.map(j => j.id);
for (const id of falta(metaTrayectoria, idsTrayectoria)) {
    problemas.push(`journey: "${id}" está en journeyMeta pero no en i18n`);
}

// 4 — clientes anidados
const metaClientes = clavesDeObjeto('src/data/journey.js', 'journeyClientMeta');
const idsClientes = es.journey.items.flatMap(j => (j.clients ?? []).map(c => c.id));
for (const id of falta(metaClientes, idsClientes)) {
    problemas.push(`journey: el cliente "${id}" está en journeyClientMeta pero no en i18n`);
}

if (problemas.length) {
    console.error(`\n${problemas.length} problema(s) de contenido:\n`);
    for (const p of problemas) console.error(`  · ${p}`);
    console.error('');
    process.exit(1);
}

console.log(
    `Contenido OK: ${rutasEs.length} claves en los dos idiomas, `
    + `${metaProyectos.length} proyectos, ${idsTrayectoria.length} entradas de trayectoria.`,
);
