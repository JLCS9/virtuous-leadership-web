# gymbro.ai

Plataforma de un solo administrador (tú) que conecta una cuenta de WhatsApp por QR
y convierte ese número en un entrenador personal automatizado, "gymbro.ai", que:

- Hace onboarding a usuarios nuevos por WhatsApp (nombre, edad, sexo, peso, objetivo, gimnasio).
- Conversa como coach con cada usuario usando Claude Haiku 4.5.
- Lleva un registro de mensajes y actividades por día.
- Manda un mensaje de objetivo del día a las 08:00 y un check-in nocturno a las 21:00.
- Recuerda 10 minutos antes cualquier actividad con hora programada.
- Expone una web admin (solo accesible con tu usuario/contraseña) para iniciar/parar
  el bot, ver el QR de vinculación y consultar todos los perfiles, conversaciones y actividades.

> **Aviso importante:** Esto usa la librería no oficial Baileys (WhatsApp Web protocol).
> Conectar un número de WhatsApp con un bot **puede llevar al baneo de Meta**, especialmente
> si envías muchos mensajes a contactos que no te tienen agendado. Usa siempre un **número
> secundario dedicado**, no tu cuenta personal.

## Stack

- **Backend** (`server/`) — Node 20 + Express + Baileys + better-sqlite3 + node-cron + Anthropic SDK.
- **Frontend** (`web/`) — React 18 + Vite. SPA admin servida por nginx.
- **Base de datos** — SQLite local (fichero en `data/gymbro.db`, persistido por volumen).
- **Despliegue** — Dos contenedores (api, web) con `docker-compose`. El nginx del host
  termina TLS para el dominio nuevo y proxea al contenedor web.

## Estructura

```
gymbro/
├── server/                 # Node API + Baileys + cron
│   ├── src/
│   │   ├── index.js        # entrypoint Express
│   │   ├── db.js           # SQLite (better-sqlite3)
│   │   ├── schema.sql      # tablas
│   │   ├── auth.js         # login admin + JWT cookie
│   │   ├── routes/admin.js # /api/admin/*
│   │   ├── ai/             # cliente Anthropic + system prompts
│   │   ├── flows/          # onboarding, coach, recordatorios cron
│   │   ├── whatsapp/       # cliente Baileys + handler de mensajes
│   │   └── lib/time.js     # helpers de zona horaria
│   ├── data/               # SQLite + sesión Baileys (volumen)
│   ├── package.json
│   └── Dockerfile
├── web/                    # React+Vite admin SPA
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── pages/          # Login, BotControl, Profiles, ProfileDetail
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── nginx.conf          # nginx interno del contenedor (sirve SPA + proxy /api)
│   └── Dockerfile
├── deploy/
│   └── nginx-gymbro.conf   # bloque nginx PARA EL HOST (HTTPS + dominio)
├── docker-compose.yml
├── .env.example
└── README.md
```

## Puesta en marcha (local, para pruebas)

1. Genera tu `.env`:
   ```sh
   cd gymbro
   cp .env.example .env
   ```
2. Edita `.env`:
   - `ADMIN_USER` y `ADMIN_PASSWORD` (o `ADMIN_PASSWORD_HASH` si prefieres hash bcrypt).
   - `JWT_SECRET` aleatorio largo (`openssl rand -hex 32`).
   - `ANTHROPIC_API_KEY` desde https://console.anthropic.com.
   - `TIMEZONE` (ej. `Europe/Madrid`).
3. Arranca el stack:
   ```sh
   docker compose up -d --build
   ```
4. Abre http://localhost:8082 → entra con `ADMIN_USER` / `ADMIN_PASSWORD`.
5. Pulsa **Iniciar bot** → aparecerá un QR. Escanéalo desde WhatsApp del número
   que quieras usar como bot (Ajustes → Dispositivos vinculados → Vincular un dispositivo).
6. Pídele a alguien (o a ti mismo desde otro número) que escriba al bot. El primero
   pasará por onboarding; los siguientes mensajes los responde Claude como coach.

## Despliegue en producción (dominio nuevo)

1. Apunta el DNS del dominio nuevo (ej. `gymbro.tudominio.com`) al VPS.
2. En el VPS, clona este repo, entra a `gymbro/`, copia `.env.example` a `.env` y rellénalo
   con valores reales. **Pon `NODE_ENV=production`** en el contenedor (ya está) — eso hace
   que la cookie de sesión vaya con `Secure`.
