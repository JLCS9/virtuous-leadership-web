#!/usr/bin/env python3
"""Extrae los textos del Test del Corazón (modelo "Corazón Libre" de A. Havard,
8 enfermedades espirituales) desde el archivo oficial `.ods` y emite dos
JSONs en `src/data/`:

  1. heart-test.json
      - meta: { source, disorders_count, questions_per_disorder,
                thresholds: { LOW_PCT, HIGH_PCT } }.
      - disorders: lista ordenada de los 8 trastornos con
        { code, label_key, html_key, question_codes[4] }.
      - questions: 32 items { code, disorder_code, text: { en, ru, fr, es, pt } }.
      - link_to_book: { en, ru, fr, es, pt }  (URL de compra del libro).

  2. heart-support-text.json
      - labels: dict { key: {en,ru,fr,es,pt} } con
          heartTest, heartTestIntro,
          hResult* (nombres de los 8 trastornos),
          hResultNoDecease, hResultDeceaseStage1, hResultDeceaseStage2,
          hResultInBalance,
          y las 2 UI labels ("después de 4 preguntas", "en el final").
      - html: dict { key: {en,ru,fr,es,pt} } con
          about-heart.html + 8 HTMLs `N-XX.html` (diagnóstico y remedio).

Idiomas activos en el ODS: EN, RU, FR, ES, PT. DE e IT están vacíos → ignorados.
El sitio expone solo ES/EN/FR/RU; PT se conserva por si algún día se activa.

Determinismo: no random, no fechas. Mismo ODS → mismos JSONs.

Uso:
    python3 scripts/extract-heart-ods.py [path/al/ODS]
"""

import json
import sys
from pathlib import Path

from odf.opendocument import load
from odf.table import Table, TableRow, TableCell
from odf.text import P

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ODS = '/Users/joseluiscastedosanchez/Downloads/TRAD Test Corazon libre 4 languages.ods'
OUT_DIR = REPO_ROOT / 'src' / 'data'

# Columnas del ODS (headers en fila 1): 0=code, 1=EN, 2=RU, 3=FR, 4=ES,
# 5=DE (vacía), 6=IT (vacía), 7=PT.
LANG_COLUMNS = [
    ('en', 1),
    ('ru', 2),
    ('fr', 3),
    ('es', 4),
    ('pt', 7),
]

# Los 8 trastornos en orden semántico (racionalismo → voluntarismos →
# sentimentalismos). El orden importa porque define el orden visual en la
# pantalla de resultados. `label_key` y `html_key` referencian claves del
# ODS (hoja support_text implícita).
DISORDERS = [
    # (code, label_key, html_key, question_prefix)
    ('R',  'hResultR',  '1-R.html',  'hQuestionR'),
    ('VR', 'hResultVR', '2-VR.html', 'hQuestionVR'),
    ('VM', 'hResultVM', '3-VM.html', 'hQuestionVM'),
    ('VI', 'hResultVI', '4-VI.html', 'hQuestionVI'),
    ('VC', 'hResultVC', '5-VC.html', 'hQuestionVC'),
    ('SV', 'hResultSV', '6-SV.html', 'hQuestionSV'),
    ('SI', 'hResultSI', '7-SI.html', 'hQuestionSI'),
    ('SC', 'hResultSC', '8-SC.html', 'hQuestionSC'),
]

# Umbrales default de stage (parametrizables luego desde el motor JS).
THRESHOLDS = {'LOW_PCT': 33, 'HIGH_PCT': 66}

# Claves de labels UI (aparte de los hResult* de trastornos).
UI_LABEL_KEYS = [
    'heartTest',
    'heartTestIntro',
    'hResultNoDecease',
    'hResultDeceaseStage1',
    'hResultDeceaseStage2',
    'hResultInBalance',
    'после 4 вопросов',    # UI label (fila con clave en ruso en el ODS)
    'в конце',              # UI label (idem)
]


def cell_text(cell):
    """Extrae texto plano de una celda ODS, concatenando <text:p> con \n."""
    ps = cell.getElementsByType(P)
    return '\n'.join(
        ''.join(node.data for node in p.childNodes if node.nodeType == 3)
        for p in ps
    ).strip()


def repeated(cell):
    """Número de columnas que ocupa la celda (por spans/vacías comprimidas)."""
    return int(cell.getAttribute('numbercolumnsrepeated') or 1)


