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
| `cassandra-engine` | 114 |
| `melodia` | 162 |
| `distributed-systems` | 163 |
| `vibetrip` | 188 |
| `monopoly` | 220 |
| `zorro-ocas` | 231 |
| `specforge` | 257 |
| `predictive-models` | 273 |

**Reproduciendo.** Cassandra: monitor 880×500, barra del reproductor 222, **un** párrafo
visible, desborde 0. Melodía: celular 310×612, dos párrafos, desborde 0.

### El protocolo importa tanto como los números

Las dos primeras corridas de esta tabla dieron **+11px** en varias tarjetas, y el alto de
tarjeta salía 706 en vez de 695. Costó dos intentos aislarlo, y no era ruido: es medir una
tarjeta mientras la **anterior todavía se está cerrando**. Durante esa transición la grilla
mide 11px de más, se clava ese alto —`Projects.jsx` fija el alto de la grilla en px al
abrir— y la franja, que toma lo que sobra, se lleva la diferencia entera.

Los 11px no son casualidad: son `--marco: 0.7rem`, el aire que la tarjeta abierta le da al
marco, mientras su transición de `margin` todavía está corriendo sobre la tarjeta que se
cierra.

La moraleja es más incómoda que el número: **una línea base mal tomada es peor que no
tener ninguna**, porque después cada diferencia parece una regresión. Con los valores de
arriba, el paso 2 parecía haber movido tres tarjetas; la única forma de descartarlo fue
`git stash` de los cambios y volver a medir, que dio idéntico. Si una medida no cierra,
ese es el camino corto: stashear y comparar, no razonar sobre la tabla.

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

## 2. El problema estructural: la tarjeta expandida — **hecho**

En ancho la tarjeta abierta es una capa: `position: absolute; inset: 0` sobre la grilla
entera, y `Projects.jsx` le clava a la grilla su alto en px antes de abrir. Así la grilla
no cambia de alto y la página no se mueve bajo el mouse.

En angosto eso se cae: con una tarjeta por fila la grilla son ocho apiladas, y la abierta
heredaría ese alto entero. Por debajo de 900 ahora vuelve al flujo, crece y empuja lo de
abajo, que es lo que se espera en un teléfono.

Tres piezas, y la tercera no es CSS:

1. `position: static` para la abierta.
2. Las otras pasan de `visibility: hidden` a `display: none`. En ancho ocupan su lugar a
   propósito —es lo que sostiene el alto de la grilla—; acá eso dejaría siete huecos.
3. **La guarda en `Projects.jsx`.** Clavar el alto de la grilla no solo sobra en angosto:
   es dañino, porque lo que clavaría es el alto de las ocho apiladas. El umbral está
   repetido en el CSS y en el JS; si se mueve, se mueven los dos.

Y sin techo que repartir, la franja deja de estirarse y toma un alto propio proporcional
al ancho (`clamp(120px, 38vw, 260px)`), que es lo que tiene sentido para una banda
apaisada en una pantalla angosta.

### Lo que se corrigió del plan original

- **No existe `expandedIsRight` ni intercambio de `order`.** `CLAUDE.md` lo describe, pero
  es de una implementación anterior. Lo que hay es el alto clavado. La nota de `CLAUDE.md`
  quedó vieja y conviene arreglarla cuando se toque ese archivo.
- El morph de View Transitions no necesitó nada: sigue funcionando con la tarjeta en el
  flujo.

### Cómo se verificó sin poder achicar la ventana

`resize_window` no tiene efecto sobre esta ventana, así que el truco fue **subir los dos
umbrales a 2000px temporalmente** —el del CSS y el del JS—, mirar el resultado a 1920, y
devolverlos. Con eso se comprobó lo que importa: `position: static`, grilla sin clavar,
hermanas en `display: none`, la sección creciendo de 890 a 1035 y desborde 0.

Es la forma más barata de ver el layout angosto en esta máquina, y sirve para el resto de
los pasos.

---

## 3. Orden del resto, de más riesgoso a menos

La idea es atacar primero lo que puede obligar a repensar algo, y dejar para el final lo
que es puro acomodo.

