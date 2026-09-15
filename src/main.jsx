import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './context/ThemeProvider';
import { LangProvider } from './context/LangProvider';
import App from './App';
import { iniciarLienzo } from './lib/medidas';
import './index.css';
import './styles/primitivas.css';

// Antes de montar nada: deja `--escala` puesta para el primer render, así ningún
// componente puede leerla vacía —era eso lo que dejaba al cursor propio dibujándose
// lejos del puntero— y la página no pasa un cuadro dibujada a tamaño de lienzo.
iniciarLienzo();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <LangProvider>
        <App />
      </LangProvider>
    </ThemeProvider>
  </StrictMode>,
);
