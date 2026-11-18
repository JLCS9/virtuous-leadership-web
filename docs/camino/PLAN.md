# Camino: plan de implementación (fase 1)

Estado: **borrador v2, pendiente de aprobación**. 18 de noviembre de 2026.
No se ha tocado código de producto. Lo único añadido al repositorio es esta carpeta `docs/camino/`.

Cambios de la v2 respecto a la primera versión: biblioteca v0.2 con 85 citas (apartado 4), la cita
del día, Hoy como pantalla principal, qué se guarda de un día sin terminar, la lista de virtudes de
los hábitos, y las dudas ya contestadas (apartado 6).

## Resumen

- El «Camino» aparcado y la biblioteca de retos son **dos productos distintos**. El aparcado son 14
  días de juegos y vídeos (especificación del 1 de noviembre). La biblioteca es un reto diario por
  temperamento con tres opciones, variables y hábitos. Del aparcado se reutilizan piezas de
  pantalla y utilidades, no el flujo.
- Las funciones `retos-*` del servidor compartido **no sirven para esto**: son una conversación con
  un modelo de IA sobre otra biblioteca (113 retos en `metodo.reto`), sin opciones A/B/C ni
  variables. Propongo no usarlas y resolver la biblioteca en la web, con funciones puras y tablas
  nuevas. Es la decisión más importante del plan (duda 1).
- Hacen falta **cuatro tablas nuevas**. No se modifica ninguna existente ni nada que use la app
  móvil.
- Siete entregas pequeñas. La pestaña sigue con candado hasta la última.
- **Hoy es la pantalla principal**: lo primero que se ve es la cita del día y el reto con sus tres
  opciones. Camino guarda el historial, los hábitos y «lo que Virtus sabe de ti».
- Del apartado 6: 5 dudas ya contestadas y 13 con mi propuesta pendiente de que la confirmes.
  Hay 4 nuevas (19 a 22) por lo que has pedido.

## Material revisado

| Material | Dónde estaba | Nota |
|---|---|---|
| `Virtus_biblioteca_retos_v0.2.xlsx` | Adjunto (Descargas) | Copiada a `docs/camino/` (la carpeta no existía). Sustituye a la v0.1, que borro: la v0.2 es igual más la hoja Citas y la columna «Citas sugeridas» |
| Propuesta Virtus | `~/Downloads/Propuesta_Virtus_NotebookLM.md` | Leída. No está en el repositorio |
| Esqueleto del camino | No lo he encontrado | Lo más parecido es `Camino · Semanas 0 y 1 — Especificación completa.md` (1-nov), que es la base del código aparcado. ¿Es ese, o hay otro documento? (duda 18) |

La biblioteca es coherente: 40 retos (10 por temperamento), 17 variables, 85 citas. Todas las
variables usadas están definidas y todas tienen alguna pregunta que las alimenta. Retos, Variables,
Preguntas iniciales y Hábitos no han cambiado de la v0.1 a la v0.2 (lo he comprobado celda a celda).
Los 40 retos y las 85 citas están en «Pendiente».

Sobre las citas, lo que he comprobado:

- Cada reto tiene entre 2 y 11 citas sugeridas, y toda cita encaja con algún reto. Las referencias
  de ida y vuelta (columna N de Retos y columna G de Citas) coinciden.
- **Doce citas llevan, en la columna «Retos con los que encaja», una etiqueta que no es un ID de
  reto**: «General» (Q56, Q64–Q66, Q70, Q75, Q76) o «Mes 1» (Q68, Q71–Q74). Algunas además citan retos
  concretos. El guion tiene que leerlas como «cita libre», no como un error.
- 78 son de la mañana y 7 de la noche.
- Siete necesitan la referencia exacta de la obra antes de publicarse (seis con la nota «Falta la
  obra y el número» y una con «Nota probable: Pieper… Confirmar»), tres son largas (hasta 276
  caracteres) y una es una pregunta de examen, no una afirmación. El filtro «Aprobado» las deja
  fuera mientras tanto.
- Cuando dice «literal comprobada», es una comprobación automática contra el texto de los libros, no
  una revisión humana.

---

## 1. Qué existe y qué se puede reutilizar

