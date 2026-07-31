# Plan de rediseño

Documento de trabajo derivado de `links.md`. Traduce cada referencia a cambios
concretos sobre el código que ya existe, marca los conflictos entre ideas y
lista lo que falta para poder empezar.

**Convención de estado:** ✅ hecho · 🟡 empezado o parcial · 🔲 por hacer ·
🔴 bloqueado por un insumo.

---

## 0. Estado de un vistazo

| Fase | Qué | Estado |
|---|---|---|
| 0 | Insumos (logo SVG, CV, capturas, foto) | 🟡 llegaron los medios de Melodía; falta el resto |
| 1 | Fondo: el sol verde | ✅ salvo la iluminación direccional de las figuras |
| 2 | Pantalla de carga | 🔴 bloqueada por el logo en SVG |
| 3 | Figuras: entrada e interacción | ✅ completa |
| 4 | Hero: marco, flecha, letras diagonales | 🔲 sin empezar |
| 5 | Proyectos al estilo larson | ✅ terminada: ventana, tipografía, celular y encuadres |
| 5-bis | Barra lateral de contacto | ✅ completa y ampliada |
| 5-ter | Medios: galerías conectadas | ✅ nueva, no estaba en el plan |
| — | Auditorías con skills (rendimiento y a11y) | ✅ nueva, ver 2.9 |
| 6.1 | Figuras que forman el logo | 🔲 a decidir aparte (pregunta 8) |
| 6.2 | "As featured in" | 🔴 sin contenido (pregunta 6) |
| 6.3 | Celular 3D con las demos | ✅ hecho |

Lo hecho hasta acá se apoya en dos decisiones que **se desviaron del plan
original** y quedaron registradas más abajo: el sol en tema claro pasó a ser luz
blanca (no el mismo verde atenuado), y el tema claro entero se invirtió a verde
principal con blanco secundario.

**Novedad grande (29/07/2026):** llegaron los medios de Melodía y con eso se
destrabaron dos cosas que estaban 🔴 por falta de insumos: la Fase 5 y el celular
3D de la Fase 6.3. Ver 2.8.

**Al 30/07/2026 la Fase 5 quedó cerrada**, con la Fase 6.3 —el celular— adentro,
y se auditó todo lo construido con dos skills del proyecto (ver 2.9). Lo que sigue
es el Hero.

---

## 1. De dónde partimos

Lo que hoy toca cada una de estas ideas:

| Pieza actual | Archivo | Qué hace |
|---|---|---|
| Pantalla de carga | `components/Loader.jsx` | Logo PNG con pulso + barra deslizante |
| Hero | `components/Hero.jsx` | Dos columnas: texto a la izquierda, video con alfa a la derecha |
| Rol animado | `components/ui/AnimatedText.jsx` | Aparición letra por letra, CSS puro |
| Fondo | `index.css` → `body::before` | ✅ El sol: tres radiales + viñeta en `body::after` |
| Figuras de alambre | `components/ui/WireFigure.jsx` | Pirámide, cubo, tetraedro y esfera; una por sección + una por link del navbar |
| Timeline | `components/Journey.jsx` | Doble eje, modo compacto + expandible |
| Proyectos | `components/Projects.jsx` | Grilla, modo compacto + expandible |
| Flecha de scroll | `Hero.css` → `.scroll-indicator` | Línea vertical animada — sigue siendo línea, no flecha |
| Riel de contacto | `components/SideBar.jsx` | ✅ Borde izquierdo, desplegable, con foto |
| Cursor propio | `components/ui/Cursor.jsx` | ✅ Círculo que reemplaza al puntero |
| Galerías | `lib/media.js` + `ui/Gallery.jsx` | ✅ Indexan `assets/media/` con `import.meta.glob`; imagen o video según extensión |

Reglas vigentes que el rediseño tiene que respetar o revocar explícitamente:

- **Una sección por pantalla.** Sigue vigente. Varias de estas referencias
  presentan contenido mucho más alto.
- **Presupuesto de rendimiento.** Ya tuvimos un problema térmico real. Las
  figuras grandes rotan en 2D sobre una capa ya rasterizada justamente por eso.
  Varias de estas ideas se implementan normalmente con canvas o WebGL, que
  redibujan cada frame.
- **Accesibilidad.** Contraste AA, foco visible, `prefers-reduced-motion`.

---

## 2. Qué implica cada referencia

### 2.1 david — el logo se dibuja solo al cargar 🔴

**Qué se ve:** el logo se traza como si lo dibujaran, en vez de aparecer.

**Cómo se hace:** el trazo se anima con `stroke-dasharray` y `stroke-dashoffset`
sobre un `<path>`. Es barato: anima una sola propiedad sobre un SVG.

**🔴 Bloqueo:** el logo hoy es **PNG**, un mapa de píxeles. No tiene trazos que
animar. Hace falta la versión vectorial (`.svg`) del monograma TP.

**Toca:** `Loader.jsx`, `Loader.css`, `assets/`.

---

### 2.2 dunks — el texto se forma con las letras animándose

**Qué se ve:** un "welcome" cuyas letras entran de forma dinámica.

**Estado:** **ya lo teníamos de antes.** `AnimatedText` hace exactamente eso y lo
usa el rol del hero. Es CSS puro, sin dependencias.

**🔲 Qué faltaría:** aplicarlo también en la pantalla de carga y/o al nombre del
hero, y quizá enriquecer la entrada (hoy es subir + aparecer; se le puede sumar
desenfoque o rotación por letra).

**Toca:** `AnimatedText.jsx`, `Loader.jsx`, `Hero.jsx`.

**Nota:** esto y el punto anterior comparten pantalla. Hay que decidir si la
carga muestra **logo dibujándose**, **texto formándose**, o los dos en secuencia.

---

### 2.3 tamalsen — sol verde que ilumina, y fuera las manchas ✅ (parcial)

**Qué se ve:** una fuente de luz detrás que ilumina la escena, incluidos los
objetos y el suelo.

**✅ Hecho:** las seis manchas se fueron. `body::before` es ahora el sol en tres
capas —núcleo, halo y piso— y `body::after` una viñeta que cierra los bordes.
Los tres tonos salen de `--sol-nucleo` / `--sol-halo` / `--sol-piso`, definidos
por tema.

**🔲 Falta:** la parte de "que ilumine los objetos". Las figuras de alambre se
pintan con un tinte **uniforme** (`--wire-tint`), no con una caída de luz. Se
intentó y se sacó: ver la Fase 1.3.

**Además de la referencia:**
- ✅ *Flecha animada hacia abajo* → **hecha.** Ver Fase 4.
- 🔴 *"As featured in"* → **no tenemos ese contenido.** Pregunta 6.
- ✅ *Celular 3D girando con Melodía en pantalla* → **hecho.** Ver Fase 6.3.

**Toca:** `index.css` ✅, `ui.css` (tinte de las figuras) 🔲, `Hero.css` ✅.

---

### 2.4 charles — figuras que entran, reaccionan y forman el logo ✅ (3 de 4)

Es la referencia más ambiciosa. Son cuatro comportamientos distintos:

1. **✅ Entrada desde afuera hacia el centro al cargar.** Las figuras entran
   desde fuera de la pantalla una sola vez, con transiciones de 2.4s y 3s y
   0.35s de retardo: si entran rápido, para cuando termina de cargar ya están
   colocadas y el movimiento se pierde.
2. **✅ Reacción al pasar el mouse.** Escala y tinte más intenso. Las chicas
   crecen más que las grandes, porque con el mismo porcentaje no se notaría.
3. **🔲 Al pasar el mouse por ciertas palabras, las figuras forman el logo.**
   Sigue siendo el punto caro: implica que las figuras dejen de ser decoración
   por sección y pasen a ser un sistema único reorganizable. Ver Fase 6 y
   pregunta 8.
4. **✅ Resaltar la figura de la sección al tocar su link en el navbar.**
   Terminado y ampliado: al pasar el mouse por un link reaccionan **las tres**
   instancias de esa figura — la chiquita del navbar, la grande de la sección y
   la del hero. Va por `data-hover-section` en el `<html>`, no por sección
   activa: atarlo a la sección activa hacía que la figura creciera de forma
   permanente al llegar ahí, que no era la idea.

**Toca:** `WireFigure.jsx` ✅, `Navbar.jsx` ✅, `ui.css` ✅.

---

### 2.5 vanho — letras en diagonal que se enderezan al pasar el mouse 🔲

**Qué se ve:** texto inclinado en perspectiva hacia el fondo; al pasar el mouse
se pone más paralelo a la pantalla y cambia de color.

**Cómo se hace:** `rotateX`/`rotateY` con `perspective`, y una transición al
hacer hover. Barato.

**🟡 Sin empezar: falta decidir dónde va.** Opciones que veo:
- Los títulos de sección (hoy con degradado).
- Los nombres de los proyectos.
- El nombre del hero.
- Los links del navbar.

**Ojo con el rendimiento:** `perspective` con `preserve-3d` re-rasteriza cada
hijo por frame. Fue la causa del problema térmico de las figuras. Sobre unas
pocas palabras no es lo mismo que sobre una figura de 800px, pero conviene
medirlo, no asumirlo.

**Toca:** depende de la respuesta (pregunta 5).

---

### 2.6 larson — hero enmarcado y proyectos con foto ✅ / 🟡

**Hero:** el nombre dentro de un recuadro, con su tipografía y color, adaptado a
nuestros tonos. Sin los stickers. **Hecho** (Fase 4).

**Conflicto ya resuelto:** el video se queda a la derecha y el marco envuelve
solo el nombre y el rol, en la columna izquierda. Conviven.

**Proyectos:** un recuadro con la foto, la tipografía del nombre, y un recuadro
más chico abajo a la izquierda de cada proyecto.

