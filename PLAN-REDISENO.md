# Plan de rediseño

Documento de trabajo derivado de `links.md`. Traduce cada referencia a cambios
concretos sobre el código que ya existe, marca los conflictos entre ideas y
lista lo que falta para poder empezar.

---

## 1. De dónde partimos

Lo que hoy toca cada una de estas ideas:

| Pieza actual | Archivo | Qué hace |
|---|---|---|
| Pantalla de carga | `components/Loader.jsx` | Logo PNG con pulso + barra deslizante |
| Hero | `components/Hero.jsx` | Dos columnas: texto a la izquierda, video con alfa a la derecha |
| Rol animado | `components/ui/AnimatedText.jsx` | Aparición letra por letra, CSS puro |
| Fondo | `index.css` → `body::before` | Seis degradados radiales verdes, fijos |
| Figuras de alambre | `components/ui/WireFigure.jsx` | Pirámide, cubo, tetraedro y esfera; una por sección + una por link del navbar |
| Timeline | `components/Journey.jsx` | Doble eje, modo compacto + expandible |
| Proyectos | `components/Projects.jsx` | Grilla, modo compacto + expandible |
| Flecha de scroll | `Hero.css` → `.scroll-indicator` | Línea vertical animada |

Reglas vigentes que el rediseño tiene que respetar o revocar explícitamente:

- **Una sección por pantalla.** Recién implementada. Varias de estas referencias
  presentan contenido mucho más alto.
- **Presupuesto de rendimiento.** Ya tuvimos un problema térmico real. Las
  figuras grandes rotan en 2D sobre una capa ya rasterizada justamente por eso.
  Varias de estas ideas se implementan normalmente con canvas o WebGL, que
  redibujan cada frame.
- **Accesibilidad.** Contraste AA, foco visible, `prefers-reduced-motion`.

---

## 2. Qué implica cada referencia

### 2.1 david — el logo se dibuja solo al cargar

**Qué se ve:** el logo se traza como si lo dibujaran, en vez de aparecer.

**Cómo se hace:** el trazo se anima con `stroke-dasharray` y `stroke-dashoffset`
sobre un `<path>`. Es barato: anima una sola propiedad sobre un SVG.

**🔴 Bloqueo:** el logo hoy es **PNG**, un mapa de píxeles. No tiene trazos que
animar. Hace falta la versión vectorial (`.svg`) del monograma TP.

**Toca:** `Loader.jsx`, `Loader.css`, `assets/`.

---

### 2.2 dunks — el texto se forma con las letras animándose

**Qué se ve:** un "welcome" cuyas letras entran de forma dinámica.

**Estado:** **ya lo tenemos.** `AnimatedText` hace exactamente eso y lo usa el
rol del hero. Es CSS puro, sin dependencias.

**Qué faltaría:** aplicarlo también en la pantalla de carga y/o al nombre del
hero, y quizá enriquecer la entrada (hoy es subir + aparecer; se le puede sumar
desenfoque o rotación por letra).

**Toca:** `AnimatedText.jsx`, `Loader.jsx`, `Hero.jsx`.

**Nota:** esto y el punto anterior comparten pantalla. Hay que decidir si la
carga muestra **logo dibujándose**, **texto formándose**, o los dos en secuencia.

---

### 2.3 tamalsen — sol verde que ilumina, y fuera las manchas

**Qué se ve:** una fuente de luz detrás que ilumina la escena, incluidos los
objetos y el suelo.

**Cómo se haría acá:** un degradado radial grande y brillante detrás de todo,
más sombras y realces coherentes con esa dirección de luz en las figuras y las
tarjetas. Sin blur de pantalla completa: eso ya nos costó caro.

**⚠️ Conflicto:** pedís sacar las manchas verdes, que son justamente el fondo
actual (`body::before`). El sol las **reemplaza**, no convive con ellas.

**Pregunta abierta:** ¿el sol es fijo detrás de todo el sitio, o vive solo en el
hero? Si es fijo, hay que decidir cómo interactúa con el modo claro, donde un
"sol sobre fondo negro" no aplica.

**Además de la referencia:**
- *Flecha animada hacia abajo* → ya existe `.scroll-indicator`; habría que
  rediseñarla como flecha.
- *"As featured in"* → **no tenemos ese contenido.** ¿Qué iría ahí? ¿Premios,
  la FIUBAtón, la Olimpiada, medios?
- *Celular 3D girando con Melodía en pantalla* → **requiere capturas reales de
  la app.** Hoy hay cero archivos en `assets/media/`.