### Camino aparcado (web)

| Pieza | Dónde | Estado | Veredicto |
|---|---|---|---|
| Marco de la pestaña | `src/app/Camino.jsx` | 14 días fijos, tira de semanas 0 y 1, racha | **Descartar para esto.** Se escribe una pantalla nueva; el fichero se queda aparcado |
| Piezas de pantalla | `src/app/camino/ui.jsx` (`Pantalla`, `Opciones`, `Opcion`, `Puntos`) | En uso desde Personas | **Tal cual.** Son las pantallas de «un toque» que necesitan mañana, noche y preguntas iniciales |
| Examen de la noche | `src/app/camino/Examen.jsx` | Sí / a medias / no, con quién, palabra | **Adaptar el patrón**, no el fichero: los pasos y la tabla son otros. El «sí / a medias / no» y la pantalla «Buenas noches» sirven de modelo |
| Elegir persona | `src/app/personas/EligeQuien.jsx` | Lista las fichas y devuelve `p:<id>` | **Adaptar**: sirve para las variables de persona, filtrando por grupo. Hoy arrastra la lista `CON_QUIEN` del camino viejo |
| Sesiones, juegos, cierres, rueda, onboarding | `src/app/camino/{Sesion,Juegos,Cierres,Rueda,Onboarding}.jsx` | Funcionan, sin enrutar | **No se usan.** `Juegos.jsx` sigue en uso desde `CrearFicha`: no se toca |
| Lógica pura | `src/lib/camino.js` (+ 79 líneas de pruebas) | Textos y reglas de los 14 días | **Reutilizar solo las utilidades de fecha** (`fechaLocal`, `diaIso`, suma de días por calendario). El resto es contenido del camino viejo |
| Acceso a datos | `src/account/camino.js`, `src/app/useCamino.js` | Leen y escriben `perfil_camino`, `actividad_diaria` y `preguntas_respuestas_ejercicios` | **Reutilizar el patrón** (clase de error, `comprobar`, hook con `recargar`). Las tablas son otras |

### Retos del servidor compartido (`~/virtus`)

| Pieza | Estado | Veredicto |
|---|---|---|
| `retos-manana`, `retos-noche`, `retos-onboarding` | Funcionan. Eligen entre 113 retos propios con un motor de puntuación y los adapta un modelo de IA; la noche es una conversación de cinco pasos. Guardan en los esquemas `metodo.*` e `identidad.*`, cifrado y con seudónimo, inaccesible desde la web | **No encajan** con la biblioteca: otro contenido, sin tres opciones, sin variables con nombre, sin hábitos. Propongo no llamarlas (duda 1) |
| `src/account/retos.js` | Cliente de esas funciones y `tieneAccesoRetos()` | Solo se sigue usando `tieneAccesoRetos()` (la llave del portal) y `catalogoFormacion()` |
| `src/pages/Retos.jsx`, espacio `retos` del fichero de idioma | Interfaz de conversación, aparcada | **No se usa.** Se queda aparcada |
| `public.suscripciones_retos` | Llave de acceso al portal | **Tal cual**, a través de `PortalGuard` |

La app móvil actual (rama `feat/app-como-web`) **lee** `perfil_camino` y `actividad_diaria` en su
pantalla Hoy, pero no llama a `retos-*`. No hay ninguna tabla de hábitos en ningún sitio: en la app
antigua iban dentro de un bloque cifrado (`daily_entries`).

### Resto del portal

