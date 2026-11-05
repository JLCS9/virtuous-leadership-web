import { useState } from 'react';
import { NAVY, MUTED, GOLD_REF, GOLD_REF_DK, PAPER, LINE, FONT_BODY } from '../theme';

const TEMP_NOMBRE = { COL: 'Colérico', MEL: 'Melancólico', SAN: 'Sanguíneo', FLE: 'Flemático' };

const DEFINE_IDS = ['m1-02', 'm1-06'];
const IDENTIFICA_ID = 'm1-08';
const RETOS_ID = 'm1-13c';
const TEST_PROFUNDO_IDS = ['m1-17', 'm1-20', 'm1-23', 'm1-26'];
const CIERRE_ID = 'm1-27';

const VIRTUD_DESAFIO_MAP = {
  COL: 'Humildad', 'COL-MEL': 'Humildad fraterna', 'COL-SAN': 'Humildad fundamental',
  MEL: 'Audacia', 'MEL-COL': 'Humildad fraterna', 'MEL-FLE': 'Audacia',
  SAN: 'Resistencia y persistencia', 'SAN-COL': 'Humildad fundamental', 'SAN-FLE': 'Magnanimidad',
  FLE: 'Magnanimidad', 'FLE-MEL': 'Audacia', 'FLE-SAN': 'Magnanimidad',
};

const FACILITA_DIFICULTA = {
  COL: { facilita: 'la audacia (fortaleza)', dificulta: 'el servicio (humildad)' },
  MEL: { facilita: 'la deliberación (prudencia)', dificulta: 'la decisión y la audacia (fortaleza)' },
  SAN: { facilita: 'la comunión (justicia)', dificulta: 'la perseverancia (fortaleza)' },
  FLE: { facilita: 'el dominio propio', dificulta: 'la magnanimidad y la iniciativa' },
};

const SECUNDARIO_COMPENSA = {
  'COL-MEL': 'te será más fácil practicar la Deliberación (Prudencia) que si fueras 100% Colérico',
  'COL-SAN': 'te será más fácil practicar la Humildad que si fueras 100% Colérico',
  'MEL-COL': 'encontrarás más sencillo tomar decisiones (Prudencia) que si fueras 100% Melancólico',
  'MEL-FLE': 'te resultará más sencillo practicar el dominio propio que si fueras 100% Melancólico',
  'SAN-FLE': 'te será más fácil practicar la Perseverancia que si fueras 100% Sanguíneo',
  'SAN-COL': 'te será más fácil practicar la Perseverancia que si fueras 100% Sanguíneo',
  'FLE-SAN': 'será más fácil practicar la Magnanimidad que si fueras 100% Flemático',
  'FLE-MEL': 'será más fácil practicar la Magnanimidad que si fueras 100% Flemático',
};

function leerProgreso(userId) {
  try {
    const raw = localStorage.getItem(`vl-modulo:${userId}:modulo1`);
    return raw ? JSON.parse(raw).completados ?? {} : {};
  } catch { return {}; }
}

