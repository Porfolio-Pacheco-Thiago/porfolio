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

**Un quinto defecto, encontrado después.** El recuadro de la foto llevaba
`height: 80px` dentro de este mismo bloque de 768, de antes del rediseño. En ancho la
fila mide `--foto` y el recuadro sale cuadrado (105×105); acá la ventana crece porque el
título se parte en más renglones, y el recuadro se quedaba en 80 contra 158 o 230 de
ventana. Quedaba un cuadrado flotando arriba y, debajo, la ventana **sin borde de ese
lado**: el borde compartido lo dibuja la foto, así que donde la foto no llega no hay
borde. Se borra la regla y el alto vuelve a salir del `stretch` del bloque, igual que en
ancho. Las seis filas quedan con foto y ventana del mismo alto y el mismo tope.

Es el mismo patrón que los otros cuatro: el bloque de 768 se escribió para una estructura
que el rediseño cambió, y nunca se volvió a mirar.

### 3.3 Hero — **hecho**

El layout estaba bien: a 390 y a 768 no hay desborde y la columna apilada entra. Los dos
arreglos fueron otra cosa.

**El peso.** Era el punto real y salió como estaba previsto: por debajo de 768px el
`<video>` se reemplaza por el `<img>` del póster, que es el mismo cuadro con su alfa en
39 KB. Medido en el navegador, a 390px no se pide ningún `.webm`: **2,92 MB → 39 KB**.
La decisión se toma una sola vez, al montar, y **no** se escucha el `change` del
`matchMedia`, por dos razones: la pregunta que contesta —"¿este aparato gasta 1,2 MB en
esto?"— no cambia porque se gire el teléfono, y escucharla implicaría cortarle el video a
alguien que apenas achica la ventana. Se probó primero con listener y se sacó: en este
entorno `resize_window` informa éxito y no redimensiona nada —ni siquiera dispara
`resize`—, así que era una rama que no se podía ejercitar. Mejor no tenerla que tenerla
sin probar.

**La flecha caía encima del carrusel de marcas.** `.scroll-indicator` es `absolute`
contra el pie del hero, que en escritorio tiene altura de sobra. Apilado el hero mide lo
que mide su contenido y la flecha se superponía **48px** con `.marcas`, igual a 390 que a
768. Se oculta debajo de 768: el dibujo es un mouse con rueda, que en una pantalla táctil
no dice nada, y su trazo anima sin parar —la misma animación que el componente ya pausa al
salir de vista—.

**No re-encodear los WebM.** Ver la nota de `CLAUDE.md`: llevan alfa por `BlockAdditional`
y ffmpeg lo pierde en silencio. Acá no hizo falta tocarlos: no se recomprime nada, se
elige no pedirlos.

#### Dos cosas que aparecieron y **no** son de este paso

- **El riel de contacto tapa el final del pie.** Debajo de 900px el riel pasa a ser una
  barra fija abajo de 55px, y nada le reserva ese espacio: el contenido del pie termina a
  48px del final del documento, así que la barra le come los últimos 7px. Es de 3.4 y se
  arregla con un `padding-bottom` en `.footer` dentro del media query, no con uno en
  `body` —el pie no tiene fondo propio, solo un borde arriba, y un `body` con relleno
  dejaría una franja rara debajo—.
- **La flecha roza el carrusel también en escritorio**, entre ~1024 y ~1300 con ventanas
  de 900px de alto: las cajas se solapan en una esquina de 32×8px. En 1920×857 —la medida
  de referencia— no pasa, y el ícono está centrado en su caja de 64px, así que es roce de
  bounding box y no algo que se vea. Queda anotado y no se toca: es escritorio.

### 3.4 Habilidades, Navbar, Footer — **hecho**

Dos de los tres eran verificación, como decía el plan. El tercero tenía un agujero real.

**Habilidades.** Limpio en los tres anchos: dos columnas a 900, una a 768 y a 390, cero
desborde del documento, ningún chip saliéndose de su categoría y ninguna `.skills-list`
con desborde propio. No se tocó nada.

**Navbar.** El cajón se abre y entra: panel de 267px pegado al borde derecho, alto
completo, los cuatro links entre 80 y 300, la X y los botones de idioma y tema encima del
panel, y el riel queda tapado detrás —`.navbar` hace contexto de apilamiento con
`z-index: 200` y el riel es 100—. Cero desborde. No se tocó nada.

**Pie.** Acá sí: debajo de 900px el riel deja de ser una columna sobre el borde izquierdo
y pasa a ser una barra fija abajo de 55px. Al ser `fixed` no ocupa lugar en el flujo, y el
final del documento es justamente el único lugar que no se puede scrollear para
descubrirlo: al pie le quedaban 48px de aire y la barra le comía los últimos 7 —el logo de
React de "Hecho con React" entraba 2px debajo—. Se le reserva el alto con
`padding-bottom: calc(3rem + var(--riel-alto))` dentro de un `@media (max-width: 900px)`,
con `--riel-alto: 55px` declarado al lado de `--riel-ancho`, que ya era una constante
medida a mano por el mismo motivo. Queda el relleno de siempre, pero contado desde la
barra en vez de desde el borde: la holgura pasa de 48 a 103px, contra 55 de barra.

El umbral es 900 y no 768 a propósito: el que manda es el del riel, no el del pie.

**Escritorio, otra vez idéntico** a la línea base: hero 1912×872, grilla 1136×695, sección
1200×890, habilidades 1200×660, las ocho tarjetas 363×208/231, y el `padding` del pie
sigue siendo `48px 32px`.

