FROM alpine:3.19

RUN apk add --no-cache \
      nodejs \
      npm \
      python3 \
      make \
      g++ \
      tini \
      curl

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p /var/log/api-gateway && \
    addgroup -S nodeapp && adduser -S nodeapp -G nodeapp && \
    chown -R nodeapp:nodeapp /usr/src/app /var/log/api-gateway

USER nodeapp

ENV NODE_ENV=production
EXPOSE 3000

CMD ["/sbin/tini", "--", "node", "server.js"]

