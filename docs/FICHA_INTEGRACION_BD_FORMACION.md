# Ficha Técnica: Integración BD Formación

**Objetivo**: Reemplazar `localStorage` por Supabase para guardar respuestas, progreso y notas de los cursos de formación.

**Fecha**: 2026-11-06  
**Estado**: Tablas creadas y contenido migrado (Curso 1: 42 pasos, Curso 2: 25 pasos).

---

## 1. Esquema de tablas

### 1.1 `contenidos` (lectura — ya poblada)

Almacena el contenido de cada paso de cada curso. **El frontend LEE de aquí**, no escribe.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | text PK | Identificador del paso (ej: `m1-01`, `m2-17`) |
| `tipo` | text | Tipo de actividad (ver sección 3) |
| `titulo` | text | Título visible del paso |
| `curso` | integer | Número de curso (1, 2, ...) |
| `modulo` | integer | Número de módulo dentro del curso (0, 1, 2, ...) |
| `orden` | integer | Posición secuencial dentro del curso |
| `visible` | boolean | Si el paso se muestra al usuario |
| `estado` | text | `'activo'` para pasos de formación |
| `datos` | jsonb | Contenido específico del tipo (preguntas, opciones, etc.) |

**Query para cargar un curso completo:**
```sql
SELECT id, tipo, titulo, modulo, orden, visible, datos
FROM contenidos
WHERE curso = :curso AND estado = 'activo'
ORDER BY orden;
```

**Equivalente Supabase JS:**
```js
const { data: pasos } = await supabase
  .from('contenidos')
  .select('id, tipo, titulo, modulo, orden, visible, datos')
  .eq('curso', cursoNum)
  .eq('estado', 'activo')
  .order('orden');
```

---

### 1.2 `respuestas` (lectura + escritura)

Guarda la respuesta del usuario a cada paso. **Una fila por usuario + paso** (UNIQUE en `user_id, contenido_id`).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | Auto-generado |
| `user_id` | uuid FK → auth.users | Usuario autenticado |
| `contenido_id` | text FK → contenidos | ID del paso (`m1-01`, `m2-17`, etc.) |
| `curso` | integer | Número de curso |
| `modulo` | integer | Número de módulo |
| `respuesta` | jsonb | Datos de la respuesta (ver sección 3) |
| `aprobado` | boolean NULL | `true`/`false` para evaluables, `NULL` para no evaluables |
| `completado` | boolean | Siempre `true` al insertar |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto (actualizar en UPSERT) |

**RLS activo**: el usuario solo ve/escribe sus propias filas (`auth.uid() = user_id`).

**Constraint UNIQUE**: `(user_id, contenido_id)` — si el usuario repite un paso, se hace UPSERT (actualizar la fila existente).

**INSERT (primera vez):**
```js
const { error } = await supabase.from('respuestas').insert({
  user_id: user.id,
  contenido_id: paso.id,     // ej: 'm1-05'
  curso: paso.curso,          // ej: 1
  modulo: paso.modulo,        // ej: 1
  respuesta: resultado,       // el objeto que devuelve onComplete()
  aprobado: calcularAprobado(paso.tipo, resultado),
});
```

**UPSERT (si el usuario repite el paso):**
```js
const { error } = await supabase.from('respuestas').upsert({
  user_id: user.id,
  contenido_id: paso.id,
  curso: paso.curso,
  modulo: paso.modulo,
  respuesta: resultado,
  aprobado: calcularAprobado(paso.tipo, resultado),
  updated_at: new Date().toISOString(),
}, { onConflict: 'user_id, contenido_id' });
```

**Leer respuestas de un curso:**
```js
const { data: respuestas } = await supabase
  .from('respuestas')
  .select('contenido_id, respuesta, aprobado, completado, created_at')
  .eq('user_id', user.id)
  .eq('curso', cursoNum);

// Convertir a mapa { [pasoId]: { respuesta, aprobado, ... } }
const mapaRespuestas = Object.fromEntries(
  respuestas.map(r => [r.contenido_id, r])
);
```

---

### 1.3 `progreso_curso` (lectura + escritura)

