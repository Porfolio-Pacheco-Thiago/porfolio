import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `.claude/skills` trae scripts de terceros (impeccable son 88 .mjs); no es
  // código nuestro y no tiene por qué cumplir nuestras reglas.
  globalIgnores(['dist', '.claude']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // Atrapa automáticamente los problemas de accesibilidad que hasta ahora
      // veníamos encontrando a mano.
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Usar un `const` antes de su declaración no es un error de sintaxis: es un
      // ReferenceError en tiempo de ejecución, porque `const` se iza sin valor. Y no se ve
      // leyendo cuando hay treinta líneas de comentario en el medio. Ya pasó dos veces en
      // este proyecto —`ORDEN` antes que `LETRAS` en `NombreTrazado`, y el hook del
      // reproductor antes que `medio` en `DemoDispositivo`, que dejó la página en blanco
      // con el build y el lint en verde—.
      //
      // Dos exclusiones, y las dos son patrones que el proyecto usa a propósito:
      //
      // - `functions: false` — una declaración `function` sí se iza entera, y los ayudantes
      //   van al final del archivo, después del componente que los usa.
      // - `variables: false` — no marca una referencia cuya declaración está en un **ámbito
      //   de arriba**. Es el caso de `NombreTrazado`: el componente nombra `LETRAS`, que se
      //   declara más abajo en el módulo, y eso funciona porque el módulo termina de
      //   evaluarse antes de que nadie renderice. Lo que sí queda marcado es el caso que
      //   rompe: usar algo antes de declararlo **en el mismo ámbito**, que es lo que pasó
      //   en `DemoDispositivo`.
      'no-use-before-define': ['error', { functions: false, classes: true, variables: false }],
    },
  },
  {
    // Lo de `scripts/` y los archivos de configuración corren en Node, no en el
    // navegador: tienen `process` y no tienen `window`. Y no son componentes, así que
    // las reglas de React tampoco vienen al caso.
    files: ['scripts/**/*.js', '*.config.js'],
    languageOptions: { globals: globals.node },
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
