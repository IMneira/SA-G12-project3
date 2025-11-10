# Frontend - Expo React Native

Este es el frontend de la aplicación construido con Expo y React Native.

## 🚀 Desarrollo Sin Docker (Local)

### Requisitos previos

- Node.js 18 o superior
- npm o yarn
- El backend debe estar corriendo en `http://localhost:8000`

### Instalación

```bash
# Instalar dependencias
npm install
```

### Variables de entorno

Crea un archivo `.env` en la carpeta `frontend/` (opcional, tiene valores por defecto):

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Ejecutar la aplicación

```bash
# Iniciar el servidor de desarrollo
npm start
```

Esto abrirá Expo DevTools en tu navegador. Desde ahí puedes:

- Presionar `w` para abrir en el navegador web
- Escanear el código QR con la app Expo Go en tu dispositivo móvil
- Presionar `a` para abrir en un emulador Android
- Presionar `i` para abrir en un simulador iOS

### Comandos específicos

```bash
# Abrir en web directamente
npm run web

# Abrir en Android
npm run android

# Abrir en iOS
npm run ios
```

### Limpiar caché

Si tienes problemas, puedes limpiar la caché de Expo:

```bash
npx expo start --clear
```

### Reinstalar dependencias

```bash
rm -rf node_modules
npm install
```

---

## 🐳 Dockerización

El frontend está completamente dockerizado y listo para usar.

### Requisitos previos

- Docker Desktop instalado y en ejecución
- El backend debe estar corriendo en `http://localhost:8000`

### Comandos de Docker

**Construir y levantar el contenedor:**

```bash
docker compose up --build -d
```

**Ver los logs:**

```bash
docker logs -f app_frontend
```

**Detener el contenedor:**

```bash
docker compose down
```

**Reconstruir desde cero:**

```bash
docker compose down
docker compose up --build -d
```

### Acceso a la aplicación

Una vez que el contenedor esté corriendo, puedes acceder a la aplicación web en:

- **Web**: http://localhost:8081

También puedes escanear el código QR que aparece en los logs con Expo Go para ejecutar la app en tu dispositivo móvil.

### Variables de entorno

El frontend se conecta automáticamente al backend usando la variable de entorno configurada en `docker-compose.yml`:

- `EXPO_PUBLIC_API_BASE_URL=http://localhost:8000`

**Importante**: Esta configuración usa `localhost:8000` porque el navegador accede al backend desde fuera de Docker. El backend está expuesto en el puerto 8000 del host.

Si necesitas cambiar la URL del backend, modifica esta variable en el archivo `docker-compose.yml`.

### Desarrollo

Los cambios en el código se reflejan automáticamente gracias al volumen montado:

```yaml
volumes:
  - ./:/app
  - /app/node_modules
```

### Solución de problemas

**El contenedor no inicia:**

```bash
docker logs app_frontend
```

**Reinstalar dependencias:**

```bash
docker compose down
docker compose up --build -d
```

**Verificar que el backend esté corriendo:**

```bash
curl http://localhost:8000/docs
```
