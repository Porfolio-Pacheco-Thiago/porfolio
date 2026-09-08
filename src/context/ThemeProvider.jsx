import { useState, useLayoutEffect, useMemo, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { conVistaTransicion } from '../lib/vista-transicion';
import { ThemeContext } from './theme-context';

const STORAGE_KEY = 'portfolio-theme';

// Preferencia guardada > preferencia del sistema > oscuro
function initialTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(initialTheme);

    // useLayoutEffect y no useEffect: el atributo tiene que quedar aplicado de
    // forma síncrona dentro del flushSync de la View Transition, si no el
    // crossfade captura el "después" sin cambios. De paso evita el flash de
    // tema equivocado en el primer render.
    useLayoutEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        // Un crossfade compuesto en vez de transicionar background/color por CSS:
        // `color` se hereda, así que la versión CSS repintaba toda la página.
        // Cambiar el tema es un cambio global, el caso que las View Transitions
        // resuelven bien. Sin soporte (o con motion reducido), cambia directo.
        //
        // El `flushSync` va adentro porque el `useLayoutEffect` de abajo tiene que
        // aplicar el atributo de forma síncrona dentro del morph: si no, el crossfade
        // captura el "después" sin cambios.
        conVistaTransicion(
            () => flushSync(() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))),
        );
    }, []);

    const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
