# NaiLand Metaverse API Documentation

**Generated:** 2026-04-13 10:00:42

**Total Endpoints:** 28

## Base URL
```
http://localhost:8000
```

## AUTH Endpoints

**Base Path:** `/api/v1`

| Method | Endpoint | Full URL |
|--------|----------|----------|
| POST | `/google` | `/api/v1/google` |
| POST | `/login` | `/api/v1/login` |
| POST | `/logout` | `/api/v1/logout` |
| POST | `/refresh` | `/api/v1/refresh` |
| POST | `/resend-code` | `/api/v1/resend-code` |
| POST | `/signup` | `/api/v1/signup` |
| POST | `/verify-email` | `/api/v1/verify-email` |

## DASHBOARD Endpoints

**Base Path:** `/api/v1`

| Method | Endpoint | Full URL |
|--------|----------|----------|
| POST | `/collaborations` | `/api/v1/collaborations` |
| GET | `/map-pins` | `/api/v1/map-pins` |
| POST | `/map-pins` | `/api/v1/map-pins` |
| GET | `/notifications` | `/api/v1/notifications` |
| POST | `/notifications/{notification_id}/read` | `/api/v1/notifications/{notification_id}/read` |
| GET | `/search-users` | `/api/v1/search-users` |
| POST | `/skill-requests` | `/api/v1/skill-requests` |
| GET | `/skills-needed` | `/api/v1/skills-needed` |
| GET | `/stats` | `/api/v1/stats` |
| GET | `/trending-collabs` | `/api/v1/trending-collabs` |
| GET | `/user-profile` | `/api/v1/user-profile` |
| GET | `/user-profile` | `/api/v1/user-profile` |
| PUT | `/user-skills` | `/api/v1/user-skills` |

## HEALTH Endpoints

**Base Path:** `/api/v1`

| Method | Endpoint | Full URL |
|--------|----------|----------|
| GET | `/` | `/api/v1/` |
| GET | `/health` | `/api/v1/health` |
| GET | `/ping` | `/api/v1/ping` |

## USERS Endpoints

**Base Path:** `/api/v1`

| Method | Endpoint | Full URL |
|--------|----------|----------|
| GET | `/interests` | `/api/v1/interests` |
| GET | `/me` | `/api/v1/me` |
| PUT | `/me/interests` | `/api/v1/me/interests` |
| PUT | `/me/region` | `/api/v1/me/region` |
| GET | `/regions` | `/api/v1/regions` |

## Authentication

Most endpoints require a Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

## Interactive Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
