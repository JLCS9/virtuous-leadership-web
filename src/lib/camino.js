// Lógica pura y textos del Camino · semanas 0 y 1 (los 14 primeros días). Sin React ni red.
// Fuente: «Camino · Semanas 0 y 1 — Especificación completa» (1-nov-2026). Los textos son los de la
// especificación, sin reescribir.

export const TOTAL_DIAS = 14;

export const SEMANAS = [
  {
    numero: 0,
    titulo: 'Punto de partida',
    frase: 'El test no es sobre tu carácter ni sobre tus cualidades: es sobre tu primera reacción.',
    reto: 'Cazar mi primera reacción',
    retoTexto: 'Una vez al día, nota tu reacción automática y ponle nombre.',
  },
  {
    numero: 1,
    titulo: 'El temperamento es biológico, el carácter espiritual',
    frase: 'Nacemos con un temperamento. No nacemos con un carácter: lo construimos.',
    reto: 'Contar mi temperamento y preguntar si me reconocen',
    retoTexto: 'Cada día a una persona distinta, si es posible.',
  },
];

// tipo: el componente que pinta la sesión. Los que aún no existen muestran «llega pronto».
export const DIAS = [
  { dia: 1, titulo: 'Vídeo 1.0 y tu resultado', tipo: 'video', leccion: '1.0', tiempo: 'Vídeo + 2 min' },
  { dia: 2, titulo: 'Desliza: los cuatro temperamentos', tipo: 'pronto', tiempo: '4 min' },
  { dia: 3, titulo: 'Elige tu reacción', tipo: 'pronto', tiempo: '4 min' },
  { dia: 4, titulo: 'Verdad o mito', tipo: 'verdad_mito', tiempo: '3 min' },
  { dia: 5, titulo: 'Descubre el temperamento de X', tipo: 'pronto', tiempo: '5 min' },
  { dia: 6, titulo: 'Mi punto de partida', tipo: 'punto_partida', tiempo: '3 min' },
  { dia: 7, titulo: 'Cierre de la semana', tipo: 'pronto', cierre: true, tiempo: '4 min' },
  { dia: 8, titulo: 'Vídeo 1.1 y reto', tipo: 'video', leccion: '1.1', tiempo: 'Vídeo + 2 min' },
  { dia: 9, titulo: 'Verdad o mito', tipo: 'verdad_mito', tiempo: '3 min' },
  { dia: 10, titulo: 'Desliza: ¿temperamento o carácter?', tipo: 'pronto', tiempo: '4 min' },
  { dia: 11, titulo: 'Elige tu reacción: temperamento frente a carácter', tipo: 'pronto', tiempo: '4 min' },
  { dia: 12, titulo: 'Mis personas', tipo: 'pronto', tiempo: '5 min' },
  { dia: 13, titulo: 'Arrastra: no lo elegí / lo he construido', tipo: 'pronto', tiempo: '4 min' },
  { dia: 14, titulo: 'Cierre: primer espejo', tipo: 'pronto', cierre: true, tiempo: '5 min' },
];

export const semanaDe = (dia) => SEMANAS[dia <= 7 ? 0 : 1];
export const infoDia = (dia) => DIAS[dia - 1];
/** El título del día con punto final, salvo si ya acaba en «?» o «!». */
export const conPunto = (texto) => (/[?!.]$/.test(texto) ? texto : `${texto}.`);

// ───────────── Onboarding «Personaliza tu camino» ─────────────

export const ONBOARDING = {
  entrada: 'Tu temperamento ya lo conocemos. Ahora cuéntanos un poco de tu vida para que el camino sea tuyo.',
  momentos: {
    pregunta: '¿En qué momento de tu vida estás?',
    ayuda: 'Puedes elegir varias.',
    opciones: [['estudio', 'Estudio'], ['trabajo', 'Trabajo'], ['dirijo', 'Dirijo personas'], ['familia', 'Cuido de mi familia'], ['jubilado', 'Estoy jubilado'], ['otro', 'Otro']],
  },
  estado_vida: {
    pregunta: '¿Cuál es tu estado de vida?',
    opciones: [['soltero', 'Soltero'], ['casado', 'Casado'], ['religioso', 'Religioso'], ['no_dice', 'Prefiero no decirlo']],
  },
  objetivo: {
    pregunta: '¿Para qué estás aquí?',
    opciones: [['conocerme', 'Conocerme mejor'], ['liderar', 'Liderar mejor'], ['relaciones', 'Mejorar mis relaciones'], ['mision', 'Encontrar mi misión']],
  },
  vida_interior: {
    pregunta: '¿Quieres incluir propuestas de vida interior?',
    opciones: [['si', 'Sí'], ['no', 'No'], ['mas_adelante', 'Más adelante']],
  },
  agenda: { pregunta: '¿Qué día quieres tu vídeo? ¿A qué hora tu examen de la noche?' },
};

