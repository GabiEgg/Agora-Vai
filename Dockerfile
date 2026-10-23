FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY build.js index.html ./
COPY js ./js
COPY data ./data
COPY server ./server
RUN mkdir -p /dados
# Sem Turso, o banco é um arquivo em /dados: começa como root só para liberar o volume;
# o servidor troca para o usuário "node" antes de abrir o banco (veja RODAR_COMO em server.js).
ENV NODE_ENV=production PORT=3000 DB_PATH=/dados/dossie.db RODAR_COMO=node
EXPOSE 3000
CMD ["node","--no-warnings=ExperimentalWarning","server/server.js"]
