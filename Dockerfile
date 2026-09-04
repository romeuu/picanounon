# -------------------------------------------------------------
# Etapa 1: Compilación de Angular
# -------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar manifestos de dependencias
COPY package*.json ./
RUN npm install

# Copiar o código e compilar en produción
COPY . .
RUN npm run build -- --configuration=production

# -------------------------------------------------------------
# Etapa 2: Servidor web de estáticos
# -------------------------------------------------------------
FROM nginx:alpine

# Configuración para soportar SPA (evita 404 ao recargar rutas de Angular)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copiar os artefactos compilados (axusta o nome da carpeta se difire en dist/)
COPY --from=builder /app/dist/*/browser /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]