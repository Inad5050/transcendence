# Usar una imagen oficial de Node.js en su versión 18-alpine, que es ligera.
FROM node:18-alpine

# Instala curl
RUN apk add --no-cache curl

# Establecer el directorio de trabajo a /app dentro del contenedor.
WORKDIR /app

# Copiar los archivos de definición de paquetes. Este paso se cachea para acelerar futuras construcciones si no hay cambios en las dependencias.
COPY package*.json ./

# Ejecutar npm install para descargar las dependencias definidas en package.json.
RUN npm install

# Copiar el resto de los archivos del proyecto (como server.js) al contenedor.
COPY . .

# El comando para iniciar el servidor de desarrollo. Se usará el script "dev" del package.json.
CMD ["npm", "run", "dev"]
