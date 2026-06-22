# ---- build: genera el artefacto estático en dist/ ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime: nginx sirviendo el artefacto, sin Node en producción ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/docker-entrypoint.d/40-env-config.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh
EXPOSE 80
