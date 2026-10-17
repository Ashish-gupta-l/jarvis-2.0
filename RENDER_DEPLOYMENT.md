# Render Deployment Guide (jarvis-2.0)

This repository deploys as two Render services:
- Spring Boot backend web service (`backend/`)
- React/Vite frontend static site (`frontend/`)

## 1) Backend (Web Service)

Create a **Web Service** with:
- **Runtime**: `Docker`
- **Root Directory**: `backend`
- **Dockerfile Path**: `Dockerfile`
- **Start Command**: *(leave empty, Dockerfile `CMD` is used)*

Health check path:
- `GET /api/health`

Set these environment variables on the backend service:
- `SPRING_PROFILES_ACTIVE=prod`
- `DB_HOST=<Render PostgreSQL internal hostname>`
- `DB_PORT=5432`
- `DB_NAME=<database name>`
- `DB_USER=<database user>`
- `DB_PASSWORD=<database password>`
- `JWT_SECRET=<long random secret value>`
- `UPLOAD_DIR=/var/data/uploads` (or another writable path)

Notes:
- Backend listens on Render’s assigned port via `${PORT}`.
- `JWT_SECRET` must be set in Render, do not commit real secrets.
- Render filesystem is ephemeral by default. Uploaded files in `UPLOAD_DIR` are not durable unless you attach a persistent disk or move uploads to external object storage.

## 2) Frontend (Static Site)

Create a **Static Site** with:
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

Set frontend environment variable:
- `VITE_API_URL=https://<your-backend-service>.onrender.com`

The frontend will call:
- `${VITE_API_URL}/api/...` in production
- `/api/...` in local dev (Vite proxy to `http://localhost:8080`)

## 3) PostgreSQL connection guidance

In Render, open your PostgreSQL service and use the **internal connection values** (host, port, database, user, password) for the backend environment variables above.

Do not paste database credentials or JWT secrets in chat, issues, or commits.
