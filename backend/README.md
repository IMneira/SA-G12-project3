# Backend (FastAPI) — Instrucciones de desarrollo y API

Este servicio es una API REST construida con FastAPI. El contenedor del backend espera a que la base de datos esté accesible antes de arrancar (mediante `entrypoint.sh`).

## Requisitos
- Docker & Docker Compose (recomendado para pruebas locales)
- (Opcional) Python 3.10+ y `pip` para ejecutar sin Docker

## Cómo correr (con Docker)
1. Copia/edita el archivo `.env` en la carpeta `backend/` con las variables necesarias (ver sección siguiente).
2. Desde la carpeta `backend/` ejecuta:

```powershell
docker-compose up --build
```

El servicio escuchará en el puerto `8000` (http://localhost:8000). La base de datos PostgreSQL se expone en el puerto `5432`.



## .env (ejemplo)
Coloca un archivo `.env` en la carpeta `backend/` con estas variables:

```properties
POSTGRES_USER=admin
POSTGRES_PASSWORD=secret
POSTGRES_DB=finance_db

SECRET_KEY=key_para_JWT
```

Nota: `docker-compose.yml` arma `DATABASE_URL` automáticamente usando `POSTGRES_*`.

## Resumen de endpoints (parámetros y ejemplos)

Todas las rutas protegidas requieren el header Authorization (Bearer token) salvo `/register` y `/login`.

### 1) Registrarse
- Método: POST
- Ruta: `/register`
- Body (JSON):

```json
{
  "email": "user@example.com",
  "password": "string"
}
```

- Respuesta (201/200): `schemas.User`

Ejemplo respuesta:

```json
{
  "id": 1,
  "email": "user@example.com"
}
```

### 2) Login / Obtener token
- Método: POST
- Ruta: `/login`
- Form data (x-www-form-urlencoded): `username` (email), `password`
- Respuesta: `schemas.Token`

Ejemplo respuesta:

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### 3) Obtener usuario actual
- Método: GET
- Ruta: `/users/me`
- Auth: Bearer token
- Respuesta: `schemas.User`

Ejemplo respuesta:

```json
{
  "id": 1,
  "email": "user@example.com"
}
```

### 4) Categorías

- Crear categoría
  - Método: POST
  - Ruta: `/categories/`
  - Body JSON: `{"name": "Transporte"}` (esquema `CategoryCreate`)
  - Respuesta: `Category`:

```json
{
  "id": 3,
  "name": "Transporte",
  "owner_id": 1
}
```

- Listar categorías
  - Método: GET
  - Ruta: `/categories/`
  - Respuesta: lista de `Category`.

### 5) Transacciones

- Crear transacción
  - Método: POST
  - Ruta: `/transactions/`
  - Body JSON (esquema `TransactionCreate`):

```json
{
  "description": "Taxi",
  "amount": 12.5,
  "type": "expense",
  "category_id": 3,
  "date": "2025-11-08T12:00:00"
}
```

  - `type` acepta: `"income"` o `"expense"` (ver `TransactionType`).
  - Respuesta: `Transaction`:

```json
{
  "id": 10,
  "description": "Taxi",
  "amount": 12.5,
  "type": "expense",
  "category_id": 3,
  "date": "2025-11-08T12:00:00",
  "owner_id": 1,
  "category": {
    "id": 3,
    "name": "Transporte",
    "owner_id": 1
  }
}
```

- Listar transacciones
  - Método: GET
  - Ruta: `/transactions/`
  - Query params: `skip` (int, default 0), `limit` (int, default 100)
  - Respuesta: lista de `Transaction`.

- Actualizar transacción
  - Método: PUT
  - Ruta: `/transactions/{transaction_id}`
  - Body JSON (esquema `TransactionUpdate`) con campos opcionales a actualizar.
  - Respuesta: `Transaction` actualizado.

- Eliminar transacción
  - Método: DELETE
  - Ruta: `/transactions/{transaction_id}`
  - Respuesta: HTTP 204 No Content

### 6) Dashboard (resúmenes)

- Resumen total
  - Método: GET
  - Ruta: `/dashboard/summary_total`
  - Respuesta: `DashboardSummary`:

```json
{
  "total_income": 1500.0,
  "total_expense": 800.0,
  "balance": 700.0
}
```

- Resumen por rango de fechas
  - Método: GET
  - Ruta: `/dashboard/summary_by_date`
  - Query params: `start_date` (YYYY-MM-DD), `end_date` (YYYY-MM-DD)
  - Respuesta: `DashboardSummary` (igual estructura al de arriba).

## Notas y observaciones
- El proyecto crea tablas al arrancar (`models.Base.metadata.create_all(bind=engine)`). Para un flujo de producción es recomendable usar Alembic para migraciones.
- El service `entrypoint.sh` espera a que la base de datos acepte conexiones antes de ejecutar Uvicorn.
- Variables opcionales: `ACCESS_TOKEN_EXPIRE_MINUTES` y `ALGORITHM` (por defecto `HS256`) pueden configurarse vía entorno.
- Si experimentas problemas con hashing de contraseñas (bcrypt), asegúrate de que la dependencia `bcrypt` esté instalada en el entorno o considera migrar a `argon2`.

## Cómo probar rápidamente
1. Levanta los servicios con Docker: `docker-compose up --build`
2. Abre `http://localhost:8000/docs` para la documentación interactiva de OpenAPI (Swagger).
3. Registra un usuario con `/register`, luego usa `/login` para obtener un token y prueba los endpoints protegidos usando el botón "Authorize" en la UI.
