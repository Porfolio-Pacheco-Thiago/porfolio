// Metadata estructural del timeline: no es traducible, así que vive acá y no en i18n.
//
// sort:            orden cronológico como YYYYMM (mayor = más reciente = más arriba).
// category:        eje en el que se dibuja la entrada ('academic' a la izquierda, 'work' a la derecha).
// bannerFondo:     con qué se rellenan los costados del logo apaisado de la tarjeta
//                  abierta. El logo entra completo —no se recorta— en una caja más
//                  ancha que él, y lo que sobra a los lados se pinta con esto.
//
//                  El valor sale de **medir el archivo**: el color de sus columnas de
//                  borde izquierda y derecha, que son las que quedan pegadas al
//                  relleno. Por defecto blanco puro, que es lo que dieron UBA, docencia
//                  y Lovelytics; acá abajo van solo los que dieron otra cosa. Un
//                  `'transparent'` deja el logo directo sobre la ventana.
//
// Las entradas sin metadata caen al fondo del timeline sobre el eje académico.
export const journeyMeta = {
    uba: { sort: 202607, category: 'academic' },        // Graduación UBA — julio 2026
    lovelytics: { sort: 202512, category: 'work' },     // Dic 2025 — Presente
    teaching: { sort: 202511, category: 'work' },       // Docencia FIUBA — inició antes que Lovelytics
    // Académico pese a ser una competencia. Blanco crema, no puro: el 100% de sus
    // columnas de borde da este valor
    fiubaton: { sort: 202510, category: 'academic', bannerFondo: '#f7f7f7' },
    // Secundario 2017–2021 (egreso). Azul del escudo, uniforme en los dos bordes
    pellegrini: { sort: 202112, category: 'academic', bannerFondo: '#20394f' },
    // Olimpiada de Informática — 2020 (año a confirmar). El único que no tiene **un**
    // color: su fondo de circuitos va de #191b3f a la izquierda a #1c1d49 a la derecha,
    // así que el relleno los repite en degradado y cada costado empalma con el borde
    // que tiene al lado en vez de dejar un escalón.
    olympiad: {
        sort: 202000, category: 'academic',
        bannerFondo: 'linear-gradient(90deg, #191b3f, #1c1d49)',
    },
};
