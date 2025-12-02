# Dockerfiles/inventory-app.Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 8080
# Support both styles (if your code uses PORT or INVENTORY_PORT)
ENV PORT=8080
ENV INVENTORY_PORT=8080

CMD ["node", "server.js"]
