FROM node:20-alpine
WORKDIR /app

# Instala dependencias primero (capa cacheable) — sólo cuando cambia package.json
COPY package.json ./
RUN npm install --omit=dev --no-fund --no-audit

# Código y migraciones (las migraciones se referencian para aplicar a mano
# con `docker compose exec api ...` o `psql` desde el host)
COPY server.mjs db.mjs ./
COPY migrations ./migrations

EXPOSE 3001
USER node
CMD ["node", "server.mjs"]