| Pieza | Dónde | Veredicto |
|---|---|---|
| Horarios | `preferencias_notificaciones`, `src/lib/preferencias.js`, `src/account/preferencias.js`, `src/app/Horarios.jsx` | **Tal cual.** Se lee `hora_reto` y `hora_reflexion` para mostrar «tu reto es a las 8:00». No se envía ningún aviso (fuera de alcance) |
| Tu entorno | `src/lib/personas.js`, `src/account/personas.js`, `src/app/usePersonas.js`, `personas/comun.jsx` (`Avatar`) | **Tal cual.** `usePersonas()` da la lista con su grupo; las variables de persona guardan el `id` de la ficha |
| Temperamento del usuario | `fetchLatestTemperament()` + `claveTemperamento()` (`src/lib/virtudes.js`) | **Tal cual.** Da `SAN-COL`: primario y secundario para la regla de los mixtos |
| Progreso y notas de Formación | `respuestas`, `progreso_curso`, `notas_formacion`, `useModulo.js`, `useNotas.js` | **No se usan.** Están atadas a `contenidos` por clave externa: cada reto tendría que darse de alta como «contenido». Es más simple una tabla propia |
| Marco del portal | `AppShell.jsx` (burbuja con candado), `App.jsx` (`camino` redirige a Hoy), `app/estilos.js`, `Iconos.jsx` | **Adaptar** en la última entrega: quitar el candado y montar la ruta |
| Guion de extracción | `scripts/extract-character-xlsx.py`, `extract-heart-ods.py` | **Mismo patrón** para la biblioteca |
| Pruebas | `node --test` sobre `src/lib/*.test.js`; hoy 116 en verde (comprobado) | Mismo estilo |

Dos avisos sobre el estado del repositorio:

- La copia local va una PR por detrás de `main` (falta la 52, la bienvenida). Antes de empezar la
  fase 2 hay que partir de `main` actualizado.
- `CLAUDE.md` dice 103 pruebas; son 116. Se corrige en la última entrega.

---

## 2. Qué falta y dónde encaja

| Pieza nueva | Dónde | Qué es |
|---|---|---|
| Biblioteca | `src/data/camino-biblioteca.json` | Generada desde el Excel (apartado 4) |
| Guion de carga | `scripts/extract-retos-xlsx.py` | Excel → JSON, con comprobaciones |
| Lógica de retos | `src/lib/retos.js` + pruebas | Filtro por validación, elección del reto del día, elección de la cita, sustitución de variables. Pura |
| Lógica de hábitos | `src/lib/habitos.js` + pruebas | Estados, transiciones, límites. Pura; los números vienen de la biblioteca |
| Acceso a datos | `src/account/caminoDiario.js` | Leer y guardar variables, días y hábitos |
| Hook | `src/app/useCaminoDiario.js` | Estado del día: variables, reto de hoy, hábitos, `recargar` |
| Pantallas | `src/app/caminoDiario/` : `PreguntasIniciales.jsx`, `Manana.jsx` (cita + reto + tres opciones), `Noche.jsx`, `Habitos.jsx`, `CampoVariable.jsx` | Solo pintan. `CampoVariable` es el campo de una variable: texto libre o persona de «Tu entorno» |
| Hoy | `src/app/Hoy.jsx` | **Pantalla principal del día**: arriba, la cita y el reto de hoy con sus tres opciones (el componente `Manana`), y las casillas de hábitos. De noche, en su lugar, el examen (`Noche`). Hoy es lo primero que ve el usuario al entrar |
| Camino | `src/app/CaminoDiario.jsx` | La pestaña: historial de días, lista de hábitos (activos, adquiridos, retirados) y «lo que Virtus sabe de ti» (las variables, editables) |
| Textos | `src/i18n/es.js`, espacio `camino` | Todos los textos de interfaz |
| SQL | `supabase-migraciones/AAAAMMDD_camino_diario.sql` | Lo aplica Infra/BD |

Uso nombres nuevos (`caminoDiario`, `retos.js`) para no pisar los ficheros aparcados, que no se
borran. Si prefieres que el código nuevo sustituya al viejo, dímelo (duda 5).

Sobre los textos: pides que vayan en el fichero de idioma «como el resto del portal». En realidad
el portal tiene hoy casi todos sus textos escritos en los componentes (solo `Hoy.jsx` usa el
fichero de idioma, para el resultado del test). Seguiré tu instrucción y los pondré en `es.js`;
solo aviso de que será la primera parte del portal que lo haga. No añadiré las claves a `en`, `fr`
y `ru`, porque el portal no existe en esos idiomas.

---

## 3. Modelo de datos

Cuatro tablas nuevas en `public`. Todas con acceso por fila (`user_id = auth.uid()`), como
`preferencias_notificaciones`, y borrado en cascada al borrar la cuenta. **No se toca ninguna tabla
existente.**

### `camino_variables`: una fila por usuario y variable

