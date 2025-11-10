# Proyecto - Sistema de Gestión Financiera

Aplicación full-stack con backend en FastAPI y frontend en React Native (Expo).

## Inicio Rápido con Docker

### Prerequisitos

- Docker Desktop instalado y en ejecución
- Puertos 8000, 8081, y 5432 disponibles

### Iniciar todos los servicios

```bash
docker compose up -d
```

### Ver logs

```bash
# Todos los servicios
docker compose logs -f

# Solo un servicio específico
docker compose logs -f backend
docker compose logs -f frontend
```

### Detener todos los servicios

```bash
docker compose down
```

## URLs de Acceso

- **Frontend Web**: http://localhost:8081
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Base de datos**: localhost:5432

## Comandos Útiles

### Ver estado de los servicios

```bash
docker compose ps
```

### Ver logs en tiempo real

```bash
# Todos los servicios
docker compose logs -f

# Solo backend
docker compose logs -f backend

# Solo frontend
docker compose logs -f frontend

# Solo base de datos
docker compose logs -f db
```

### Reiniciar servicios

```bash
# Reiniciar todos
docker compose restart

# Reiniciar solo un servicio
docker compose restart backend
docker compose restart frontend
```

### Reconstruir servicios

```bash
# Reconstruir todo
docker compose up --build -d

# Reconstruir solo un servicio
docker compose up --build -d backend
```

### Acceder a los contenedores

```bash
# Backend
docker compose exec backend sh

# Frontend
docker compose exec frontend sh

# Base de datos
docker compose exec db psql -U admin -d finance_db
```

### Detener y eliminar todo (incluyendo datos)

```bash
docker compose down -v
```

## Estructura del Proyecto

```
project-sa-G12/
├── docker-compose.yml    # Configuración Docker unificada
├── .env                  # Variables de entorno
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── main.py      # Punto de entrada
│   │   ├── models.py    # Modelos SQLAlchemy
│   │   ├── schemas.py   # Esquemas Pydantic
│   │   ├── crud.py      # Operaciones de BD
│   │   ├── security.py  # Autenticación JWT
│   │   └── database.py  # Configuración BD
│   ├── Dockerfile
│   └── requirements.txt
│
└── frontend/             # React Native (Expo)
    ├── src/
    │   ├── components/  # Componentes UI
    │   ├── services/    # API services
    │   ├── contexts/    # React contexts
    │   └── styles/      # Estilos
    ├── types/           # TypeScript types
    ├── Dockerfile
    └── package.json
```

## 🌐 Arquitectura de Red

Ambos servicios (frontend y backend) están conectados a la misma red Docker llamada `app-network`, lo que permite:

- Comunicación entre contenedores
- Aislamiento de la red
- Fácil escalabilidad

## 🔍 Solución de Problemas

### El frontend no puede conectarse al backend

1. Verifica que ambos servicios estén corriendo:

   ```bash
   docker ps
   ```

2. Verifica que estén en la misma red:

   ```bash
   docker network inspect app-network
   ```

3. Prueba la conectividad del backend:
   ```bash
   curl http://localhost:8000/
   ```

### Reconstruir todo desde cero

```bash
# Detener y eliminar todo
./docker-stop.sh
docker system prune -f

# Eliminar volúmenes (¡esto borrará los datos de la DB!)
docker volume rm backend_postgres_data

# Iniciar de nuevo
./docker-start.sh
```

### El puerto está en uso

```bash
# Verificar qué proceso está usando el puerto
lsof -i :8000  # o :8081, :5432

# Detener el proceso o cambiar el puerto en docker-compose.yml
```

## Documentación Adicional

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## Desarrollo sin Docker

Si prefieres desarrollar sin Docker:

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Variables de Entorno

### Backend (.env en /backend)

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_DB=finance_db
SECRET_KEY=your-secret-key-here
```

### Raíz del proyecto (.env)

El docker-compose.yml usa las variables del archivo `.env` en la raíz:

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_DB=finance_db
SECRET_KEY=key_para_JWT
```

### Frontend

La URL del backend se configura automáticamente en `docker-compose.yml`:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```