#### Una trampa más para el punto 5

El cajón del navbar **medía cerrado con la clase `open` puesta**: `getComputedStyle`
devolvía `right: -382px` en vez de `0`. Es la trampa nº1 del punto 5 otra vez, pero
disfrazada — no es que el contenido midiera 0, es que devolvía la posición *previa* y
parecía un bug de CSS. Un `getAnimations().forEach(a => a.finish())` sobre el panel lo
destrabó y dio `right: 0`. Ante cualquier medida que parezca "la regla no se aplica",
terminar las animaciones antes de salir a buscar el problema en el CSS.

---

## 4. Dos cosas que aplican a todo — **hecho**

### 4.1 `vh` en móvil — **no se hace, y el plan estaba al revés**

Lo que decía este punto: que `100vh` incluye la barra de URL, que el valor cambia al
scrollear y que había que migrar a `dvh`. Las dos mitades están mal.

`vh` se resuelve contra el viewport **grande** y **no** cambia al scrollear: el que cambia
mientras la barra se retrae es justamente `dvh`. Así que la migración habría *introducido*
el salto que este punto quería sacar, y encima sobre padding y gaps, donde se nota más que
sobre el alto de una sección.

Y donde el problema sí existe —los `100vh` de pantalla completa— **ya estaba resuelto**:
los tres del proyecto (`App.css`, `Hero.css`, `Navbar.css`) son `dvh` desde antes, con la
nota de por qué en `App.css`.

Los 18 `vh` que quedan son todos budgets chicos dentro de un `clamp()` o un `min()` con
tope duro en px o rem: el más grande es `min(58vh, 470px)`. Ninguno se acerca al alto de
la ventana, así que no hay nada que recortar ni que saltar. Se quedan como están.

### 4.2 Hover en pantalla táctil — **hecho**

**47 de 49** reglas `:hover` quedaron dentro de `@media (hover: hover) and (pointer: fine)`.
Se hizo con un transformador que envuelve cada regla **en el lugar**: envolver no cambia ni
la especificidad ni la posición en la cascada, así que en escritorio —donde la condición da
verdadero— el resultado tiene que ser idéntico. Las corridas de reglas `:hover` seguidas
comparten un solo `@media`, y el comentario que documenta la primera se va adentro con ella.

**Cinco reglas no se podían envolver enteras** y se separaron a mano, porque su lista de
selectores era mixta: solo una parte llevaba `:hover` y la otra no tiene nada que ver con
el puntero. Envolverlas habría apagado en táctil cosas que no son hover:

- `.nav-link.active .nav-figure` — el link de la sección en la que estás.
- `…:focus-within .fono-volumen` — el camino por teclado del control de volumen.
- `[data-hover-section=…] #journey .wire` y su gemela de tema claro — las pone el JS del
  navbar, no el puntero.

**Las dos que quedaron sin gatear son a propósito:** `::-webkit-scrollbar-thumb:hover`, que
en táctil no existe, y el `.scroll-indicator:hover` de `prefers-reduced-motion`, que lo
único que hace es devolver el `transform` al valor base — aplicarlo siempre no cambia nada.

#### Cómo se verificó que el escritorio no se movió

Este era el punto que tocaba reglas base, así que en vez de las medidas del punto 0 se hizo
algo más fuerte: una **huella de estilo computado de las 1415 elementos de la página** —
todas las propiedades de cada uno, más su caja— antes y después, a 1920×857.

**Cero diferencias**, y se repitió en tema claro (1407 elementos, también cero) porque una
de las reglas separadas a mano era de `[data-theme="light"]`.

Después, con el mouse de verdad sobre un link del navbar: el color pasa de
`rgb(160,160,160)` a `rgb(0,230,118)`, la figura chica sube a opacidad 1, el `.active`
sigue en 1 sin depender del hover, y el resaltado de sección por `data-hover-section` sigue
encendiendo el `--wire-tint` y el `scale(1.06)` de su figura grande. Las dos mitades de
cada regla separada funcionan.

Una trampa más, la misma de siempre: la primera lectura de la figura dio `0.6` en vez de
`1` y parecía que la separación había roto algo. Era la transición congelada otra vez —
`getAnimations().finish()` sobre **la figura**, no solo sobre el link, y da 1.

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

A eso se le suma una tercera, del paso 3.3: **Chrome no deja la ventana por debajo de
500px de ancho**, así que 390 no se puede probar redimensionando. Lo que sí funciona es
montar un `<iframe>` del mismo origen con `width: 390px`: adentro los media queries y las
unidades de viewport ven 390 de verdad. Dos detalles al usarlo:

- `resize_window` puede informar éxito y no redimensionar nada. Confirmar siempre contra
  `innerWidth` antes de creerle a una medición, y desconfiar de dos mediciones seguidas
  sin recargar: el cambio de tamaño llega tarde y se lee un ancho viejo.
- `<html>` lleva **`scroll-behavior: smooth`**, así que `scrollTo` no salta: anima. Toda
  lectura inmediata después de pedirlo devuelve la posición vieja, y dos pedidos seguidos
  se pisan — parece que el scroll "está clavado" cuando en realidad está viajando. Poner
  `documentElement.style.scrollBehavior = 'auto'` antes de mover, y recién ahí medir.
  (Esto fue lo que se leyó mal como "`overflow: clip` impide scrollear": `<html>` es el
  scroller y sí se mueve.) Tampoco sirve trasladar el `<body>` con un `transform` para
  esquivarlo: el `overflow-x: clip` de `<html>` recorta lo que se salga de la caja
  original.

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
