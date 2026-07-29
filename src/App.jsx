import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Journey from './components/Journey';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Cursor from './components/ui/Cursor';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);

  // Ocultar el loader cuando la página terminó de cargar (con un mínimo y un tope)
  useEffect(() => {
    let timer;
    const finish = () => {
      timer = setTimeout(() => setLoading(false), 500);
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
      <main>
        {/* El hero necesita saber cuándo terminó la carga: el texto animado del
            rol arranca al montarse, y detrás del loader no se vería. */}
        <Hero loading={loading} />
        <Journey />
        <Projects />
        <Skills />
      </main>
      <Footer />
    </div>
  );
}

export default App;
