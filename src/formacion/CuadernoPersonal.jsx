import { useState } from 'react';
import { NAVY, MUTED, GOLD_REF, GOLD_REF_DK, PAPER, LINE, FONT_BODY, FONT_SLAB } from '../theme';
import { tarjeta, eyebrow } from '../app/estilos';

const TEMP_NOMBRE = { COL: 'Colérico', MEL: 'Melancólico', SAN: 'Sanguíneo', FLE: 'Flemático' };

const TEST_PROFUNDO_IDS = ['m1-17', 'm1-20', 'm1-23', 'm1-26'];
const IDENTIFICA_ID = 'm1-08';

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
  return tieneIdentifica || tieneProfundo || tieneNotas;
}

async function generarPDF(userId, pasos) {
  const { jsPDF } = await import('jspdf');
  const comp = leerProgreso(userId);
  const notas = leerNotas(userId);

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const ML = 20;
  const MR = 20;
  const TW = W - ML - MR;
  let y = 0;

  function checkPage(need) {
    if (y + need > H - 20) {
      doc.addPage();
      y = 25;
    }
  }

  function heading(texto) {
    checkPage(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(27, 42, 74);
    doc.text(texto, ML, y);
    y += 4;
    doc.setDrawColor(165, 139, 38);
    doc.setLineWidth(0.6);
    doc.line(ML, y, ML + TW, y);
    y += 10;
  }

  function subheading(texto) {
    checkPage(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(27, 42, 74);
    doc.text(texto, ML, y);
    y += 8;
  }

  function label(texto) {
    checkPage(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(100, 110, 130);
    doc.text(texto, ML + 2, y);
    y += 5;
  }

  function body(texto) {
    if (!texto) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 55, 65);
    const lines = doc.splitTextToSize(texto, TW - 4);
    for (const line of lines) {
      checkPage(5.5);
      doc.text(line, ML + 2, y);
      y += 5;
    }
    y += 2;
  }

  function preguntaRespuesta(pregunta, respuesta) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(27, 42, 74);
    const qLines = doc.splitTextToSize(pregunta, TW - 4);
    for (const line of qLines) {
      checkPage(5.5);
      doc.text(line, ML + 2, y);
      y += 5;
    }
    y += 1;
    if (respuesta) {
      body(respuesta);
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(160, 160, 170);
      doc.text('(sin respuesta)', ML + 2, y);
      y += 6;
    }
    y += 3;
  }

  // ─── Portada ───
  y = 70;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(27, 42, 74);
  doc.text('Mi cuaderno personal', W / 2, y, { align: 'center' });
  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(100, 110, 130);
  doc.text('Formación en Liderazgo Virtuoso', W / 2, y, { align: 'center' });
  y += 10;
  doc.setFontSize(11);
  doc.text(formatFecha(new Date().toISOString()), W / 2, y, { align: 'center' });

  y += 18;
  doc.setDrawColor(165, 139, 38);
  doc.setLineWidth(0.8);
  doc.line(W / 2 - 30, y, W / 2 + 30, y);

  y += 12;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(130, 130, 140);
  const nota = doc.splitTextToSize(
    'Este cuaderno recoge tus reflexiones personales del curso. Es un documento privado para tu crecimiento.',
    120,
  );
  for (const line of nota) {
    doc.text(line, W / 2, y, { align: 'center' });
    y += 5;
  }

  // ─── Identifica (Mi carácter) ───
  const ident = comp[IDENTIFICA_ID];
  if (ident?.respuestas?.length) {
    doc.addPage();
    y = 25;
    heading('Mi carácter');

    const virtudes = pasos.find(p => p.id === IDENTIFICA_ID)?.virtudes ?? [];
    for (let i = 0; i < ident.respuestas.length; i++) {
      const r = ident.respuestas[i];
      const v = virtudes[i];
      if (!v) continue;

      checkPage(30);
      subheading(v.nombre);

      const facilLabel = r.facil === 'pasivo' ? v.pasivo : v.activo;
      const dificilLabel = r.facil === 'pasivo' ? v.activo : v.pasivo;

      label(`Me resulta más fácil: ${facilLabel}`);
      if (r.ejemploFacil) body(r.ejemploFacil);

      label(`Me cuesta más: ${dificilLabel}`);
      if (r.ejemploDificil) body(r.ejemploDificil);

      y += 4;
    }
  }

  // ─── Tests profundos ───
  for (const stepId of TEST_PROFUNDO_IDS) {
    const resultado = comp[stepId];
    if (!resultado?.respuestas) continue;
    const hayAlguna = resultado.respuestas.some(r => r);
    if (!hayAlguna) continue;

    const paso = pasos.find(p => p.id === stepId);
    if (!paso) continue;

    doc.addPage();
    y = 25;
    heading(`Autoexamen — ${TEMP_NOMBRE[paso.temperamento] ?? paso.temperamento}`);

    label(paso.foco ?? '');
    y += 2;

    for (let i = 0; i < paso.preguntas.length; i++) {
      preguntaRespuesta(paso.preguntas[i], resultado.respuestas[i] || '');
    }
  }

  // ─── Bloc de notas ───
  const todasLasNotas = [];
  for (const [stepId, arr] of Object.entries(notas)) {
    for (const n of arr) {
      const paso = pasos.find(p => p.id === stepId);
      todasLasNotas.push({ ...n, stepId, pasoTitulo: paso?.titulo ?? stepId });
    }
  }
  todasLasNotas.sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? ''));

  if (todasLasNotas.length) {
    doc.addPage();
    y = 25;
    heading('Mis notas');

    for (const n of todasLasNotas) {
      checkPage(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(130, 130, 140);
      doc.text(`${formatFecha(n.fecha)} · ${n.pasoTitulo}`, ML + 2, y);
      y += 5;
      body(n.texto);
      y += 2;
    }
  }

  doc.save('cuaderno-personal-vl.pdf');
}

export function CuadernoPersonal({ userId, pasos }) {
  const [generando, setGenerando] = useState(false);
  const hay = tieneContenido(userId, pasos);

  if (!hay) return null;

  async function descargar() {
    setGenerando(true);
    try {
      await generarPDF(userId, pasos);
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
