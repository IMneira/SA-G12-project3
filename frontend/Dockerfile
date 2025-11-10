FROM node:18-bullseye-slim

# Directorio de trabajo
WORKDIR /app

# Añadir binarios de node_modules al PATH
ENV PATH /app/node_modules/.bin:$PATH

# Copiar package.json y lock files
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Exponer puertos usados por Expo (dev server + web)
EXPOSE 8081 19006

# Iniciar Expo en modo web para desarrollo
CMD ["npx", "expo", "start", "--web", "--port", "8081"]
