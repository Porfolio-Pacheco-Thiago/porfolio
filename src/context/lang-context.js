import { createContext, useContext } from 'react';

export const LangContext = createContext(null);

export function useLang() {
    const context = useContext(LangContext);
    if (!context) throw new Error('useLang must be used within LangProvider');
    return context;
}
