# Farmacia Ávila

Sistema de gestión para el día a día de la farmacia: catálogo, clientes, ventas e inventario.

## Ejecución con Docker

Permite levantar PostgreSQL, backend y frontend de forma reproducible. **No usa el PostgreSQL instalado en tu máquina**; Compose crea el suyo.

### 1. Requisitos

- Docker
- Docker Compose v2 (`docker compose`)

### 2. Configuración de `.env`

En la raíz del repositorio:

```bash
cp .env.example .env
```

Compose lee `.env` automáticamente desde esta raíz. Revisa y cambia, como mínimo:

**PostgreSQL**

| Variable | Uso |
|---|---|
| `POSTGRES_DB` | Nombre de la base **de Docker** |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` | Credenciales del PostgreSQL de Compose (no el de tu máquina) |

**Backend**

| Variable | Uso |
|---|---|
| `JWT_SECRET` | Clave Base64 de al menos 256 bits. El valor del example es un placeholder inválido: hay que sustituirlo o el backend no arranca. |
| `JWT_EXPIRATION` | Caducidad del token en milisegundos (3600000 = 1 h) |
| `CORS_ALLOWED_ORIGINS` | Origen del navegador, p. ej. `http://localhost:8080` |

Compose fija además `SPRING_PROFILES_ACTIVE=prod`, `DB_URL` (host interno `postgres`), `DB_USERNAME` y `DB_PASSWORD`.

**Frontend (build time)**

| Variable | Uso |
|---|---|
| `VITE_API_URL` | URL del backend **vista por el navegador**, p. ej. `http://localhost:8010` |

`VITE_API_URL` se incrusta en el build de Vite. No uses el hostname interno `backend`: el JavaScript corre en el navegador, no dentro de la red de Docker.

### 3. Construcción

```bash
docker compose build
```

### 4. Ejecución

```bash
docker compose up -d
```

El backend espera a que PostgreSQL esté saludable. Flyway crea el esquema en esa base **nueva**. El servicio `seed` inserta usuarios demo si aún no existen; el frontend espera a que el seed termine.

### 5. Logs

```bash
docker compose logs -f backend
```

Otros: `docker compose logs -f postgres` y `docker compose logs -f frontend`.

### 6. Detener (conserva los datos de Docker)

```bash
docker compose down
```

El volumen `farmacia_pgdata` se mantiene.

### 7. Detener conservando datos

```bash
docker compose down
```

Misma orden: apaga contenedores y **no** borra el volumen.

### 8. Eliminar también el volumen

```bash
docker compose down -v
```

**Borra la base de datos de Docker.** No afecta a tu PostgreSQL local. Úsalo solo si quieres un entorno Compose desde cero.

### 9. URLs

| Servicio | URL |
|---|---|
| Frontend | http://localhost:8080 |
| Backend | http://localhost:8010 |
| PostgreSQL | no se publica en el host; solo red interna (`postgres:5432`) |

El backend no incluye Spring Actuator; no hay `GET /actuator/health`. El arranque se comprueba con los logs y llamando a la API en el puerto 8010.

### 10. Credenciales demo (solo Compose)

Tras el seed:

| Usuario | Rol |
|---|---|
| `admin` | ADMIN |
| `vendedor` | Vendedor |

Contraseñas demo: `admin123` y `vendedor123`. No son secretos de producción.

## Desarrollo local (sin Docker)

Backend (`farmaciaSpring`), perfil `local`, PostgreSQL de tu máquina, puerto 8010.

Frontend (`farmacia-app`): `npm run dev`, `VITE_API_URL` en `.env` (ver `farmacia-app/.env.example`).
