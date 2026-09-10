FROM node:22-alpine AS build
WORKDIR /app

COPY package.json ./
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
RUN npm install

COPY index.html ./
COPY public ./public
COPY scripts ./scripts
COPY src ./src

RUN npm run validate:data && npm run build

FROM caddy:2.10-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY docker-entrypoint.sh /usr/local/bin/stammbaum-entrypoint
COPY --from=build /app/dist /srv

RUN chmod +x /usr/local/bin/stammbaum-entrypoint

EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/stammbaum-entrypoint"]
