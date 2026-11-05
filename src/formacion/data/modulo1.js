// Módulo 1 — Del temperamento al carácter.
// 27 pasos secuenciales. Fuentes: Curriculo modulos LV Portal.xlsx + quiz_modulo1.csv + Cuaderno_1_V2.pdf.
// NOTA: datos de quizzes pendientes de confirmación por Formación (erratas en revisión).

export const MODULO_1 = {
  id: 'modulo-1',
  numero: 1,
  titulo: 'Del temperamento al carácter',
  pasos: [
    // ─── PASO 1: VIDEO ───
    {
      id: 'm1-01', tipo: 'video', visible: true,
      titulo: 'El temperamento es biológico, el carácter espiritual',
      vimeoId: null,
      duracion: 1200,
    },

    // ─── PASO 2: DEFINE (temperamentos) ───
    {
      id: 'm1-02', tipo: 'define', visible: false,
      titulo: 'Define',
      conceptos: [
        {
          nombre: 'Temperamento',
          correctas: ['Predisposición innata', 'Biológico', 'Modo de reaccionar', 'Recibido al nacer', 'No se puede cambiar'],
          distractores: ['Hábito moral', 'Se construye con la práctica', 'Fortaleza espiritual', 'Fruto de la libertad'],
        },
        {
          nombre: 'Colérico',
          correctas: ['La acción', 'Manager nacido', 'Energía', 'Conseguir metas', 'Confianza en sí mismo'],
          distractores: ['La contemplación', 'Las personas', 'Voluntad oculta', 'Perfeccionista'],
        },
        {
          nombre: 'Melancólico',
          correctas: ['Las ideas', 'Contemplación', 'Perfeccionista', 'Independiente', 'Creador'],
          distractores: ['La acción', 'Comunicador nacido', 'La alegría', 'Manager nacido'],
        },
        {
          nombre: 'Sanguíneo',
          correctas: ['Las personas', 'Comunicador nacido', 'La alegría', 'Sentidos siempre despiertos', 'Le encanta la aventura'],
          distractores: ['La paz', 'Desapasionado', 'Voluntad de hierro', 'Las ideas'],
        },
        {
          nombre: 'Flemático',
          correctas: ['La paz', 'Desapasionado y científico', 'Voluntad de hierro oculta', 'Constante y perseverante', 'Racional'],
          distractores: ['Emprendedor nato', 'Sentidos siempre despiertos', 'La aventura', 'Creador'],
        },
      ],
    },

    // ─── PASO 3: QUIZ 1 ───
    {
      id: 'm1-03', tipo: 'quiz', visible: false,
      titulo: 'Cuestionario 1',
      preguntas: [
        {
          texto: '¿Con qué se debe comenzar la educación del carácter?',
          opciones: [
            { letra: 'A', texto: 'Estudiando filosofía clásica' },
            { letra: 'B', texto: 'Practicando meditación diaria' },
            { letra: 'C', texto: 'Leyendo biografías de grandes líderes' },
            { letra: 'D', texto: 'Identificando el propio temperamento biológico' },
          ],
          correcta: 'D',
        },
        {
          texto: '¿Por qué es importante conocer el propio temperamento?',
          opciones: [
            { letra: 'A', texto: 'Permite entender las reacciones propias' },
            { letra: 'B', texto: 'Ayuda a identificar virtudes y defectos naturales' },
            { letra: 'C', texto: 'Facilita el trabajo en equipo' },
            { letra: 'D', texto: 'Todas las respuestas son correctas' },
          ],
          correcta: 'D',
        },
        {
          texto: '¿Cuál de los siguientes no es un temperamento?',
          opciones: [
            { letra: 'A', texto: 'Colérico' },
            { letra: 'B', texto: 'Sanguíneo' },
            { letra: 'C', texto: 'Neurótico' },
            { letra: 'D', texto: 'Flemático' },
          ],
          correcta: 'C',
        },
        {
          texto: '¿Qué gran científico desarrolló la teoría de los temperamentos?',
          opciones: [
            { letra: 'A', texto: 'Aristóteles' },
            { letra: 'B', texto: 'Galeno' },
            { letra: 'C', texto: 'Hipócrates' },
            { letra: 'D', texto: 'Platón' },
          ],
          correcta: 'C',
        },
      ],
    },

    // ─── PASO 4: VIDEO ───
    {
      id: 'm1-04', tipo: 'video', visible: true,
      titulo: 'El carácter se construye sobre la base del temperamento',
      vimeoId: null,
      duracion: 600,
    },

    // ─── PASO 5: QUIZ 2 ───
    {
      id: 'm1-05', tipo: 'quiz', visible: false,
      titulo: 'Cuestionario 2',
      preguntas: [
        {
          texto: '¿Cuál de los siguientes factores no influye en el desarrollo del carácter?',
          opciones: [
            { letra: 'A', texto: 'La educación recibida' },
            { letra: 'B', texto: 'Las decisiones personales' },
            { letra: 'C', texto: 'La alimentación' },
            { letra: 'D', texto: 'El entorno cultural' },
          ],
          correcta: 'C',
        },
        {
          texto: '¿Cuál es la relación entre carácter y temperamento?',
          opciones: [
            { letra: 'A', texto: 'Son lo mismo, solo cambia el nombre' },
            { letra: 'B', texto: 'El temperamento reemplaza al carácter con la edad' },
            { letra: 'C', texto: 'El carácter puede complementar el temperamento y compensar sus defectos' },
            { letra: 'D', texto: 'No tienen ninguna relación' },
          ],
          correcta: 'C',
        },
        {
          texto: '¿Qué concepto describe mejor la esencia del carácter?',
          opciones: [
            { letra: 'A', texto: 'Inteligencia emocional' },
            { letra: 'B', texto: 'Personalidad heredada' },
            { letra: 'C', texto: 'Carisma natural' },
            { letra: 'D', texto: 'Libertad interior' },
          ],
          correcta: 'D',
        },
        {
          texto: '¿En qué se manifiesta la libertad interior de una persona?',
          opciones: [
            { letra: 'A', texto: 'En poder hacer lo que quiera sin límites' },
            { letra: 'B', texto: 'En no depender de la opinión de los demás' },
            { letra: 'C', texto: 'En dominar sus pasiones y actuar según la razón' },
            { letra: 'D', texto: 'Todas las respuestas son correctas' },
          ],
          correcta: 'D',
        },
      ],
    },

    // ─── PASO 6: DEFINE (virtudes) ───
    {
      id: 'm1-06', tipo: 'define', visible: false,
      titulo: 'Define',
      conceptos: [
        {
          nombre: 'Carácter',
          correctas: ['Virtudes', 'Hábitos morales', 'Predisposición adquirida', 'Crecimiento personal', 'Se construye'],
          distractores: ['Predisposición innata', 'Biológico', 'Reactividad', 'Nacemos con él'],
        },
        {
          nombre: 'Prudencia',
          correctas: ['Tomar buenas decisiones', 'Madre de todas las virtudes', 'Sabiduría práctica', 'Tomar decisiones'],
          distractores: ['Mantener el rumbo', 'Controlarse', 'Dar a cada uno lo suyo', 'Ir hacia las cosas grandes'],
        },
        {
          nombre: 'Fortaleza',
          correctas: ['Mantener el rumbo', 'Asumir riesgos', 'Ser fuerte en el plan espiritual', 'Resistencia', 'Audacia'],
          distractores: ['Tomar buenas decisiones', 'Control de las pasiones', 'Servicio a los otros', 'Soñar con cosas grandes'],
        },
        {
          nombre: 'Dominio de sí',
          correctas: ['Capacidad de controlarse', 'Control de las emociones', 'Control de sus pasiones', 'Disciplina interior'],
          distractores: ['Asumir riesgos', 'Tomar buenas decisiones', 'Vivir en la verdad', 'La acción'],
        },
        {
          nombre: 'Justicia',
          correctas: ['Dar a cada uno lo suyo', 'Hábito de dar a cada uno su derecho', 'Relación con los demás'],
          distractores: ['Capacidad de controlarse', 'Mantener el rumbo', 'Verdad sobre sí mismo', 'Sueños y acción'],
        },
        {
          nombre: 'Magnanimidad',
          correctas: ['Ir hacia las cosas grandes', 'Luchar por cosas grandes', 'Sueño y acción', 'Los que sueñan y actúan', 'Grandeza de alma'],
          distractores: ['Capacidad de controlarse', 'Dar a cada uno lo suyo', 'Predisposición innata', 'Hábito del servicio'],
        },
      ],
    },

    // ─── PASO 7: VIDEO ───
    {
      id: 'm1-07', tipo: 'video', visible: true,
      titulo: 'Cada temperamento posee valores concretos',
      vimeoId: null,
      duracion: 900,
    },

    // ─── PASO 8: IDENTIFICA (diagrama) — D1 implementa el componente ───
    {
      id: 'm1-08', tipo: 'identifica', visible: false,
      titulo: '4 Temperamentos: Identifica',
      preguntas: [
        { texto: 'Identifica los principales valores del temperamento colérico', opciones: [{ letra: 'A', texto: 'Acción' }, { letra: 'B', texto: 'Ideas' }, { letra: 'C', texto: 'Personas' }, { letra: 'D', texto: 'Paz' }], correcta: 'A' },
        { texto: 'Identifica los principales valores del temperamento sanguíneo', opciones: [{ letra: 'A', texto: 'Acción' }, { letra: 'B', texto: 'Ideas' }, { letra: 'C', texto: 'Personas' }, { letra: 'D', texto: 'Paz' }], correcta: 'C' },
        { texto: 'Identifica los principales valores del temperamento flemático', opciones: [{ letra: 'A', texto: 'Acción' }, { letra: 'B', texto: 'Ideas' }, { letra: 'C', texto: 'Personas' }, { letra: 'D', texto: 'Paz' }], correcta: 'D' },
        { texto: 'Identifica los principales valores del temperamento melancólico', opciones: [{ letra: 'A', texto: 'Acción' }, { letra: 'B', texto: 'Ideas' }, { letra: 'C', texto: 'Personas' }, { letra: 'D', texto: 'Paz' }], correcta: 'B' },
      ],
    },

    // ─── PASO 9: NOOP ───
    { id: 'm1-09', tipo: 'noop', visible: false },

    // ─── PASO 10: VIDEO ───
    {
      id: 'm1-10', tipo: 'video', visible: true,
      titulo: 'Cada temperamento se distingue por su reactividad a los estímulos',
      vimeoId: null,
      duracion: 180,
    },

    // ─── PASO 11: DESLIZA (6 escenas) ───
    {
      id: 'm1-11', tipo: 'desliza', visible: false,
      titulo: '4 Temperamentos: Desliza',
      opciones: [
        { clave: 'COL', nombre: 'Colérico' },
        { clave: 'MEL', nombre: 'Melancólico' },
        { clave: 'SAN', nombre: 'Sanguíneo' },
        { clave: 'FLE', nombre: 'Flemático' },
      ],
      escenas: [
        { texto: 'En una reunión surge un problema urgente. Alguien se levanta y dice: "Yo me encargo. Esto es lo que haremos..."', correcta: 'COL', explicacion: 'El colérico pasa a la acción de inmediato y toma el mando.' },
        { texto: 'Antes de aceptar un proyecto nuevo, pide tres días para analizar todas las opciones y los posibles riesgos.', correcta: 'MEL', explicacion: 'El melancólico necesita reflexionar y contemplar antes de actuar.' },
        { texto: 'Llega a una fiesta y en diez minutos ya conoce a todos y ha montado un plan para el fin de semana.', correcta: 'SAN', explicacion: 'El sanguíneo conecta con las personas al instante y disfruta de la novedad.' },
        { texto: 'Todos discuten acaloradamente. Espera en silencio. Cuando habla, resume la situación con calma y todos se tranquilizan.', correcta: 'FLE', explicacion: 'El flemático mantiene la calma y aporta paz al grupo.' },
        { texto: 'Le asignan un proyecto complejo. Trabaja sin parar hasta terminarlo, sin pedir ayuda a nadie.', correcta: 'COL', explicacion: 'El colérico persigue sus metas con determinación, pero su riesgo es el orgullo: no delega.' },
        { texto: 'Le proponen liderar un equipo nuevo. Responde: "Necesito pensarlo... no estoy seguro de estar preparado."', correcta: 'MEL', explicacion: 'El melancólico tiende a dudar de sí mismo; su riesgo es el miedo a actuar.' },
      ],
    },

    // ─── PASO 12: NOOP ───
    { id: 'm1-12', tipo: 'noop', visible: false },

    // ─── PASO 13: VIDEO ───
    {
      id: 'm1-13', tipo: 'video', visible: true,
      titulo: 'Temperamento dominante y temperamento secundario',
      vimeoId: null,
      duracion: 720,
    },

    // ─── PASO 14: QUIZ personalizado ───
    {
      id: 'm1-14', tipo: 'quiz', visible: false,
      titulo: 'Los desafíos de mi temperamento',
      preguntas: [
        {
          texto: '¿Cuál es la traducción de temperamentum?',
          opciones: [
            { letra: 'A', texto: 'Temperatura' },
            { letra: 'B', texto: 'Oportunidad' },
            { letra: 'C', texto: 'Mezcla, justa proporción de las partes' },
            { letra: 'D', texto: 'Coraje' },
          ],
          correcta: 'C',
        },
        {
          texto: '¿Cuántos temperamentos puede combinar una persona?',
          opciones: [
            { letra: 'A', texto: '1' },
            { letra: 'B', texto: '2' },
            { letra: 'C', texto: '3' },
            { letra: 'D', texto: '4' },
          ],
          correcta: 'B',
        },
        {
          texto: '¿Cuál de estas combinaciones de temperamentos es posible?',
          opciones: [
            { letra: 'A', texto: 'Colérico-Flemático' },
            { letra: 'B', texto: 'Sanguíneo-Melancólico' },
            { letra: 'C', texto: 'Melancólico-Colérico' },
            { letra: 'D', texto: 'Flemático-Colérico' },
          ],
          correcta: 'C',
        },
        {
          texto: '¿Qué combinaciones de temperamentos son imposibles?',
          opciones: [
            { letra: 'A', texto: 'Colérico-Melancólico y Sanguíneo-Flemático' },
            { letra: 'B', texto: 'Colérico-Sanguíneo y Melancólico-Flemático' },
            { letra: 'C', texto: 'Colérico-Flemático y Sanguíneo-Melancólico' },
            { letra: 'D', texto: 'Sanguíneo-Colérico y Flemático-Melancólico' },
          ],
          correcta: 'C',
        },
      ],
    },

    // ─── PASO 15: VIDEO ───
    {
      id: 'm1-15', tipo: 'video', visible: true,
      titulo: 'El Colérico',
      vimeoId: null,
      duracion: 600,
    },

    // ─── PASO 16: QUIZ Colérico ───
    {
      id: 'm1-16', tipo: 'quiz', visible: false,
      titulo: 'Cuestionario — Colérico',
      preguntas: [
        {
          texto: '¿Qué personaje famoso de Shakespeare es colérico?',
          opciones: [
            { letra: 'A', texto: 'Hamlet' },
            { letra: 'B', texto: 'Romeo' },
            { letra: 'C', texto: 'Otelo' },
            { letra: 'D', texto: 'Próspero' },
          ],
          correcta: 'C',
        },
        {
          texto: '¿Qué cualidad positiva no corresponde al colérico?',
          opciones: [
            { letra: 'A', texto: 'Determinación y energía' },
            { letra: 'B', texto: 'Confianza en sí mismo' },
            { letra: 'C', texto: 'Capacidad de liderazgo' },
            { letra: 'D', texto: 'Tendencia a la contemplación' },
          ],
          correcta: 'D',
        },
        {
          texto: '¿Qué defecto no corresponde al colérico?',
          opciones: [
            { letra: 'A', texto: 'Orgullo y soberbia' },
            { letra: 'B', texto: 'Impulsividad e ira' },
            { letra: 'C', texto: 'Dificultad para delegar' },
            { letra: 'D', texto: 'Tendencia al pesimismo' },
          ],
          correcta: 'D',
        },
        {
          texto: '¿Qué afirmación sobre gestión y liderazgo es correcta?',
          opciones: [
            { letra: 'A', texto: 'Un gestor se enfoca en los procesos y los resultados inmediatos' },
            { letra: 'B', texto: 'Un líder se enfoca en el desarrollo y crecimiento de las personas' },
            { letra: 'C', texto: 'Gestionar y liderar son exactamente lo mismo' },
            { letra: 'D', texto: 'El liderazgo solo se aplica en empresas grandes' },
          ],
          correcta: 'B',
        },
      ],
    },

    // ─── PASO 17: TEST PROFUNDO — Colérico (condicional) ───
    {
      id: 'm1-17', tipo: 'test_profundo', visible: false,
      titulo: 'Reflexión profunda — Colérico',
      temperamento: 'COL',
      virtud_desafio: 'Humildad',
      num_preguntas: 14,
      preguntas: [
        { texto: '¿Suelo pedir opinión a los demás o me aferro obstinadamente a mis propias ideas?' },
        { texto: '¿Estoy abierto a la crítica sana y constructiva?' },
        { texto: '¿Veo mi trabajo como una oportunidad para servir o sólo persigo mi propio interés?' },
        { texto: '¿Me dejo llevar con frecuencia por el orgullo, que se manifiesta de las siguientes maneras? 1) pensar que lo que yo hago o digo es mejor que lo que hacen o dicen los demás; 2) querer hacer las cosas a mi manera; 3) justificarme cuando me equivoco o insistir obstinadamente cuando tengo razón; 4) dar mi opinión sin que me la pidan; 5) despreciar el punto de vista de los demás; 6) citarme como ejemplo en las conversaciones; 7) buscar distinguirme; 8) mostrar celos o tristeza ante el éxito de los demás.' },
        { texto: '¿Interrumpo fácilmente a los demás, pensando que lo que yo tengo que decir es más importante o interesante?' },
        { texto: '¿Me apresuro a defender un punto de vista, incluso cuando no conozco el tema?' },
        { texto: '¿Soy capaz de pedir perdón con humildad y sencillez, sin justificarme?' },
        { texto: 'Cuando me apresuro a cumplir algunos objetivos, ¿me importan las consecuencias para los demás?' },
        { texto: '¿Soy capaz de cambiar mis planes personales cuando las necesidades de los demás lo requieren?' },
        { texto: '¿Soy autoritario en lugar de buscar la cooperación de los demás?' },
        { texto: '¿Soy tan ambicioso en mi vida profesional que me olvido de mi vida familiar, consumido por un deseo insaciable de «salir adelante»?' },
        { texto: '¿Me enfado ante las contradicciones o las veo como oportunidades para crecer en paciencia?' },
        { texto: '¿Tengo tendencia a querer controlarlo todo?' },
        { texto: '¿Soy consciente de que mis talentos son dones y no el producto de mi propia actividad?' },
      ],
    },

    // ─── PASO 18: VIDEO ───
    {
      id: 'm1-18', tipo: 'video', visible: true,
      titulo: 'El Melancólico',
      vimeoId: null,
      duracion: 540,
    },

    // ─── PASO 19: QUIZ Melancólico ───
    {
      id: 'm1-19', tipo: 'quiz', visible: false,
      titulo: 'Cuestionario — Melancólico',
      preguntas: [
        {
          texto: '¿Qué personaje famoso de Shakespeare es melancólico?',
          opciones: [
            { letra: 'A', texto: 'Otelo' },
            { letra: 'B', texto: 'Hamlet' },
            { letra: 'C', texto: 'Falstaff' },
            { letra: 'D', texto: 'Macbeth' },
          ],
          correcta: 'B',
        },
        {
          texto: '¿Qué cualidad positiva no corresponde al melancólico?',
          opciones: [
            { letra: 'A', texto: 'Le gusta el poder y prospera en la competencia' },
            { letra: 'B', texto: 'Profundidad de pensamiento' },
            { letra: 'C', texto: 'Creatividad e independencia' },
            { letra: 'D', texto: 'Perfeccionismo constructivo' },
          ],
          correcta: 'A',
        },
        {
          texto: '¿Qué defecto no corresponde al melancólico?',
          opciones: [
            { letra: 'A', texto: 'Miedo a actuar' },
            { letra: 'B', texto: 'Susceptibilidad y rencor' },
            { letra: 'C', texto: 'Tiende a la confrontación y al autoritarismo' },
            { letra: 'D', texto: 'Perfeccionismo paralizante' },
          ],
          correcta: 'C',
        },
        {
          texto: '¿Por qué el perfeccionismo es peligroso?',
          opciones: [
            { letra: 'A', texto: 'Puede paralizar la acción por miedo al error' },
            { letra: 'B', texto: 'Genera frustración constante con los demás' },
            { letra: 'C', texto: 'Impide aceptar soluciones "suficientemente buenas"' },
            { letra: 'D', texto: 'Todas las respuestas son correctas' },
          ],
          correcta: 'D',
        },
      ],
    },

    // ─── PASO 20: TEST PROFUNDO — Melancólico (condicional) ───
    {
      id: 'm1-20', tipo: 'test_profundo', visible: false,
      titulo: 'Reflexión profunda — Melancólico',
      temperamento: 'MEL',
      virtud_desafio: 'Audacia',
      num_preguntas: 16,
      preguntas: [
        { texto: '¿Me esfuerzo cada día por convertir mis sueños en acciones concretas?' },
        { texto: '¿Cumplo mis decisiones con diligencia?' },
        { texto: '¿Intento salir de mí mismo y conocer gente nueva?' },
        { texto: '¿Mi preferencia por la soledad me lleva a aislarme de los demás hasta el punto de olvidar sus necesidades y privarles de mi apoyo?' },
        { texto: '¿Guardo rencor a alguien? ¿Soy rápido para perdonar cuando me hacen daño o permito que la ira se instale y supure en mi corazón?' },
        { texto: '¿Tengo la costumbre de «reírme» de mí mismo?' },
        { texto: '¿Trato de ser positivo, animando a los demás y apoyando sus planes?' },
        { texto: '¿Paso demasiado tiempo insistiendo en los problemas, en lugar de buscar soluciones, aunque sean imperfectas?' },
        { texto: '¿Reacciono desproporcionadamente ante los sucesos?' },
        { texto: '¿Dejo que los acontecimientos del día me desanimen?' },
        { texto: '¿Lucho decididamente contra la tristeza?' },
        { texto: '¿Suelo resistir la tentación del desánimo, del mal humor, del pensamiento crítico?' },
        { texto: '¿Tiendo a dudar de la corrección de las intenciones de las personas que conozco en lugar de creer en su buena voluntad?' },
        { texto: '¿Permito que las imperfecciones que percibo en los demás creen distancia entre ellos y yo?' },
        { texto: '¿Supero la tentación del «perfeccionismo» en mi trabajo?' },
        { texto: '¿Dejo que mis preocupaciones profesionales invadan mi vida familiar?' },
      ],
    },

    // ─── PASO 21: VIDEO ───
    {
      id: 'm1-21', tipo: 'video', visible: true,
      titulo: 'El Sanguíneo',
      vimeoId: null,
      duracion: 600,
    },

    // ─── PASO 22: QUIZ Sanguíneo ───
    {
      id: 'm1-22', tipo: 'quiz', visible: false,
      titulo: 'Cuestionario — Sanguíneo',
      preguntas: [
        {
          texto: '¿Qué cualidad positiva no corresponde al sanguíneo?',
          opciones: [
            { letra: 'A', texto: 'Capacidad de comunicación' },
            { letra: 'B', texto: 'Empatía y amabilidad' },
            { letra: 'C', texto: 'Gusto por la aventura' },
            { letra: 'D', texto: 'Racionalidad y rigor científico' },
          ],
          correcta: 'D',
        },
        {
          texto: '¿Qué defecto no corresponde al sanguíneo?',
          opciones: [
            { letra: 'A', texto: 'Frivolidad e inconstancia' },
            { letra: 'B', texto: 'Está completamente absorto en sus ideas' },
            { letra: 'C', texto: 'Busca la aprobación de los demás' },
            { letra: 'D', texto: 'Inestabilidad en sus compromisos' },
          ],
          correcta: 'B',
        },
        {
          texto: '¿Qué afirmación sobre el sanguíneo es incorrecta?',
          opciones: [
            { letra: 'A', texto: 'Es un comunicador nato' },
            { letra: 'B', texto: 'Tiene los sentidos siempre despiertos' },
            { letra: 'C', texto: 'Le encanta la aventura y la novedad' },
            { letra: 'D', texto: 'Todas son correctas' },
          ],
          correcta: 'D',
        },
        {
          texto: '¿En qué acción se manifiesta principalmente la justicia?',
          opciones: [
            { letra: 'A', texto: 'En la obediencia a la ley' },
            { letra: 'B', texto: 'En la apertura al otro' },
            { letra: 'C', texto: 'En la defensa de los propios derechos' },
            { letra: 'D', texto: 'En la acumulación de méritos' },
          ],
          correcta: 'B',
        },
      ],
    },

    // ─── PASO 23: TEST PROFUNDO — Sanguíneo (condicional) ───
    {
      id: 'm1-23', tipo: 'test_profundo', visible: false,
      titulo: 'Reflexión profunda — Sanguíneo',
      temperamento: 'SAN',
      virtud_desafio: 'Perseverancia',
      num_preguntas: 14,
      preguntas: [
        { texto: '¿Suelo realizar todas las tareas al detalle?' },
        { texto: '¿Lucho contra las distracciones en mi trabajo? ¿Estoy concentrado en lo que hago?' },
        { texto: '¿Intento controlar mis sentidos externos, mi imaginación y mis emociones?' },
        { texto: '¿Soy sincero o exagero algunas cosas para impresionar y oculto otras para guardar las apariencias?' },
        { texto: '¿Respeto el espacio personal y la intimidad de los demás?' },
        { texto: '¿Busco conocer bien a las personas que trato o me conformo con conversaciones superficiales?' },
        { texto: '¿Son auténticas mis amistades? ¿Soy capaz de reducir mis numerosos contactos sociales para centrarme más profundamente en unas pocas personas, sabiendo que la verdadera amistad requiere tiempo, energía y reflexión?' },
        { texto: '¿Intento centrarme en una tarea durante varias horas al día?' },
        { texto: '¿Hay momentos en mi día en los que dejo de lado mi smartphone?' },
        { texto: '¿Me conformo con un conocimiento superficial de las cosas o busco profundizar a través de la lectura, la conversación, la reflexión personal?' },
        { texto: '¿Intento asimilar lo que leo, o tiendo a leer precipitadamente?' },
        { texto: '¿Suelo hacer una lista de tareas para el día?' },
        { texto: '¿Hago mi trabajo a tiempo o tiendo a dejarlo para más tarde?' },
        { texto: '¿Persevero en mis planes una vez pasado el entusiasmo inicial?' },
      ],
    },

    // ─── PASO 24: VIDEO ───
    {
      id: 'm1-24', tipo: 'video', visible: true,
      titulo: 'El Flemático',
      vimeoId: null,
      duracion: 600,
    },

    // ─── PASO 25: QUIZ Flemático ───
    {
      id: 'm1-25', tipo: 'quiz', visible: false,
      titulo: 'Cuestionario — Flemático',
      preguntas: [
        {
          texto: '¿Qué personaje de Guerra y Paz de Tolstói es flemático?',
          opciones: [
            { letra: 'A', texto: 'Pierre Bezújov' },
            { letra: 'B', texto: 'Andréi Bolkonski' },
            { letra: 'C', texto: 'Natasha Rostova' },
            { letra: 'D', texto: 'Napoleón Bonaparte' },
          ],
          correcta: 'A',
        },
        {
          texto: '¿Qué cualidad positiva no corresponde al flemático?',
          opciones: [
            { letra: 'A', texto: 'Constancia y perseverancia' },
            { letra: 'B', texto: 'Voluntad de hierro oculta' },
            { letra: 'C', texto: 'Difícil de irritar' },
            { letra: 'D', texto: 'Está siempre alerta emocionalmente' },
          ],
          correcta: 'D',
        },
        {
          texto: '¿Qué defecto no corresponde al flemático?',
          opciones: [
            { letra: 'A', texto: 'Se deja llevar por las circunstancias' },
            { letra: 'B', texto: 'Le encanta la diversión y busca la novedad' },
            { letra: 'C', texto: 'No soporta equivocarse' },
            { letra: 'D', texto: 'Le cuesta tomar la iniciativa' },
          ],
          correcta: 'B',
        },
        {
          texto: '¿Qué temperamento hace a un buen hombre de ciencia?',
          opciones: [
            { letra: 'A', texto: 'Colérico' },
            { letra: 'B', texto: 'Sanguíneo' },
            { letra: 'C', texto: 'Melancólico' },
            { letra: 'D', texto: 'Flemático' },
          ],
          correcta: 'D',
        },
      ],
    },

    // ─── PASO 26: TEST PROFUNDO — Flemático (condicional) ───
    {
      id: 'm1-26', tipo: 'test_profundo', visible: false,
      titulo: 'Reflexión profunda — Flemático',
      temperamento: 'FLE',
      virtud_desafio: 'Magnanimidad',
      num_preguntas: 11,
      preguntas: [
        { texto: '¿Suelo buscar la compañía de personas magnánimas?' },
        { texto: '¿Me esfuerzo por crear un «entorno magnánimo» a mi alrededor (mi entorno son los libros que leo, las películas que veo, la música que escucho, Internet)? ¿Rechazo lo que es moralmente cuestionable y lleno mi corazón y mi mente de lo que es noble?' },
        { texto: '¿Procuro cultivar mi imaginación?' },
        { texto: '¿Me esfuerzo por desarrollar mis talentos o me limito a luchar contra mis defectos?' },
        { texto: '¿Intento descubrir mi misión en la vida, formularla y ponerla en práctica?' },
        { texto: '¿Dejo pasar las oportunidades de actuar por miedo o pereza?' },
        { texto: '¿Cuántas veces soy yo quien propone una solución sin que nadie me lo pida?' },
        { texto: '¿Caigo a menudo en la tentación de pensar que involucrarme en los «problemas» de los demás no me va a llevar a ninguna parte?' },
        { texto: '¿Intento comprender las necesidades reales de mis amigos, sus luchas, sus retos particulares, o me conformo con el statu quo en mi trato con ellos?' },
        { texto: '¿Evito conversaciones incómodas por miedo al conflicto o a complicarme la vida?' },
        { texto: '¿Intento salir de mi «zona de confort», asumiendo tareas que parecen difíciles?' },
      ],
    },

    // ─── PASO 27: CIERRE ───
    {
      id: 'm1-27', tipo: 'cierre', visible: true,
      titulo: 'Mi Síntesis — Módulo 1',
    },
  ],
};