**Toca:** `index.css`, todas las secciones (sombras), `Hero.jsx`.

---

### 2.4 charles — figuras que entran, reaccionan y forman el logo

Es la referencia más ambiciosa. Son cuatro comportamientos distintos:

1. **Entrada desde afuera hacia el centro al cargar.** Barato: animación de
   `transform` una sola vez.
2. **Reacción al pasar el mouse.** Barato si es escala o rotación.
3. **Al pasar el mouse por ciertas palabras, las figuras se reacomodan y forman
   el logo.** 🔴 **Caro y complejo.** Implica que las figuras dejen de ser
   decoración por sección y pasen a ser un sistema único que puede reorganizarse.
   Con nuestras figuras CSS 3D, "formar el logo" significa mover piezas a
   posiciones calculadas: es un cambio de arquitectura, no un efecto.
4. **Resaltar la figura de la sección al tocar su link en el navbar.** Fácil, y
   **ya tenemos la mitad**: la figura del navbar gira cuando su link está activo.
   Faltaría que también reaccione la figura grande de esa sección.

**Recomendación:** 1, 2 y 4 son abordables ya. El 3 conviene tratarlo aparte y
decidir si vale su costo.

**Toca:** `WireFigure.jsx`, `Navbar.jsx`, todas las secciones.

---

### 2.5 vanho — letras en diagonal que se enderezan al pasar el mouse

**Qué se ve:** texto inclinado en perspectiva hacia el fondo; al pasar el mouse
se pone más paralelo a la pantalla y cambia de color.

**Cómo se hace:** `rotateX`/`rotateY` con `perspective`, y una transición al
hacer hover. Barato.

**🟡 Vos mismo anotaste que no sabés dónde aplicarlo.** Opciones que veo:
- Los títulos de sección (hoy con degradado).
- Los nombres de los proyectos.
- El nombre del hero.
- Los links del navbar.

**Toca:** depende de la respuesta.

---

### 2.6 larson — hero enmarcado y proyectos con foto

**Hero:** el nombre dentro de un recuadro, con su tipografía y color, adaptado a
nuestros tonos. Sin los stickers.

**⚠️ Conflicto fuerte:** nuestro hero es de **dos columnas con el video de alfa
a la derecha**. Un hero centrado y enmarcado alrededor del nombre no deja lugar
obvio para ese video. Hay que decidir si el video sobrevive, se mueve o se va.

**Proyectos:** un recuadro con la foto, la tipografía del nombre, y un recuadro
más chico abajo a la izquierda de cada proyecto.

**⚠️ Dos conflictos:**
- **Necesita fotos.** Hoy las galerías son marcadores de posición vacíos.
- **Choca con "una sección por pantalla".** Presentar 7 proyectos con foto
  grande no entra en una pantalla. O se revoca la regla para esta sección, o se
  muestran pocos con paginación, o las tarjetas quedan chicas y crecen al abrir.

**Toca:** `Hero.jsx`, `Hero.css`, `Projects.jsx`, `Projects.css`.

---

## 3. Conflictos entre referencias

| Conflicto | Entre | Hay que elegir |
|---|---|---|
| Qué hay detrás de todo | tamalsen (sol) vs. actual (manchas) | El sol reemplaza las manchas |
| Qué protagoniza el hero | larson (nombre enmarcado) vs. actual (video con alfa) | Si el video queda, se mueve o se va |
| Qué pasa al cargar | david (logo se dibuja) vs. dunks (letras se forman) | Uno, otro, o los dos en secuencia |
| Rol de las figuras | charles (sistema único interactivo) vs. actual (decoración por sección) | Si se convierten en un sistema |
| Alto de las secciones | larson/tamalsen (contenido alto) vs. regla de una pantalla | Si la regla sigue valiendo |

---

## 4. Plan por pasos

Ordenado por dependencias y por relación entre esfuerzo y resultado visible.
Cada fase deja el sitio funcionando.

### Fase 0 — Insumos (te toca a vos)

Sin esto, tres de las seis referencias no se pueden hacer.

1. **Logo en SVG.** Para que se dibuje solo.
2. **Capturas de proyectos** en `src/assets/media/projects/<id>/`. Para los
   marcos de larson y el celular de tamalsen.
3. **Definir el contenido de "as featured in"**, si va.
4. Opcional pero pendiente de antes: URLs reales de repos y redes.

### Fase 1 — Fondo: el sol verde

1. Reemplazar los seis degradados de `body::before` por un sol: un radial grande
   y brillante, posicionado alto y centrado o al costado.
