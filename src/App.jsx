import { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/secciones/Hero';
import Journey from './components/secciones/Journey';
import Projects from './components/secciones/Projects';
import Skills from './components/secciones/Skills';
import Footer from './components/layout/Footer';
import Loader from './components/layout/Loader';
import { ATRIBUTO_CARGA, EVENTO_CARGA } from './lib/carga';
import { SIN_RIEL, LIENZO } from './lib/medidas';
import { useMediaQuery } from './hooks/useMediaQuery';
import Cursor from './components/ui/Cursor';
import SideBar from './components/layout/SideBar';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  // Vive acá y no en SideBar porque el botón "Contactame" del hero también lo abre
  const [contactoAbierto, setContactoAbierto] = useState(false);
  // Y acá porque decide tres cosas a la vez que están en ramas distintas del árbol: si
  // el riel se monta, qué hace el botón del hero y si el pie muestra el bloque de
  // contacto. Se escucha el cambio —a diferencia del `SIN_VIDEO` del hero, que se decide
  // una sola vez— porque acá no hay nada que cortar al recalcularlo: son tres piezas que
  // se montan o no, y girar el teléfono tiene que dejar la página coherente.
  const angosto = useMediaQuery(SIN_RIEL);

  // La escala del lienzo, en una variable que lee el `zoom` de `index.css`.
  //
  // Debajo del corte de `SIN_RIEL` vale 1: ahí manda el diseño adaptable, que está hecho
  // a medida de esos anchos. Escalar el de escritorio en un teléfono sería mostrarlo al
  // 20%, con el texto en 3px.
  //
  // Escucha `resize` en vez de leer `angosto` de arriba: no le alcanza con saber de qué
  // lado del corte está, necesita el ancho exacto en cada cuadro del arrastre.
  useEffect(() => {
    const aplicar = () => {
      const raiz = document.documentElement;
      const angosto = window.matchMedia(SIN_RIEL).matches;
      // `clientWidth` y no `innerWidth`: el segundo **incluye la barra de scroll**, así
      // que donde la barra ocupa lugar —Windows y Linux con barras clásicas, ~17px— el
      // lienzo se escalaba para llenar un ancho que no existía y se salía por la derecha
      // esos píxeles, que el `overflow-x: clip` recortaba. Con barras superpuestas
      // (macOS, Windows 11 por defecto) los dos valores coinciden y no cambia nada.
      const escala = angosto ? 1 : raiz.clientWidth / LIENZO;
      raiz.style.setProperty('--escala', String(escala));
      // El alto de una pantalla, medido **en unidades del lienzo**: escalado por `zoom`
      // vuelve a dar la ventana entera. No se usa `100dvh` para esto porque no está claro
      // que todos los navegadores midan un `dvh` contra el lienzo y no contra la ventana
      // real, y de eso depende que el hero llene la pantalla o se quede al 70%.
      //
      // En angosto la variable se **borra**, y el CSS cae en el `100dvh` de siempre. No es
      // un detalle: en iOS `dvh` es lo que evita el salto cuando se retrae la barra de
      // direcciones, y un número fijo en píxeles perdería eso.
      if (angosto) raiz.style.removeProperty('--alto-lienzo');
      else raiz.style.setProperty('--alto-lienzo', `${window.innerHeight / escala}px`);
    };
    aplicar();
    window.addEventListener('resize', aplicar);
    return () => window.removeEventListener('resize', aplicar);
  }, []);

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
      {/* Solo en ancho. En angosto el riel era una barra fija abajo que tapaba
          contenido y no se podía cerrar; sus enlaces viven ahora al final del pie. */}
      {!angosto && <SideBar abierto={contactoAbierto} onCambio={setContactoAbierto} />}
      <main>
        {/* El hero necesita saber cuándo terminó la carga: el texto animado del
            rol arranca al montarse, y detrás del loader no se vería. */}
        <Hero loading={loading} sinRiel={angosto} contactoAbierto={contactoAbierto} onContacto={setContactoAbierto} />
        <Journey />
        <Projects />
        <Skills />
      </main>
      <Footer sinRiel={angosto} contactoAbierto={contactoAbierto} onContacto={setContactoAbierto} />
    </div>
  );
}

export default App;