**🟡 Desbloqueado para Melodía.** Su tarjeta ya usa el mockup como tapa en lugar
del ícono genérico. Los otros seis siguen con ícono hasta que tengan medios, así
que la tarjeta nueva tiene que verse bien **en los dos estados** — con foto y sin
foto— y no puede asumir que siempre hay imagen.

**Conflicto ya resuelto:** manda la regla de una sección por pantalla; tarjetas
chicas que crecen al abrirse.

**El recuadro chico, resuelto:** en la referencia está **vacío** — es puro
ornamento, no lleva nada adentro. Mirándola de cerca se ve además que la diagonal
es de él y no del marco.

**Toca:** `Hero.jsx`, `Hero.css`, `Projects.jsx`, `Projects.css`.

---

### 2.7 Barra lateral de contacto ✅ (idea propia, no viene de las referencias)

**✅ Construida** en `components/SideBar.jsx`, y terminó siendo bastante más que
un riel de íconos.

Lo que quedó:

| Qué | Cómo |
|---|---|
| Posición | Fija sobre el borde izquierdo, centrada vertical. 55px plegada |
| Contenido | Foto de perfil circular, GitHub, LinkedIn, correo, CV, y el botón de abrir/cerrar al final |
| Despliegue | Crece a la derecha hasta 121px y aparece el nombre de cada enlace |
| Cómo se abre | Su propio botón, el "Contactame" del hero y el del pie — los tres alternan |
| Móvil | Se acuesta como barra horizontal abajo, sin desplegar |

**El choque con las figuras se resolvió por la salida 2:** riel angosto y
figuras corridas hacia afuera. `--riel-ancho` declara la franja reservada del
margen izquierdo y las figuras se posicionan en función de ella (`.wire-decor.at-left`,
`.fig-a`, `.fig-b`). Desplegado el riel se monta sobre el cubo de Trayectoria,
que queda detrás del panel borroso; es un estado transitorio que abre el usuario.

**Duplicación resuelta (pregunta 10):** el riel **reemplaza** a los otros dos.
Se borró `ui/SocialLinks.jsx` y los enlaces salieron del hero y del pie. Hoy
`socialsActivos` se consume en un solo lugar.

**Detalles técnicos que conviene no perder:**
- Lo que se despliega usa `grid-template-columns/rows` de `0fr` a `1fr`, que sí
  interpola —a diferencia de `width/height: auto`— y no obliga a inventar
  medidas fijas. El hueco de la foto colapsa en los **dos** ejes: `overflow:
  hidden` recorta pero no achica la contribución de ancho, y si no, plegado, los
  84px del círculo estirarían el riel.
- El estado vive en `App.jsx`, no en `SideBar`, porque lo abren tres botones.
- Si lo abre un botón lejano, el foco salta al primer enlace del riel; si lo
  abre su propio botón, no se toca.
- En móvil **no puede ocultarse**: al haber sacado los enlaces del hero y del
  pie, sería quedarse sin forma de contacto.

**🔴 Insumos que le faltan:**
- **El CV.** `socials.js` ya tiene la entrada, con `href: null`, así que
  simplemente no se dibuja hasta que exista el PDF (pregunta 11).
- **La foto de perfil.** `data/perfil.js` tiene `foto: null` y mientras tanto se
  dibuja un marcador con un ícono de persona.

**Toca:** `SideBar.jsx` ✅, `ui/ContactButton.jsx` ✅, `App.jsx` ✅,
`data/socials.js` ✅, `data/perfil.js` ✅, `ui.css` ✅.

---

### 2.8 Medios y galerías ✅ (nueva, tampoco viene de las referencias)

Era el insumo que trababa la Fase 5 y la 6.3. Llegaron los de Melodía y se armó
la plomería para todos.

**Lo que se construyó:**

| Qué | Dónde |
|---|---|
| Índice de `assets/media/` | `lib/media.js` — un `import.meta.glob` eager, agrupado por carpeta |
| Galería | `ui/Gallery.jsx` — imagen o video según extensión; cae en el marcador si la carpeta está vacía |
| Tapa de tarjeta | `getMedia`/`getCover` — la primera **imagen** de la carpeta reemplaza al ícono |

Conectada en los tres lugares que tenían marcador: `Projects.jsx`,
`journey/TimelineItem.jsx` y `journey/NestedClients.jsx`. De **14 galerías, 1
tiene contenido y 13 siguen con el marcador**, así que se puede llenar carpeta
por carpeta sin romper nada.

**Decisión de peso: los videos van en el repo, no en YouTube.** Se evaluó
embeberlos desde YouTube y perdió en todo una vez comprimidos: un iframe trae su
propio cromo, branding y ~1 MB de JS de terceros, el cursor propio no funciona
adentro, y suma cookies de terceros. Lo que hacía atractivo a YouTube era el
peso, y el peso dejó de ser un problema:

| | Original | Ahora |
|---|---|---|
| `complete-app.mp4` (90 s) | 153 MB | 3.8 MB |
| `cover-ai.mp4` (64 s) | 41 MB | 1.6 MB |
| `shazam.mp4` (18 s) | 12 MB | 446 KB |
| `mockup-melodia` | 1.6 MB PNG | 109 KB WebP |
| **Total** | **207 MB** | **5.9 MB** |

**Detalles técnicos que conviene no perder:**
- **GitHub rechaza archivos de más de 100 MB.** `complete-app.mp4` en crudo no
  entraba en el repo aunque se quisiera. Los screencasts venían a 13 Mbps, ~10×
  lo que necesitan; comprimen muchísimo sin diferencia visible.
- Los originales **no se commitearon**: viven en `~/Escritorio/melodia-originales/`.
  Commiteados serían parte del historial para siempre.
- Se recortó el pillarbox (64–90px de negro por lado) con un `crop=960:1920:60:0`
  uniforme, menor que el mínimo detectado para no tocar contenido. Los posters se
  regeneran **desde el video ya recortado**, para que al darle play no salte el
  cuadro.
- `preload="none"` + `poster`: el costo inicial de la página son los ~76 KB de
  posters y **0 bytes de video**. Verificado: nada de `.mp4` aparece en
  `performance.getEntriesByType('resource')` hasta que se le da play.
- Convención de portadas: `<video>-poster.webp` no se dibuja como elemento de la
  galería, es el `poster` del video homónimo.
- El audio se conservó (AAC 96k) porque **Melodía es un producto de audio**: el
  Shazam por tarareo y el Cover IA se demuestran escuchándolos. Cuesta ~1 MB en
  total.
- `getCover` prioriza **imágenes** sobre portadas de video: en modo compacto la
  franja de la tapa mide ~66px y una captura vertical recortada a esa altura
  queda en una tirita ilegible. Un mockup apaisado entra entero.
- `logomelodia.png` salió de la carpeta (60×60 estirado a 367×275 se veía
  borroso). Quedó en `src/assets/logomelodia.png` por si sirve como ícono.

**✅ El borde áspero se cerró:** los videos verticales ya no van en el hueco 4/3.
Se mudaron al celular de la Fase 6.3, cuya pantalla tiene la proporción exacta del
video. La galería quedó solo para imágenes, y `Gallery` acepta una lista `medios`
ya filtrada para eso. El soporte de video sigue en `Gallery` porque las galerías
del timeline pueden necesitarlo.

**Toca:** `lib/media.js` ✅, `ui/Gallery.jsx` ✅, `Projects.jsx` ✅,
`journey/TimelineItem.jsx` ✅, `journey/NestedClients.jsx` ✅, `ui.css` ✅,
`Projects.css` ✅, `i18n/*.json` ✅ (claves `media.imageOf` / `media.videoOf`).

---

### 2.9 Auditorías con skills ✅ (nueva)

Antes de propagar el lenguaje visual al Hero se auditó lo construido con dos
skills del proyecto. Vale registrar qué salió, porque son cosas que no se ven
mirando la pantalla.

**`redesign-skill` — auditoría de diseño.** Lo que arregló:

- **El celular giraba para siempre con la tarjeta cerrada.** El bloque expandible
  queda en el DOM con alto 0, así que la animación 3D seguía corriendo en la GPU
  sobre algo invisible — el mismo patrón que costó el problema térmico. Ahora se
  pausa con `animation-play-state`.
- **`100vh` → `100dvh`** en `App.css`, `Hero.css` y el menú móvil. En Safari de iOS
  `100vh` incluye la barra de direcciones que después se retrae: la sección salta
  al scrollear, y con la regla de una sección por pantalla se nota el doble.
- **Sin respuesta al apretar.** `Projects.css` no tenía un solo `:active`.
- **Sombras teñidas.** Se agregó `--sombra-rgb` —los canales sueltos, para que
  cada sombra elija su opacidad— y se barrieron las 7 del proyecto. El negro puro
  sobre un fondo con tinte se lee como un agujero gris.
- **Escala de capas.** `--z-fondo/riel/navbar/loader/cursor` reemplazaron al
  `9999`, `5000`, `2000` y `1500`. Quedaron fuera a propósito los `z-index` de 0 a
  3 —ordenamiento local dentro de una sección— y el de la capa de View
  Transitions, que es otro contexto de apilado.
- `text-wrap: balance` en los nombres de proyecto.

**`components-build` — API y accesibilidad de los componentes nuevos:**

- **Los sliders anunciaban números sin sentido.** Sin `aria-valuetext`, un lector
  de pantalla leía la aguja como *"38, de 0 a 63,8"* y el volumen como *"0,65"*.
  Ahora dicen "0:00 de 1:03" y "100 %". Era el hallazgo más concreto: los
  controles existían pero eran inservibles sin vista.
- **Áreas de toque por debajo de 44px** en los controles del reproductor,
  agrandadas con un pseudo-elemento sin cambiar el tamaño visual.