Resumen del avance del usuario en cada curso. **Una fila por usuario + curso**.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | Auto-generado |
| `user_id` | uuid FK | Usuario |
| `curso` | integer | Número de curso |
| `paso_actual` | text FK → contenidos NULL | ID del último paso visitado |
| `completados` | integer | Cuenta de pasos completados |
| `total_pasos` | integer | Total de pasos del curso |
| `iniciado_en` | timestamptz | Cuándo empezó el curso |
| `updated_at` | timestamptz | Última actualización |

**UPSERT al avanzar:**
```js
await supabase.from('progreso_curso').upsert({
  user_id: user.id,
  curso: cursoNum,
  paso_actual: pasoActual.id,
  completados: numCompletados,
  total_pasos: totalPasos,
  updated_at: new Date().toISOString(),
}, { onConflict: 'user_id, curso' });
```

**Leer progreso:**
```js
const { data } = await supabase
  .from('progreso_curso')
  .select('*')
  .eq('user_id', user.id)
  .eq('curso', cursoNum)
  .single();
// data.paso_actual → último paso visitado
// data.completados / data.total_pasos → barra de progreso
```

---

### 1.4 `notas_formacion` (lectura + escritura)

Notas libres del usuario sobre cualquier paso. **Múltiples notas por paso** (no hay UNIQUE).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid PK | Auto-generado |
| `user_id` | uuid FK | Usuario |
| `contenido_id` | text FK → contenidos | ID del paso |
| `texto` | text | Contenido de la nota |
| `created_at` | timestamptz | Auto |

**Insertar nota:**
```js
await supabase.from('notas_formacion').insert({
  user_id: user.id,
  contenido_id: paso.id,
  texto: textoNota,
});
```

**Leer notas de un paso:**
```js
const { data: notas } = await supabase
  .from('notas_formacion')
  .select('id, texto, created_at')
  .eq('user_id', user.id)
  .eq('contenido_id', paso.id)
  .order('created_at');
```

**Eliminar nota:**
```js
await supabase.from('notas_formacion')
  .delete()
  .eq('id', notaId)
  .eq('user_id', user.id);  // RLS ya lo exige, pero explícito por seguridad
```

---

## 2. Mapeo localStorage → Supabase

### 2.1 Reemplazar `useModuloProgreso` (src/formacion/useModulo.js)

**Antes (localStorage):**
```
clave: vl-modulo:{userId}:{moduloId}
valor: { completados: { [pasoId]: { fecha, ...resultado } }, pasoActual }
```

**Después (Supabase):**

| Dato localStorage | Tabla Supabase | Campo |
|---|---|---|
| `completados[pasoId]` | `respuestas` | Una fila por paso completado |
| `completados[pasoId].fecha` | `respuestas` | `created_at` |
| `completados[pasoId].{aciertos, total, ...}` | `respuestas` | `respuesta` (jsonb) |
| `pasoActual` | `progreso_curso` | `paso_actual` |

**Nuevo hook sugerido: `useModuloProgresoBD`**

```js
// Pseudocódigo — estructura del hook de reemplazo
export function useModuloProgresoBD(userId, cursoNum) {
  const [respuestas, setRespuestas] = useState({});
  const [pasoActual, setPasoActual] = useState(null);

  // Carga inicial: leer respuestas + progreso de Supabase
  useEffect(() => {
    async function cargar() {
      const { data: resps } = await supabase
        .from('respuestas')
        .select('contenido_id, respuesta, aprobado, created_at')
        .eq('user_id', userId)
        .eq('curso', cursoNum);

      const mapa = {};
      for (const r of resps ?? []) {
        mapa[r.contenido_id] = {
          fecha: r.created_at,
          ...r.respuesta,   // aciertos, total, etc.
          aprobado: r.aprobado,
        };
      }
      setRespuestas(mapa);

      const { data: prog } = await supabase
        .from('progreso_curso')
        .select('paso_actual')
        .eq('user_id', userId)
        .eq('curso', cursoNum)
        .single();
      if (prog) setPasoActual(prog.paso_actual);
    }
    cargar();
  }, [userId, cursoNum]);

  async function completar(pasoId, resultado, paso) {
    // 1. Guardar respuesta
    await supabase.from('respuestas').upsert({
      user_id: userId,
      contenido_id: pasoId,
      curso: cursoNum,
      modulo: paso.modulo,
      respuesta: resultado ?? {},
      aprobado: calcularAprobado(paso.tipo, resultado),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id, contenido_id' });

    // 2. Actualizar estado local
    setRespuestas(prev => ({
      ...prev,
      [pasoId]: { fecha: new Date().toISOString(), ...resultado }
    }));
  }

  async function irA(pasoId, totalPasos) {
    await supabase.from('progreso_curso').upsert({
      user_id: userId,
      curso: cursoNum,
      paso_actual: pasoId,
      completados: Object.keys(respuestas).length,
      total_pasos: totalPasos,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id, curso' });
    setPasoActual(pasoId);
  }

  return { completados: respuestas, pasoActual, completar, irA };
}
```

