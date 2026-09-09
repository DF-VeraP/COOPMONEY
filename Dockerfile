# Imagen base ligera de Node.js (LTS)
FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar el código de la aplicación
COPY . .

# Exponer el puerto de la aplicación (5000)
EXPOSE 5000

# Variables de entorno predeterminadas
ENV PORT=5000
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["npm", "start"]
