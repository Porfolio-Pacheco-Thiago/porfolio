# Plan: hacer el sitio responsive sin tocar el escritorio

El diseño de escritorio está terminado y no se discute. Este plan es sobre **agregar**
comportamiento en pantallas angostas, no sobre rediseñar nada.

---

## 0. La regla que gobierna todo

**Ninguna regla base se edita.** Todo lo nuevo va adentro de un `@media (max-width: …)`.

Esto no es una preferencia de estilo: es la única forma de que "no se tocó el escritorio"
sea verificable en vez de una promesa. Si una regla base cambia, hay que demostrar que el
render en ancho no se movió, y eso cuesta más que escribir el override.

**La trampa de los refactors "responsive-friendly".** La tentación va a ser cambiar cosas
como `width: calc(33.333% - 1rem)` (`Projects.css:73`) por un `flex: 1 1 320px`, que se
acomoda solo. No: son fórmulas distintas y en 1920 dan anchos distintos. Lo mismo con
cambiar `px` por `clamp()` en reglas base. Si algo así parece necesario, el override en el
media query resuelve el mismo caso sin poner en riesgo el ancho.

**Cómo se prueba que no se movió.** Antes de empezar, tomar las medidas de referencia en
1920×857 y guardarlas en este archivo. Después de cada tanda, volver a medirlas: tienen que
dar **idéntico**, no parecido.

```js
// pegar en la consola con la sección Proyectos a la vista
JSON.stringify([...document.querySelectorAll('.project-card')].map(c => ({
  id: c.dataset.proyecto,
  w: Math.round(c.getBoundingClientRect().width),
  h: Math.round(c.getBoundingClientRect().height),
})))
```

Y con una tarjeta abierta, lo que se ajustó a mano en las últimas sesiones:

```js
const c = document.querySelector('.project-card.expanded');
JSON.stringify({
  desborde: c.scrollHeight - c.clientHeight,        // tiene que ser 0
  franja: Math.round(c.querySelector('.project-media').getBoundingClientRect().height),
  card: Math.round(c.getBoundingClientRect().height),
})
```

### Línea base — 1920×857, español, tema oscuro

Tomada en `0cd0ae7`, con el tab en primer plano y las animaciones forzadas a terminar.

**Cerradas.** Las ocho miden **363px de ancho**. El alto es 208 salvo las tres sin
aparato —`distributed-systems`, `specforge`, `predictive-models`— que miden 231.
Grilla 1136×695, sección 1200×890, hero 1912×872, habilidades 1200×660.

**Abiertas.** Desborde **0** en las ocho y alto de tarjeta **695** en todas. La franja es
la medida de control, porque es la que se reparte sola:

| id | franja |
|---|---|
| `cassandra-engine` | 125 |
| `melodia` | 162 |
| `distributed-systems` | 174 |
| `vibetrip` | 199 |
| `monopoly` | 220 |
| `zorro-ocas` | 231 |
| `specforge` | 257 |
| `predictive-models` | 273 |

**Reproduciendo.** Cassandra: monitor 880×500, barra del reproductor 222, **un** párrafo
visible, desborde 0. Melodía: celular 310×612, dos párrafos, desborde 0.

### El protocolo importa tanto como los números

La primera corrida de esta tabla dio **+11px** en tres tarjetas —`zorro-ocas`, `specforge`
y el alto de tarjeta, que salía 706 en vez de 695—. No era ruido: era medir una tarjeta
mientras la **anterior todavía se estaba cerrando**. Durante esa transición la grilla mide
11px de más, y como la franja toma el alto que sobra, se lleva la diferencia entera.

O sea que la franja es un control excelente y por eso mismo delata cualquier suciedad del
método. Antes de cada medición:

```js
// 1. cerrar todo y esperar a que la grilla se asiente
document.querySelectorAll('.project-card.expanded').forEach(c => c.click());
await new Promise(r => setTimeout(r, 1800));
document.querySelectorAll('*').forEach(el => el.getAnimations().forEach(a => { try { a.finish(); } catch(e) {} }));
// 2. recién ahí abrir la que se quiere medir
```

Control rápido de que la grilla está limpia: los altos cerrados tienen que dar
`[208,208,208,231,231,231,208,208]` y la grilla **695**. Si da 706, todavía se está
moviendo algo.

---

## 1. Auditar lo que ya hay, antes de agregar nada

El sitio **ya tiene** media queries, pero son anteriores al rediseño y algunas ahora pelean
con las reglas nuevas. Esto va primero: si no, se van a estar depurando síntomas de reglas
viejas creyendo que son del trabajo nuevo.