- **Las galerías eran sopa de `div`** — pasaron a `ul`/`li`.
- El grupo de controles se llamaba "Melodía" en vez de describir qué controla.

**Lo que la skill pedía y no se aplicó, con motivo:** el patrón
controlado/no-controlado con `useControllableState` de Radix —agregaría una
dependencia para un componente con un solo consumidor— y `data-state` en vez de
clases `is-*`, que rompería una convención que el proyecto ya tiene por escrito.

---

## 3. Conflictos entre referencias

| Conflicto | Entre | Resolución |
|---|---|---|
| Qué hay detrás de todo | tamalsen (sol) vs. actual (manchas) | ✅ El sol reemplazó las manchas |
| Qué protagoniza el hero | larson (nombre enmarcado) vs. actual (video con alfa) | ✅ Conviven: video a la derecha, marco a la izquierda |
| Qué pasa al cargar | david (logo se dibuja) vs. dunks (letras se forman) | 🔲 Sin decidir |
| Rol de las figuras | charles (sistema único interactivo) vs. actual (decoración por sección) | 🔲 Sin decidir (pregunta 8) |
| Alto de las secciones | larson/tamalsen (contenido alto) vs. regla de una pantalla | ✅ Manda la regla de una pantalla |
| Quién ocupa el margen izquierdo | barra de contacto vs. figuras del hero y de Trayectoria | ✅ Riel angosto, figuras corridas |

---

## 4. Plan por pasos

Ordenado por dependencias y por relación entre esfuerzo y resultado visible.
Cada fase deja el sitio funcionando.

### Fase 0 — Insumos (te toca a vos) 🟡

1. 🔴 **Logo en SVG.** Para que se dibuje solo. Quedó que lo vectorizo yo desde
   el PNG, así que técnicamente no depende de vos — pero sigue sin hacerse.
2. 🔴 **CV en PDF** en `public/`, para el riel de contacto.
3. 🟡 **Capturas de proyectos** en `src/assets/media/projects/<id>/`. **Melodía
   llegó** (3 videos + mockup); faltan los otros **6 de 7**. Ver 2.8.
4. 🔴 **Foto de perfil** para el riel. *(Nuevo: no estaba en el plan original.)*
5. 🔲 **Definir el contenido de "as featured in"**, si va.
6. 🟡 URLs reales de repos y redes. **Melodía ya apunta** a
   `https://github.com/Melodia-ID2`; los otros **6 siguen en `'#'`**, y
   `socials.js` sigue con `https://github.com/` y `thiago@example.com`.

### Fase 1 — Fondo: el sol verde ✅ (3 de 4)

1. ✅ Reemplazar los seis degradados de `body::before` por un sol.
2. ✅ Definir su comportamiento en tema claro. **Se desvió de lo decidido:** ver
   4-bis.
3. 🔲 **Iluminar las figuras de alambre.** El sol alumbra solo el fondo: las
   figuras se pintan con un tinte **uniforme** (`--wire-tint`), o sea objetos sin
   dirección de luz sobre una escena que sí la tiene.

   **Se intentó y se sacó por completo.** La implementación fue una máscara de
   degradado sobre `.wire` —la capa que no rota, para que la luz se quedara quieta
   en pantalla mientras el objeto gira—, con la caída invertida según el tema
   porque en oscuro el trazo es más claro que la página y en claro más oscuro. Se
   revirtió por decisión tuya, con el `--wire-tint` de vuelta en 22%/16% y 62%/46%.

   Si alguna vez se retoma, lo que costó descubrir y conviene no volver a pagar:
   las figuras son 3D y al girar sus caras se proyectan **fuera** del box de
   `.wire`. Una máscara las recorta, y el culpable **no** es `mask-repeat` sino
   **`mask-clip`**, que por defecto es `border-box` y recorta lo pintado a la caja.
   Hacen falta `mask-clip: no-clip` (sin prefijo: `-webkit-mask-clip` no lo
   acepta), `mask-repeat: no-repeat` y un `mask-size` holgado —al 200% sobra, el
   peor ángulo desborda un 5.3% del lado—.

4. ✅ Verificar que no se reintroduce costo de repintado.

**Además, no estaba en el plan y se hizo:** el tema claro se invirtió entero a
verde principal + blanco secundario, las tarjetas pasaron a verde oscuro con los
tokens de texto invertidos adentro, y los botones principales y los del navbar
adoptaron ese mismo verde.

### Fase 2 — Pantalla de carga ✅

**El bloqueo se levantó: el logo ya está vectorizado.** No había vector de origen
—solo dos PNG de 256px, uno por tema—, así que se trazó **desde el PNG**.

Se trazó por **línea media** y no por contorno, que es la diferencia que decide si
esto sirve o no: el logo son trazos de ancho parejo, y un contorno rodearía cada
trazo — al animarlo con `stroke-dashoffset` se vería dibujar el **borde** del trazo
en vez del trazo. El proceso: binarizar → adelgazar (Zhang-Suen) → armar el grafo
del esqueleto → podar barbas y fusionar los racimos de bifurcación que deja cada
nodo redondo (de 712 aristas crudas a 47) → encadenar por los nodos de grado 2 (27
trazos) → simplificar con Ramer-Douglas-Peucker → suavizar a bézier respetando las
esquinas.

**Verificado contra el PNG rasterizando los dos y comparando píxeles: 0.94 de IoU,
cubriendo el 96.9% del original.** Los parámetros salieron de barrer y medir, no de
mirar: trazo 7.2, nodos r=7.4. El hallazgo que más movió la aguja fue un **medio
píxel**: el esqueleto son índices de píxel y el centro real del trazo cae en el
centro del píxel; sin corregirlo el IoU se quedaba en 0.85.

`Logo.jsx` pasó de dos `<img>` a un SVG en línea con `currentColor`, así que el
color sale de un token (`--logo`) en vez de dos archivos, y escala sin pixelarse
—en el pie se dibuja a 64px y en pantalla 2x el PNG se veía blando—. Exporta
`TRAZOS` y `NODOS` para que la animación pueda escalonarlos. Los trazos vienen
**ordenados de arriba-izquierda a abajo-derecha**, para que el escalonado se lea
como un trazo que avanza y no como parpadeos sueltos.

Los PNG originales quedan en `src/assets/` como arte de origen; ya no los importa
nadie, así que no entran al bundle.

**La animación ya está.** El logo se dibuja solo al cargar, como en la referencia
de david, y el latido genérico que había antes se fue.

Los tiempos no son a ojo: salen de dos variables que `Logo.jsx` pone en cada
elemento. `--i` es el lugar en el orden de dibujo —y los trazos están ordenados de
arriba-izquierda a abajo-derecha—, así que el escalonado hace avanzar la mano por
el dibujo en vez de encenderlo a saltos. `--k` es cuánto tiene que durar cada trazo
relativo al más largo: a velocidad de pluma constante el trazo más largo tardaría
**40 veces** más que el más corto (312 contra 8 unidades), así que el factor va
elevado a 0.6, que comprime eso a unas 9 veces. Sin eso, o los cortos se arrastran
o los largos pasan volando.

Los nodos redondos caen 260ms detrás de la pluma, sobre un trazo que ya pasó por
ahí. Llevan `transform-box: fill-box` porque si no el `scale` de cada círculo
giraría sobre el origen del SVG y no sobre su propio centro.

**No hay barra de carga debajo:** se sacó por pedido tuyo, así que la pantalla es
el logo dibujándose y nada más.

El dibujado dura **1.0s** —medido, no estimado: es el máximo de `delay + duration`
sobre los 27 trazos—, y `App.jsx` sostiene el loader ese tiempo mínimo (1150ms). Eso
obligó a cambiar cómo se contaba: antes era un retardo fijo de 500ms **después** de
`load`, y con una carga rápida la animación se cortaba por la mitad. Ahora el mínimo
se cuenta **desde que monta** el loader.

Los cuatro tiempos —escalón entre trazos, base y tramo variable de la duración, y el
desfase de los nodos— se escalan juntos cuando se cambia el total, así la proporción
entre trazo corto y largo no se deforma.

La pantalla es **el logo grande y nada más**: sin barra de carga, con el logo a
`clamp(220px, 34vw, 420px)`.

**La misma animación la usa el logo del navbar**, y arranca junto con el resto del
sitio cuando la carga termina. No hizo falta una prop ni un temporizador: la
coreografía es un modificador (`.logo-dibuja`) que vive en `Logo.css` —los tiempos
dependen del orden de los trazos y de `--k`, o sea que son parte del logo, no del
loader—, y **cuándo arranca lo decide dónde está**. El del loader está adentro de
`.loader`, lo único que la regla global no pausa, así que corre durante la carga; el
del navbar está afuera, así que queda congelado en su primer cuadro hasta que la
marca se va.

Un detalle que vale por sí solo: el estado "sin dibujar" vive **dentro del
`@keyframes`**, no en la regla base. Si estuviera en la base y la animación no
llegara a correr —una pestaña abierta en segundo plano, un navegador con las
animaciones apagadas— el logo se quedaría **invisible**. Con el `from` adentro, lo
que se ve por defecto es el logo entero, y de paso el bloque de
`prefers-reduced-motion` se reduce a sacar la animación.

### El gesto se extiende al navbar y al hero

**El logo del navbar lleva la misma animación**, cuatro veces más lenta
(`--logo-vel: 4`, ~4s): ahí no compite con nada —la pantalla ya está poblada— y al
ritmo del loader pasaba desapercibida. El multiplicador está en el modificador, así
que cada lugar donde se use el logo elige su velocidad sin duplicar los tiempos.

