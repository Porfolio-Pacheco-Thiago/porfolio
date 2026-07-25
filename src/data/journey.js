// Metadata estructural del timeline: no es traducible, así que vive acá y no en i18n.
//
// sort:     orden cronológico como YYYYMM (mayor = más reciente = más arriba).
// category: eje en el que se dibuja la entrada ('academic' a la izquierda, 'work' a la derecha).
//
// Las entradas sin metadata caen al fondo del timeline sobre el eje académico.
export const journeyMeta = {
    uba: { sort: 202607, category: 'academic' },        // Graduación UBA — julio 2026
    lovelytics: { sort: 202512, category: 'work' },     // Dic 2025 — Presente
    teaching: { sort: 202511, category: 'work' },       // Docencia FIUBA — inició antes que Lovelytics
    fiubaton: { sort: 202509, category: 'academic' },   // Logro académico pese a ser una competencia
    pellegrini: { sort: 202112, category: 'academic' }, // Secundario 2017–2021 (egreso)
    olympiad: { sort: 202000, category: 'academic' },   // Olimpiada de Informática — 2020
};