Puntos de quiebre en uso hoy: **1400, 900, 768, 700**. Sin criterio único — conviene fijar
la escala antes de sumar el quinto.

**Hecho.** La auditoría dio bastante menos de lo que yo esperaba, y una de mis sospechas
era falsa:

| Dónde | Qué hace | Veredicto |
|---|---|---|
| `.project-card { width: 100% }` a 768 **y** a 900 | una tarjeta por fila | **Duplicado, sacado.** El bloque de 900 ya cubre todo lo que hay por debajo. |
| `.project-media { height: 160px }` a 768 | alto de la ventana | **Vivo, se queda.** Yo había escrito que peleaba con la franja elástica. No es cierto: esa regla es `.project-media`, una clase, y la de la franja es `.project-card.expanded .project-media`, tres. Gana por especificidad, sin que el media query tenga nada que ver. Solo alcanza a la tarjeta **cerrada**. |
| `.fono-bloque { grid-template-columns: 1fr }` a 768 | apila aparato y columna | **Vivo.** El acomodo de reproducción define su propio template con más especificidad, pero solo mientras se reproduce; esta regla gobierna el resto del tiempo. |
| barra del reproductor en dos filas a 700 | `flex-wrap` | **Vivo.** Convive con el `justify-content: space-between` que se agregó después: uno reparte, el otro parte en filas. |

Los dos bloques de 768 se unieron en uno y quedaron ordenados de mayor a menor, que era la
otra fuente de confusión: estaban intercalados con el de 900.

**Lección para el resto del plan:** antes de dar por conflictiva una regla vieja, contar la
especificidad. Media query y especificidad son cosas independientes — estar adentro de un
`@media` no le da prioridad a nada.

---

## 2. El problema estructural: la tarjeta expandida

Esto es el núcleo del trabajo, no un detalle.

`Projects.css:112` pone la tarjeta abierta en `position: absolute; inset: 0` **sobre la
grilla entera**. En escritorio la grilla son 3 filas, así que esa caja mide unos 695px y es
un techo razonable. Todo lo que se ajustó en las últimas sesiones cuelga de que ese techo
exista y sea ese:

- la franja que se estira para tomar lo que sobra,
- el reparto entre el monitor y la descripción al reproducir,
- que Cassandra esconda su segundo párrafo.

En angosto las tarjetas pasan a `width: 100%`, o sea **ocho apiladas**. La grilla mide
varios miles de píxeles y la tarjeta abierta hereda ese alto entero. No es que se vea mal:
es que todas las decisiones de alto dejan de tener sentido a la vez.

**La pregunta a resolver primero** (antes de tocar una línea de las otras secciones): en
angosto, ¿la tarjeta abierta sigue siendo una capa sobre la grilla, o vuelve al flujo?

La razón de que sea una capa está en el comentario de `Projects.css:96`: que la grilla no
cambie de alto, para que la página no se mueva bajo el mouse y la tarjeta aparezca donde ya
estabas mirando. **En un teléfono ese argumento no aplica** — ahí se scrollea de todos
modos, no hay mouse, y una tarjeta que crece empujando lo de abajo es el comportamiento
esperado.

Así que lo más probable es:

```css
@media (max-width: 900px) {
    .project-card.expanded {
        position: static;   /* vuelve al flujo: crece y empuja */
        inset: auto;
    }
    /* y con eso, la franja deja de repartir un techo que ya no existe */
    .project-card.expanded .project-marco { flex: none; }
    .project-card.expanded .project-media { height: <un alto propio>; }
}
```

Ojo con el efecto secundario: las tarjetas no expandidas están en `visibility: hidden`
**pero siguen ocupando su lugar** (`Projects.css:102`). Con la abierta de vuelta en el
flujo, eso deja un hueco enorme debajo. En angosto probablemente tengan que ir a
`display: none`.

**Verificar también:** el morph de View Transitions (`Projects.jsx`, con `flushSync` y el
intercambio de `order`) y el cálculo de `expandedIsRight`, que según `CLAUDE.md` supone una
grilla de N columnas. Con una sola columna hay que confirmar que no queda haciendo cuentas
sobre una geometría que ya no existe.

---

## 3. Orden del resto, de más riesgoso a menos

La idea es atacar primero lo que puede obligar a repensar algo, y dejar para el final lo
que es puro acomodo.

### 3.1 El aparato (monitor y celular) — el más caro

