import { useEffect, useRef } from 'react';

/**
 * Figura de alambre decorativa que gira lentamente en 3D.
 *
 * @param {object} props
 * @param {'sphere'|'cube'|'tetrahedron'|'pyramid'} [props.kind='sphere']
 * @param {string} [props.className]
 * @param {number} [props.size=800]      Lado o diámetro, en px.
 * @param {number} [props.line=3]        Grosor de línea, en px.
 * @param {number} [props.seconds=120]   Duración de una vuelta.
 * @param {number} [props.tiltX=18]      Inclinación hacia el observador. En la
 *                                       esfera es lo que abre los paralelos: a
 *                                       0° se ven de canto y parecen no estar.
 * @param {number} [props.tiltZ=-12]     Ladeo del eje.
 * @param {number} [props.meridians=10]  Solo esfera.
 * @param {number} [props.parallels=7]   Solo esfera.
 * @param {number} [props.detail=0]      Divisiones intermedias en cubo,
 *                                       pirámide y tetraedro. A tamaño chico
 *                                       conviene 0: se empasta.
 * @param {boolean} [props.autoSpin=true] Si gira sola al entrar en pantalla.
 *                                        En `false` no observa nada y el giro
 *                                        lo decide el CSS de quien la use.
 * @param {'3d'|'flat'} [props.spin='3d'] Cómo gira.
 *   - `3d`: rotación real en el espacio. El navegador re-rasteriza cada hijo en
 *     cada frame porque su tamaño proyectado cambia. Solo apto para tamaños
 *     chicos.
 *   - `flat`: la geometría 3D se dibuja una vez y lo que rota es el contenedor,
 *     en 2D. Una rotación 2D sobre una capa ya rasterizada es pura composición.
 *     Obligatorio para las figuras grandes.
 *
 * @example
 * <WireFigure kind="cube" size={880} seconds={150} />
 * <WireFigure kind="sphere" size={18} meridians={6} parallels={5} autoSpin={false} />
 *
 * @remarks
 * El conteo de elementos se mantiene bajo a propósito: con `preserve-3d` el
 * navegador re-rasteriza cada hijo en cada frame, porque su tamaño proyectado
 * cambia al girar. Por eso el cubo son 6 caras y no 12 aristas, y el octaedro
 * 3 rombos cruzados y no 12 aristas.
 */
