# Dockerfile
FROM node:24-bullseye

# Activar Corepack para usar Yarn 4 (Muy importante si usas Yarn moderno)
RUN corepack enable
RUN corepack prepare yarn@4.12.0 --activate

WORKDIR /app

# Copiamos archivos de dependencias primero para aprovechar la caché de Docker
COPY package.json yarn.lock ./

# Instalamos dependencias
RUN yarn install --immutable

# Copiamos el resto del código
COPY . .

# Exponemos el puerto del backend
EXPOSE 3000

# Comando por defecto (genera el cliente de prisma y arranca en modo dev)
CMD ["sh", "-c", "yarn prisma generate && yarn start:dev"]