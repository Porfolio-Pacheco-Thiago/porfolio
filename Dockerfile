# Node 22 y no otra versión: Vite 8 pide 20.19+ o 22.12+, y es la misma que usa CI.
FROM node:22-alpine

WORKDIR /app

# Las dependencias primero, para aprovechar la cache de capas
COPY package.json package-lock.json ./

# `npm ci` y no `npm install`: instala exactamente lo que dice el lock, que es lo que CI
# valida. Con `install` el contenedor podía resolver versiones distintas y "en Docker
# anda" dejaba de significar nada.
RUN npm ci

# El resto del proyecto
COPY . .

EXPOSE 5173

# Servidor de desarrollo de Vite accesible desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