export default function WireFigure({
    kind = 'sphere', className, size = 800, line = 3, seconds = 120,
    tiltX = 18, tiltZ = -12, meridians = 10, parallels = 7, detail = 0, autoSpin = true,
    spin = '3d',
}) {
    const ref = useRef(null);

    useEffect(() => {
        if (!autoSpin) return;
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([e]) => {
                el.toggleAttribute('data-visible', e.isIntersecting);
                // `data-entered` se engancha una sola vez: la entrada es un
                // gesto de bienvenida, no algo que se repita en cada scroll.
                if (e.isIntersecting) el.setAttribute('data-entered', '');
            },
            { rootMargin: '5% 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [autoSpin]);

    return (
        <div
            className={`wire wire-${kind} spin-${spin} ${className ?? ''}`}
            ref={ref}
            aria-hidden="true"
            style={{ '--wire-size': `${size}px`, '--wire-line': `${line}px` }}
        >
            {/* En modo `flat` es esta capa la que gira, en 2D, con todo lo de
                adentro ya rasterizado. En modo `3d` gira .wire-spin. */}
            <div className="wire-turn" style={{ '--wire-seconds': `${seconds}s` }}>
                <div className="wire-tilt" style={{ '--tx': `${tiltX}deg`, '--tz': `${tiltZ}deg` }}>
                    <div className="wire-spin" style={{ '--wire-seconds': `${seconds}s` }}>
                        {kind === 'sphere' && <Sphere meridians={meridians} parallels={parallels} />}
                        {kind === 'cube' && <Cube detail={detail} />}
                        {kind === 'tetrahedron' && <Tetrahedron detail={detail} />}
                        {kind === 'pyramid' && <Pyramid detail={detail} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Meridianos (verticales) + paralelos (horizontales, perpendiculares) */
function Sphere({ meridians, parallels }) {
    const aros = Array.from({ length: parallels }, (_, k) => {
        const lat = (Math.PI / 2) * ((2 * k) / (parallels - 1) - 1) * 0.84;
        return { s: Math.cos(lat).toFixed(4), y: (-Math.sin(lat)).toFixed(4) };
    });
    return (
        <>
            {Array.from({ length: meridians }, (_, i) => (
                <span key={`m${i}`} className="wire-ring wire-meridian"
                    style={{ '--rot': `${(i * 180) / meridians}deg` }} />
            ))}
            {aros.map(({ s, y }, k) => (
                <span key={`p${k}`} className="wire-ring wire-parallel"
                    style={{ '--scale': s, '--lift': y }} />
            ))}
        </>
    );
}

/* Caras con borde en vez de aristas sueltas, más planos intermedios paralelos
   a cada par de caras: son el equivalente a los paralelos de la esfera. */
function Cube({ detail = 0 }) {
    const R = 0.38;
    const ejes = ['rotateY(0deg)', 'rotateY(90deg)', 'rotateX(90deg)'];
    const piezas = [];
    ejes.forEach((eje, e) => {
        // las dos caras del eje
        piezas.push(<span key={`c${e}a`} className="wire-face" style={{ '--face': eje, '--z': R }} />);
        piezas.push(<span key={`c${e}b`} className="wire-face" style={{ '--face': eje, '--z': -R }} />);
        // los cortes de adentro
        for (let i = 1; i <= detail; i++) {
            const z = R * ((2 * i) / (detail + 1) - 1);
            piezas.push(
                <span key={`c${e}i${i}`} className="wire-face wire-inner"
                    style={{ '--face': eje, '--z': z.toFixed(4) }} />
            );
        }
    });
    return piezas;
}

/**
 * Arista genérica entre dos puntos, en unidades relativas al tamaño.
 * La barra nace en `p`, mide lo que el vector, y se orienta con dos giros.
 */
function arista(p, q, i) {
    const v = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
    const largo = Math.hypot(...v);
    return (
        <span
            key={i}
            className="wire-bar"
            style={{
                '--px': p[0].toFixed(4), '--py': p[1].toFixed(4), '--pz': p[2].toFixed(4),
                '--len': largo.toFixed(4),
                '--ry': `${((Math.atan2(-v[2], v[0]) * 180) / Math.PI).toFixed(2)}deg`,
                '--rz': `${((Math.atan2(v[1], Math.hypot(v[0], v[2])) * 180) / Math.PI).toFixed(2)}deg`,
            }}
        />
    );
}

/* Tetraedro: base triangular + vértice. Cuatro caras, seis aristas. */
function Tetrahedron({ detail = 0 }) {
    const R = 0.52;    // radio de la base
    const yb = 0.26;   // altura de la base (hacia abajo)
    const ya = -0.42;  // altura del vértice (hacia arriba)
    const base = [90, 210, 330].map(g => {
        const r = (g * Math.PI) / 180;
        return [R * Math.cos(r), yb, R * Math.sin(r)];
    });
    const vertice = [0, ya, 0];
    const piezas = [
        ...base.map((p, i) => arista(p, base[(i + 1) % 3], `b${i}`)),
        ...base.map((p, i) => arista(vertice, p, `l${i}`)),
    ];
    // Secciones triangulares intermedias, encogiéndose hacia el vértice
    for (let k = 1; k <= detail; k++) {
        const t = k / (detail + 1);
        const corte = base.map(p => [
            p[0] + (vertice[0] - p[0]) * t,
            p[1] + (vertice[1] - p[1]) * t,
            p[2] + (vertice[2] - p[2]) * t,
        ]);
        corte.forEach((p, i) => piezas.push(arista(p, corte[(i + 1) % 3], `s${k}-${i}`)));
    }
    // Nervaduras verticales: suben desde puntos repartidos en cada arista de la
    // base hasta el vértice. Son a los cortes horizontales lo que los meridianos
    // a los paralelos de la esfera.
    // Sin subdivisiones pedidas, tampoco nervaduras: a 28px empastan la figura.
    const porCara = detail > 0 ? Math.max(1, detail - 1) : 0;
    base.forEach((p, i) => {
        const q = base[(i + 1) % 3];
        for (let n = 1; n <= porCara; n++) {
            const t = n / (porCara + 1);
            const punto = [0, 1, 2].map(j => p[j] + (q[j] - p[j]) * t);
            piezas.push(arista(punto, vertice, `n${i}-${n}`));
        }
    });
    return piezas;
}

/* Base cuadrada + 4 aristas laterales que suben al vértice. Cada arista es una
   barra alineada por rotación: se calcula el vector del vértice a la esquina y
   se traduce a dos ángulos. */
function Pyramid({ detail = 0 }) {
    const s = 0.62;   // media base, relativa al tamaño
    const h = 0.72;   // altura total, relativa al tamaño
    const esquinas = [[s, s], [s, -s], [-s, -s], [-s, s]];
    // Cortes horizontales: cuadrados que se achican al subir, igual que los
    // paralelos de la esfera se achican hacia los polos.
    const cortes = Array.from({ length: detail }, (_, i) => {
        const t = (i + 1) / (detail + 1);
        return { esc: (1 - t).toFixed(4), alt: (0.36 - t * h).toFixed(4) };
    });
    return (
        <>
            <span className="wire-base" />
            {cortes.map(({ esc, alt }, i) => (
                <span key={`x${i}`} className="wire-slice"
                    style={{ '--scale': esc, '--lift': alt }} />
            ))}
            {/* Nervaduras verticales desde el medio de cada lado de la base */}
            {detail > 0 && esquinas.map(([x, z], i) => {
                const [x2, z2] = esquinas[(i + 1) % 4];
                const mx = (x + x2) / 2, mz = (z + z2) / 2;
                const vx = -mx, vy = h, vz = -mz;
                return (
                    <span
                        key={`n${i}`}
                        className="wire-edge wire-rib"
                        style={{
                            '--len': Math.hypot(vx, vy, vz).toFixed(4),
                            '--ry': `${((Math.atan2(-vz, vx) * 180) / Math.PI).toFixed(2)}deg`,
                            '--rz': `${((Math.atan2(vy, Math.hypot(vx, vz)) * 180) / Math.PI).toFixed(2)}deg`,
                            '--up': (-h / 2).toFixed(4),
                        }}
                    />
                );
            })}
            {esquinas.map(([x, z], i) => {
                const vx = x, vy = h, vz = z;
                const largo = Math.hypot(vx, vy, vz);
                const giroY = (Math.atan2(-vz, vx) * 180) / Math.PI;
                const giroZ = (Math.atan2(vy, Math.hypot(vx, vz)) * 180) / Math.PI;
                return (
                    <span
                        key={i}
                        className="wire-edge"
                        style={{
                            '--len': largo.toFixed(4),
                            '--ry': `${giroY.toFixed(2)}deg`,
                            '--rz': `${giroZ.toFixed(2)}deg`,
                            '--up': (-h / 2).toFixed(4),
                        }}
                    />
                );
            })}
        </>
    );
}