| Columna | Tipo | Nota |
|---|---|---|
| `user_id` | uuid | Clave junto con `variable` |
| `variable` | text, hasta 40 | El nombre de la biblioteca: `persona_trabajo`, `proyecto`… |
| `valor` | text, hasta 120, admite nulo | Nulo: la pregunta se saltó y se usa el texto por defecto |
| `persona_id` | uuid, admite nulo, apunta a `personas` | Si se eligió de «Tu entorno». Al borrar la ficha queda en nulo y se conserva el `valor` |
| `origen` | `inicial`, `noche` o `manual` | De dónde salió |
| `actualizado_en` | timestamptz | |

Se guarda solo el valor vigente. El historial no se pierde: cada respuesta de la noche queda
también en `camino_dia`. Las preguntas iniciales se dan por hechas cuando existen las filas de sus
cinco variables (con valor o sin él), así que no hace falta una tabla de estado.

### `camino_dia`: una fila por usuario y fecha

| Columna | Tipo | Nota |
|---|---|---|
| `user_id`, `fecha` | uuid, date | Clave. `fecha` es la fecha local del usuario |
| `reto_id` | text | `C01`… Se fija al abrir la mañana: el reto no cambia durante el día |
| `cita_id` | text, admite nulo | `Q25`… La cita que se enseñó ese día. Se fija a la vez que el reto, para no repetirla y para poder enseñarla en el historial |
| `temperamento` | `COL`, `MEL`, `SAN`, `FLE` | De qué temperamento salió (para la regla de los mixtos) |
| `opcion` | `persona`, `habito`, `situacion`, admite nulo | La elegida |
| `texto` | text, admite nulo | El texto ya sustituido que el usuario aceptó. Así la noche y el historial enseñan lo que de verdad se comprometió a hacer, aunque luego cambien las variables o la biblioteca |
| `elegido_en` | timestamptz, admite nulo | |
| `cumplido` | `si`, `a_medias`, `no`, admite nulo | |
| `reflexion` | text, hasta 500, admite nulo | |
| `nutrir_variable`, `nutrir_respuesta` | text, admiten nulo | Qué se preguntó y qué respondió |
| `examen_en` | timestamptz, admite nulo | |

**Un día sin terminar** (decisión tuya, duda 8): no se puede completar al día siguiente, pero lo que
se hizo **se guarda** tal cual: la fila existe desde que se abre la mañana, y la opción elegida, el
cumplimiento, la reflexión o la respuesta de nutrir quedan aunque falte el resto. Lo que tenga
valor sigue sirviendo para personalizar: una respuesta de nutrir guardada alimenta la variable
aunque el usuario no haya hecho el resto del examen. Cómo sacar más información de lo guardado
(duda 20) está sin decidir.

### `habitos`: una fila por hábito

| Columna | Tipo | Nota |
|---|---|---|
| `id`, `user_id` | uuid | |
| `texto` | text, hasta 200 | |
| `virtud` | text, una de seis: `humildad`, `magnanimidad`, `prudencia`, `dominio_de_si`, `fortaleza`, `justicia` | Vínculo obligatorio. Es la lista que has indicado (duda 12). Los hábitos que nacen de un reto heredan la virtud con la correspondencia de la duda 21 |
| `reto_id` | text, admite nulo | Nulo si lo escribió el usuario |
| `estado` | `en_prueba`, `activo`, `consolidado`, `en_revision`, `retirado` | |
| `alta_en`, `estado_desde` | date | |
| `creado_en`, `actualizado_en` | timestamptz | |

### `habito_marcas`: una fila por casilla marcada

`habito_id`, `user_id`, `fecha`; clave (`habito_id`, `fecha`). Desmarcar borra la fila, así que esta
tabla sí necesita permiso de borrado. La política comprueba además que el hábito es del usuario.

### Decisiones de diseño

- **Los límites y umbrales no van en la base de datos.** El máximo de cinco, los 7, 30 y 24 días
  viven en la biblioteca y los aplica `src/lib/habitos.js`. Cambiarlos es regenerar el JSON.
- **El estado del hábito se guarda**, pero lo calcula una función pura a partir de las marcas y la
  configuración; el front lo actualiza al cargar si ha cambiado. No hay tarea programada.
