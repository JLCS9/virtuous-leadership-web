FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 build-essential ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev --build-from-source

COPY src ./src

RUN mkdir -p /app/data
ENV DB_PATH=/app/data/gymbro.db
ENV WA_AUTH_DIR=/app/data/wa-auth
ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

CMD ["node", "src/index.js"]
