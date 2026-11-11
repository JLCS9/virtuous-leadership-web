# Checklist de verificación — Nuevo curso de formación VL

Ejecutar ANTES de entregar cualquier curso nuevo al usuario.
Referencia: GUIA-ESTILOS-FORMACION.md

---

## A. Estructura del JSON

- [ ] **Título módulo 0**: SIN prefijo "Introducción:" — solo el nombre del curso
- [ ] **Orden de pasos en cada módulo**: video → cuaderno/reto → cuestionario → conclusión
- [ ] **Numeración**: IDs secuenciales correctos (m{N}-01, m{N}-02, ...)
- [ ] **`visible: true`** en pasos que son headers de módulo (vídeos) + NO tienen `continua_modulo`
- [ ] **Imágenes referenciadas**: cada key de `imagen` en JSON existe en REFLEXION_IMAGENES
- [ ] **Tipos válidos**: cada `tipo` tiene su componente en Actividad.jsx
- [ ] **Preguntas de quiz**: tienen `texto`, `opciones` (array), `correcta` (índice)
- [ ] **Conceptos de define**: tienen `concepto`, `correctas` (array), `distractores` (array), opcional `definicion`
- [ ] **Test profundo**: tiene `preguntas` (array de strings o objetos con `texto`)
- [ ] **Lecturas**: si hay `paso.lecturas`, cada elemento es un array de items (string | {cita} | {enfasis})
- [ ] **CARATULA_TEXTOS**: existe entrada para cada `tipo` usado en el curso
- [ ] **Contenido basado en fuentes**: todo texto de preguntas/descripciones viene del cuaderno o transcripción del vídeo, NUNCA inventado

## B. Estilos de componentes

### B1. Layout (verificar en pantalla)
- [ ] Ejercicios evaluados (quiz, define, desliza, identifica): usan Shell → maxWidth 860
- [ ] Lectura/reflexión paginada: usan Layout B → maxWidth 800
- [ ] Carátulas: maxWidth 860
- [ ] Cierres: maxWidth 860

### B2. Barras de progreso
- [ ] **Shell** (ejercicios evaluados): height 7, borderRadius 0, fill GOLD_REF_DK
- [ ] **ReflexionGuiada/SlideLectura**: height 3, borderRadius 2, fill GOLD_REF, background `${LINE}55`
- [ ] Contador: "X de Y" (no "X/Y" ni "Página X de Y")

### B3. Tipografía
- [ ] H2 en slides de lectura: FONT_SLAB, fontSize **30**, fontWeight 700
- [ ] Texto de lectura: fontSize **20**, lineHeight **1.75**
- [ ] Preguntas de quiz: fontSize **26**
- [ ] Preguntas abiertas: fontSize **24**
- [ ] Eyebrow: fontSize **14** (Layout B) o **13** (Shell, si overrideado)
- [ ] Contador en Layout B: fontSize **14**
- [ ] Contador en Shell: fontSize **17**

### B4. Botones
- [ ] Primario de avance: fontSize **19**, padding '18px 40px', GOLD_REF, #fff
- [ ] "← Anterior": fontWeight 600, MUTED, border LINE
- [ ] "Empezar →" en carátula: fontSize 19, padding '18px 48px'
- [ ] borderRadius siempre **0** (nunca rounded)

### B5. Textareas
- [ ] fontSize 18, background BEIGE, border 1px LINE, padding '16px 18px'
- [ ] minHeight 160

### B6. Animaciones
- [ ] Fade entre slides: opacity + translateY(12px), 300ms ease
- [ ] Autoguardado: ✓ Guardado aparece 5s con fadeInCheck

## C. Flujo TestProfundo

- [ ] Secuencia: carátula → lectura (si hay `paso.lecturas`) → ejercicio → cierre
- [ ] Lecturas usan SlideLectura (Layout B)
- [ ] Preguntas usan Shell (Layout A)
- [ ] Cierre muestra ✓ en círculo SUCCESS

## D. Intros de vídeo (PasoVideo en Modulo.jsx)

- [ ] Usan Layout B (maxWidth 800, barra height 3, GOLD_REF)
- [ ] eyebrow DENTRO de tarjeta (excepción documentada)
- [ ] H2: fontSize 30, margin '8px 0 8px'
- [ ] Fade transition 300ms entre páginas

## E. Consistencia entre cursos

- [ ] Abrir curso 1 como referencia en otra pestaña
- [ ] Comparar visualmente: carátula → primer ejercicio → quiz → cierre
- [ ] Verificar que fontSize, colores, espaciado y barras son IDÉNTICOS
- [ ] No hay estilos nuevos inventados que no estén en la guía

## F. No hay nuevos componentes sin necesidad

- [ ] Si el ejercicio es lectura paginada → SlideLectura (no inventar componente nuevo)
- [ ] Si es reflexión con preguntas abiertas → TestProfundo o ReflexionPiramide
- [ ] Si es cuestionario → Quiz
- [ ] Solo crear componente nuevo si la mecánica NO existe en ninguno de los anteriores
