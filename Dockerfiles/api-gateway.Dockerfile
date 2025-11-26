# Dockerfiles/api-gateway.Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# The gateway listens on API_PORT (default 3000)
EXPOSE 3000
ENV API_PORT=3000

CMD ["node", "server.js"]