**El marco del hero, el nombre y el rol se dibujan encadenados** —marco → nombre →
rol, **2.0s exactos** medidos sobre la línea de tiempo real—, arrancando cuando cae la marca de carga como todo lo demás.
Cada uno con su gesto:

- **El marco crece desde la esquina superior izquierda**, hacia la derecha y hacia
  abajo a la vez: los dos lados del `inset` se abren juntos.
- **El nombre se traza de verdad**, como el logo: cada letra dibuja su propio
  contorno con `stroke-dashoffset`, las 13 **en paralelo**, y el relleno entra
  después —si entrara junto taparía el dibujo—. Vive en `ui/NombreTrazado.jsx`.
- **El rol aparece letra por letra**, con el mismo recorte pero en `steps()`, así
  avanza a saltos del ancho de un caracter. La cantidad de caracteres la pone el
  JSX en `--letras-rol`, no el CSS, para que siga al idioma.

**Cómo se trazó el nombre.** El texto de HTML no tiene contorno que recorrer, así
que las letras salen de la propia Chakra Petch 700: se baja el `.ttf` de Google, se
extraen los contornos de las 13 letras con fontTools y se colocan con los mismos
avances e interletrado (0.03em) que usaba el `<h1>`. O sea que es tipográficamente
el mismo texto, no un dibujo parecido.

Dos cosas que costaron y conviene no volver a pagar:

- **Van en dos capas: todos los contornos y después todos los rellenos.** Con una
  sola capa —cada letra con su contorno y su relleno— el contorno de cada letra
  tapa el relleno de la anterior y el nombre se ve apelmazado. En HTML esto salía
  gratis porque el contorno era una capa `::before` entera por detrás del texto.
- **El grosor del contorno pasó a unidades del `viewBox`** (`--borde-nombre-svg`,
  170 en oscuro y 220 en claro): 1000 unidades por em, o sea el equivalente de los
  0.17em/0.22em que usaba el texto.

**Un efecto colateral que hubo que arreglar:** `.hero-ventana` era `width:
fit-content` y daba los 600px de la columna **por accidente** — el `max-content` del
nombre, las dos palabras en una línea, pasaba ese ancho y quedaba recortado ahí. Al
pasar el nombre a SVG ese `max-content` se volvió el ancho del dibujo, mucho menor,
y la ventana se achicó sola. Ahora es `width: 100%`: el ancho es el de la columna y
no depende de cómo esté hecho el nombre por dentro.

**Lo que se perdió al salir de HTML**, anotado para que no sorprenda:

- El salto de línea es fijo (THIAGO / PACHECO). SVG no acomoda texto solo.
- El nombre está horneado en los `path`. Si cambia hay que volver a generarlo — hoy
  es el mismo en los dos idiomas, así que no hay ramas.
- El peso es uno solo (700). El tema claro usaba 600 para afinar el relleno; ahora
  esa diferencia la da el grosor del contorno, que sí cambia con el tema.
- El texto de verdad quedó en el `<h1>` como `visually-hidden`, y el SVG va
  `aria-hidden`: el encabezado sigue siendo un encabezado con su texto.

Dos cosas que se ajustaron midiendo:

- **La curva.** Con la `ease-out` marcada que usa el resto del sitio para entradas,
  el recorte llegaba al 95% en el primer tercio y se veía instantáneo. La curva
  actual reparte el recorrido y deja ver el avance.
- **El estado tapado vive dentro del `@keyframes`**, igual que en el logo: si
  estuviera en la regla base y la animación no llegara a correr, el hero quedaría
  recortado para siempre.

### Nada se anima detrás del loader

Antes el sitio arrancaba **en paralelo** con la pantalla de carga: para cuando esta
se levantaba, las figuras ya habían terminado su entrada de 3s desde el borde y el
video del hero iba por la mitad. Ahora todo espera.

Son tres mecanismos, porque no todo se resuelve igual:

- **Las animaciones CSS se pausan**, no se anulan: una regla global bajo
  `html[data-cargando]` les pone `animation-play-state: paused`, así se crean igual
  y quedan **en su primer cuadro**, listas para arrancar enteras. El `:not()` deja
  afuera al loader, que es lo único que tiene que moverse.
- **Las transiciones se anulan**, porque una transición no se puede pausar: se
  aplicaría el estado final y el movimiento se perdería igual.
- **Lo que se dispara por observador espera un aviso.** La entrada de las figuras es
  una transición que engancha un atributo desde un `IntersectionObserver`; ese
  observador ahora se arma recién cuando el loader se fue. Va por
  `lib/carga.js` —un atributo en `<html>` más un evento— y no por un contexto,
  porque el único que escribe es `App` y los que leen son componentes hondos:
  pasarles un prop obligaría a enhebrarlo por media docena de componentes que no
  tienen nada que ver.
- **El video del hero perdió el `autoPlay`** y arranca desde cero cuando el loader
  se va.

**La marca `data-cargando` viene puesta desde `index.html`, no desde un efecto.**
Esto no es un detalle: React corre los efectos de los hijos **antes** que los del
padre, así que con la marca puesta desde `App` las figuras montadas primero veían
`<html>` todavía limpio y arrancaban igual. Instrumentando el helper aparecieron
**6 de 10** colándose por ahí.

Verificado midiendo con y sin la marca: con ella el pulso del sol, la flecha y las
figuras quedan en `paused` y las transiciones de las figuras en `0s`, mientras el
trazo del loader sigue en `running` y su propio fundido conserva sus 0.6s.

`prefers-reduced-motion` lo deja dibujado y quieto. Ahí **no alcanza con
`animation: none`**: los estados iniciales —trazo sin dibujar, nodo en escala 0—
están en la regla base, así que hay que deshacerlos a mano. Verificado que la regla
está en la hoja y bien formada; **no pude emular la media query** desde el navegador
automatizado, así que conviene mirarlo una vez con la preferencia activada.

### Fase 3 — Figuras: entrada e interacción ✅

1. ✅ Entrada desde fuera de pantalla hacia su posición, una sola vez al cargar.
2. ✅ Reacción al pasar el mouse.
3. ✅ Que la figura grande de una sección reaccione cuando se toca su link en el
   navbar. Se amplió también a las figuras del hero.

**Extra no planificado:** el cursor propio (`ui/Cursor.jsx`), un círculo que
reemplaza al puntero del sistema. Solo con punteros finos y respetando
`prefers-reduced-motion`.

**No incluye** el armado del logo con las figuras: ver Fase 6.

### Fase 4 — Hero ✅

1. ✅ **La ventana alrededor del nombre y el rol.** Es la misma ventana que las
   tarjetas de Proyectos —marco grueso, barra de título con los tres cuadraditos—
   con las diferencias que pediste: el marco va en **degradado** en vez de un color
   plano, **no lleva el recuadro** de la esquina inferior izquierda (ese recuadro es
   lo que identifica a un proyecto), y detrás hay un **segundo contorno corrido
   12px** que hace de sombra.

   Ese contorno es un elemento y no un `box-shadow` porque tiene que ser un trazo
   hueco del mismo grosor, y una sombra siempre es una silueta rellena.

   **El fondo de la ventana es transparente**, así que se ve el fondo real de la
   página. Va con `border-image` y no con el truco de dos fondos que usa Proyectos:
   ese truco necesita pintar la caja de relleno con un color opaco para tapar el
   degradado de abajo, o sea que exige fondo. `border-image` pinta solo el borde.
   Es también lo que hace la referencia — bajado su `FrontWindowMain.svg`, el marco
   es un trazo relleno y el interior no existe.

   Los tokens (`--trazo`, `--barra`) repiten los nombres de Projects.css pero son
   **locales**: acá el trazo es más grueso —una ventana grande, no siete chicas—, y
   compartirlos ataría los dos tamaños.

   **El saludo "Hola, soy" se fue**, y con él la clave `hero.greeting` de los dos
   JSON de i18n.

   **El nombre lleva contorno grueso** en el degradado del marco. Es una copia del
   texto puesta detrás con relleno transparente y trazo grueso, recortada con
   `background-clip: text`: un `-webkit-text-stroke` a secas acepta un color, no un
   degradado.

   El trazo va centrado sobre el contorno de la letra, así que la mitad queda tapada
   por el relleno de adelante y **el relleno no engorda por más que crezca el
   borde**. El peso del nombre bajó de 700 a 500 por lo mismo: en negrita el relleno
   quedaba tan ancho como el borde. Archivo es variable, así que el peso intermedio
   no cuesta una fuente más — solo hubo que pedirle a Google el rango `500..700` en
   vez del `700` suelto.

   El relleno tiene su propio token, `--hero-nombre-relleno`, y no usa
   `--text-primary`: tiene que contrastar contra el **contorno**, que es del acento,
   no contra el fondo. En oscuro los dos coinciden, pero en claro `--text-primary`
   es casi negro y el acento es verde profundo, y el contorno desaparecía. Con el
   token, contorno contra relleno da 19:1 y contorno contra página 10:1.

   **Al lado del nombre van seis puntos en paralelogramo.** En la referencia son
   ocho discos en dos columnas inclinadas 6° (`LogoCenter_2.svg`); acá van seis, con
   la misma inclinación. Se dibujan con una máscara de un solo punto repetido en
   una grilla de 2×3, no con seis elementos ni con un SVG: así el color es
   literalmente `var(--degrade)` y sigue al tema, en vez de ser una copia de sus
   paradas que habría que mantener en dos lados.

2. ✅ **El video de alfa se queda a la derecha.** Convive con la ventana sin tocarlo.

