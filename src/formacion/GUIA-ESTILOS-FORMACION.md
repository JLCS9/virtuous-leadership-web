# Guía canónica de estilos — Portal de Formación VL

Fuente de verdad: **Curso 1 (Del temperamento al carácter)**, validado por el usuario.
Todos los cursos nuevos DEBEN copiar estos patrones exactos.

---

## 1. Tokens compartidos (estilos.js)

```
tarjeta:      background PAPER, borderTop 2px GOLD_REF, borderRadius 0, padding '24px 22px'
eyebrow:      FONT_BODY, fontSize 14, fontWeight 600, letterSpacing '0.16em', uppercase, GOLD_REF_DK
barraFondo:   height 6, borderRadius 0, background rgba(27,42,74,0.10), overflow hidden
botonPrimario: FONT_BODY fontSize 16 fontWeight 600 padding '16px 28px' GOLD_REF #fff
```

---

## 2. Dos layouts base

### Layout A — Ejercicios evaluados (Shell)
Usado en: Quiz, Define, Desliza, Identifica
```
maxWidth:           860
eyebrow:            fuera de tarjeta, fontSize 13 (override)
barra progreso:     barraFondo con height 7, margin '12px 0 8px'
                    fill: GOLD_REF_DK, transition 'width 400ms ease'
contador:           FONT_BODY fontSize 17, color MUTED, marginBottom 28
formato contador:   "X de Y"
```

### Layout B — Lectura/reflexión paginada (ReflexionGuiada)
Usado en: ReflexionGuiada, SlideLectura, PasoVideo intro
```
maxWidth:           800
eyebrow:            fuera de tarjeta, fontSize 14 (default)
tarjeta:            con marginTop 12
H2:                 FONT_SLAB, fontSize 30, fontWeight 700, NAVY, margin '0 0 8px'
contador:           FONT_BODY, fontSize 14, color MUTED, marginBottom 20
formato contador:   "X de Y"
barra progreso:     height 3, background `${LINE}55`, borderRadius 2
                    fill: GOLD_REF, borderRadius 2, transition 'width 400ms ease'
animación fade:     opacity/translateY(12px), transition 300ms ease
contenido padding:  '24px 0'
texto:              FONT_BODY, fontSize 20, color NAVY, lineHeight 1.75
```

---

## 3. Componentes canónicos

### Carátula (antes de cada ejercicio)
```
maxWidth:       860
tarjeta
icono:          64×64, borderRadius 50%, background BEIGE, border 2px GOLD_REF
                FONT_SLAB fontSize 28, fontWeight 700, GOLD_REF_DK
módulo label:   eyebrow display inline-block, marginTop 16 (dentro de tarjeta)
H2:             FONT_SLAB, fontSize 28, fontWeight 700, NAVY
                margin '12px 0 14px', textAlign center, lineHeight 1.3
descripción:    FONT_BODY, fontSize 17, MUTED, lineHeight 1.7
                textAlign center, maxWidth 520, margin '0 auto 8px'
botón:          fontSize 19, fontWeight 600, #fff, GOLD_REF
                padding '18px 48px', borderRadius 0
texto botón:    "Empezar →"
```

### Conclusión (tras ejercicio evaluado)
```
maxWidth:       860
tarjeta
icono score:    72×72, borderRadius 50%
                color/bg según resultado (SUCCESS/WARNING/ERROR)
H2:             FONT_SLAB fontSize 26, fontWeight 700, NAVY, textAlign center
resultado:      FONT_BODY fontSize 17, MUTED, textAlign center
reintentar:     FONT_BODY fontSize 17, fontWeight 600, NAVY/BEIGE, padding '16px 32px'
                (o bloqueado: fontSize 17, #fff, GOLD_REF, padding '18px 40px')
continuar:      fontSize 19, fontWeight 600, #fff, GOLD_REF, padding '18px 40px'
```

### Cierre de autoexamen (TestProfundo, ReflexionPiramide)
```
maxWidth:       860
tarjeta
icono:          ✓ en círculo SUCCESS 64×64
H2:             FONT_SLAB fontSize 26, fontWeight 700, NAVY, textAlign center
mensaje:        FONT_BODY fontSize 16, MUTED, lineHeight 1.7, maxWidth 480
continuar:      fontSize 19, fontWeight 600, #fff, GOLD_REF, padding '18px 48px'
```

### SlideLectura (lectura del cuaderno paginada)
IDÉNTICO a ReflexionGuiada, con estos extras:
```
eyebrow text:   "Lectura"
H2 text:        "Lectura del cuaderno"
soporte citas:  flex, gap 14, padding '16px 20px', background BEIGE, borderLeft 3px GOLD_REF
                comilla: Georgia serif, fontSize 40, lineHeight 1, GOLD_REF
                texto: FONT_BODY fontSize 20, fontStyle italic, lineHeight 1.65
soporte énfasis: FONT_SLAB fontSize 20, fontWeight 700, lineHeight 1.6
botón anterior: fontSize 18, fontWeight 600, MUTED, border 1px LINE, padding '14px 28px'
botón siguiente: fontSize 18, fontWeight 600, #fff, GOLD_REF, padding '14px 36px'
```

