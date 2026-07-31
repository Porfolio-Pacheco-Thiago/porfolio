# Multimedia por tarjeta

Cada subcarpeta corresponde a una tarjeta y usa el mismo `id` que el código.
Subí acá las fotos/videos de cada una (cualquier nombre: `1.jpg`, `2.png`, `demo.mp4`, etc.).

## Proyectos — `projects/<id>/`
| id | Proyecto |
|----|----------|
| `melodia` | Melodía |
| `vibetrip` | VibeTrip |
| `cassandra-engine` | Cassandra Engine |
| `specforge` | SpecForge |
| `predictive-models` | Predictive Models & AI Analysis |
| `monopoly` | Monopoly Game Engine |
| `zorro-ocas` | Zorro y Ocas (Assembly) |

## Línea de tiempo — `timeline/<id>/`
| id | Tarjeta |
|----|---------|
| `uba` | Universidad de Buenos Aires |
| `lovelytics` | Lovelytics |
| `fiubaton` | FIUBAtón 2025 |
| `pellegrini` | Carlos Pellegrini |
| `olympiad` | Olimpiada Nacional de Informática |

## Notas
- **Ya está conectado.** `src/lib/media.js` indexa esta carpeta con
  `import.meta.glob` y `ui/Gallery.jsx` la dibuja. Alcanza con dejar los
  archivos acá: no hay que tocar código. La carpeta que siga vacía muestra el
  marcador de posición de antes, así que se puede ir llenando de a una.
- Formatos: **imágenes** `.jpg` / `.png` / `.webp` / `.gif` / `.svg`,
  **videos** `.mp4` / `.webm`.
- **El orden es alfabético por nombre de archivo.** Si importa cuál va primero,
  numeralos: `1-mockup.webp`, `2-demo.mp4`.
- **Tapa de la tarjeta:** el archivo que se llame **`cover.*`** (`cover.webp`,
  `cover.jpg`…) es la tapa de la tarjeta en `Proyectos`. Si no hay ninguno, se usa
  la primera imagen por orden alfabético, y si solo hay videos, la portada del
  primero. Conviene que sea **apaisada**: en modo compacto esa franja mide ~66px
  de alto y una captura vertical queda reducida a una tirita.
- **Logos de la línea de tiempo:** en `timeline/<id>/` los archivos que empiezan
  con **`logo`** no son parte de la galería, tienen dos lugares propios:
  - el **cuadrado** (`logo.png`, `logo-pelle.jpeg`) es la miniatura del costado de
    la tarjeta cerrada. Si hay varios gana el de nombre más corto.
  - el **apaisado**, que además lleva `grande` o `largo` en el nombre
    (`logo-grande.jpeg`, `logo-fiuba-largo.png`), se muestra solo y de lado a lado
    arriba de la galería cuando la tarjeta está abierta. Si no hay, no se muestra
    ninguno: el cuadrado estirado a todo el ancho queda como una mancha.

  Todo lo demás de la carpeta son las fotos del evento y van en la grilla.
- **Portadas de video:** un archivo llamado `<video>-poster.webp` no se dibuja
  como un elemento más — se usa como `poster` del video con ese mismo nombre
  (`shazam.mp4` → `shazam-poster.webp`). Sin portada, el video se ve como un
  rectángulo vacío hasta que le dan play, porque no se precarga.
- El `.gitkeep` de cada carpeta es solo para que la carpeta vacía quede en git;
  podés dejarlo o borrarlo cuando subas archivos.

## Peso

Los videos se sirven desde el repo, así que **hay que comprimirlos antes de
subirlos**. Los de Melodía venían a 13 Mbps y pesaban 207 MB entre los tres;
GitHub además rechaza cualquier archivo de más de 100 MB. Con esto quedaron en
5.3 MB en total, sin diferencia visible —los screencasts comprimen muchísimo—:

```bash
ffmpeg -i original.mp4 -c:v libx264 -crf 28 -preset slow -vf "scale=720:-2" \
  -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart salida.mp4

# y su portada, de un frame representativo
ffmpeg -ss 15 -i salida.mp4 -frames:v 1 -vf "scale=540:-2" \
  -c:v libwebp -quality 78 salida-poster.webp
```

Los originales sin comprimir **no van al repo**: quedan en
`~/Escritorio/melodia-originales/`. Una vez commiteados serían parte del
historial para siempre, aunque después se borren.
