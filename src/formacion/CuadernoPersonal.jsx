import { useState } from 'react';
import { MUTED, GOLD_REF, GOLD_REF_DK, LINE, FONT_BODY } from '../theme';

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

function splitText(text, font, fontSize, maxWidth) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function generarPDF(userId, pasos, temperamento) {
  const { PDFDocument, StandardFonts, rgb, PageSizes } = await import('pdf-lib');

  const comp = leerProgreso(userId);
  const notas = leerNotas(userId);
  const p = temperamento?.primary;
  const s = temperamento?.secondary;
  const perfil = s ? `${p}-${s}` : p;

  const pdfBytes = await fetch('/cuadernos/cuaderno-1.pdf').then(r => r.arrayBuffer());
  const doc = await PDFDocument.load(pdfBytes);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const INK = rgb(27 / 255, 42 / 255, 74 / 255);
  const GOLD = rgb(165 / 255, 139 / 255, 38 / 255);
  const MUTED_C = rgb(100 / 255, 110 / 255, 130 / 255);
  const GREEN = rgb(6 / 255, 95 / 255, 70 / 255);
  const RED = rgb(153 / 255, 27 / 255, 27 / 255);

  const pages = doc.getPages();
  const PH = 842;
  const ML = 78;
  const TW = 440;

  function draw(page, text, x, yTop, opts = {}) {
    if (!text) return 0;
    const { size = 10, bold, italic, color = INK, maxWidth } = opts;
    const f = bold ? fontBold : italic ? fontItalic : font;
    if (maxWidth) {
      const lines = splitText(text, f, size, maxWidth);
      let linesDrawn = 0;
      for (const line of lines) {
        page.drawText(line, { x, y: PH - yTop - linesDrawn * (size + 3), size, font: f, color });
        linesDrawn++;
      }
      return linesDrawn;
    }
    page.drawText(text, { x, y: PH - yTop, size, font: f, color });
    return 1;
  }

  function check(page, x, yTop) {
    page.drawText('X', { x: x + 3, y: PH - yTop + 1, size: 11, font: fontBold, color: INK });
  }

  // ━━━ PAGE 4 (index 3): Conceptos básicos ━━━
  const definePasos = pasos.filter(pp => DEFINE_IDS.includes(pp.id));
  const allConceptos = definePasos.flatMap(pp => pp.conceptos ?? []);
  const defineComplete = DEFINE_IDS.some(id => comp[id]);

  if (defineComplete && allConceptos.length > 0) {
    const pg = pages[3];
    const conceptoPos = {
      'Temperamento': 200, 'Temperamento colérico': 245, 'Temperamento melancólico': 288,
      'Temperamento sanguíneo': 332, 'Temperamento flemático': 375,
      'Carácter': 430, 'Prudencia': 473, 'Fortaleza': 517,
      'Dominio de sí': 560, 'Justicia': 605, 'Humildad': 647, 'Magnanimidad': 690,
    };
    for (const c of allConceptos) {
      const yTop = conceptoPos[c.concepto];
      if (!yTop) continue;
      const txt = (c.correctas ?? []).slice(0, 3).join('  ·  ');
      if (txt) draw(pg, txt, 200, yTop, { size: 9 });
    }
  }

  // ━━━ PAGE 5 (index 4): Mi temperamento ━━━
  if (p) {
    const pg = pages[4];
    const xPos = { COL: 242, MEL: 330, SAN: 414, FLE: 500 };
    if (xPos[p]) check(pg, xPos[p], 414);
    if (s && xPos[s]) check(pg, xPos[s], 438);
  }

  // ━━━ PAGES 7-8 (index 6-7): Mi carácter ━━━
  const ident = comp[IDENTIFICA_ID];
  if (ident?.respuestas?.length) {
    const virtudes = pasos.find(pp => pp.id === IDENTIFICA_ID)?.virtudes ?? [];
    // Page 7 (index 6): Prudencia, Fortaleza, Dominio de sí
    // Page 8 (index 7): Justicia, Magnanimidad, Humildad
    const layout = [
      { pi: 6, idx: [0, 1, 2], bases: [70, 275, 480] },
      { pi: 7, idx: [3, 4, 5], bases: [60, 265, 470] },
    ];
    for (const l of layout) {
      const pg = pages[l.pi];
      for (let vi = 0; vi < l.idx.length; vi++) {
        const r = ident.respuestas[l.idx[vi]];
        const v = virtudes[l.idx[vi]];
        if (!v || !r) continue;
        const base = l.bases[vi];
        if (r.facil) draw(pg, r.facil, 170, base + 28, { size: 9 });
        if (r.ejemploFacil) draw(pg, r.ejemploFacil, 140, base + 48, { size: 9, maxWidth: 370 });
        if (r.dificil) draw(pg, r.dificil, 145, base + 85, { size: 9 });
        if (r.ejemploDificil) draw(pg, r.ejemploDificil, 140, base + 105, { size: 9, maxWidth: 370 });
      }
    }
  }

  // ━━━ PAGE 11 (index 10): Los desafíos - Paso 1 ━━━
  if (p) {
    const pg = pages[10];
    const retos = comp[RETOS_ID];
    const fd = FACILITA_DIFICULTA[p];
    const facilitaTxt = retos?.textoFacilita ?? fd?.facilita ?? '';
    if (facilitaTxt) draw(pg, facilitaTxt, ML, 370, { size: 10, maxWidth: TW });
    const dificultaTxt = retos?.textoDificulta ?? fd?.dificulta ?? '';
    if (dificultaTxt) draw(pg, dificultaTxt, ML, 460, { size: 10, maxWidth: TW });

    const vd = VIRTUD_DESAFIO_MAP[perfil] ?? VIRTUD_DESAFIO_MAP[p];
    const vdX = { Humildad: 227, Audacia: 310, Perseverancia: 397, Magnanimidad: 490 };
    const simple = vd?.includes('Humildad') ? 'Humildad'
      : vd?.includes('Audacia') ? 'Audacia'
      : (vd?.includes('esistencia') || vd?.includes('erseverancia')) ? 'Perseverancia'
      : vd?.includes('Magnanimidad') ? 'Magnanimidad' : null;
    if (simple && vdX[simple]) check(pg, vdX[simple], 530);
  }

  // ━━━ PAGE 12 (index 11): Los desafíos - Paso 2 ━━━
  if (p && s) {
    const pg = pages[11];
    const retos = comp[RETOS_ID];
    if (retos?.textoDefectos) {
      draw(pg, retos.textoDefectos, ML, 170, { size: 9, maxWidth: TW });
    }
  }

  // ━━━ PAGE 24 (index 23): Mi síntesis ━━━
  {
    const pg = pages[23];
    const cierre = comp[CIERRE_ID];
    const tempPrim = TEMP_NOMBRE[cierre?.temperamento_primario ?? p] ?? '';
    if (tempPrim) draw(pg, tempPrim, 250, 110, { bold: true, size: 10 });
    const tempSec = TEMP_NOMBRE[cierre?.temperamento_secundario ?? s] ?? '';
    if (tempSec) draw(pg, tempSec, 440, 110, { bold: true, size: 10 });
    const vdS = cierre?.virtud_desafio ?? VIRTUD_DESAFIO_MAP[perfil] ?? VIRTUD_DESAFIO_MAP[p] ?? '';
    if (vdS) draw(pg, vdS, 200, 145, { bold: true, size: 10 });
    if (cierre?.lo_que_facilita) draw(pg, cierre.lo_que_facilita, 330, 182, { size: 9, maxWidth: 190 });
    if (cierre?.lo_que_cuesta) draw(pg, cierre.lo_que_cuesta, 260, 222, { size: 9, maxWidth: 260 });
    if (cierre?.proposito) draw(pg, cierre.proposito, ML, 480, { size: 9, maxWidth: TW });
  }

  // ━━━ APPENDIX: Test profundo answers ━━━
  let hayTest = false;
  for (const id of TEST_PROFUNDO_IDS) {
    if (comp[id]?.respuestas?.some(r => r)) { hayTest = true; break; }
  }

  if (hayTest) {
    for (const stepId of TEST_PROFUNDO_IDS) {
      const resultado = comp[stepId];
      if (!resultado?.respuestas?.some(r => r)) continue;
      const paso = pasos.find(pp => pp.id === stepId);
      if (!paso) continue;

      let curPage = doc.addPage(PageSizes.A4);
      let y = 60;

      curPage.drawText(`Test profundo — ${TEMP_NOMBRE[paso.temperamento] ?? paso.temperamento}`, {
        x: ML, y: PH - y, size: 18, font: fontBold, color: INK,
      });
      y += 8;
      curPage.drawLine({ start: { x: ML, y: PH - y }, end: { x: ML + 80, y: PH - y }, thickness: 1.2, color: GOLD });
      y += 16;
      curPage.drawText('Tus respuestas del curso', {
        x: ML, y: PH - y, size: 10, font: fontItalic, color: MUTED_C,
      });
      y += 18;

      for (let i = 0; i < paso.preguntas.length; i++) {
        const resp = resultado.respuestas[i];
        const qLines = splitText(`${i + 1}. ${paso.preguntas[i]}`, fontBold, 10, TW);
        const aLines = resp ? splitText(resp, font, 9, TW - 10) : [];
        const need = qLines.length * 13 + 3 + Math.max(aLines.length * 12, 16) + 10;

        if (y + need > PH - 40) {
          curPage = doc.addPage(PageSizes.A4);
          y = 50;
        }

        for (const line of qLines) {
          curPage.drawText(line, { x: ML, y: PH - y, size: 10, font: fontBold, color: INK });
          y += 13;
        }
        y += 3;

        if (resp) {
          for (const line of aLines) {
            curPage.drawText(line, { x: ML + 5, y: PH - y, size: 9, font, color: rgb(50 / 255, 55 / 255, 65 / 255) });
            y += 12;
          }
        } else {
          curPage.drawLine({
            start: { x: ML + 5, y: PH - y }, end: { x: ML + TW - 5, y: PH - y },
            thickness: 0.3, color: rgb(200 / 255, 200 / 255, 210 / 255),
          });
          y += 8;
          curPage.drawLine({
            start: { x: ML + 5, y: PH - y }, end: { x: ML + TW - 5, y: PH - y },
            thickness: 0.3, color: rgb(200 / 255, 200 / 255, 210 / 255),
          });
          y += 8;
        }
        y += 10;
      }
    }
  }

  // ━━━ APPENDIX: Notas ━━━
  const allNotas = [];
  for (const [stepId, arr] of Object.entries(notas)) {
    for (const n of arr) {
      const paso = pasos.find(pp => pp.id === stepId);
      allNotas.push({ ...n, pasoTitulo: paso?.titulo ?? stepId });
    }
  }
  allNotas.sort((a, b) => (a.fecha ?? '').localeCompare(b.fecha ?? ''));

  if (allNotas.length > 0) {
    const pg = doc.addPage(PageSizes.A4);
    let y = 60;

    pg.drawText('Tus notas del curso', {
      x: ML, y: PH - y, size: 18, font: fontBold, color: INK,
    });
    y += 8;
    pg.drawLine({ start: { x: ML, y: PH - y }, end: { x: ML + 80, y: PH - y }, thickness: 1.2, color: GOLD });
    y += 20;

    for (const n of allNotas) {
      if (y > PH - 60) {
        break; // simplified: don't overflow for now
      }
      pg.drawText(`${formatFecha(n.fecha)} · ${n.pasoTitulo}`, {
        x: ML, y: PH - y, size: 8, font: fontBold, color: MUTED_C,
      });
      y += 12;
      const nLines = splitText(n.texto, font, 9, TW - 10);
      for (const line of nLines) {
        if (y > PH - 40) break;
        pg.drawText(line, { x: ML + 5, y: PH - y, size: 9, font, color: rgb(50 / 255, 55 / 255, 65 / 255) });
        y += 12;
      }
      y += 8;
    }
  }

  // ━━━ Footer on appended pages ━━━
  const originalPageCount = 26;
  const totalPages = doc.getPageCount();
  for (let i = originalPageCount; i < totalPages; i++) {
    const pg = doc.getPages()[i];
    pg.drawText('Liderazgo Virtuoso® 2026 · alexhavard.com · virtuousleadership.com', {
      x: ML, y: 22, size: 7, font, color: MUTED_C,
    });
    pg.drawText(String(i + 1), {
      x: 595 - ML, y: 22, size: 7, font, color: MUTED_C,
    });
  }

  const modified = await doc.save();
  const blob = new Blob([modified], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cuaderno-personal-vl.pdf';
  a.click();
  URL.revokeObjectURL(url);
}

export function CuadernoPersonal({ userId, pasos, temperamento }) {
  const [generando, setGenerando] = useState(false);

  async function descargar() {
    setGenerando(true);
    try {
      await generarPDF(userId, pasos, temperamento);
    } catch (err) {
      console.error('Error generando cuaderno:', err);
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