3. ✅ **La flecha de scroll.** La de tamalsen no es CSS: es un **Lottie**
   (`lf30_editor_axlyflyi`). Bajado el JSON, es una composición de 72×72 a 25 fps y
   125 cuadros —5 s de loop— con un mouse de contorno que se dibuja solo, la rueda
   y un chevron adentro que rebotan, y todo barriéndose al final para volver a
   empezar.

   Está **porteado a SVG + CSS**, con las medidas y los tiempos sacados del JSON:
   la cápsula es `rect rx=18.29`, la rueda va de y=17.5 a y=34.5, el chevron está
   en (29.55, 47.25)-(35.96, 53.75)-(42.45, 47.25), y cada porcentaje de los
   `@keyframes` es el cuadro del Lottie dividido por 125. O sea: misma animación,
   solo cambia el color, que era violeta.

   Va porteado y no con `lottie-web` porque el reproductor pesa ~250 KB para
   dibujar tres trazos — más que todo el hero.

   `pathLength="100"` normaliza el largo de cada trazo para que los
   `stroke-dashoffset` sean porcentajes y no números medidos a mano que se rompen
   al tocar la forma.

   **Es un botón**, no decoración: baja a Trayectoria con el mismo desplazamiento
   que usan los links del navbar (pregunta 28). Lleva nombre accesible propio
   (`hero.scroll` en los dos idiomas), foco visible y área táctil de 44px, porque
   el dibujo solo mide 52 y el `cursor: none` del cursor propio le saca la única
   señal que tendría de ser clickeable.

4. ✅ **El nombre va en Chakra Petch Bold**, en su propio token `--font-hero`. No
   comparte token con `--font-display` a propósito: esa es la de los nombres de
   proyecto, y son dos decisiones distintas — si mañana cambia una, no tiene por qué
   arrastrar a la otra. (Antes de esta pasó por Archivo, Orbitron, Space Grotesk y
   JetBrains Mono.)

   Se cargan los pesos **600 y 700**: el 700 es el del tema oscuro y el 600 el del
   claro, que lleva el relleno un punto más fino junto con el borde más grueso.

   Lo de abajo es el camino tipográfico que llevó hasta acá, y sigue valiendo para
   los **nombres de proyecto**, que son los que hoy usan `--font-display`:

   **La tipografía (pregunta 26).** Montserrat estaba mal: es geométrica y
   redonda, y vos pediste "más cuadrada y espaciosa". Inspeccionando larson, su
   tipografía real es **Grifter Bold con +0.05em de interletrado**. Grifter es
   comercial, así que quedó **Archivo** —variable, con eje de ancho— pedida al
   112% de ancho y peso 700, que es lo más cerca que se llega con una libre. El
   interletrado pasó a **positivo**: antes estaba en negativo, que es lo contrario
   de lo que hace la referencia.

   Cambia los nombres de proyecto y el nombre del hero, que ahora comparten
   `--font-display`.

5. ✅ **El rol, en píxeles.** El renglón de abajo del nombre va en **Silkscreen**,
   en `--font-pixel`. Contrasta con la tipografía cuadrada del nombre, que es lo que
   evita que el bloque se lea como dos líneas del mismo cartel.

   Dos cosas que hay que respetar al tocarla:

   - **El cuerpo tiene que ser múltiplo de 8.** El dibujo de Silkscreen está hecho
     sobre una grilla de 8px; con un `clamp()` fluido el cuerpo cae en valores
     fraccionarios —36.8px, por ejemplo— que dejan los píxeles a medio camino y el
     navegador los difumina. Por eso el rol lleva medida fija: 24px, y 16px en
     pantallas chicas.
   - **Peso 400 y forzado.** Es el único que tiene; el rol estaba en 600 y el
     navegador le sintetizaba una negrita engordando los píxeles, que es justo lo
     que rompe una tipografía de grilla.

   (Antes de esto pasó por **Kaushan Script**, buscando el pincel manuscrito de
   larson — su renglón está vectorizado dentro de `LogoCenter_2.svg`, así que no
   tiene nombre, y comparando formas contra las candidatas libres esa era la más
   cercana. Quedó descartada por decisión tuya.)

6. 🔲 **Las letras en diagonal de vanho.** Dejadas para el final, según la
   respuesta a la pregunta 5.

### Fase 5 — Proyectos ✅

**Tercera vuelta — lo que quedó al final.** Las dos primeras están más abajo; esto
es el estado actual.

- **La tarjeta no es una superficie.** Fue el arreglo que enderezó todo: el
  `.project-card` tenía fondo, borde y radio propios, y con la ventana adentro se
  veía **un cuadro dentro de otro**. En la referencia no hay ninguna caja: el marco
  *es* la tarjeta. Ahora solo queda como contenedor de layout —y la superficie
  vuelve al expandirse, donde sí hace falta para contener descripción, celular y
  galería—.
- **Tipografía propia.** IBM Plex Sans es humanista y la de larson es geométrica,
  de bowls circulares y "a" de dos pisos. Se cargó **Montserrat 700** en
  `--font-display`, un solo peso, solo para los nombres de proyecto.
- **La diagonal es del recuadro, no del marco.** Al revés de como estaba. El marco
  tiene las cuatro esquinas rectas; el recuadro cuelga de la esquina inferior
  izquierda —un tercio arriba, dos tercios abajo— con el corte en **su** esquina
  superior derecha. Va anclado por arriba: por abajo se movía cuando el nombre
  ocupaba dos líneas.
- **Una sola densidad.** Se fue el botón "Ver todo" y el estado `compacto`. La
  clase `is-compact` quedó fija —es la que gobierna el CSS de la grilla, y Journey
  sigue usándola con su toggle—, pero ya no alterna.
- **Abierta, la tarjeta es la sección.** Con una abierta, las otras seis se
  ocultan: si siguieran ahí la empujarían hacia abajo y habría que scrollear para
  ver lo que se acaba de abrir. El título es el control que abre y cierra; no hay
  "Más información" ni "Ver repositorio" en la vista chica.
- **Tags y repo a la derecha del celular**, no debajo. `PhoneDemo` recibe un
  `children` que renderiza en su columna derecha: la composición queda explícita en
  vez de que el componente sepa qué son tags.
- **La foto se amplía al pasar el mouse** y se ve completa. Crece **como capa**,
  no en el flujo: entera y a ancho de tarjeta serían 781px de alto y la tarjeta
  dejaría de entrar en una pantalla.
- **Encuadres.** Al abrir se centra la tarjeta contra el espacio útil (ventana
  menos navbar); al cerrar se encuadra la sección con el tope a ras, que es
  exactamente lo que hace el link "Proyectos" del navbar. Son dos cálculos
  distintos a propósito, y está escrito por qué.

1. ✅ **Tarjeta al estilo larson.** Ver el detalle de las vueltas anteriores abajo.
2. ✅ Resolver la tensión con la regla de una sección por pantalla: manda la
   regla.
3. ✅ Conectar los medios a la tarjeta: la tapa sale de la carpeta del proyecto y
   el ícono queda como respaldo. Ver 2.8.
4. ✅ El celular con las demos. Ver Fase 6.3.

**La tarjeta funciona con foto y sin foto**, que era la condición: 6 de 7
proyectos siguen sin capturas y usan su ícono. Se recorrieron las siete para
confirmar que **cada una entra sola en una pantalla** — la más alta es Melodía con
851px contra 953.

**La regla de encuadre, precisada:** lo que tiene que entrar sin scrollear es la
**tarjeta sola**, no la tarjeta más el encabezado de la sección. Eso libera unos
150px de presupuesto y fue lo que permitió que la foto de la tarjeta abierta pase
de 162px a 285.

---

**Segunda vuelta (respuesta 20):** la primera versión no era la estética pedida.
Faltaban tres cosas que sí están en la referencia y ahora están: la **barra de
título** con los tres cuadraditos de contorno, la **esquina de abajo a la
izquierda recortada en diagonal**, y el **nombre al lado del recuadro**, no
debajo. Además el look ahora se ve **en el estado compacto**, que es el de
entrada, y no solo en "Ver todo".

Lo que costó que entre en una pantalla: los tags de la tarjeta compacta. Cuatro
etiquetas envuelven a dos líneas y se comían 59px por tarjeta. En la referencia la
tarjeta chica es solo ventana y nombre, así que sacarlos de ahí —vuelven al
expandir— es a la vez más fiel y lo que deja crecer la foto. La sección quedó en
889px contra un viewport de 897.

**El límite real, para que quede escrito:** con 3 columnas × 3 filas en una
pantalla, la foto no puede pasar de ~108px de alto. En larson las fotos son 4/3;
acá quedan apaisadas y bajas. Para tener proporción de larson **de verdad** habría
que mostrar menos tarjetas en el compacto, que era la opción (c) de la pregunta 20.

1. ✅ **Tarjeta al estilo larson.** Tres piezas:
   - **El cuadro de la foto.** `.project-media` dejó de ir pegado de lado a lado:
     está despegado del borde por `--marco` y tiene borde y radio propios (12px
     contra los 16px de la tarjeta, para que se lea como un cuadro adentro de
     otro). `--marco` es variable porque el compacto lo baja de 0.9rem a 0.5rem.
     Perdió el `overflow: hidden` —el recuadro chico tiene que poder salirse— y
     ahora lo que recorta es el radio que heredan la foto y el marcador.
   - **La tipografía del nombre.** De 1.2rem fijo a
     `clamp(1.3rem, 1.05rem + 0.85vw, 1.9rem)` con `letter-spacing: -0.02em`,
     que a ese cuerpo hacía falta cerrar. El compacto tiene su propia escala: 7
     tarjetas en 3 filas no toleran el cuerpo grande.
   - **La ventana.** `.project-marco` con `.project-barra` arriba —tres
     cuadraditos **de contorno**, porque rellenos leen como botones de ventana de
     verdad— y la esquina de abajo a la izquierda recortada con `clip-path`. El
     recorte va en el marco y no en la foto justamente para que el **borde** se
     corte con ella: `clip-path` recorta el elemento entero, borde incluido.
   - **El recuadro chico.** `.project-notch`: un cuadro **vacío y transparente**
     que queda a caballo del borde, apoyado en la diagonal, con el nombre **al
     lado**. Se sube solo el recuadro con su propio margen negativo: subir la fila
     entera dejaba el nombre tapado por el borde de la ventana —fue el primer
     bug—. Va en las dos variantes, con foto y con ícono, porque es ornamento del
     marco.
   - **El color.** El marco y la barra van atenuados contra el acento puro
     (`color-mix` al 45% y 62%). En larson son del color de acento porque toda su
     paleta es ese violeta; nuestro verde a full sobre siete tarjetas a la vez se
     vuelve un subrayador. Fue el segundo bug de la primera vuelta.
