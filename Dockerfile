# ---- Etapa 1: Construcción (Vite/React) ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Etapa 2: Servidor web ligero (Nginx) ----
FROM nginx:alpine
# Copiar el código compilado de Vite
COPY --from=build /app/dist /usr/share/nginx/html
# Configurar Nginx para que React Router maneje las URLs correctamente
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]