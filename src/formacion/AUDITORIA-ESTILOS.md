# Auditoría de estilos — Cursos 1, 2, 3

Fecha: 2026-11-11
Referencia: Curso 1 = patrón correcto

---

## Resumen

**Curso 1**: OK — es la referencia.
**Curso 2**: OK — usa los mismos componentes (Quiz, Define, Desliza, Identifica, TestProfundo, RetosTemperamento, TemperamentoMagnanimidad, ReflexionPiramide). No tiene componentes nuevos con estilos propios.
**Curso 3**: OK después de fix — SlideLectura fue reescrito para copiar ReflexionGuiada exactamente.

---

## Inconsistencias encontradas (menores, no bloquean)

### 1. Shell eyebrow fontSize 13 vs estándar 14
- **Dónde**: `Shell` component (línea ~137)
- **Qué**: `{...eyebrow, fontSize: 13}` — el eyebrow por defecto en estilos.js es 14
- **Impacto**: Todos los ejercicios evaluados (quiz, define, desliza, identifica) muestran el eyebrow 1px más pequeño que las lecturas
- **Veredicto**: ACEPTABLE — diferencia mínima, distingue visualmente ejercicios evaluados de lecturas
- **Acción**: Ninguna (mantener como está)

### 2. Botón "← Anterior" — fontSize varía entre componentes
- **Quiz**: fontSize 15, border 1.5px
- **TestProfundo/ReflexionPiramide**: fontSize 16, border 1px
- **SlideLectura**: fontSize 18, border 1px
- **Impacto**: El botón de retroceso tiene tamaños ligeramente distintos
- **Veredicto**: MENOR — la lectura usa 18 porque su botón primario también usa 18 (proporcional)
- **Acción**: Aceptable, documentado en la guía como variación contextual

### 3. Botón primario — padding varía ligeramente
- **Carátula "Empezar →"**: padding '18px 48px'
- **Quiz/Define "Siguiente"**: padding '17px 38px'
- **TestProfundo "Siguiente"**: padding '18px 40px'
- **ReflexionGuiada/SlideLectura**: padding '14px 36px'
- **Cierre "Continuar →"**: padding '18px 48px'
- **Impacto**: 1-2px de diferencia en padding vertical/horizontal
- **Veredicto**: MENOR — visualmente imperceptible
- **Acción**: El patrón dominante es '18px 40px'. No corregir retroactivamente.

### 4. PasoVideo intro — eyebrow DENTRO de tarjeta
- **Dónde**: Modulo.jsx, PasoVideo cuando `enIntro` (línea ~131)
- **Qué**: El eyebrow va dentro de la tarjeta, no fuera como en ReflexionGuiada/SlideLectura
- **Impacto**: Visual — el eyebrow aparece dentro del recuadro blanco en vez de fuera
- **Veredicto**: INTENCIONAL — las intros de vídeo son un contexto diferente (están dentro de la tarjeta porque el título H2 que sigue es el del vídeo, no un título genérico como "Lectura")
- **Acción**: Ninguna (mantener como está, documentado)

---

## Cosas que ya están correctas

1. **SlideLectura** (curso 3): copió ReflexionGuiada exactamente tras el fix
   - H2 fontSize 30 ✓
   - Barra height 3 con GOLD_REF ✓
   - Contador fontSize 14 ✓
   - Texto fontSize 20 lineHeight 1.75 ✓
   - Fade 300ms ✓
   - maxWidth 800 ✓

2. **Carátulas**: CARATULA_TEXTOS tiene entradas para todos los tipos usados en los 3 cursos ✓

3. **Todos los componentes reutilizados** entre cursos usan exactamente los mismos estilos ✓
   (no hay copias de componentes con variaciones)

4. **Tokens de estilos.js** se usan consistentemente en todos los componentes ✓

---

## Conclusión

No hay inconsistencias graves. Los estilos de los 3 cursos son consistentes porque reutilizan los mismos componentes (Quiz, Define, Shell, Caratula, Conclusion, etc.). Las variaciones menores (1-2px de padding, fontSize 13 vs 14 en eyebrow) son aceptables y están documentadas.

El riesgo real no está en los componentes existentes sino en **crear componentes nuevos** que inventen estilos — eso es lo que pasó con SlideLectura antes del fix. La checklist de verificación previene esto.