2. ✅ Resolver la tensión con la regla de una sección por pantalla: manda la
   regla.
3. ✅ Conectar los medios a la tarjeta: la tapa sale de la carpeta del proyecto y
   el ícono queda como respaldo. Ver 2.8.
4. ✅ El celular con las demos. Ver Fase 6.3.

**La tarjeta funciona con foto y sin foto**, que era la condición: 6 de 7
proyectos siguen sin capturas y usan su ícono.

### Fase 5-bis — Barra lateral de contacto ✅

1. ✅ Resolver el choque con las figuras del margen izquierdo.
2. ✅ Construir el riel con LinkedIn, GitHub, correo, CV y contacto,
   reutilizando `data/socials.js`.
3. ✅ Darle su propio nombre accesible: son dos `<nav>` en la página.
4. ✅ Definir el comportamiento en móvil.

**Se hizo de más:** el despliegue hacia la derecha con los nombres, la foto de
perfil circular, y que los "Contactame" del hero y del pie lo abran y lo cierren.

**Ya no depende del CV:** la entrada se oculta sola mientras `href` sea `null`.

### Fase 6 — Ambicioso, a decidir aparte 🔲

1. 🔲 Las figuras se reorganizan para formar el logo al pasar el mouse por
   ciertas palabras.
2. 🔴 "As featured in". Sigue sin contenido definido (pregunta 6).
3. ✅ **Celular 3D con las demos. Hecho** — `ui/PhoneDemo.jsx`, respuesta a la
   pregunta 16.

   **Tercera vuelta — el estado final.** Sobre lo de abajo se agregó:

   - **Al arrancar el video, la ventana se contrae y el celular se queda con su
     espacio.** `PhoneDemo` avisa con `onPlayingChange` y la tarjeta se pone
     `is-reproduciendo`. Se dispara con el `play` **real**, no con el click: si el
     navegador bloquea la reproducción, el layout no cambia — no tiene sentido
     esconder la foto si no se está viendo nada.
   - **El empalme entre el giro y la pose de frente.** Era el "salto" que se veía.
     Una animación de keyframes **le gana al `transform` declarado**, así que al
     sacarla el valor saltaba a la base y la transición recién arrancaba desde ahí.
     De ida se congela la pose real con `commitStyles()` antes de que la clase mate
     la animación; de vuelta, una clase `is-volviendo` saca la animación mientras
     la transición lleva el celular hasta la pose inicial, que es **idéntica al
     fotograma 0%** del giro, así el reingreso no se nota.
   - **Al cerrar la tarjeta, el celular vuelve solo al estado inicial.** Se remonta
     con un `key` atado a si está abierta — la forma idiomática de resetear estado
     en React. Eso además **corta el audio de raíz**, porque el `<video>` deja de
     existir: antes seguía sonando con la tarjeta cerrada, ya que el bloque queda
     en el DOM para poder animarse.
   - **La coreografía se ralentizó a 0.85s** con una curva que entra y sale suave.
     Vive en `--demo-anim`, una sola variable para las cinco piezas —foto, barra,
     marco, recuadro y celular—, que además permite apagarla entera con
     `prefers-reduced-motion`. Antes eran 0.45s con una curva de arranque brusco, y
     no estaba cubierta por reduced-motion.

   ---

   **Segunda vuelta (respuesta 21).** Quedó así:

   - **Un iPhone en diagonal que gira sobre su eje vertical.** `rotateZ` fijo más
     `rotateY` oscilando entre −26° y +24°. **No da la vuelta completa a
     propósito:** sin caras 3D, pasados los 90° se vería la pantalla espejada.
     El grosor es un `box-shadow` sólido desplazado —con la inclinación se lee
     como el canto— y los botones laterales son dos spans sobre el borde.
   - **El mismo botón alterna.** Tocar la demo puesta la saca; tocar otra cambia
     de video. **Ya no hay botón "Volver".**
   - **El video es intocable.** Sin `controls` y con `pointer-events: none`, así
     la barra del navegador no aparece nunca encima de la pantalla del celular.
   - **Los controles viven afuera**, debajo de los botones de demo: pausa,
     tiempo transcurrido, aguja, duración, silenciar, volumen y pantalla completa.
     Eso obliga a mantener el estado del reproductor en React y sincronizarlo con
     los eventos del elemento; no alcanza con leerlo una vez.
   - Cada control corta la propagación por su cuenta. La tarjeta tiene su propio
     `onClick` para expandirse, así que sin eso tocar play la cerraría. Se hace en
     los controles y no en el contenedor porque un `div` con `onClick` no es un
     control y no responde al teclado — el linter de a11y lo marca.

   **Reemplazó a los videos de la galería.** En el hueco 4/3 entraban completos
   pero chicos; acá la proporción del hueco **es** la del video (1:2 exacto,
   720×1440), así que se ve como lo que es. La galería se quedó con las imágenes,
   y como la única de Melodía era su tapa, en su tarjeta no queda galería.

   **Las tres decisiones que son de rendimiento, no de gusto:**
   - **En reposo la pantalla es una imagen, no un video.** Girar un video obliga a
     recomponer la capa por frame; una imagen se rasteriza una vez y después solo
     se transforma.
   - **Sin `transform-style: preserve-3d`.** El celular es plano: alcanza con
     rotar un solo elemento y dejar que sus hijos se aplanen en su plano. Con
     `preserve-3d` cada hijo se re-rasterizaría por frame — exactamente lo que
     causó el problema térmico de las figuras.
   - **La escala del estado de demo va en el `transform`, no en el `width`**, para
     no disparar un relayout.

   **El arranque del video va por `play()` en un efecto, no por `autoplay`.**
   Verificado: con el atributo, el navegador lo bloquea porque el audio necesita
   un gesto del usuario detrás y el atributo no se ata al click. Desde el efecto
   que dispara el click sí corre dentro de esa ventana — comprobado con un click
   real: `reproduciendo: true`, sin silenciar, volumen 1. Si algún navegador igual
   lo rechaza, queda en pausa y el play de la barra lo arranca.

   El giro se apaga con `prefers-reduced-motion`.

   **Lo que no se pudo verificar por automatización:** que el video avance cuadro
   a cuadro. La pestaña del navegador automatizado corre en segundo plano
   (`visibilityState: "hidden"`) y ahí Chrome estrangula la carga de medios:
   `networkState: 2` pero `readyState: 0`, sin error. Sí quedaron verificados el
   alternado, el cambio de demo, la ausencia de controles nativos, el
   `pointer-events: none` y que `play()` resuelva sin silenciar. Conviene mirarlo
   a ojo una vez en una pestaña en primer plano.

### Fase 7 — Trayectoria y Habilidades 🔲

Las dos únicas secciones que el rediseño **no tocó**. Nunca tuvieron fase propia
—venían apareciendo como un ítem suelto en "qué sigue"—, así que quedan acá.

**El rediseño de Trayectoria arrancó (2026-07-31).** Estuvo congelada mientras lo
pensabas; la primera decisión ya está tomada y hecha:

**Una sola línea de tiempo en el medio**, con lo académico a su izquierda y lo
laboral a su derecha. Antes eran **dos ejes**, uno pegado a cada margen, cada uno
con sus tarjetas colgando hacia adentro.

Lo que cambió al pasar a un solo eje:

- Los rótulos ("Académico" / "Experiencia") **ya no viven adentro de su eje** —no
  hay dos—: se cuelgan del centro, uno hacia cada lado. Siguen ocultando su rama.
- **Ocultar una rama ya no apaga la línea.** Antes cada eje se desvanecía con su
  rama; ahora la línea es de las dos, así que se queda encendida y lo único que se
  colapsa son las tarjetas de ese lado.
- Las tarjetas pasaron de 54% a **44% de ancho**: cada una entra en su mitad menos
  el hueco que la separa de la línea.
- **La tarjeta expandida ya no se ensancha al 80%**, solo crece a lo alto: con la
  línea en el medio, ensancharla la haría cruzar al otro lado.
- En móvil no hay dos lados, así que la línea se va al margen izquierdo y todo
  cuelga de ella, como antes.

**Segunda decisión, prototipo: la entrada es una ventana**, la misma de Proyectos —
marco de trazo grueso con barra de título y los tres cuadraditos—. Antes era la
tarjeta genérica: fondo, borde de 1px, radio de 16px y sombra al pasar el mouse, o
sea el patrón que ya habíamos sacado de Proyectos.

Está **a prueba**: la reserva que dejé anotada antes de hacerlo sigue en pie —son
siete ventanas apiladas, y la ventana ya significa "esto es un proyecto"—. Deshacerlo
es CSS de una clase.

Dos cosas que costó acomodar:

- **La altura.** Cada barra de título suma alto siete veces: la sección se fue a
  1030px contra los 953 de la pantalla, y la regla es que entre en una. Se recuperó
  achicando lo que la rodea —barra de 14px a 10px en compacto, relleno del timeline,
  aire entre entradas— hasta dejarla en 953 justo. **No queda margen**: cualquier
  cosa que se agregue a una entrada la saca de pantalla otra vez.
