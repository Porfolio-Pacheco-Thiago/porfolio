// Metadata estructural del timeline: no es traducible, así que vive acá y no en i18n.
//
// sort:            **fecha de inicio** del hecho, como YYYYMM (mayor = más arriba). Es
//                  la de inicio y no la de fin: de un período "2017 — 2021" cuenta el
//                  2017. Cuando solo se sabe el año, el mes va en `00`.
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
    uba: { sort: 202300, category: 'academic' },        // 2023 — 2026 (graduación julio 2026)
    lovelytics: { sort: 202512, category: 'work' },     // Dic 2025 — Presente
    teaching: { sort: 202408, category: 'work' },       // Docencia FIUBA — Ago 2024 — Presente
    // Académico pese a ser una competencia. Blanco crema, no puro: el 100% de sus
    // columnas de borde da este valor
    fiubaton: { sort: 202510, category: 'academic', bannerFondo: '#f7f7f7' },
    // Secundario 2017–2021. Azul del escudo, uniforme en los dos bordes
    pellegrini: { sort: 201700, category: 'academic', bannerFondo: '#20394f' },
    // Olimpiada de Informática — 2020 (año a confirmar). El único que no tiene **un**
    // color: su fondo de circuitos va de #191b3f a la izquierda a #1c1d49 a la derecha,
    // así que el relleno los repite en degradado y cada costado empalma con el borde
    // que tiene al lado en vez de dejar un escalón.
    olympiad: {
        sort: 202000, category: 'academic',
        bannerFondo: 'linear-gradient(90deg, #191b3f, #1c1d49)',
    },
};

/**
 * Lo mismo, pero para los puntos de la línea de tiempo interna de una entrada (hoy,
 * los clientes de Lovelytics). Se indexa por el `id` del punto, el mismo que usa su
 * subcarpeta de medios.
 *
 * `bannerFondo` funciona igual que arriba, y acá el caso normal es el contrario: los
 * logos de cliente vienen como PNG con transparencia, y el de GP es **blanco puro**
 * —luminancia 255, el 100% de sus píxeles visibles por encima de 200—, así que sobre
 * el blanco por defecto no se ve nada. Va sin fondo, directo sobre la superficie de la
 * ventana, donde da 14.4:1 en oscuro y 8.5:1 en claro.
 */
export const journeyClientMeta = {
    gp: { bannerFondo: 'transparent' },
};
