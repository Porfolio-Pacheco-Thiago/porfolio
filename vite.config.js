import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/porfolio/',
  build: {
    // Los subtítulos salen siempre como archivo, nunca en línea. Vite mete en el bundle
    // como `data:` todo asset de menos de 4 KB, y siete de las diez pistas pesan menos
    // que eso: quedaban dentro del JS, que las baja el primer visitante aunque no abra
    // ningún proyecto ni prenda los subtítulos. Como archivo se piden recién cuando el
    // `<track>` se activa, que es una vez cada tanto y en un idioma solo.
    //
    // Va como función y no como número para no cambiarle el criterio al resto de los
    // assets: `undefined` deja que Vite decida como siempre.
    assetsInlineLimit: (archivo) => (archivo.endsWith('.vtt') ? false : undefined),
  },
})