def expand_row(row):
    """Devuelve las celdas de una fila expandidas — respetando el atributo
    `number-columns-repeated` de ODS y padding a 8 columnas."""
    cells = row.getElementsByType(TableCell)
    expanded = []
    for c in cells:
        txt = cell_text(c)
        for _ in range(repeated(c)):
            expanded.append(txt)
    # trim trailing empties para no arrastrar celdas vacías infinitas
    while expanded and expanded[-1] == '':
        expanded.pop()
    # pad a 8 columnas (para acceder por índice sin IndexError)
    expanded += [''] * (8 - len(expanded))
    return expanded


def load_rows_by_code(ods_path):
    """Lee el ODS y devuelve dict { code: { en, ru, fr, es, pt } }."""
    wb = load(ods_path)
    t = wb.getElementsByType(Table)[0]
    rows = t.getElementsByType(TableRow)
    by_code = {}
    for row in rows:
        cells = expand_row(row)
        code = cells[0].strip()
        if not code or code == 'code':
            continue
        by_code[code] = {lang: cells[col] for lang, col in LANG_COLUMNS}
    return by_code


def main():
    ods_path = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_ODS
    print(f'Reading {ods_path}')
    rows = load_rows_by_code(ods_path)
    print(f'  total codes: {len(rows)}')

    # ── heart-test.json ──
    questions = []
    for code, _, _, prefix in DISORDERS:
        for i in (1, 2, 3, 4):
            q_code = f'{prefix}{i}'
            if q_code not in rows:
                raise SystemExit(f'  ✗ missing question {q_code} in ODS')
            questions.append({
                'code': q_code,
                'disorder_code': code,
                'text': rows[q_code],
            })
    print(f'  ✓ 32 questions extracted (8 disorders × 4)')
    assert len(questions) == 32, f'expected 32 questions, got {len(questions)}'

    disorders_json = [
        {
            'code': code,
            'label_key': lk,
            'html_key': hk,
            'question_codes': [f'{prefix}{i}' for i in (1, 2, 3, 4)],
        }
        for code, lk, hk, prefix in DISORDERS
    ]

    link_book = rows.get('linkToBookHeart', {lang: '' for lang, _ in LANG_COLUMNS})

    test_json = {
        'meta': {
            'source': 'TRAD Test Corazon libre 4 languages.ods',
            'disorders_count': 8,
            'questions_per_disorder': 4,
            'questions_total': 32,
            'thresholds': THRESHOLDS,
        },
        'disorders': disorders_json,
        'questions': questions,
        'link_to_book': link_book,
    }

    # ── heart-support-text.json ──
    labels = {}
    for key in UI_LABEL_KEYS:
        if key in rows:
            labels[key] = rows[key]

    # Nombres de los 8 trastornos (hResult*)
    for _, label_key, _, _ in DISORDERS:
        if label_key in rows:
            labels[label_key] = rows[label_key]
        else:
            raise SystemExit(f'  ✗ missing disorder label {label_key}')
    print(f'  ✓ {len(labels)} labels extracted')

    # 8 HTMLs de diagnóstico+remedio + about-heart.html
    html_keys = ['about-heart.html'] + [hk for _, _, hk, _ in DISORDERS]
    htmls = {}
    for key in html_keys:
        if key in rows:
            htmls[key] = rows[key]
        else:
            raise SystemExit(f'  ✗ missing HTML {key}')
    print(f'  ✓ {len(htmls)} HTML blocks extracted')

    support_json = {
        'meta': {
            'source': 'TRAD Test Corazon libre 4 languages.ods',
            'labels_count': len(labels),
            'htmls_count': len(htmls),
            'languages_active': [lang for lang, _ in LANG_COLUMNS],
            'note': 'Some cells may be empty in some languages (gaps in the ODS). '
                    'The React engine falls back: active_lang → EN → ES.',
        },
        'labels': labels,
        'html': htmls,
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out1 = OUT_DIR / 'heart-test.json'
    out2 = OUT_DIR / 'heart-support-text.json'
    out1.write_text(json.dumps(test_json, ensure_ascii=False, indent=2), encoding='utf-8')
    out2.write_text(json.dumps(support_json, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f'\nWrote:')
    print(f'  {out1}  ({out1.stat().st_size:,} bytes)')
    print(f'  {out2}  ({out2.stat().st_size:,} bytes)')

    # Report gaps encontrados (informativo — la app hace fallback en runtime)
    print(f'\n=== Gaps del ODS (fallback EN→ES los cubre) ===')
    def gaps_of(key):
        return [lang for lang, val in rows.get(key, {}).items() if not val]
    for key in ['linkToBookHeart', 'about-heart.html']:
        g = gaps_of(key)
        if g:
            print(f'  {key}: missing {g}')
    for q in questions:
        g = [lang for lang, val in q['text'].items() if not val]
        if g:
            print(f'  {q["code"]}: missing {g}')


if __name__ == '__main__':
    main()