### 2.2 Reemplazar `useNotas` (src/formacion/useNotas.js)

**Antes (localStorage):**
```
clave: vl-notas:{userId}:{moduloId}
valor: { [pasoId]: [{ id, texto, fecha }] }
```

**Después (Supabase):** tabla `notas_formacion`, una fila por nota.

El hook nuevo sigue la misma interfaz (`agregar`, `eliminar`) pero con `supabase.from('notas_formacion')` en vez de `localStorage`.

---

## 3. Tipos de paso y formato exacto de `respuesta`

Esta es la parte más importante. Cada tipo de paso produce un objeto diferente en `onComplete()`. Ese objeto se guarda TAL CUAL en el campo `respuesta` (jsonb) de la tabla `respuestas`.

### 3.1 Tipos evaluables (con nota — calculan `aprobado`)

Estos tipos tienen aciertos/total. Se calcula `aprobado = (aciertos / total) >= 0.70`.

#### `quiz`
```json
{ "aciertos": 3, "total": 4 }
```
- Fuente: `Actividad.jsx:235`
- `aprobado`: `aciertos / total >= 0.70`

#### `define`
```json
{ "aciertos": 5, "total": 8 }
```
- Fuente: `Actividad.jsx:356`
- `aprobado`: `aciertos / total >= 0.70`

#### `desliza`
```json
{ "aciertos": 4, "total": 5 }
```
- Fuente: `Actividad.jsx:582`
- `aprobado`: `aciertos / total >= 0.70`

### 3.2 Tipos interactivos NO evaluables (`aprobado = NULL`)

#### `video`
```json
{}
```
- El usuario lo marca como visto. Sin datos de respuesta.
- `aprobado`: `NULL`

#### `conclusion_modulo`
```json
{}
```
- Resumen del módulo, el usuario lo marca como completado.
- `aprobado`: `NULL`

#### `reflexion_piramide`
```json
{ "respuestas": ["texto libre pregunta 1", "texto libre pregunta 2", ...] }
```
- Fuente: `Actividad.jsx:1033`
- Array de strings, una por cada pregunta de reflexión.
- `aprobado`: `NULL`

#### `test_profundo`
```json
{ "respuestas": ["reflexión 1", "reflexión 2", ...] }
```
- Fuente: `Actividad.jsx:940`
- Mismo formato que reflexion_piramide.
- `aprobado`: `NULL`

#### `identifica`
```json
{
  "respuestas": [
    {
      "virtud": "Prudencia",
      "facil": "Colérico",
      "dificil": "Sanguíneo",
      "ejemploFacil": "texto libre",
      "ejemploDificil": "texto libre"
    }
  ]
}
```
- Fuente: `Actividad.jsx:726`
- Array de objetos, uno por virtud analizada.
- `aprobado`: `NULL`

#### `temperamento_perfil`
```json
{
  "visto": true,
  "textoFuerte": "texto libre",
  "textoDebil": "texto libre",
  "textoFuerteSec": "texto libre",
  "textoDebilSec": "texto libre"
}
```
- Fuente: `Actividad.jsx:1324`
- Reflexión sobre fortalezas/debilidades del temperamento.
- `aprobado`: `NULL`