function leerNotas(userId) {
  try {
    const raw = localStorage.getItem(`vl-notas:${userId}:modulo1`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function formatFecha(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function tieneContenido(userId, pasos) {
  const comp = leerProgreso(userId);
  const notas = leerNotas(userId);
  const tieneIdentifica = comp[IDENTIFICA_ID]?.respuestas?.some(r => r.ejemploFacil || r.ejemploDificil);
  const tieneProfundo = TEST_PROFUNDO_IDS.some(id => comp[id]?.respuestas?.some(r => r));
  const tieneNotas = Object.values(notas).some(arr => arr.length > 0);
  const tieneDefine = DEFINE_IDS.some(id => comp[id]);
  return tieneIdentifica || tieneProfundo || tieneNotas || tieneDefine;
}

async function generarPDF(userId, pasos, temperamento) {
  const { jsPDF } = await import('jspdf');
  const comp = leerProgreso(userId);
  const notas = leerNotas(userId);

  const p = temperamento?.primary;
  const s = temperamento?.secondary;
  const perfil = s ? `${p}-${s}` : p;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ML = 20;
  const MR = 20;
  const TW = W - ML - MR;
  let y = 0;

  const NAVY_RGB = [27, 42, 74];
  const GOLD_RGB = [165, 139, 38];
  const MUTED_RGB = [100, 110, 130];
  const BODY_RGB = [50, 55, 65];

  function checkPage(need) {
    if (y + need > H - 20) { doc.addPage(); y = 25; }
  }

  function sectionTitle(num, texto) {
    checkPage(22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...NAVY_RGB);
    doc.text(`${num}. ${texto}`, ML, y);
    y += 5;
    doc.setDrawColor(...GOLD_RGB);
    doc.setLineWidth(0.8);
    doc.line(ML, y, ML + 60, y);
    y += 12;
  }

  function heading(texto) {
    checkPage(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...NAVY_RGB);
    doc.text(texto, ML, y);
    y += 8;
  }

  function subheading(texto) {
    checkPage(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...NAVY_RGB);
    doc.text(texto, ML, y);
    y += 7;
  }

  function label(texto) {
    checkPage(8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED_RGB);
    doc.text(texto, ML + 2, y);
    y += 5;
  }

  function body(texto) {
    if (!texto) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...BODY_RGB);
    const lines = doc.splitTextToSize(texto, TW - 4);
    for (const line of lines) {
      checkPage(5.5);
      doc.text(line, ML + 2, y);
      y += 5;
    }
    y += 2;
  }

  function blankLine() {
    checkPage(8);
    doc.setDrawColor(200, 200, 210);
    doc.setLineWidth(0.3);
    doc.line(ML + 2, y, ML + TW - 2, y);
    y += 7;
  }

  function preguntaRespuesta(num, pregunta, respuesta) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY_RGB);
    const qLines = doc.splitTextToSize(`${num}. ${pregunta}`, TW - 4);
    for (const line of qLines) {
      checkPage(5.5);
      doc.text(line, ML + 2, y);
      y += 5;
    }
    y += 2;
    if (respuesta) {
      body(respuesta);
    } else {
      blankLine();
      blankLine();
    }
    y += 3;
  }

  // ━━━ PORTADA ━━━
  y = 60;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...NAVY_RGB);
  doc.text('Mi cuaderno personal', W / 2, y, { align: 'center' });
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.setTextColor(...MUTED_RGB);
  doc.text('Curso 1 — Formación en Liderazgo Virtuoso', W / 2, y, { align: 'center' });
  y += 12;
  doc.setFontSize(12);
  doc.text(formatFecha(new Date().toISOString()), W / 2, y, { align: 'center' });
  y += 20;
  doc.setDrawColor(...GOLD_RGB);
  doc.setLineWidth(1);
  doc.line(W / 2 - 35, y, W / 2 + 35, y);
  y += 14;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(130, 130, 140);
  const portadaNota = doc.splitTextToSize(
    'Este cuaderno recoge tus reflexiones personales del curso. Es un documento privado para tu crecimiento.',
    120,
  );
  for (const line of portadaNota) {
    doc.text(line, W / 2, y, { align: 'center' });
    y += 5;
  }

  // ━━━ SECCIÓN 1: CONCEPTOS BÁSICOS ━━━
  const definePasos = pasos.filter(p => DEFINE_IDS.includes(p.id));
  const conceptos = definePasos.flatMap(p => p.conceptos ?? []);
  if (conceptos.length > 0) {
    doc.addPage();
    y = 25;
    sectionTitle('1', 'Conceptos básicos');

    body('Define cada concepto con tres palabras clave.');
    y += 4;

    for (const c of conceptos) {
      checkPage(22);
      subheading(c.concepto);
      const palabras = (c.correctas ?? []).slice(0, 3);
      if (palabras.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...BODY_RGB);
        doc.text(palabras.join('  ·  '), ML + 2, y);
        y += 7;
      } else {
        blankLine();
      }
      y += 3;
    }
  }

  // ━━━ SECCIÓN 2: MI TEMPERAMENTO ━━━
  if (p) {
    checkPage(40);
    if (y > 30) { doc.addPage(); y = 25; }
    sectionTitle('2', 'Mi temperamento');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...NAVY_RGB);
    doc.text('Mi temperamento primario:', ML + 2, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(TEMP_NOMBRE[p] ?? p, ML + 62, y);

    if (s) {
      doc.setFont('helvetica', 'bold');
      doc.text('· secundario:', ML + 100, y);
      doc.setFont('helvetica', 'normal');
      doc.text(TEMP_NOMBRE[s] ?? s, ML + 125, y);
    }
    y += 12;
  }

  // ━━━ SECCIÓN 3: MI CARÁCTER ━━━
  const ident = comp[IDENTIFICA_ID];
  if (ident?.respuestas?.length) {
    if (y > 60) { doc.addPage(); y = 25; }
    sectionTitle('3', 'Mi carácter');

    const virtudes = pasos.find(pp => pp.id === IDENTIFICA_ID)?.virtudes ?? [];

    for (let i = 0; i < ident.respuestas.length; i++) {
      const r = ident.respuestas[i];
      const v = virtudes[i];
      if (!v) continue;

      checkPage(38);
      subheading(v.nombre);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED_RGB);
      doc.text(`${v.pasivo}  ·  ${v.activo}`, ML + 2, y);
      y += 6;

      const facilLabel = r.facil ?? (r.facil === v.pasivo ? v.pasivo : v.activo);
      const dificilLabel = r.dificil ?? (r.facil === v.pasivo ? v.activo : v.pasivo);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(6, 95, 70);
      doc.text(`(+) Me resulta más fácil: ${facilLabel}`, ML + 2, y);
      y += 5;
      if (r.ejemploFacil) body(r.ejemploFacil);
      else { y += 2; }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(153, 27, 27);
      doc.text(`(−) Me cuesta más: ${dificilLabel}`, ML + 2, y);
      y += 5;
      if (r.ejemploDificil) body(r.ejemploDificil);
      else { y += 2; }

      y += 4;
    }
  }

  // ━━━ SECCIÓN 4: LOS DESAFÍOS DE MI TEMPERAMENTO ━━━
  if (p) {
    doc.addPage();
    y = 25;
    sectionTitle('4', 'Los desafíos de mi temperamento');

    // Paso 1: temperamento primario y virtudes
    heading('Paso 1 — Tu temperamento primario y las virtudes');

    const fd = FACILITA_DIFICULTA[p];
    if (fd) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(6, 95, 70);
      doc.text('FAVORECE', ML + 2, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...BODY_RGB);
      body(fd.facilita);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(153, 27, 27);
      doc.text('DIFICULTA', ML + 2, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...BODY_RGB);
      body(fd.dificulta);
      y += 4;
    }

    // Retos text reflections if available
    const retos = comp[RETOS_ID];
    if (retos?.textoFacilita) {
      label('Lo que mi temperamento me facilita:');
      body(retos.textoFacilita);
    }
    if (retos?.textoDificulta) {
      label('Lo que mi temperamento me dificulta:');
      body(retos.textoDificulta);
    }

    // Virtud-desafío
    y += 4;
    const vd = VIRTUD_DESAFIO_MAP[perfil] ?? VIRTUD_DESAFIO_MAP[p] ?? '—';
    heading('Tu virtud-desafío');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...NAVY_RGB);
    doc.text(vd, ML + 2, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...BODY_RGB);
    body('Cada temperamento tiene una virtud-desafío: la virtud que más necesitas trabajar a lo largo de tu vida.');

    // Paso 2: temperamento secundario
    if (s) {
      y += 6;
      heading('Paso 2 — Tu temperamento secundario');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...NAVY_RGB);
      doc.text(`Primario: ${TEMP_NOMBRE[p]}     Secundario: ${TEMP_NOMBRE[s]}`, ML + 2, y);
      y += 8;

      const comp_text = SECUNDARIO_COMPENSA[perfil];
      if (comp_text) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(6, 95, 70);
        const compLines = doc.splitTextToSize(`Como ${TEMP_NOMBRE[p]}/${TEMP_NOMBRE[s]}, ${comp_text}.`, TW - 4);
        for (const line of compLines) {
          checkPage(5.5);
          doc.text(line, ML + 2, y);
          y += 5;
        }
        y += 4;
      }

      if (retos?.textoDefectos) {
        label('Defectos del primario superados con la ayuda del secundario:');
        body(retos.textoDefectos);
      }
    }
  }

  // ━━━ SECCIÓN 5: TEST PARA CADA TEMPERAMENTO ━━━
  let hayAlgunTest = false;
  for (const stepId of TEST_PROFUNDO_IDS) {
    const resultado = comp[stepId];
    if (resultado?.respuestas?.some(r => r)) { hayAlgunTest = true; break; }
  }

  if (hayAlgunTest) {
    for (const stepId of TEST_PROFUNDO_IDS) {
      const resultado = comp[stepId];
      if (!resultado?.respuestas) continue;
      const hayAlguna = resultado.respuestas.some(r => r);
      if (!hayAlguna) continue;

      const paso = pasos.find(pp => pp.id === stepId);
      if (!paso) continue;

      doc.addPage();
      y = 25;

      if (stepId === TEST_PROFUNDO_IDS[0]) {
        sectionTitle('5', 'Test para cada temperamento');
      }

      heading(`${TEMP_NOMBRE[paso.temperamento] ?? paso.temperamento}`);

      if (paso.foco) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(...MUTED_RGB);
        doc.text(paso.foco, ML + 2, y);
        y += 7;
      }

      for (let i = 0; i < paso.preguntas.length; i++) {
        preguntaRespuesta(i + 1, paso.preguntas[i], resultado.respuestas[i] || '');
      }
    }
  }

  // ━━━ SECCIÓN 6: MI SÍNTESIS ━━━
  const cierre = comp[CIERRE_ID];
  const tieneSintesis = p || cierre;

  if (tieneSintesis) {
    doc.addPage();
    y = 25;
    sectionTitle('6', 'Mi síntesis');

    body('Reúne aquí lo esencial de este cuaderno. Es la página a la que volverás.');
    y += 4;

    // Temperamentos
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...NAVY_RGB);
    const tempPrimLabel = TEMP_NOMBRE[cierre?.temperamento_primario ?? p] ?? '—';
    const tempSecLabel = TEMP_NOMBRE[cierre?.temperamento_secundario ?? s] ?? '—';
    doc.text(`Mi temperamento primario: ${tempPrimLabel}`, ML + 4, y);
    doc.text(`· secundario: ${tempSecLabel}`, ML + 90, y);
    y += 8;

    // Virtud-desafío
    const vdSintesis = cierre?.virtud_desafio ?? VIRTUD_DESAFIO_MAP[perfil] ?? VIRTUD_DESAFIO_MAP[p] ?? '—';
    doc.text(`Mi virtud-desafío: ${vdSintesis}`, ML + 4, y);
    y += 10;

    // Lo que facilita
    label('Lo que mi temperamento me facilita, en una frase:');
    if (cierre?.lo_que_facilita) {
      body(cierre.lo_que_facilita);
    } else {
      blankLine();
    }
    y += 2;

    // Lo que cuesta
    label('Lo que más me cuesta, en una frase:');
    if (cierre?.lo_que_cuesta) {
      body(cierre.lo_que_cuesta);
    } else {
      blankLine();
    }
    y += 2;

    // 3 preguntas removedoras
    label('Las 3 preguntas del test que más me han removido (número y por qué):');
    blankLine();
    blankLine();
    blankLine();
    y += 2;

    // Propósito
    heading('Mi propósito para las próximas semanas');
    if (cierre?.proposito) {
      body(cierre.proposito);
    } else {
      blankLine();
      blankLine();
      blankLine();
    }

    y += 6;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED_RGB);
    const ejemploProp = doc.splitTextToSize(
      'Un buen propósito es concreto y se puede comprobar. Por ejemplo, para un colérico: «En las reuniones de los lunes pediré la opinión de dos personas antes de dar la mía».',
      TW - 8,
    );
    for (const line of ejemploProp) {
      checkPage(5);
      doc.text(line, ML + 4, y);
      y += 4.5;
    }
  }

  // ━━━ NOTAS ━━━
  const todasLasNotas = [];
  for (const [stepId, arr] of Object.entries(notas)) {
    for (const n of arr) {
      const paso = pasos.find(pp => pp.id === stepId);
      todasLasNotas.push({ ...n, stepId, pasoTitulo: paso?.titulo ?? stepId });
    }
  }
  todasLasNotas.sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? ''));

  if (todasLasNotas.length) {
    doc.addPage();
    y = 25;
    heading('Notas');
    doc.setDrawColor(...GOLD_RGB);
    doc.setLineWidth(0.6);
    doc.line(ML, y - 2, ML + 30, y - 2);
    y += 6;

    for (const n of todasLasNotas) {
      checkPage(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED_RGB);
      doc.text(`${formatFecha(n.fecha)} · ${n.pasoTitulo}`, ML + 2, y);
      y += 5;
      body(n.texto);
      y += 2;
    }
  }

  // ━━━ PIE ━━━
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 170);
    doc.text('Liderazgo Virtuoso® 2026 · alexhavard.com · virtuousleadership.com', ML, H - 10);
    doc.text(String(i), W - MR, H - 10, { align: 'right' });
  }

  doc.save('cuaderno-personal-vl.pdf');
}

export function CuadernoPersonal({ userId, pasos, temperamento }) {
  const [generando, setGenerando] = useState(false);
  const hay = tieneContenido(userId, pasos);

  if (!hay) return null;

  async function descargar() {
    setGenerando(true);
    try {
      await generarPDF(userId, pasos, temperamento);
    } catch (err) {
      console.error('Error generando PDF:', err);
    } finally {
      setGenerando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={descargar}
      disabled={generando}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600,
        color: generando ? MUTED : GOLD_REF_DK,
        background: 'none', border: `1.5px solid ${generando ? LINE : GOLD_REF}`,
        borderRadius: 0, padding: '10px 20px',
        cursor: generando ? 'wait' : 'pointer',
        transition: 'border-color 200ms ease, color 200ms ease',
        letterSpacing: '0.02em', width: '100%', justifyContent: 'center',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {generando ? 'Generando...' : 'Descargar cuaderno personal'}
    </button>
  );
}