3. `docker compose up -d --build`.
4. Copia `deploy/nginx-gymbro.conf` al host:
   ```sh
   sudo cp deploy/nginx-gymbro.conf /etc/nginx/sites-available/gymbro
   sudo sed -i 's/GYMBRO_DOMAIN/gymbro.tudominio.com/g' /etc/nginx/sites-available/gymbro
   sudo ln -s /etc/nginx/sites-available/gymbro /etc/nginx/sites-enabled/gymbro
   sudo nginx -t && sudo systemctl reload nginx
   ```
5. Saca certificado:
   ```sh
   sudo certbot --nginx -d gymbro.tudominio.com
   ```
6. Entra a `https://gymbro.tudominio.com` y vincula el número.

## Operación

- **Iniciar / parar el bot:** desde la web admin, pestaña *Bot*. "Detener" hace logout
  de WhatsApp (tendrás que escanear QR de nuevo). "Iniciar" reusa la sesión guardada
  en `data/wa-auth/` si existe; si no, genera QR nuevo.
- **Reconexión automática:** si pones `AUTOSTART_BOT=true` en `.env`, al arrancar el
  contenedor intentará reconectar con la sesión guardada (ideal tras un reinicio).
  Si la sesión está revocada, queda en estado `stopped` y tendrás que iniciar manual.
- **Backups:** todo el estado vive en `gymbro/data/`. Haz backup periódico de esa carpeta:
  - `gymbro.db` — perfiles, mensajes, actividades.
  - `wa-auth/` — sesión de WhatsApp (si la borras, hay que reescanear QR).
- **Costes Claude:** cada mensaje del coach son ~500-1500 tokens de prompt + ~200 de respuesta.
  Con Haiku 4.5 (~$1/M in, ~$5/M out) cada interacción cuesta sub-céntimo.

## Cómo funciona el bot

### Estados de un usuario

```
nuevo → onboarding_name → onboarding_age → onboarding_sex
      → onboarding_weight → onboarding_goal → onboarding_gym → active
```

Mientras está en `onboarding_*`, las preguntas son fijas (state machine en `flows/onboarding.js`).
En `active`, cada mensaje entra en `flows/coach.js` y se responde con Claude usando
el perfil + las últimas 10 vueltas de conversación + el plan de hoy.

### Extracción de actividades

Tras cada respuesta del coach, si el mensaje del usuario contiene patrones de actividad
("voy a entrenar", "a las 18 hago cardio", etc.), se hace una segunda llamada a Claude
en modo extractor (`PLANNER_SYSTEM`) que devuelve JSON con las actividades del día.
Se guardan en la tabla `activities` y disparan los recordatorios de 10 min antes.

### Cron jobs (zona horaria configurable)

- **08:00 diario** → manda `morning_msg` a cada usuario activo.
- **21:00 diario** → manda `evening_msg` (check-in nocturno).
- **Cada minuto** → revisa actividades planeadas con `scheduled_time` y manda
  recordatorio si quedan ≤10 min y aún no se ha enviado.

## Seguridad

- Solo el admin puede ver perfiles. Todo /api/admin/* exige cookie JWT firmada.
- La cookie va `httpOnly`, `sameSite=lax`, y `Secure` en producción.
- La API la binda nginx en `127.0.0.1:3002` — no es accesible desde fuera del VPS.
- Las credenciales del admin viven en `.env`. Recomendado usar `ADMIN_PASSWORD_HASH` (bcrypt).
- El bot no responde a grupos ni a `status@broadcast`, solo a chats individuales.

## Troubleshooting

- **El QR no aparece:** mira logs con `docker compose logs api -f`. Si Baileys peta al
  arrancar, normalmente es por la versión del protocolo — `npm update @whiskeysockets/baileys`
  dentro del Dockerfile y reconstruye.
- **"bot_not_connected" al mandar recordatorio:** el cron intentó enviar pero el bot
  no está conectado. Revisa estado en la web. Los morning/evening solo se ejecutan
  si el bot está conectado.
- **Claude devuelve 401:** revisa `ANTHROPIC_API_KEY`.
- **Claude devuelve 429 (rate limit):** subiendo de tier en console.anthropic.com.