export const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']; // ISO 1…7

// `cuando`: «hoy» o «el lunes, 3 de noviembre».
export const textoCierreOnboarding = (cuando) =>
  `Tu camino empieza ${cuando}. Cada semana, un vídeo. Cada día, cinco minutos. Cada noche, un momento para mirar tu día.`;

// ───────────── Fechas (siempre la fecha local del usuario, «YYYY-MM-DD») ─────────────

const DIA_MS = 86400000;
const aFecha = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export function fechaLocal(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
const diferenciaDias = (a, b) => Math.round((aFecha(b) - aFecha(a)) / DIA_MS);

/** Día ISO de la semana (1 lunes … 7 domingo) de una fecha local. */
export const diaIso = (fecha) => ((aFecha(fecha).getDay() + 6) % 7) + 1;

/** El primer `diaVideo` (ISO) a partir de `desde`, incluido: ese es el día 1 del camino. */
export function calcularInicio(diaVideo, desde = fechaLocal()) {
  const salto = (diaVideo - diaIso(desde) + 7) % 7;
  return fechaLocal(new Date(aFecha(desde).getTime() + salto * DIA_MS));
}

/** Día del camino hoy: ≤0 aún no empieza, 1…14 en curso, >14 terminado. */
export const diaDelCamino = (inicio, hoy = fechaLocal()) => diferenciaDias(inicio, hoy) + 1;

export const fechaDelDia = (inicio, dia) => fechaLocal(new Date(aFecha(inicio).getTime() + (dia - 1) * DIA_MS));

export function fechaCorta(fecha) {
  return aFecha(fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

/**
 * Racha: días seguidos con sesión o examen hechos, contando hacia atrás desde hoy (si hoy aún no hay
 * nada, desde ayer). `dias` son las filas de camino_dias.
 */
export function racha(dias, hoy = fechaLocal()) {
  const activos = new Set();
  for (const d of dias) {
    if (d.sesion_en) activos.add(fechaLocal(new Date(d.sesion_en)));
    if (d.examen_en) activos.add(fechaLocal(new Date(d.examen_en)));
  }
  let cursor = aFecha(hoy);
  if (!activos.has(hoy)) cursor = new Date(cursor.getTime() - DIA_MS);
  let n = 0;
  while (activos.has(fechaLocal(cursor))) { n += 1; cursor = new Date(cursor.getTime() - DIA_MS); }
  return n;
}

// ───────────── Temperamentos ─────────────

export const LEMA = { COL: 'la acción', MEL: 'las ideas', SAN: 'las personas', FLE: 'la paz' };

// Día 1: «¿Te parece que tienes los cuatro?», el ejemplo del cuaderno según el primario.
export const EJEMPLO_CUATRO = {
  COL: 'El colérico que se cree flemático porque ha desarrollado el dominio propio.',
  FLE: 'El flemático que se cree colérico por la iniciativa.',
  MEL: 'El melancólico que se cree sanguíneo por la comunicación.',
  SAN: 'El sanguíneo que se cree melancólico por la contemplación.',
};

// Rueda: orden de los cuatro alrededor del círculo, en el sentido de las agujas del reloj.
export const RUEDA = ['COL', 'MEL', 'FLE', 'SAN'];

// ───────────── Sesiones ─────────────

export const RETO_PRESENTACION = {
  1: 'Esta semana, caza tu primera reacción. Cuando algo te mueva por dentro, fíjate en lo primero que sale. Esta noche te preguntaremos.',
  8: 'Esta semana, cuéntale a alguien tu temperamento y pregúntale: ¿me reconoces? Es la primera vez que te miras en un espejo que no eres tú.',
};

export const VERDAD_MITO = {
  4: [
    ['El temperamento se elige', false, 'Nacemos con un temperamento y no podemos cambiarlo'],
    ['Moriré con las cualidades y los defectos de mi temperamento', true, 'El temperamento no cambia; lo que crece es el carácter'],
    ['Si me veo de los cuatro temperamentos, el test está mal', false, 'Confundes temperamento y carácter: has desarrollado virtudes'],
    ['Hay temperamentos mejores que otros', false, 'Cada uno facilita unos aspectos de las virtudes y dificulta otros'],
    ['El carácter se construye con hábitos', true, 'Las virtudes son hábitos morales adquiridos con la práctica'],
    ['El test mide mis cualidades', false, 'Mide tu primera reacción ante los estímulos'],
  ],
  9: [
    ['El temperamento es biológico', true, 'Es nuestra predisposición natural a reaccionar de una manera'],
    ['El carácter también es innato', false, 'No nacemos con un carácter: lo construimos'],
    ['Con esfuerzo, un colérico puede volverse flemático', false, 'Su temperamento no cambia; puede adquirir el dominio de sí, que al flemático le resulta fácil'],
    ['El carácter se compone de virtudes', true, 'Prudencia, fortaleza, dominio de sí, justicia, magnanimidad y humildad'],
    ['Mi temperamento me condena a mis defectos', false, 'Sobre él construyes el carácter'],
    ['Mi temperamento me facilita unas virtudes y me dificulta otras', true, 'Al colérico le facilita la audacia y le dificulta el servicio'],
  ],
};

export const PUNTO_PARTIDA = {
  fallo: {
    pregunta: 'Cuando algo me sale mal, yo…',
    opciones: [['arreglo', 'Me pongo en marcha para arreglarlo'], ['vueltas', 'Le doy muchas vueltas'], ['cuento', 'Lo cuento y paso página'], ['acepto', 'Lo acepto con calma']],
  },
  me_ven: {
    pregunta: 'Los que me quieren dicen que soy…',
    opciones: ['decidido', 'exigente', 'impaciente', 'profundo', 'sensible', 'perfeccionista', 'alegre', 'generoso', 'disperso', 'tranquilo', 'constante', 'pasivo'],
  },
  me_gustaria: {
    pregunta: 'Me gustaría que dijeran que soy…',
    opciones: ['prudente', 'valiente', 'sereno', 'justo', 'magnánimo', 'humilde', 'paciente', 'alegre', 'fiel', 'generoso', 'decidido', 'cercano'],
  },
  linea: '¿Quieres añadir una línea tuya?',
};

// «Elige: ¿con quién vas a hacer hoy el reto?». Hasta que existan las fichas de personas, por grupo.
export const CON_QUIEN = [['familia', 'Alguien de mi familia'], ['amigos', 'Un amigo'], ['trabajo', 'Alguien del trabajo o los estudios'], ['otra', 'Otra persona']];

// ───────────── Examen de la noche ─────────────

export const EXAMEN = {
  intro: 'Antes de dormir, mira tu día un momento.',
  reto: { pregunta: '¿Hiciste el reto hoy?', opciones: [['si', 'Sí'], ['a_medias', 'A medias'], ['no', 'No']] },
  con_quien: { pregunta: '¿Con quién?', opciones: [...CON_QUIEN, ['solo', 'Solo']] },
  reconocio: { pregunta: '¿Te reconoció?', opciones: [['si', 'Sí'], ['en_parte', 'En parte'], ['no', 'No']] },
  palabra: { pregunta: '¿Qué palabra describe mejor tu reacción más fuerte de hoy?' },
  animo: { pregunta: '¿Cómo te fue?', opciones: [[1, '😣', 'Muy difícil'], [2, '😕', 'Difícil'], [3, '😐', 'Normal'], [4, '🙂', 'Bien'], [5, '😄', 'Muy bien']] },
  gracias: '¿Quieres dar gracias por algo de hoy?',
};

// Semana 0: las 12 palabras del reto. El temperamento es interno: nunca se muestra al usuario.
export const PALABRAS = [
  ['Me enfadé', 'COL'], ['Actué rápido', 'COL'], ['Quise controlarlo', 'COL'],
  ['Le di vueltas', 'MEL'], ['Me encerré', 'MEL'], ['Me preocupé', 'MEL'],
  ['Lo conté', 'SAN'], ['Me distraje', 'SAN'], ['Me reí', 'SAN'],
  ['Lo dejé pasar', 'FLE'], ['No me afectó', 'FLE'], ['Evité el conflicto', 'FLE'],
];

/** ¿Se puede hacer ya el examen de ese día? Los días 7 y 14 el cierre lo sustituye. */
export const tieneExamen = (dia) => !infoDia(dia)?.cierre;

/** Lo siguiente que toca: la sesión de hoy, su examen, o un día anterior que quedó sin hacer. */
export function siguientePaso({ diaHoy, porDia }) {
  if (diaHoy == null || diaHoy < 1 || diaHoy > TOTAL_DIAS) return null;
  const hoy = porDia[diaHoy];
  if (!hoy?.sesion_en) return { tipo: 'sesion', dia: diaHoy };
  if (tieneExamen(diaHoy) && !hoy.examen_en) return { tipo: 'examen', dia: diaHoy };
  const pendiente = DIAS.find((d) => d.dia < diaHoy && !porDia[d.dia]?.sesion_en);
  if (pendiente) return { tipo: 'sesion', dia: pendiente.dia, atrasada: true };
  return { tipo: 'hecho', dia: diaHoy };
}