- **El tema claro.** `.timeline-card` estaba en el bloque de `ui.css` que invierte
  los tokens para las superficies verde oscuro, y ese bloque también daba vuelta
  `--proy-marco`. Pero el marco de la entrada **no está adentro de la superficie
  oscura: está contra la página**, así que con el valor de adentro medía 1.11:1 —
  invisible—. Los dos tokens quedaron acotados a `.project-card.expanded`, que sí
  está rodeada de verde oscuro. Ahora el marco da 5.2:1.

**Tercera decisión: la vista densa es la única.** Se fue el botón "Ver todo" que
alternaba con una vista completa, y con él el estado `compacto` y la clase
`is-compact` de la sección.

No quedó como clase vestigial —el error que sí cometimos en Proyectos, donde
`is-compact` sigue fija gobernando 19 selectores—: acá las 18 reglas
`.experience.is-compact X` se **fusionaron con sus reglas base**, y las que no
tenían base (lo que no se muestra en reposo) quedaron en un bloque propio con su
razón escrita. `.section-toggle` se borró de `ui.css` porque ya no lo usa nadie, y
las claves `section.expand` / `section.collapse` salieron de los dos JSON de i18n.

El encabezado achicado —que colgaba de `.is-compact`— pasó a `.experience
.section-header, .projects .section-header`, o sea que no depende más de una clase
de modo.

Sacar el botón devolvió aire: la sección quedó en **911px** contra los 953 de la
pantalla, después de haber estado justo en 953.

Sigue funcionando expandir una entrada suelta, que es otra cosa: ahí vuelven la
descripción, las etiquetas y el botón de "ver más".

**Cuarta decisión: foto chica del lado de afuera, y más aire entre entradas.** La
foto va **fuera del cuadro verde**, a su costado externo: a la izquierda en lo
académico y a la derecha en lo laboral, o sea siempre contra el margen y nunca
contra la línea.

Por eso la entrada tiene un bloque (`.timeline-bloque`): la foto y la ventana son
**hermanas**, no una adentro de la otra, y el ancho de la mitad lo lleva el bloque.
En el DOM la foto va siempre primero y en la rama laboral se invierte solo el orden
visual (`row-reverse`), así el orden de lectura no depende del lado.

Se estira al alto de la ventana en vez de flotar —una miniatura chica al lado de
una caja más alta se lee como un error de alineación—, salvo al expandir la entrada,
donde vuelve a su tamaño en lugar de estirarse por toda esa altura.

La foto sale del índice de medios (`getCover('timeline/<id>')`), así que **aparece
sola en cuanto haya un archivo** en `src/assets/media/timeline/<id>/`. Las seis
carpetas ya existen y están vacías; mientras tanto se ve la inicial, que es lo que
había antes.

El aire entre entradas pasó de **3px a 11px**, y eso obligó a rehacer el
presupuesto de alto: con el espaciado real la sección se iba a 1008px contra los
953 de la pantalla. Los 55px salieron de cuatro lugares que no tocan la tarjeta —el
relleno de la sección, el del timeline, el aire bajo los rótulos, y el margen de la
última entrada, que no separa de nada—. Quedó en **951px**.

**El presupuesto está otra vez al límite**, como cuando se agregó la barra de
título: no hay lugar para sumarle nada a una entrada sin sacar la sección de
pantalla. Si más adelante hace falta, lo que queda por revisar es que **cada entrada
ocupa su propia fila** aunque alternen de lado: seis entradas apiladas son seis
alturas, y compactarlas para que una laboral suba a llenar el hueco de la izquierda
casi partiría el alto al medio. Es un cambio de layout distinto.

El resto de la sección sigue igual y con la deuda anotada abajo.

**Habilidades no está congelada explícitamente**, pero como las dos comparten los
mismos patrones conviene decidirlas juntas.

Relevado en vivo, para cuando se retome:

- **Siguen con el patrón de tarjeta genérica** que ya se sacó de Proyectos:
  `border-radius: 16px`, borde translúcido de 1px, superficie `#2a2a2a` y sombra
  interior. Es literalmente lo que provocó el *"el cuadro verde está dentro de una
  card"*.
- **Los títulos de tarjeta siguen en la tipografía del texto corrido**, no en
  `--font-display`. La jerarquía tipográfica del sitio se corta al pasar de
  Proyectos a Trayectoria.
- **Los botones son píldoras** ("Ver todo", "Académico", "Experiencia"), un patrón
  que el resto del sitio ya no usa.
- ✅ **El bug de superposición está arreglado.** El rótulo "Académico" pisaba la
  esquina de la primera tarjeta —73×22px, medidos—. La causa era estructural: los
  rótulos estaban **posicionados en absoluto** dentro del timeline, así que había
  que reservarles lugar con un `padding-top` puesto a ojo, y en modo compacto ese
  relleno (26px) quedaba más chico que ellos (48px).

  El arreglo saca el problema de raíz en vez de subir el relleno: los rótulos
  pasaron **al flujo**, arriba de la línea, así que el alto lo reservan ellos
  mismos y no hay número que mantener. Van en una grilla de dos columnas iguales con
  un hueco al medio, cosa que el borde entre ellas caiga justo en el 50% —o sea
  sobre la línea— sin depender de cuánto mida cada texto: "Académico" y
  "Experiencia" no miden lo mismo, así que centrar el par como bloque dejaría la
  línea adentro de uno de los dos.

  Efecto colateral que hubo que atender: `--work-color` estaba definido en
  `.timeline`, y los rótulos ahora viven **afuera** de él, así que el laboral perdía
  su color y su borde. El token subió a `.experience`.

  Verificado: cero superposiciones entre rótulos y tarjetas, el borde entre rótulos
  cae en el mismo píxel que el eje, y la sección sigue entrando en una pantalla
  (910px contra 953).

---

## 4-bis. Decisiones tomadas

- **Fondo:** el sol es **fijo detrás de todo el sitio**, no solo del hero, y
  reemplaza las manchas. ✅ Implementado.
- ~~**Sol en tema claro:** el mismo sol, más tenue.~~ **Revocado en la
  implementación.** Sobre un fondo verde, una luz verde no se ve: el sol del
  tema claro pasó a ser **luz blanca**. Es lo que da la sensación de sol ahí.
- **Tema claro invertido** *(decisión posterior, no estaba en el plan)*: el verde
  pasa a ser la superficie principal y el blanco la secundaria. Arrastró varias
  cosas: el acento bajó a un verde profundo (`#0a3d1f`) porque un verde medio se
  perdía contra el fondo; las tarjetas quedaron en verde oscuro (`#2c5540`,
  4.08:1 contra la página — el verde claro anterior se despegaba apenas 1.23:1);
  y dentro de esas tarjetas hay que **invertir los tokens de texto**, cosa que se
  hace redefiniendo las variables sobre la propia tarjeta para no tocar ninguna
  regla de texto.
- **Hero:** el video con alfa **se queda a la derecha**. El marco al estilo
  larson envuelve **solo el nombre y el rol**, en la columna izquierda.
- **Proyectos:** **manda la regla de una sección por pantalla.** Tarjetas al
  estilo larson pero en chico, que crecen al abrirse.
- **Logo:** lo vectorizo yo desde el PNG. Va a ser una reinterpretación del
  monograma, no una copia exacta.
- **Riel de contacto:** **reemplaza** los enlaces del hero y del pie, no se
  suman. Es fijo todo el tiempo, no aparece al scrollear.
- **Orden:** se arrancó por el fondo, siguió por las figuras y después por el
  riel.

```
┌──────────────────────┬─────────────┐
│  ╔════════════════╗  │             │
│  ║ Thiago Pacheco ║  │    video    │
│  ║ Software Eng.  ║  │    (alfa)   │
│  ╚════════════════╝  │             │
│  bio, botones        │             │
└──────────────────────┴─────────────┘
```

*(Las redes ya no van en el hero: se mudaron al riel.)*

## 5. Decisiones ya tomadas

Las preguntas respondidas se sacaron de acá: lo que se decidió está escrito en el
bloque de cada tema y en «4-bis. Decisiones tomadas». **Las que siguen abiertas
están al final, en la sección 7.**

---


## 5-bis. Auditoría de color (post Fase 4)

Barrido con las dos skills sobre todo lo construido, midiendo contraste y
saturación en vivo en los dos temas. **El patrón de fondo es uno solo:** cada token
que mezcla el acento hacia un casi-blanco se rompe en tema claro, porque ahí la
página no es blanca sino un verde **medio**, y la mezcla aterriza justo en su
luminosidad.

### Arreglado

| # | Qué | Antes | Después |
|---|-----|-------|---------|
| 1 | `--degrade` mezclaba con `white`; en claro el marco, la barra, los puntos y el contorno del nombre se volvían grises en su tramo medio | 1.09:1 · sat 11% | 3.47:1 · sat 40% |
| 2 | Los tres cuadraditos de la barra del hero, con trazo al 50% del color de página | 1.04:1 | 3.47–5.96:1 |
| 3 | `--brillo` de Proyectos: el mismo bug latente en el hover | igual que (1) | igual que (1) |
| 4 | Los nombres de proyecto en tema claro | **1.91:1** | 8.28:1 |

El (1) y el (2) se resuelven con un token nuevo, `--degrade-luz`, el extremo claro
del degradado: `#7bffc0` en oscuro y `#3f7a58` en claro.

Después hubo dos ajustes más sobre ese degradado, los dos por pedido:

- **Menos brillo en oscuro.** El extremo claro era `white`, y el tramo medio llegaba
  a 78% de luminosidad contra el 45% del acento — un salto de 33 puntos que se leía
  como un reflector. Con el menta baja a 63%, la mitad del salto.
