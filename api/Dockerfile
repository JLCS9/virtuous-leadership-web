FROM node:20-alpine
WORKDIR /app
# Sin deps externas — copia los dos archivos y arranca.
COPY package.json server.mjs ./
EXPOSE 3001
USER node
CMD ["node", "server.mjs"]