#### `temperamento_magnanimidad`
```json
{ "visto": true }
```
- Fuente: `Actividad.jsx:1405`
- Solo registra que el usuario lo ha visto/completado.
- `aprobado`: `NULL`

#### `retos_temperamento`
```json
{
  "visto": true,
  "textoFacilita": "texto libre",
  "textoDificulta": "texto libre",
  "textoDefectos": "texto libre"
}
```
- Fuente: `Actividad.jsx:1704`
- `aprobado`: `NULL`

#### `circulo_personas`
```json
{ "personas": 5 }
```
- Fuente: `Actividad.jsx:1949/2006`
- Solo guarda el CONTEO de personas añadidas, no los datos de cada persona.
- `aprobado`: `NULL`

#### `reflexion_guiada`
```json
{}
```
- Fuente: `Actividad.jsx:2298/2304`
- Sin datos, solo marca completado.
- `aprobado`: `NULL`

#### `test_caracter`
```json
{ "scoreResult": { /* resultado completo del test de carácter */ } }
```
- Fuente: `Actividad.jsx:2602`
- Objeto con las puntuaciones de las 6 virtudes (prudencia, fortaleza, dominio de sí, justicia, magnanimidad, humildad) con global/passive/active.
- `aprobado`: `NULL`

#### `test_corazon`
```json
{ "scoreResult": { /* resultado completo del test del corazón */ } }
```
- Fuente: `Actividad.jsx:2975`
- Objeto con las puntuaciones de los 8 trastornos.
- `aprobado`: `NULL`

#### `cierre` (Síntesis)
```json
{
  "temperamento_primario": "COL",
  "temperamento_secundario": "MEL",
  "virtud_desafio": "Fortaleza",
  "lo_que_facilita": "texto libre",
  "lo_que_cuesta": "texto libre",
  "proposito": "texto libre"
}
```
- Fuente: `Actividad.jsx:2690`
- Síntesis final del curso con reflexiones personales.
- `aprobado`: `NULL`

#### `plan_crecimiento`
```json
{
  "plan": {
    "personas": [{"nombre": "...", "motivo": "..."}],
    "libros": ["libro 1", "libro 2"],
    "peliculas": ["peli 1"],
    "arte": ["obra 1"],
    "musica": ["pieza 1"],
    "alejarme": "texto libre",
    "recursos_internet": ["recurso 1"],
    "objetivos": {"Lectura": ["obj1"], "Viajes": ["obj2"]},
    "refuerzo": "texto libre",
    "proposito": "texto libre"
  }
}
```
- Fuente: `Actividad.jsx:3453/3501`
- Objeto `plan` con los datos de todas las sub-pantallas del Plan de Crecimiento.
- Las claves del plan corresponden a los `id` de las pantallas definidas en `datos.pantallas` del contenido.
- `aprobado`: `NULL`

---

## 4. Lógica de aprobación

### 4.1 Función `calcularAprobado`

```js
const UMBRAL_APROBADO = 0.70; // 70% — Confirmado por D1 (Actividad.jsx:157)

function calcularAprobado(tipo, resultado) {
  // Solo los tipos evaluables tienen aprobado
  const EVALUABLES = ['quiz', 'define', 'desliza'];
  if (!EVALUABLES.includes(tipo)) return null;

  if (resultado?.aciertos == null || resultado?.total == null) return null;
  if (resultado.total === 0) return null;

  return (resultado.aciertos / resultado.total) >= UMBRAL_APROBADO;
}
```

### 4.2 Impacto en completar módulos

Un módulo se considera completado cuando **TODOS sus pasos evaluables están aprobados**. Los pasos no evaluables (video, reflexión, etc.) solo necesitan estar completados (tener fila en `respuestas`).

```js
function moduloCompletado(pasosDelModulo, respuestasUsuario) {
  return pasosDelModulo.every(paso => {
    const resp = respuestasUsuario[paso.id];
    if (!resp) return false; // no completado

    const EVALUABLES = ['quiz', 'define', 'desliza'];
    if (EVALUABLES.includes(paso.tipo)) {
      return resp.aprobado === true;
    }
    return true; // no evaluable → basta con estar completado
  });
}
```

---

