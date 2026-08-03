# Los proyectos, uno por uno

Este archivo es la fuente de la sección Proyectos del portfolio. La tarjeta se escribe
**desde acá**, no al revés: primero se mira el código, se lo hace correr y se lo
documenta, y recién después se actualizan el texto, las etiquetas y las imágenes del
sitio.

El recorrido de cada proyecto, en orden:

1. **Docker** — un `Dockerfile` y un `docker-compose.yml` para poder levantarlo sin
   instalarle las herramientas a la máquina. Varios ya traen algo; se revisa antes de
   escribir uno.
2. **El front** — si lo tiene, qué se le puede mejorar y si conviene hacerlo.
3. **Resumen** — qué hace el proyecto, en prosa.
4. **Tecnologías** — leídas de los manifiestos y del código, no de memoria.
5. **Capturas** — se levanta y se fotografía. Van a
   `src/assets/media/projects/<id>/`.

El `id` de cada uno es el de `src/data/projects.js`, que es lo que ata este archivo con
el sitio.

## Estado

| id | Proyecto | Código | Docker | Front | Resumen | Tecnologías | Capturas |
|----|----------|--------|--------|-------|---------|-------------|----------|
| `melodia` | Melodía | 🔴 falta | | | | | ✅ ya tiene |
| `vibetrip` | VibeTrip | ✅ `~/Escritorio/proyectos/vibe-trip` | 🟡 uno por lado | 🔲 | 🔲 | 🔲 | 🔲 |
| `cassandra-engine` | Motor de Cassandra | ✅ `~/Escritorio/proyectos/cassandra-flight-app` | 🟡 compose + 5 Dockerfile | 🔲 | 🔲 | 🔲 | 🔲 |
| `specforge` | SpecForge | 🔴 falta | | | | | |
| `predictive-models` | Modelos Predictivos y Análisis con IA | 🔴 falta | | | | | ✅ portada animada |
| `monopoly` | Motor de Monopoly | ✅ `~/Escritorio/proyectos/monopoly` | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 |
| `zorro-ocas` | Zorro y Ocas (Assembly) | 🔴 falta | | | | | |

Sin ubicar todavía: `~/Escritorio/distribuidos-tp-money-laundering`, que no tiene
tarjeta en el portfolio — - hay que decidir si entra como una nueva.

---

<!-- A partir de acá, una sección por proyecto, con este esqueleto:

## <Nombre> (`<id>`)

**Dónde está.** Ruta o repositorio.

### Docker
Qué había y qué se agregó. Cómo se levanta, textual.

### El front
Qué tiene hoy y qué se le puede mejorar. Si no tiene, decirlo.

### Resumen
Qué hace y por qué es interesante. Es el borrador del texto de la tarjeta.

### Tecnologías
De dónde salió cada una — el manifiesto, el import, el archivo de configuración.

### Capturas
Qué se fotografió y dónde quedó cada archivo.
-->