2. Definir su comportamiento en tema claro.
3. Ajustar las figuras de alambre para que su iluminación sea coherente con esa
   dirección de luz (borde superior más claro).
4. Verificar que no se reintroduce costo de repintado.

**Depende de:** decidir si el sol es global o solo del hero.

### Fase 2 — Pantalla de carga

1. Incorporar el SVG del logo.
2. Animar su trazo con `stroke-dashoffset`.
3. Si va también el texto formándose, encadenarlo después del logo.
4. Ajustar la duración a la carga real, respetando el tope actual de 4s.

**Depende de:** Fase 0.1.

### Fase 3 — Figuras: entrada e interacción

1. Entrada desde fuera de pantalla hacia su posición, una sola vez al cargar.
2. Reacción al pasar el mouse (escala o cambio de velocidad).
3. Que la figura grande de una sección reaccione cuando se toca su link en el
   navbar, complementando lo que ya hace la figura chica.

**No incluye** el armado del logo con las figuras: ver Fase 6.

### Fase 4 — Hero

1. Definir la composición: recuadro alrededor del nombre al estilo larson.
2. Resolver qué pasa con el video de alfa.
3. Rediseñar la flecha de scroll.
4. Evaluar acá las letras en diagonal de vanho, si el hero es el lugar elegido.

**Depende de:** decidir el destino del video.

### Fase 5 — Proyectos

1. Rediseñar la tarjeta al estilo larson: marco con foto, tipografía del nombre,
   recuadro chico abajo a la izquierda.
2. Resolver la tensión con la regla de una sección por pantalla.
3. Si va el celular 3D de Melodía, tratarlo como pieza aparte del resto.

**Depende de:** Fase 0.2 y de la decisión sobre la regla de altura.

### Fase 6 — Ambicioso, a decidir aparte

1. Las figuras se reorganizan para formar el logo al pasar el mouse por ciertas
   palabras.
2. "As featured in".
3. Celular 3D girando.

---

## 4-bis. Decisiones tomadas

- **Fondo:** el sol es **fijo detrás de todo el sitio**, no solo del hero, y
  reemplaza las manchas.
- **Sol en tema claro:** el mismo sol, más tenue. No desaparece ni se invierte.
- **Hero:** el video con alfa **se queda a la derecha**, tal como está. El marco
  al estilo larson envuelve **solo el nombre y el rol**, en la columna
  izquierda. O sea: se conserva la composición de dos columnas y el marco es un
  elemento nuevo dentro de la izquierda.
- **Proyectos:** **manda la regla de una sección por pantalla.** Las tarjetas van
  al estilo larson pero en chico, y al abrir una crece con su foto grande. Es
  extender el modo compacto que ya funciona, no reemplazarlo.
- **Logo:** lo vectorizo yo desde el PNG. Va a ser una reinterpretación del
  monograma, no una copia exacta.
- **Orden:** se arranca por el fondo.

```
┌──────────────────────┬─────────────┐
│  ╔════════════════╗  │             │
│  ║ Thiago Pacheco ║  │    video    │
│  ║ Software Eng.  ║  │    (alfa)   │
│  ╚════════════════╝  │             │
│  bio, botones, redes │             │
└──────────────────────┴─────────────┘
```

Esto además resuelve el conflicto que había marcado entre larson y el hero
actual: no hay que elegir, conviven.

## 5. Preguntas abiertas

Numeradas para poder responder por número.

1. ~~¿Tenés el logo en SVG?~~ **Resuelto: se vectoriza desde el PNG.**
2. ~~¿El sol es fijo? ¿Y en tema claro?~~ **Resuelto: fijo en todo el sitio,
   y en claro el mismo sol pero más tenue.**
3. ~~¿El video sobrevive?~~ **Resuelto: se queda a la derecha; el marco va
   solo alrededor del nombre y el rol, a la izquierda.**
4. ~~¿Sigue valiendo la regla de una sección por pantalla?~~ **Resuelto: sí.
   Tarjetas chicas que crecen al abrirse.**
5. **¿Dónde van las letras en diagonal de vanho?**
6. **¿Qué contenido tendría "as featured in"?**
7. **¿Las manchas se van del todo, o el sol convive con algo de textura?**
8. **¿Las figuras siguen siendo cuatro (una por sección) o pasan a ser un
   sistema único que se reorganiza?**
9. **¿Cuál es la prioridad?** Si hubiera que elegir dos referencias para
   empezar, ¿cuáles?