`--monitor-video: 880px` (`Projects.css:1035`) es un ancho fijo en px. Por debajo de
~1000px de viewport no entra, y con él se cae el acomodo de reproducción entero: el monitor
a la derecha, el reproductor a la izquierda y la descripción abajo (`:1046`).

En angosto eso tiene que apilarse: aparato arriba, controles debajo, descripción al final.
Es el mismo contenido en otro orden, no un diseño nuevo.

Mientras se toca esto, ver también:
- `Projects.css:1165` — `width: var(--monitor-video, 717px)`, otro px fijo.
- El giro 3D del aparato. `CLAUDE.md` documenta un problema térmico con transforms 3D en
  este repo; en un teléfono es peor. Evaluar apagarlo por debajo de cierto ancho, como ya
  se apaga con `prefers-reduced-motion` (`Projects.css:1706`).

### 3.2 Trayectoria

Ya tiene su colapso a una columna en `Journey.css:1158`: la línea se va al margen y todo
cuelga de ella. Es la parte más resuelta del sitio.

Falta revisar: los acordeones por cliente y las listas anidadas (los tres modos de
`Journey.jsx`) con el ancho de un teléfono, y las galerías.

### 3.3 Hero

Tiene 768 y 1400 (`Hero.css:448`, `:531`). El `width: 600px` de `Hero.css:17` es el
resplandor decorativo, dentro de un `overflow: hidden` — no es riesgo de layout.

El punto real acá es el **peso**: `CLAUDE.md` dice que lo que queda de la página es casi
todo el hero, 1,7 MB + 1,2 MB de video WebM. En una conexión móvil eso es el problema
principal del sitio, más que cualquier layout. Considerar servir solo el póster
(38 KB, ya optimizado) por debajo de cierto ancho.

**No re-encodear los WebM.** Ver la nota de `CLAUDE.md`: llevan alfa por `BlockAdditional`
y ffmpeg lo pierde en silencio.

### 3.4 Habilidades, Navbar, Footer

Los tres ya tienen su breakpoint y son grillas simples. Es verificación, no trabajo.

---

## 4. Dos cosas que aplican a todo y es barato hacer bien de entrada

**`vh` en móvil.** El proyecto usa `vh` en todos lados para presupuestar altura contra la
ventana — la franja, los items de galería (`Projects.css:821`), el padding de sección. En
móvil `100vh` incluye la barra de URL, así que el valor cambia al scrollear y el layout
salta. Migrar esos `vh` a `dvh` **adentro de los media queries**, no en las reglas base.

**Hover en pantalla táctil.** Todo el hover del sitio —la tarjeta que se inclina, la tapa
que se agranda, el marco que brilla— se dispara al tocar y se queda pegado. Envolver en
`@media (hover: hover) and (pointer: fine)`. Esto **sí** toca reglas base, y es la
excepción justificada: en escritorio la condición da verdadero y el render no se mueve.
Aun así, verificar con las medidas del punto 0.

---

## 5. Cómo verificar

En este repo hay dos trampas ya conocidas para medir en el navegador, las dos documentadas
en `CLAUDE.md` y ambas encontradas por las malas:

1. Un tab en segundo plano **congela las transiciones CSS** en `currentTime: 0`, así que
   `getComputedStyle` devuelve el valor previo y el contenido expandido mide 0. Llamar
   `el.getAnimations().forEach(a => a.finish())` antes de medir, envuelto en `try/catch`
   porque el carrusel tiene animaciones infinitas y `finish()` las rechaza.
2. En un tab oculto Chrome también **throttlea `setInterval` a ≥1000ms**, suspende la
   decodificación de video y nunca dispara `requestAnimationFrame`. Cualquier medición de
   tiempo o de reproducción ahí es basura, y un `await` sobre rAF cuelga la sesión.

Anchos a probar, alineados con los breakpoints que ya existen: **1920, 1400, 900, 768, 390**.
En cada uno: desborde 0 en las ocho tarjetas, abiertas y cerradas, en los dos idiomas y en
los dos temas. El español es el caso que aprieta —sus textos son más largos que los
ingleses en todas las tarjetas medidas hasta ahora—.

---

## 6. Qué NO entra en este trabajo

- Cambiar tipografías, colores, espaciados o proporciones del escritorio.
- "Aprovechar para" simplificar reglas base. Si sobra algo, va en un commit aparte y con
  las medidas del punto 0 antes y después.
- Rehacer el morph de View Transitions. Si en angosto molesta, se apaga con un media query;
  no se reescribe.
