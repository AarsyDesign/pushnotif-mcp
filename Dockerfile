FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src
ENV PUSHNOTIF_API_URL="https://pushnotif.biz.id/mcp"
ENTRYPOINT ["node", "src/index.js"]