- **Texto sin cifrar.** Las reflexiones se guardan en claro, protegidas por el acceso por fila,
  igual que las notas de Formación y las observaciones de personas. El servidor de `retos-*`, en
  cambio, cifra y usa seudónimos. Lo señalo por si quieres el mismo nivel aquí (duda 16).

### Qué afecta a la app móvil

- **Nada se modifica.** La app lee `perfil_camino` y `actividad_diaria`: este plan no escribe en
  ellas. Tampoco toca `metodo.*`, `suscripciones_retos`, `personas` ni `preferencias_notificaciones`.
- **Nombres.** En el repositorio de la app hay una migración antigua con `camino_perfil`,
  `camino_dias` y `camino_linea_base`. No he podido comprobar si siguen en producción. Por eso la
  tabla se llama `camino_dia` (singular). Infra debe confirmar que los cuatro nombres están libres
  antes de aplicar el SQL.
- **Cuando la app quiera mostrar el reto**, leerá estas mismas tablas. Conviene que el equipo de la
  app vea el modelo antes de aplicarlo.

---

## 4. Cómo se carga la biblioteca

`scripts/extract-retos-xlsx.py docs/camino/Virtus_biblioteca_retos_vX.xlsx` genera
`src/data/camino-biblioteca.json`. Mismo Excel, mismo JSON (sin fechas ni azar), como los dos
guiones que ya existen.

```json
{
  "meta": { "version": "0.2", "fuente": "Virtus_biblioteca_retos_v0.2.xlsx" },
  "retos": [{
    "id": "C01", "temperamento": "COL", "virtud": "Humildad",
    "consigna": "Pedir opinión antes de decidir",
    "fuente": "1. ¿Suelo pedir opinión…?",
    "opciones": { "persona": "Hoy pido a {persona_trabajo}…", "habito": "…", "situacion": "…" },
    "noche": { "reflexion": "…", "nutrir": "…", "variable": "decision_pendiente" },
    "citas": ["Q25", "Q29", "Q30", "Q37", "Q38"],
    "validacion": "pendiente"
  }],
  "citas": [{
    "id": "Q02", "tema": "Magnanimidad", "texto": "Las almas grandes tienen muy en cuenta las cosas pequeñas.",
    "autor": "Josemaría Escrivá", "origen": "citado", "fuente": "Liderazgo virtuoso, cap. «Magnanimidad…»",
    "retos": ["S01", "S08", "F06", "M08"], "libre": false, "momento": "manana",
    "nota": "Falta la obra y el número", "validacion": "pendiente"
  }],
  "variables": [{
    "id": "persona_trabajo", "descripcion": "…", "origen": "…", "grupo": "trabajo",
    "forma": "Nombre o cargo", "ejemplo": "Pedro", "defecto": "alguien de tu equipo"
  }],
  "preguntas_iniciales": [{ "temperamento": "COL", "orden": 1, "pregunta": "…", "variable": "persona_trabajo", "validacion": "pendiente" }],
  "habitos": { "max_activos": 5, "dias_prueba": 7, "dias_ventana": 30, "dias_consolidar": 24, "min_semana": 3, "semanas_bajo": 2 }
}
```

El guion **falla sin escribir nada** si: una variable entre llaves no está en la hoja Variables; la
variable que alimenta una pregunta no existe; hay un ID repetido; un temperamento o una validación
no se reconoce; un número de la hoja Hábitos no es un número; una cita sugerida en un reto no
existe en la hoja Citas, o una cita nombra un reto que no existe (las etiquetas «General» y «Mes 1»
pasan a `libre: true`).

Dos puntos frágiles del Excel actual, que el guion resuelve pero que conviene arreglar en origen:

- La hoja Hábitos es texto libre: el guion localiza cada número por el texto de su fila. Si alguien
  cambia la redacción de la regla, falla (a propósito, mejor que leer mal). **Propongo añadir una
  columna «Clave»** (`max_activos`, `dias_prueba`…) en la próxima versión.
- Qué variables son de persona, y de qué grupo, sale hoy de la frase «Tu entorno (grupo familia)».
  El guion lo deduce del prefijo `persona_` y de esa frase. Una columna «Grupo» lo haría explícito.

