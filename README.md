# Porfolio — Thiago Pacheco

Sitio personal: trayectoria, proyectos y habilidades. React 19 + Vite y nada más: sin
framework de UI, sin Tailwind, sin librería de animación. Tres dependencias de producción
—`react`, `react-dom` y `react-icons`— y todo el movimiento es CSS.

El reset vive en `src/index.css`, escrito a mano y con cada regla justificada. Antes lo
daba el preflight de Tailwind, que estaba instalado solo por eso: el proyecto nunca usó
una clase de utilidad.

En vivo: <https://porfolio-pacheco-thiago.github.io/porfolio/>

## Cómo levantarlo

Requiere **Node 20.19+ o 22.12+** (lo pide Vite 8).

```bash
npm install
npm run dev      # http://localhost:5173/porfolio/
```

Ojo con la ruta: el sitio se sirve desde el subpath `/porfolio/` porque es donde vive en
GitHub Pages, así que la raíz pelada redirige.

Con Docker, si no querés instalar Node:

```bash
docker compose up
```

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila a `dist/` |
| `npm run preview` | Sirve el `dist/` ya compilado |
| `npm run lint` | ESLint sobre `.js`/`.jsx` |
| `npm run lint:css` | Stylelint sobre `src/**/*.css` |
| `npm run check:css` | Busca reglas que anulen un `@media` sin querer |
| `npm run check:contenido` | Verifica que i18n y metadata estén sincronizados |

## Cómo está organizado

```
src/
  components/
    layout/            Navbar, Loader, SideBar, Footer
    secciones/         Hero, Journey, Projects, Skills
      journey/         Las piezas internas de una entrada del timeline
    ui/                Piezas reutilizables (aparatos, galería, figuras, logo…)
  hooks/               Media queries, movimiento reducido, carrusel, alternar
  lib/                 Índice de medios, scroll, pantalla de carga, medidas,
                       View Transitions
  data/                Metadata NO traducible, indexada por id
  i18n/                Los textos, uno por idioma
  styles/              primitivas.css — lo que comparte más de un componente
  assets/              Imágenes, videos y subtítulos
index.css              Tokens de tema y reset
scripts/               Los dos chequeos que corren en CI: cascada del CSS
                       y sincronía del contenido
```

Tres reglas que conviene no romper:

1. **Todo componente con estilos importa un `.css` que se llama como él y vive a su
   lado.** El único CSS compartido es el de `styles/`.
2. **Lo traducible va en `i18n/`, lo demás en `data/`,** ligados por el mismo `id`.
   `es.json` y `en.json` tienen que tener exactamente las mismas claves; eso lo verifica
   `npm run check:contenido`, que corre en CI.
3. **Un `@media` va siempre después de lo que anula.** Con la misma especificidad decide
   el orden, así que una regla escrita más abajo deja al `@media` sin efecto — y no se ve
   leyendo, porque están a cientos de líneas. Este proyecto ya se comió ese bug dos
   veces; ahora lo atrapa `npm run check:css`.

Antes de commitear, `npm run check` corre las cinco verificaciones de CI de una.

## Cómo agregar contenido

Los medios se indexan solos: `src/lib/media.js` levanta `src/assets/media/**` con
`import.meta.glob`, así que **alcanza con poner el archivo en la carpeta correcta**. No
hay ninguna lista que actualizar. Las convenciones de nombre están documentadas en
[`src/assets/media/README.md`](src/assets/media/README.md); en resumen:

| Nombre | Qué es |
| --- | --- |
| `logo.*` / `logo-grande.*` | La marca, cuadrada y apaisada |
| `portada.*` / `portada-claro.*` / `portada-animada.*` | La tapa, por tema y animada |
| `<video>-poster.webp` | El cuadro que se ve antes de reproducir |
| `<video>.es.vtt` / `<video>.en.vtt` | Los subtítulos, por idioma |

## Despliegue

Automático: cada push a `main` dispara el workflow de GitHub Pages
(`.github/workflows/deploy.yml`). El de CI corre lint y build en toda rama y PR.

## Sobre los comentarios del código

Están largos a propósito. Guardan mediciones que no se recuperan leyendo el código
—ratios de contraste, tamaños medidos en píxeles, por qué un valor quedó congelado— y
son la razón por la que se puede volver a tocar esto meses después. Si movés código,
llevate su comentario.
