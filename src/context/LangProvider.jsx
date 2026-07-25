import { useState, useEffect, useMemo, useCallback } from 'react';
import { LangContext } from './lang-context';
import en from '../i18n/en.json';
import es from '../i18n/es.json';

const translations = { en, es };
const STORAGE_KEY = 'portfolio-lang';

// Preferencia guardada > idioma del navegador > inglés
function initialLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && Object.hasOwn(translations, stored)) return stored;
    return navigator.language?.startsWith('es') ? 'es' : 'en';
}

export function LangProvider({ children }) {
    const [lang, setLang] = useState(initialLang);

    useEffect(() => {
        // El <html lang> tiene que seguir al idioma activo (lectores de pantalla / SEO)
        document.documentElement.lang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
    }, [lang]);

    const toggleLang = useCallback(() => {
        setLang(prev => (prev === 'en' ? 'es' : 'en'));
    }, []);

    // Búsqueda por ruta de puntos: 'projects.items' -> translations[lang].projects.items
    const lookup = useCallback((path) => {
        return path.split('.').reduce((value, key) => value?.[key], translations[lang]);
    }, [lang]);

    // `t` para textos (cae en la ruta si falta), `getList` para arrays (cae en vacío)
    const t = useCallback((path) => lookup(path) ?? path, [lookup]);
    const getList = useCallback((path) => lookup(path) ?? [], [lookup]);

    const value = useMemo(
        () => ({ lang, toggleLang, t, getList }),
        [lang, toggleLang, t, getList]
    );

    return (
        <LangContext.Provider value={value}>
            {children}
        </LangContext.Provider>
    );
}
