import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Journey from './components/Journey';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Footer from './components/Footer';
import Loader from './components/Loader';
import { ATRIBUTO_CARGA, EVENTO_CARGA } from './lib/carga';
import Cursor from './components/ui/Cursor';
import SideBar from './components/SideBar';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  // Vive acá y no en SideBar porque el botón "Contactame" del hero también lo abre
  const [contactoAbierto, setContactoAbierto] = useState(false);

  // Ocultar el loader cuando la página terminó de cargar (con un mínimo y un tope).
  //
  // El mínimo se cuenta **desde que monta**, no como un retardo fijo después de
  // `load`: el logo del loader se dibuja solo y eso tarda 1s, así que con el
  // retardo de 500ms que había antes una carga rápida cortaba la animación por la
  // mitad. El tope queda por encima del mínimo para no cortarla él tampoco.
  useEffect(() => {
    const MINIMO = 1150;
    const desde = performance.now();
    let timer;
    const finish = () => {
      timer = setTimeout(() => setLoading(false),
        Math.max(0, MINIMO - (performance.now() - desde)));
    };
    if (document.readyState === 'complete') {
      finish();
    } else {
      window.addEventListener('load', finish);
    }
    const maxTimer = setTimeout(() => setLoading(false), 4000);
    return () => {
      window.removeEventListener('load', finish);
      clearTimeout(timer);
      clearTimeout(maxTimer);
    };
  }, []);

  // Nada del sitio se anima detrás del loader: la marca en `<html>` pausa por CSS
  // todas las animaciones de afuera, y el aviso al terminar destraba lo que no se
  // puede pausar (las figuras que entran desde el borde, el video del hero).
  // Ver `lib/carga.js`.
  //
  // Acá **solo se saca**. Ponerla desde un efecto no servía: React corre los
  // efectos de los hijos antes que los del padre, así que las figuras montadas
  // primero veían `<html>` todavía sin marca y arrancaban igual — la sonda mostró
  // 6 de 10 colándose. La marca viene puesta desde `index.html`, o sea desde el
  // primer byte.
  useEffect(() => {
    if (loading) return;
    document.documentElement.removeAttribute(ATRIBUTO_CARGA);
    window.dispatchEvent(new Event(EVENTO_CARGA));
  }, [loading]);

  // Animaciones de aparición: arrancan cuando termina la carga y se disparan al hacer scroll
  useEffect(() => {
    if (loading) return;
    const els = document.querySelectorAll('.reveal, .reveal-fade');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Atributo (no clase) para que React no lo pise al re-renderizar
            entry.target.setAttribute('data-revealed', 'true');
            observer.unobserve(entry.target);
          }
        });
      },
      // threshold 0 y no una fracción: `threshold` se mide sobre el elemento, no
      // sobre la pantalla, así que con 0.12 los elementos altos (el timeline mide
      // ~2750px) exigían cientos de píxeles propios visibles y aparecían tardísimo.
      // Con 0 dispara apenas asoma, sin importar su tamaño, y el -10% solo evita
      // que la animación arranque pegada al borde inferior.
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className="app">
      <Cursor />
      <Loader hidden={!loading} />
      <Navbar />
      <SideBar abierto={contactoAbierto} onCambio={setContactoAbierto} />
      <main>
        {/* El hero necesita saber cuándo terminó la carga: el texto animado del
            rol arranca al montarse, y detrás del loader no se vería. */}
        <Hero loading={loading} contactoAbierto={contactoAbierto} onContacto={setContactoAbierto} />
        <Journey />
        <Projects />
        <Skills />
      </main>
      <Footer contactoAbierto={contactoAbierto} onContacto={setContactoAbierto} />
    </div>
  );
}

export default App;