**Filtro de validación.** `retosValidos(biblioteca, { incluirPendientes })` en `src/lib/retos.js`.
En producción solo «Aprobado»; en desarrollo también «Pendiente». «Cambiar» y «Descartar» nunca.
Hoy, con los 40 retos y las 85 citas en «Pendiente», el Camino en producción no tendría contenido:
la pantalla lo dice con un mensaje y no falla. Lo mismo para las preguntas iniciales y las citas.
Una cita aprobada cuyo reto no lo está solo se usa como cita libre.

**La cita del día.** Se elige a la vez que el reto, entre las citas sugeridas para ese reto (y las
libres), sin repetir ninguna ya enseñada al usuario. De mañana salen las de «Mañana»; las 7 de
«Noche» quedan para el examen, si queréis enseñarlas (duda 22). Se guarda en `camino_dia.cita_id`.
Se enseña con su autor; si es de otro autor, también «citado por Alex», porque así lo marca la hoja.
Sin cita disponible, el reto se enseña igual.

**Avisos del móvil.** Pides que el aviso de la mañana diga «Descubre tu reto de hoy» y, después, la
cita. Enviar avisos está fuera de alcance, así que aquí solo preparo los datos y lo dejo anotado.
Hay una dependencia que hay que decidir antes (duda 19): si la cita depende del reto, quien envíe
el aviso necesita saber qué reto toca ese día.

Los textos de la biblioteca viajan en el paquete de la web, como los de los cursos: quien sepa
buscar puede leerlos sin suscripción. Si eso importa, habría que servirlos desde el servidor, como
el catálogo de vídeos (duda 17).

---

## 5. Entregas

Cada una es una PR desde `main` actualizado, con `npm test` y `npm run build` en verde. La ruta
`/es/app/camino` sigue redirigiendo a Hoy en producción hasta la entrega 7; en desarrollo se abre
para poder probar.

| # | Entrega | Contenido | Pruebas automáticas | Prueba a mano |
|---|---|---|---|---|
| 1 | Biblioteca | Guion, JSON generado (retos, variables, preguntas, hábitos y 85 citas), `docs/camino/` | El guion valida al generar. La prueba comprueba que las referencias, variables y números son íntegros **sin fijar cuántos retos o citas hay**, para que el contenido crezca sin tocar la prueba (cambio respecto a lo previsto) | Regenerar y ver que el JSON no cambia |
| 2 | Lógica de retos y citas | `src/lib/retos.js`: filtro, elección del día, elección de la cita, sustitución | Filtro por validación. Sustitución con valor, sin valor, con variable desconocida y con varias en una frase. Elección: no repite hasta agotar, temperamento puro, mixto 2 de 3, mismo resultado para la misma entrada, biblioteca vacía. Cita: sin repetir, libre si no hay sugeridas, sin cita si no hay ninguna, no usa las de noche por la mañana | No tiene pantalla |
| 3 | Datos | SQL en `supabase-migraciones/` (lo aplica Infra) + `account/caminoDiario.js` + hook | Las de la lógica; el acceso a datos no se prueba, como en el resto del repositorio | Tras aplicar Infra el SQL: leer y guardar con una cuenta de prueba |
| 4 | Preguntas iniciales y variables | Cinco preguntas, `CampoVariable` con «Tu entorno», edición posterior de variables | Orden y filtro de las preguntas por temperamento; qué variables faltan | Responder, saltar una, elegir una persona, comprobar las filas |
| 5 | Mañana, en Hoy | Cita y reto del día con tres opciones ya sustituidas, como lo principal de Hoy; elegir una | Estado del día (sin elegir, elegido) | Ver la cita y el reto con variables llenas y vacías; elegir; recargar y ver que se mantiene |
| 6 | Noche, en Hoy | Cumplido, reflexión, pregunta para nutrir; guarda la variable. Los días sin terminar se guardan | Qué pasos tocan según el estado; la respuesta actualiza la variable; un día a medias conserva lo hecho | Examen completo; al día siguiente el reto usa la respuesta nueva; dejar un día a medias y comprobar que queda guardado |
| 7 | Hábitos, Camino y apertura | `src/lib/habitos.js`, lista con casilla en Hoy, alta desde la opción B, página Camino (historial, hábitos, variables), quitar el candado, actualizar `CLAUDE.md` | Todas las transiciones de estado, el máximo, la semana por debajo del mínimo, cambio de configuración | Alta desde un reto, marcar y desmarcar, llegar al máximo, retirar y recuperar |

