/**
 * Los anillos de cota que rodean la montaña de la cumbre: en una carta
 * topográfica, una cima es el centro de curvas cerradas cada vez más chicas.
 *
 * Ocho curvas casi concéntricas, de adentro hacia afuera, con el origen
 * (0, 0) en el centro: quien las dibuja centra el `viewBox` ahí. Es una
 * ilustración, como `contourTile.ts`: se generó una sola vez, fuera del repo
 * (un radio por anillo, deformado con dos armónicos cuya fase gira de a poco
 * de un anillo al otro, suavizado a curvas cuadráticas con coordenadas enteras).
 */
export const SUMMIT_RINGS: readonly string[] = [
  'M50-9q5 9 3 19q-3 10-12 17q-9 6-19 11q-11 4-22 4q-11 0-21-5q-9-5-17-12q-7-7-10-16q-3-9-2-19q1-10 8-19q6-9 18-11q13-2 23 0q11 2 21 6q10 3 18 9q8 7 12 16z',
  'M86-17q9 15 4 31q-6 17-21 27q-15 10-32 16q-16 6-34 6q-17-1-34-6q-17-6-29-17q-13-11-16-27q-3-15-1-31q1-16 13-29q11-14 30-18q19-4 36-2q18 3 33 9q15 7 28 17q13 9 23 24z',
  'M126-26q13 22 4 45q-9 24-30 39q-20 15-45 21q-25 6-49 6q-24-1-50-5q-25-5-44-22q-18-17-22-39q-4-23 0-46q4-22 22-40q18-17 43-25q25-8 51-6q25 2 46 13q21 11 41 24q20 14 33 35z',
  'M169-36q13 30 3 61q-9 31-36 53q-27 21-61 26q-35 6-66 7q-32 1-67-4q-36-5-61-28q-25-23-32-54q-7-31 4-60q10-30 35-51q25-21 56-35q30-13 65-12q34 1 63 15q29 15 56 34q27 19 41 48z',
  'M214-46q11 38 3 78q-9 39-43 67q-35 27-78 33q-44 7-85 10q-41 3-85-4q-45-8-79-37q-34-29-45-69q-11-40 9-76q21-37 52-62q32-26 68-46q36-20 81-20q44 1 85 17q40 16 72 43q33 27 45 66z',
  'M261-58q10 48 1 96q-8 48-50 82q-42 33-94 45q-52 12-104 16q-52 5-106-9q-53-14-99-47q-45-33-59-84q-13-51 17-95q31-44 68-75q37-32 81-56q45-24 100-27q55-4 110 12q54 16 90 55q35 40 45 87z',
  'M312-69q10 57-3 113q-13 56-60 97q-47 41-106 64q-60 23-125 24q-66 2-129-19q-63-20-120-59q-58-39-70-101q-13-62 22-115q35-53 80-91q44-38 99-64q55-25 121-37q67-11 137 6q70 18 107 71q38 53 47 111z',
  'M370-83q9 69-14 132q-24 63-71 114q-47 51-115 87q-67 36-148 33q-81-3-156-29q-75-26-140-74q-64-49-75-121q-12-73 21-137q32-64 87-109q55-44 122-72q66-27 146-48q79-21 164 2q84 23 127 89q43 65 52 133z',
];

/** Medio lado de la caja que contiene todos los anillos, en unidades del dibujo. */
export const SUMMIT_RINGS_EXTENT = 380;
