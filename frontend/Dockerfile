# Usar una imagen oficial de Node.js. Alpine es ligera.
FROM node:18-alpine
# Instala curl
RUN apk add --no-cache curl
# Establecer el directorio de trabajo dentro del contenedor.
WORKDIR /app
# Copiar package.json y package-lock.json para instalar dependencias. Docker cacheará este paso si los archivos no cambian, acelerando compilaciones futuras.
COPY package*.json ./
# Instalar las dependencias del proyecto.
RUN npm install
# Copiar el resto del código fuente de la aplicación al directorio de trabajo.
COPY . .
# Exponer el puerto en el que el servidor de desarrollo de Vite se ejecutará.
EXPOSE 3000
# El comando para iniciar el servidor de desarrollo. Se usará el script "dev" del package.json.
CMD ["npm", "run", "dev"]