La entrega 7 se puede partir en dos (hábitos, y apertura) si queda grande.

No usaré la cuenta de demo para probar escritura: en local se escribe en la base de datos de
producción. Para las pruebas a mano usaré la cuenta de prueba que has indicado (duda 15). Sus
credenciales no se guardan en el repositorio ni en este documento. Antes de probar tengo que
comprobar que tiene la suscripción activa; si no la tiene, la activa Infra o tú con el SQL de
siempre, porque yo no escribo en producción.

### Mejoras vistas fuera de alcance (no las toco)

- `EligeQuien.jsx` depende de `lib/camino.js` (camino viejo) para la lista de grupos.
- Hay tres copias de `fechaLocal` (`lib/camino.js`, `account/retos.js`, `account/camino.js`).
- La virtud-desafío de la biblioteca depende solo del temperamento primario (sanguíneo:
  «Resistencia y persistencia»); la del portal depende del perfil completo (`SAN-COL`: humildad
  fundamental). Un usuario mixto verá dos virtudes-desafío distintas en Hoy y en el reto.

---

## 6. Decisiones, dudas y riesgos

### Decididas por ti

| # | Duda | Decisión |
|---|---|---|
| 2 | ¿Reto diario o de seis días? | Un reto distinto cada día, con **tres opciones cada día** (las A, B y C del reto) |
| 4 | ¿Dónde viven mañana y noche? | En Camino, pero **lo principal de Hoy** es la cita y el reto. En el plan: el componente vive en Hoy y Camino guarda historial, hábitos y variables |
| 8 | Día sin terminar | No se puede completar al día siguiente, pero **lo hecho se guarda**, y de ello se saca información para los retos siguientes, con variables anonimizadas. Lo primero ya está en el modelo; lo segundo, en la duda 20 |
| 12 | Lista de virtudes de un hábito | Humildad, magnanimidad, prudencia, dominio de sí, fortaleza, justicia |
| 15 | Cuenta de prueba | Recibida. Se usa solo para las pruebas a mano en local, con las precauciones del apartado 5 |

### Confirmadas por ti («ok a todas», 18-nov), con mi propuesta sin cambios

La 18 sigue siendo una pregunta, no una propuesta: no tiene respuesta.

1. **Prescindir de `retos-*`** y resolver la biblioteca en la web, sin IA. Conviven dos sistemas de
   retos en la misma base de datos (el del servidor, que la app actual no llama, y este).
3. **Cuando se acaban los retos**: orden de la biblioteca, sin repetir hasta agotarlos, y luego
   empezar por el que lleva más tiempo sin salir. Con 10 por temperamento, un usuario puro repite a
   los 10 días y uno mixto a los 15.
5. **El Camino nuevo convive con el de 14 días**, sin borrar código aparcado.
6. **Mixtos**: dos de cada tres días el primario, contados por días con reto.
7. **Preguntas iniciales en mixtos**: solo las cinco del primario.
9. **La noche** se abre en cuanto se elige la opción de la mañana, sin bloqueo por hora.
10. **Pregunta de nutrir ya respondida**: se vuelve a preguntar, mostrando la respuesta actual para
    confirmarla o cambiarla.
11. **Forma de las respuestas**: el ejemplo de la hoja dentro del campo y sin más validación. Una
    respuesta mal formada dará frases torpes («hablo el último en reunión equipo»).
13. **Reglas de hábitos sin precisar**: ventana móvil de los últimos 30 días; los días de prueba
    cuentan para los 24; semana de lunes a domingo; «lo ajustas» permite editar el texto sin
    reiniciar la cuenta; un hábito recuperado vuelve a «En prueba»; uno consolidado deja de tener
    casilla.
