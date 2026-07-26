import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper estándar de shadcn: combina clases condicionales y resuelve
// conflictos entre utilidades de Tailwind (la última gana).
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
