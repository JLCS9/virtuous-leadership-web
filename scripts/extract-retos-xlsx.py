#!/usr/bin/env python3
"""Genera `src/data/camino-biblioteca.json` desde el Excel de la biblioteca de retos del Camino
(`docs/camino/Virtus_biblioteca_retos_vX.xlsx`).

Hojas que lee: Léeme (solo la versión), Retos, Citas, Variables, Preguntas iniciales y Hábitos.

Salida:
  meta                 { version, fuente }
  retos[]              { id, temperamento, virtud, consigna, fuente, opciones{persona,habito,situacion},
                         noche{reflexion,nutrir,variable}, citas[], validacion }
  citas[]              { id, tema, texto, autor, origen, fuente, retos[], libre, momento, literal,
                         nota, validacion }
  variables[]          { id, descripcion, origen, grupo, persona, forma, ejemplo, defecto }
  preguntas_iniciales[]{ temperamento, orden, pregunta, variable, validacion }
  habitos              { max_activos, dias_prueba, dias_ventana, dias_consolidar, min_semana,
                         semanas_bajo }

Reglas:
  · Es determinista: sin fechas ni azar. El mismo Excel da el mismo JSON.
  · Si algo no cuadra (variable sin definir, cita o reto inexistente, validación desconocida…)
    imprime TODOS los errores y termina con código 1 SIN escribir el JSON.
  · Los números de la hoja Hábitos se localizan por el texto exacto de su regla: si alguien cambia
    la redacción, falla a propósito en lugar de leer mal.

Uso:
    python3 scripts/extract-retos-xlsx.py docs/camino/Virtus_biblioteca_retos_v0.2.xlsx [salida.json]
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

import openpyxl

SALIDA_POR_DEFECTO = Path(__file__).resolve().parent.parent / "src" / "data" / "camino-biblioteca.json"

TEMPERAMENTOS = {"colerico": "COL", "melancolico": "MEL", "sanguineo": "SAN", "flematico": "FLE"}
VALIDACIONES = {"aprobado": "aprobado", "pendiente": "pendiente", "cambiar": "cambiar", "descartar": "descartado"}
MOMENTOS = {"manana": "manana", "noche": "noche"}
ORIGENES = {"alex": "alex", "citado por alex": "citado"}
OPCIONES = ("persona", "habito", "situacion")
ETIQUETAS_LIBRES = {"general", "mes 1"}

# Texto exacto de la regla (hoja Hábitos) → clave del JSON.
REGLAS_HABITOS = {
    "Máximo de hábitos activos": "max_activos",
    "Días de prueba": "dias_prueba",
    "Días de la ventana de consolidación": "dias_ventana",
    "Días cumplidos para consolidar": "dias_consolidar",
    "Días cumplidos por semana por debajo de los cuales la app pregunta": "min_semana",
    "Semanas seguidas por debajo antes de preguntar": "semanas_bajo",
}

ID_RETO = re.compile(r"^[CMSF]\d{2}$")
ID_CITA = re.compile(r"^Q\d{2,3}$")
LLAVES = re.compile(r"\{(\w+)\}")

errores = []


def error(donde, mensaje):
    errores.append(f"{donde}: {mensaje}")


def texto(celda):
    """Celda → texto sin espacios en los extremos ('' si está vacía)."""
    if celda is None:
        return ""
    return str(celda).strip()


def clave(s):
    """Para comparar sin mayúsculas ni acentos: 'Colérico' → 'colerico'."""
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn").strip()


def filas(hoja, columnas):
    """Filas con datos de una hoja (sin la cabecera), como listas de `columnas` textos."""
    for n, fila in enumerate(hoja.iter_rows(min_row=2, values_only=True), start=2):
        celdas = [texto(c) for c in fila[:columnas]]
        celdas += [""] * (columnas - len(celdas))
        if any(celdas):
            yield n, celdas


def enumerado(valor, tabla, donde, que):
    r = tabla.get(clave(valor))
    if r is None:
        error(donde, f"{que} desconocido: «{valor}» (admitidos: {', '.join(sorted(tabla))})")
    return r


def entero(valor, donde):
    try:
        n = int(float(valor))
    except ValueError:
        error(donde, f"no es un número: «{valor}»")
        return None
    if n != float(valor) or n < 0:
        error(donde, f"debe ser un entero positivo: «{valor}»")
        return None
    return n


def leer(ruta):
    libro = openpyxl.load_workbook(ruta, data_only=True)
    for nombre in ("Léeme", "Retos", "Citas", "Variables", "Preguntas iniciales", "Hábitos"):
        if nombre not in libro.sheetnames:
            sys.exit(f"Falta la hoja «{nombre}» en {ruta}")

    # ───── meta ─────
    version = None
    for fila in libro["Léeme"].iter_rows(values_only=True):
        m = re.match(r"Versión\s+([\d.]+)", texto(fila[0]))
        if m:
            version = m.group(1)
            break
    if not version:
        error("Léeme", "no encuentra la línea «Versión X.Y»")

    # ───── variables ─────
    variables = []
    for n, f in filas(libro["Variables"], 6):
        donde = f"Variables fila {n}"
        v = {
            "id": f[0], "descripcion": f[1], "origen": f[2], "grupo": None,
            "persona": f[0].startswith("persona_"), "forma": f[3], "ejemplo": f[4], "defecto": f[5],
        }
        if not re.match(r"^\w+$", f[0]):
            error(donde, f"nombre de variable no válido: «{f[0]}»")
        if not f[5]:
            error(donde, f"{f[0]} no tiene texto por defecto")
        g = re.search(r"grupo (\w+)", f[2])
        if g:
            v["grupo"] = g.group(1)
        variables.append(v)
    ids_variables = [v["id"] for v in variables]
    for dup in {i for i in ids_variables if ids_variables.count(i) > 1}:
        error("Variables", f"variable repetida: {dup}")
    conocidas = set(ids_variables)

    # ───── citas (primera pasada) ─────
    citas = []
    for n, f in filas(libro["Citas"], 12):
        donde = f"Citas fila {n} ({f[0]})"
        if not ID_CITA.match(f[0]):
            error(donde, f"ID de cita no válido: «{f[0]}»")
        retos, libre = [], False
        for parte in [p.strip() for p in f[6].split(",") if p.strip()]:
            if ID_RETO.match(parte):
                retos.append(parte)
            elif clave(parte) in ETIQUETAS_LIBRES:
                libre = True
            else:
                error(donde, f"«{parte}» no es un ID de reto ni «General» / «Mes 1»")
        if not f[2]:
            error(donde, "sin texto")
        if not (retos or libre):
            error(donde, "no encaja con ningún reto ni es libre")
        citas.append({
            "id": f[0], "tema": f[1], "texto": f[2], "autor": f[3],
            "origen": enumerado(f[4], ORIGENES, donde, "origen"),
            "fuente": f[5], "retos": retos, "libre": libre,
            "momento": enumerado(f[7], MOMENTOS, donde, "momento"),
            "literal": clave(f[8]) == "si", "nota": f[9],
            "validacion": enumerado(f[10], VALIDACIONES, donde, "validación"),
        })
    ids_citas = [c["id"] for c in citas]
    for dup in {i for i in ids_citas if ids_citas.count(i) > 1}:
        error("Citas", f"cita repetida: {dup}")

    # ───── retos ─────
    retos = []
    for n, f in filas(libro["Retos"], 14):
        donde = f"Retos fila {n} ({f[0]})"
        if not ID_RETO.match(f[0]):
            error(donde, f"ID de reto no válido: «{f[0]}»")
        opciones = dict(zip(OPCIONES, f[5:8]))
        for k, t in opciones.items():
            if not t:
                error(donde, f"falta la opción {k}")
            for nombre in LLAVES.findall(t):
                if nombre not in conocidas:
                    error(donde, f"la opción {k} usa {{{nombre}}}, que no está en la hoja Variables")
        for etiqueta, t in (("consigna", f[4]), ("reflexión", f[8]), ("pregunta de nutrir", f[9])):
            if not t:
                error(donde, f"falta {etiqueta}")
            if "{" in t or "}" in t:
                error(donde, f"{etiqueta} lleva llaves: solo se admiten en las opciones")
        if f[10] not in conocidas:
            error(donde, f"la variable que alimenta «{f[10]}» no está en la hoja Variables")
        sugeridas = [p.strip() for p in f[13].split(",") if p.strip()]
        retos.append({
            "id": f[0],
            "temperamento": enumerado(f[1], TEMPERAMENTOS, donde, "temperamento"),
            "virtud": f[2], "consigna": f[4], "fuente": f[3],
            "opciones": opciones,
            "noche": {"reflexion": f[8], "nutrir": f[9], "variable": f[10]},
            "citas": sugeridas,
            "validacion": enumerado(f[11], VALIDACIONES, donde, "validación"),
        })
    ids_retos = [r["id"] for r in retos]
    for dup in {i for i in ids_retos if ids_retos.count(i) > 1}:
        error("Retos", f"reto repetido: {dup}")

    # ───── referencias entre retos y citas (deben coincidir en los dos sentidos) ─────
    por_reto = {r["id"]: r for r in retos}
    por_cita = {c["id"]: c for c in citas}
    for r in retos:
        for q in r["citas"]:
            if q not in por_cita:
                error(f"Retos ({r['id']})", f"cita sugerida inexistente: {q}")
            elif r["id"] not in por_cita[q]["retos"]:
                error(f"Retos ({r['id']})", f"sugiere {q}, pero la hoja Citas no la liga a este reto")
    for c in citas:
        for rid in c["retos"]:
            if rid not in por_reto:
                error(f"Citas ({c['id']})", f"nombra un reto inexistente: {rid}")
            elif c["id"] not in por_reto[rid]["citas"]:
                error(f"Citas ({c['id']})", f"se liga a {rid}, pero ese reto no la sugiere")

    # ───── preguntas iniciales ─────
    preguntas = []
    for n, f in filas(libro["Preguntas iniciales"], 6):
        donde = f"Preguntas iniciales fila {n}"
        orden = entero(f[1], donde + " (orden)")
        if f[3] not in conocidas:
            error(donde, f"la variable «{f[3]}» no está en la hoja Variables")
        preguntas.append({
            "temperamento": enumerado(f[0], TEMPERAMENTOS, donde, "temperamento"),
            "orden": orden, "pregunta": f[2], "variable": f[3],
            "validacion": enumerado(f[4], VALIDACIONES, donde, "validación"),
        })
    for t in TEMPERAMENTOS.values():
        ordenes = sorted(p["orden"] for p in preguntas if p["temperamento"] == t and p["orden"] is not None)
        if ordenes != list(range(1, len(ordenes) + 1)):
            error("Preguntas iniciales", f"{t}: el orden debe ser 1, 2, 3… sin saltos ni repetidos (hay {ordenes})")

    # ───── hábitos ─────
    habitos = {}
    for n, fila in enumerate(libro["Hábitos"].iter_rows(values_only=True), start=1):
        regla = texto(fila[0])
        if regla in REGLAS_HABITOS:
            valor = entero(texto(fila[1]), f"Hábitos fila {n} ({regla})")
            if valor is not None:
                habitos[REGLAS_HABITOS[regla]] = valor
    for regla, k in REGLAS_HABITOS.items():
        if k not in habitos:
            error("Hábitos", f"no encuentro un número para la regla «{regla}»")

    # Orden estable de las claves de hábitos.
    habitos = {k: habitos[k] for k in REGLAS_HABITOS.values() if k in habitos}

    return {
        "meta": {"version": version, "fuente": Path(ruta).name},
        "retos": retos, "citas": citas, "variables": variables,
        "preguntas_iniciales": preguntas, "habitos": habitos,
    }


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    ruta = sys.argv[1]
    salida = Path(sys.argv[2]) if len(sys.argv) > 2 else SALIDA_POR_DEFECTO
    datos = leer(ruta)
    if errores:
        print(f"{len(errores)} error(es) en {ruta}; no se escribe nada:", file=sys.stderr)
        for e in errores:
            print(f"  · {e}", file=sys.stderr)
        sys.exit(1)
    salida.write_text(json.dumps(datos, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{salida}: {len(datos['retos'])} retos, {len(datos['citas'])} citas, "
          f"{len(datos['variables'])} variables, {len(datos['preguntas_iniciales'])} preguntas iniciales")


if __name__ == "__main__":
    main()