14. **Alta de hábito** solo tras cumplir la opción B (con «sí» o «a medias»), no al elegirla.
16. **Reflexiones en claro**, con acceso por fila y sin cifrado.
17. **Biblioteca y citas dentro del paquete público**, como los cursos.
18. **El «esqueleto del camino»**: no está en `docs/camino/`. ¿Es la especificación de las semanas
    0 y 1, o es un documento que no tengo?

### Nuevas por lo que has pedido (sin confirmar)

Mientras no las confirmes, aplico mi propuesta solo donde no condiciona nada ya hecho; no afectan a
la entrega 1.

19. **Cita del día y aviso del móvil.** El aviso de la mañana dice «Descubre tu reto de hoy» y,
    después, la cita. Dos formas de hacerlo:
    - **A. Cita ligada al reto** (la que trae la hoja Citas): es la más coherente, pero quien envíe
      el aviso tiene que saber qué reto toca ese día, y hoy eso lo decide la web al abrir Hoy.
    - **B. Cita independiente del reto**, elegida por fecha y temperamento: cualquiera puede
      calcularla (móvil, servidor de avisos), pero no encaja con el reto.

    Propuesta: **A en la pantalla**, y dejar la decisión del aviso para cuando se aborden los
    avisos (fuera de alcance), sabiendo que entonces habrá que elegir el reto del día en el
    servidor. Para no cerrar esa puerta, la elección será una función pura y determinista.
20. **Qué información sacar de un día guardado.** Tres niveles posibles:
    - **a)** Solo lo estructurado: opción elegida, cumplimiento y respuesta a la pregunta de
      nutrir, que alimenta la variable. Sin IA. Es lo que ya está en el plan.
    - **b)** Además, guardar la reflexión y enseñarla en el historial.
    - **c)** Leer la reflexión libre con un modelo de IA para sacar variables nuevas. Exige una
      función de servidor, sustituir los nombres por códigos antes de enviar el texto y avisar al
      usuario de que su texto se procesa fuera. Es lo que hace `retos-noche` (con seudónimos y
      cifrado), y choca con la decisión de prescindir de ese servidor (duda 1).

    Propuesta: **a y b ahora**, y **c como entrega aparte** si la quieres, cuando se haya decidido
    qué se envía, a quién y qué se le dice al usuario. Lo que sí queda claro desde ya: las
    variables de persona guardan el identificador de la ficha, no el nombre, para poder anonimizar.
21. **Correspondencia de virtudes.** Los retos traen «Humildad», «Audacia», «Resistencia y
    persistencia» y «Magnanimidad». Para dar de alta un hábito desde un reto con la lista de seis,
    propongo: humildad → humildad, magnanimidad → magnanimidad, audacia → fortaleza, resistencia y
    persistencia → fortaleza. ¿Es correcta?
22. **Las 7 citas de noche.** ¿Se enseñan al final del examen (una, si hay), o no se usan por ahora?
    Propuesta: sí, una al final, solo si existe una aprobada.

### Riesgos que no dependen de una respuesta

- **Nombres de tabla.** Infra debe confirmar que `camino_variables`, `camino_dia`, `habitos` y
  `habito_marcas` no chocan con tablas antiguas del camino.
- **Fecha local.** El «día» es el del dispositivo. Quien viaje o use dos dispositivos con zonas
  distintas puede ver un día duplicado o saltado. Lo fijo con la `zona_horaria` de sus preferencias,
  salvo que prefieras otra cosa.
- **Personas borradas.** Si se borra una ficha usada en una variable, se conserva el nombre como
  texto. Si se renombra la ficha, el reto usa el nombre nuevo.
- **Contenido insuficiente.** La propia biblioteca avisa: para un mes hacen falta 30 retos por
  temperamento y hay 10.
- **Citas de otros autores.** 43 de las 85 son de autores citados por Alex (Escrivá, Pieper,
  Drucker, Aristóteles…), y la comprobación solo dice que el texto aparece en los libros del
  proyecto. Publicarlas en una app de pago con atribución es decisión vuestra; yo solo las uso con
  «Aprobado» y enseño autor y origen.
- **Aprobar contenido.** Con todo en «Pendiente», nada se enseñaría en producción. Hay que rellenar
  la columna Validación antes del lanzamiento.