## 5. Flujo completo: qué pasa cuando el usuario completa un paso

```
1. Usuario termina una actividad
2. Componente llama onComplete(resultado)
3. En Modulo.jsx → completar(resultado) se ejecuta:
   a. UPSERT en `respuestas` con:
      - contenido_id = paso.id
      - respuesta = resultado (el JSON del tipo)
      - aprobado = calcularAprobado(paso.tipo, resultado)
   b. UPSERT en `progreso_curso` con:
      - paso_actual = siguiente paso
      - completados = count de filas en respuestas para este curso
      - total_pasos = total de pasos del curso
4. Frontend avanza al siguiente paso
```

---

## 6. Estructura de los cursos en BD

### Curso 1: "Del temperamento al carácter"
- **42 pasos**, módulos 0-9
- IDs: `m1-01` a `m1-42`
- Tipos: video(9), quiz(7), define(2), desliza(1), identifica(1), test_profundo(4), temperamento_perfil(1), retos_temperamento(1), circulo_personas(4), reflexion_guiada(1), test_caracter(1), conclusion_modulo(9), cierre(1)

### Curso 2: "Practicando la Magnanimidad"
- **25 pasos**, módulos 0-6
- IDs: `m2-01` a `m2-19` + `m2-concl-1` a `m2-concl-6`
- Tipos: video(7), quiz(6), conclusion_modulo(6), reflexion_piramide(2), test_profundo(1), temperamento_magnanimidad(1), plan_crecimiento(1), cierre(1)

---

## 7. Notas importantes para la implementación

1. **RLS está activo** en las 3 tablas de escritura. El frontend DEBE usar `supabase.auth.getUser()` para obtener el `user_id`. Las queries sin sesión autenticada devolverán arrays vacíos.

2. **El campo `respuesta` es JSONB libre**. No hay validación de esquema en BD. La consistencia viene del código frontend (cada tipo siempre produce el mismo formato).

3. **UPSERT, no INSERT**: usar `onConflict: 'user_id, contenido_id'` en respuestas y `onConflict: 'user_id, curso'` en progreso_curso. Si el usuario repite un paso, se actualiza la fila, no se duplica.

4. **`aprobado` es NULL para no evaluables**. No poner `false` — eso significaría "suspendido". `NULL` = "este paso no se evalúa".

5. **Leer contenido de `datos`**: el campo `datos` del contenido tiene la estructura específica del tipo (preguntas del quiz, opciones, imágenes, etc.). Es lo que antes se leía del JSON estático. La carga se hace UNA vez al abrir el curso.

6. **No borrar `useModulo.js` ni `useNotas.js` todavía**. Mantenerlos como fallback hasta verificar que la BD funciona. Después se eliminan.

7. **`updated_at` no se actualiza solo**: en el UPSERT hay que pasar `updated_at: new Date().toISOString()` explícitamente.

8. **El `modulo` en `respuestas`** es redundante (se puede derivar del contenido), pero está ahí para queries rápidas de progreso por módulo sin JOIN.

---

## 8. Queries útiles para verificación

**Progreso de un usuario en un curso:**
```sql
SELECT c.modulo, c.tipo, c.titulo, r.aprobado, r.created_at
FROM contenidos c
LEFT JOIN respuestas r ON r.contenido_id = c.id AND r.user_id = '<uuid>'
WHERE c.curso = 1
ORDER BY c.orden;
```

**Módulos completados:**
```sql
SELECT c.modulo,
  COUNT(*) as total_pasos,
  COUNT(r.id) as completados,
  COUNT(CASE WHEN c.tipo IN ('quiz','define','desliza') AND (r.aprobado IS NULL OR r.aprobado = false) THEN 1 END) as suspendidos
FROM contenidos c
LEFT JOIN respuestas r ON r.contenido_id = c.id AND r.user_id = '<uuid>'
WHERE c.curso = 1
GROUP BY c.modulo
ORDER BY c.modulo;
```

**Notas de un usuario en un paso:**
```sql
SELECT texto, created_at
FROM notas_formacion
WHERE user_id = '<uuid>' AND contenido_id = 'm1-05'
ORDER BY created_at;
```