- **Más rango de tonos.** Las dos puntas del degradado eran el acento a secas, así
  que todo el recorrido cabía entre el acento y el brillo: 18 puntos de luminosidad,
  que a lo ancho de un marco de 600px se lee casi plano. Se sumó
  `--degrade-sombra` —la punta oscura— y el degradado pasó a cinco paradas
  (sombra → acento → brillo → acento → sombra), con un recorrido de 38 puntos en
  oscuro y 22 en claro, **sin** subir el pico.

  El mismo tratamiento se le aplicó después al brillo del hover de Proyectos
  (`--brillo`, pregunta 31), que había quedado con la estructura vieja: conserva su
  banda angosta de luz en el medio, pero ahora arranca y termina en la punta oscura.

  Los dos pisos están donde están porque el degradado **es** el color del marco:
  en oscuro más abajo de `#008c46` no llega a 3:1 contra la página, y en claro el
  pico ya está en el techo por el mismo motivo, así que ahí el rango se abrió hacia
  abajo y no hacia arriba. El (4) era el más grave y es una secuela de la Fase 5:
`ui.css` invierte `--text-primary` a casi blanco dentro de `.project-card` porque en
tema verde la tarjeta *era* una superficie verde oscura. Al sacarle la superficie
—el marco es la tarjeta— la inversión quedó huérfana y pintaba los nombres casi
blancos sobre la página verde clara. La regla quedó acotada a
`.project-card.expanded`, que sí sigue teniendo fondo.

También se le puso texto alternativo vacío (`content: attr(...) / ""`) a la capa
del contorno del nombre: es contenido generado y puede llegar al árbol de
accesibilidad, haciendo que el nombre se anuncie dos veces. Chrome hoy no lo
duplica —verificado leyendo el árbol— pero eso no está garantizado.

### Arreglado después (pregunta 30)

- **La barra de título y el marco de las tarjetas de Proyectos en tema claro**,
  que estaban en 1.97:1 y 2.80:1 contra la página. Mismo patrón del punto (1): se
  atenuaban contra `--bg-secondary`, que en claro es casi blanco. Ahora se atenúan
  contra el verde de tarjeta y los dos quedan en **5.20:1**. El tema oscuro no
  cambió un píxel: sus valores siguen siendo 4.06:1 y 4.90:1.

  Salió un caso que no estaba a la vista: en tema claro la tarjeta **expandida** es
  verde oscuro, así que ahí ese mismo verde desaparecía (1.27:1). Los dos tokens se
  vuelven a dar vuelta dentro de la tarjeta expandida —en el mismo bloque de
  `ui.css` donde ya se invertían los de texto— y pasan a un menta que da 4.82:1.

### Decisiones anotadas, no defectos

- **El acento está al 100% de saturación** (`#00e676`). La skill de rediseño pide
  quedarse por debajo del 80%. Es el color de marca de antes de esta tanda, pero la
  Fase 4 le multiplicó la superficie: la barra es una franja llena, el marco un
  trazo de 4px y el nombre un contorno muy grueso. Bajarlo es una decisión de sitio
  entero, no del hero.
- **El `#000000` del relleno del nombre.** La skill lo desaconseja como *fondo*;
  acá es relleno de texto y fue pedido. Queda a 1.21:1 de la página, que es
  justamente lo que lo hace leer como letra hueca — el contorno hace el trabajo a
  10.43:1.
- Lo demás del barrido de color pasa: un solo acento, grises de una sola familia,
  sombras teñidas con `--sombra-rgb`, sin degradado violeta/azul de IA.

### Rendimiento — resuelto (pregunta 33)

El mouse animado corría siempre, también con el hero fuera de pantalla, y
`stroke-dashoffset` no se compone en GPU: repinta cada cuadro. Ahora un
`IntersectionObserver` en `Hero.jsx` le pone `animation-play-state: paused` cuando
sale de vista. Se **congela**, no se oculta: al volver retoma donde estaba.

---

## 6. Qué sigue

Las fases 4 y 5 están cerradas, y **Trayectoria quedó congelada**: se va a pensar
un rediseño completo de esa sección más adelante, no propagarle el lenguaje actual
(ver Fase 7).

Las fases 1, 2, 3, 4 y 5 están cerradas. Lo que queda **sin depender de una
decisión tuya**:

1. **Fase 7 pero solo Habilidades.** Es la otra sección sin tocar y no está
   congelada. Ojo: comparte los mismos patrones que Trayectoria, así que hacerla
   sola deja las dos con lenguajes distintos hasta que se resuelva la otra. Ver la
   pregunta 36.
2. 🐞 **El bug de layout de Trayectoria** —el rótulo del eje tapando la primera
   tarjeta— es independiente del rediseño y se puede corregir solo. Ver la
   pregunta 37.
3. **Limpiar deuda.** Las tres de la lista de abajo, sobre todo `is-compact`, que
   son 19 selectores que siempre aplican.

Y lo que **sí depende de vos**:

4. Capturas de los otros 6 proyectos y enlaces reales de contacto (`socials.js`
   todavía apunta a `https://github.com/` y `thiago@example.com`). **Es lo que más
   se nota**: seis de las siete tarjetas muestran un ícono en vez de una imagen.
5. Las preguntas 5, 6 y 8, que dejaste en pendiente, y las 36 y 37, que quedaron
   sin responder.

**Estado tipográfico**, que quedó repartido en cuatro tokens:

| Token | Fuente | Dónde |
|---|---|---|
| `--font-sans` | IBM Plex Sans | todo el texto corrido |
| `--font-mono` | IBM Plex Mono | rótulos técnicos, períodos, etiquetas |
| `--font-display` | Archivo (112% de ancho, 700) | **nombres de proyecto** |
| `--font-hero` | Chakra Petch (700/600) | **el nombre del hero** |
| `--font-pixel` | Silkscreen (400, cuerpo múltiplo de 8) | **el rol del hero** |

Los dos últimos son de esta tanda. `--font-display` y `--font-hero` están separados
a propósito —son dos decisiones distintas— pero eso deja el hero y Proyectos con
tipografías de título diferentes: ver la pregunta 29.

**Deuda menor anotada**, por si molesta más adelante:

- `is-compact` en Proyectos es una clase que ya no alterna: gobierna 19 selectores
  que siempre aplican. Limpiarla es mecánico pero toca mucho CSS a la vez. **En
  Trayectoria ya se hizo** (Fase 7) y sirve de modelo: fusionar cada regla del
  modificador con su regla base.
- La grilla mide 948px contra 869 de espacio bajo el navbar, así que al encuadrarla
  el navbar le solapa el título y se corta un poco la última fila. Es consistente
  con cómo se comportan las demás secciones, pero se puede cerrar achicando ~26px
  por fila.
- `scrollToSection` —los links del navbar— sigue usando el suavizado nativo de
  ~300ms, mientras los encuadres de Proyectos usan `desplazarA` a 900ms. Vos ya
  dijiste que está bien así (pregunta 25); queda anotado por si cambia.
- Con la flecha ya navegando, `scrollToSection` la usan tres lugares (navbar, botón
  "Ver mi trabajo" y flecha) y `desplazarA` solo Proyectos. Sigue siendo la decisión
  de la pregunta 25 y no molesta, pero ahora hay un consumidor más.
- El breakpoint móvil del hero (≤768px) está escrito pero **no lo pude verificar
  en vivo**: la herramienta con la que manejo el navegador dice que redimensiona
  pero el viewport se queda en 1920, así que la media query nunca llegó a
  dispararse. Las reglas son conservadoras —centra la ventana, baja el trazo a 3px
  y el corrimiento a 8px— pero conviene que lo mires en un teléfono real.

---

## 7. Preguntas abiertas

Para responder debajo de cada una. Se conservan los números originales para que no
se rompan las referencias del resto del documento; los huecos son preguntas que ya
se respondieron y se quitaron.

### 5. ¿Dónde van las letras en diagonal de vanho?

Texto inclinado en perspectiva que se endereza al pasar el mouse. Nunca se definió
dónde aplicarlo. Candidatos: los títulos de sección, los nombres de proyecto, el
nombre del hero, los links del navbar.

Solo hace falta responderla si querés que vaya **en el hero**, porque entonces
entra en la Fase 4. Si va en otro lado, puede esperar.

*Respuesta:* por ahora lo dejamos sin definir, probablemente sea lo ultimo que hagamos y cuando hagamos el resto de cosas, haremos una lista de posibles lugares donde hacerlo.

### 6. ¿Qué contenido tendría "as featured in"?

Es lo único que traba la Fase 6.2. ¿Premios, la FIUBAtón, la Olimpiada, medios?
Si no hay contenido real, lo más honesto es no ponerlo.

*Respuesta:*
no los definimos todavia, dejemeslo en pediente, podemos saltearlo por el momento.

### 8. ¿Las figuras siguen siendo cuatro o pasan a ser un sistema único?

Es lo que traba la Fase 6.1 —las figuras que se reorganizan para formar el logo—.
Hoy son decoración por sección; convertirlas en un sistema reorganizable es un
cambio de arquitectura, no un efecto.

*Respuesta:*
esto quizas seria mejor hacerlo en un rama individualmente, para ver como quedaria y que tan pesado se hace, ya que quizas ralentiza tanto la pagina que conviene no implementarlo

### 36. ¿Habilidades entra en el congelamiento de Trayectoria?

Congelaste Trayectoria para pensarle un rediseño completo. **Habilidades no la
nombraste**, pero comparte exactamente los mismos patrones —tarjeta genérica,
títulos fuera de `--font-display`— así que hacerla sola deja las dos secciones con
lenguajes distintos hasta que se resuelva la otra.

¿La congelo también y las pensamos juntas, o la hago ahora?

*Respuesta:*