### Preguntas abiertas (TestProfundo, ReflexionPiramide)
Dentro de Shell (Layout A):
```
tarjeta
subtítulo:      FONT_BODY fontSize 14, MUTED, uppercase, letterSpacing 0.04em, fontWeight 600
pregunta:       FONT_SLAB fontSize 24, fontWeight 700, NAVY, margin '0 0 20px', lineHeight 1.45
textarea:       FONT_BODY fontSize 18, NAVY, background BEIGE
                border 1px LINE, borderRadius 0, padding '16px 18px'
                minHeight 160, resize vertical
anterior:       fontSize 16, fontWeight 600, MUTED, border 1px LINE, padding '14px 28px'
siguiente:      fontSize 19, fontWeight 600, #fff, GOLD_REF, padding '18px 40px'
```

### Quiz (preguntas tipo test)
Dentro de Shell (Layout A):
```
instrucción:    FONT_BODY fontSize 15, MUTED, margin '0 0 16px'
pregunta:       FONT_SLAB fontSize 26, fontWeight 700, NAVY, margin '0 0 24px', lineHeight 1.4
opciones:       FONT_BODY fontSize 20, lineHeight 1.55, padding '20px 26px'
                border 1.5px LINE, borderRadius 0
anterior:       fontSize 15, fontWeight 600, MUTED, border 1.5px LINE, padding '14px 24px'
siguiente:      fontSize 19, fontWeight 600, #fff, GOLD_REF, padding '17px 38px'
```

### Define (word pools)
Dentro de Shell (Layout A):
```
instrucción:    FONT_BODY fontSize 18, MUTED
concepto:       FONT_SLAB fontSize 28, fontWeight 700, NAVY
palabras:       FONT_BODY fontSize 20, fontWeight 500, padding '14px 22px'
                border 1.5px LINE (o colores de feedback), borderRadius 0
comprobar:      fontSize 19, fontWeight 600, GOLD_REF/#fff, padding '17px 38px'
siguiente:      fontSize 19, fontWeight 600, GOLD_REF/#fff, padding '17px 38px'
```

---

## 4. Patrones universales

### Botones primarios de avance
```
patrón dominante: fontSize 19, fontWeight 600, color '#fff', background GOLD_REF
                  border 'none', borderRadius 0, padding '18px 40px', cursor 'pointer'
texto:            "Siguiente" | "Completar" | "Continuar →" | "Empezar →"
```

### Botones "← Anterior"
```
patrón dominante: fontWeight 600, color MUTED
                  background 'none', border '1px solid ${LINE}', borderRadius 0
                  padding '14px 28px', cursor 'pointer'
fontSize varía:   15 (Quiz), 16 (TestProfundo/ReflexionPiramide), 18 (SlideLectura)
```

### Textareas de reflexión
```
FONT_BODY fontSize 18, color NAVY, background BEIGE
border '1px solid ${LINE}', borderRadius 0, padding '16px 18px'
width '100%', minHeight 160, resize 'vertical', outline 'none'
```

### Bloque cita (callout)
```
padding '16px 20px', background BEIGE, borderLeft '3px solid ${GOLD_REF}'
texto: FONT_BODY fontSize 17, color NAVY
label encima: FONT_BODY fontSize 13, fontWeight 700, MUTED, uppercase, letterSpacing 0.05em
```

### Link tipo lupa
```
background 'none', border 'none', padding 0, cursor 'pointer'
FONT_BODY fontSize 13, fontWeight 600, GOLD_REF_DK
display flex, alignItems center, gap 5
textDecoration underline, textUnderlineOffset 3
icono: <IconoLupa /> (14×14 SVG)
```

### Fade transition (cambio de slide)
```
opacity visible ? 1 : 0
transform visible ? 'translateY(0)' : 'translateY(12px)'
transition 'opacity 300ms ease, transform 300ms ease'
```

### Autoguardado (✓ Guardado)
```
FONT_BODY fontSize 12, color MUTED, fontWeight 600
animación fadeInCheck 300ms ease
desaparece después de 5s
```

---

## 5. Colores de feedback

```
correcto:   background SUCCESS_BG, border SUCCESS, text SUCCESS_DK
incorrecto: background ERROR_BG, border ERROR, text ERROR_DK
parcial:    background WARNING_BG, border WARNING, text WARNING_DK
selección:  background rgba(165,139,38,0.10), border GOLD_REF
```

---

## 6. RenderTextoRico

Markup soportado en lecturas:
```
**texto** → <strong fontWeight 700>
__texto__ → <span textDecoration underline, textUnderlineOffset 3>
```