### 3.1 El aparato (monitor y celular) — **hecho**

Resultó bastante menos caro de lo previsto, porque **el estado en reposo ya era fluido**:
`.fono` se mide con `min(215px, 62%, 27vh)` y `.fono.es-monitor` con
`min(485px, 90%, 58vh)`. Los porcentajes y los `vh` ya se acomodan solos.

Lo que no se acomodaba era el **acomodo de reproducción**, que cuelga de
`--monitor-video: 880px` — un ancho en px que no entra en ninguna pantalla angosta, ni él
ni la columna que lo aloja. Por debajo de 900 pasa a `100%` y la grilla a una sola columna.

Deshacer las ubicaciones explícitas fue todo lo que hizo falta: el orden del DOM **ya era
el correcto** —aparato, botonera, barra, descripción— porque los controles van con
`display: contents` y se disuelven en la grilla. Sin anularlas se superponían en la única
columna que queda.

Y Cassandra recupera su segundo párrafo: se escondía porque la tarjeta abierta no podía
crecer, y acá crece.

**No hizo falta tocar el giro 3D.** Reproduciendo, el aparato ya está derecho por
`.project-card.is-reproduciendo .fono.is-demo { transform: none }`, así que el `scale(1.1)`
—que sobre un monitor al 100% se saldría un 10% por los costados— no llega a aplicarse.
Queda pendiente la decisión de apagarlo **en reposo** por el tema térmico que documenta
`CLAUDE.md`; es una decisión de gusto, no algo roto, así que no la tomé.

**Una inconsistencia que queda anotada:** el aparato se apila en dos umbrales distintos
según cuál sea. El monitor a 900, con estas reglas; el celular a 768, con el
`.fono-bloque { grid-template-columns: 1fr }` que ya existía. Entre 769 y 900 el celular
sigue en dos columnas, y entra —se midió—, pero son dos números para la misma idea.
Unificarlos entra en la revisión de la escala de breakpoints.

### 3.2 Trayectoria — **hecho**

El plan decía que era "la parte más resuelta del sitio" y que solo faltaba verificar. Era
al revés: el bloque de 768 existía pero **no funcionaba**. Se escribió en el mismo commit
que el rediseño y quedó apuntando a una estructura que ese mismo commit cambió.

Cuatro cosas, en orden de gravedad:

1. **La tarjeta medía 21px de ancho útil.** El bloque fijaba `left: 20px` sobre la línea
   visual, pero quien posiciona todo es la variable `--eje-x`, que seguía en 50%. Los
   bloques se medían contra un eje que ya no estaba ahí. Ahora se mueve la variable, que
   es el mecanismo que el propio diseño tiene para esto: su comentario dice que al
   moverla *"todo lo demás la sigue solo"*.
2. **Las filas se pisaban.** El alto del ítem sale de `--foto`, que en ancho es el alto de
   la foto y de la fila a la vez. En una columna angosta el título se parte en más
   renglones y pedía 155px contra los 105 fijos. Acá el alto lo pone el contenido, y para
   eso el bloque vuelve al flujo.
3. **El expandido se recortaba**, 1227px de contenido en 747 de caja. Mismo techo que en
   Proyectos y por el mismo motivo: en ancho la tarjeta abierta se acota a lo que hay
   hasta el pie del timeline para que la sección entre en pantalla. Acá se scrollea igual.
4. **Los tags se salían** hasta 342px: `.nested-tags` va con `flex-wrap: nowrap`.

**Dos lecciones de método, las dos aprendidas por las malas:**

- **Medir contra el contenedor, no contra el documento.** El desborde de los tags no
  aparecía en `scrollWidth > clientWidth`: la simulación acota el timeline a 390px pero la
  ventana sigue en 1920, así que hay lugar de sobra fuera de la tarjeta y la página no
  acusa nada. Contra la tarjeta salta enseguida.
- **Devolver el umbral antes de mirar otra cosa.** Dejé el 2000px puesto y el escritorio
  quedó con el layout de teléfono hasta que el usuario lo vio. El truco es útil pero es
  una granada sin seguro: restaurarlo va en el mismo paso que ponerlo, no al final.

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
