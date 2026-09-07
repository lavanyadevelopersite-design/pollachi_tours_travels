# Tours & Travels CRM — Backend API

Production-ready Node.js / Express backend for a Tours & Travels CRM.

## Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **ORM:** Sequelize + MySQL
- **Auth:** JWT access + refresh tokens (rotation, blacklist, logout)
- **Validation:** Zod
- **Security:** Helmet, CORS, rate limiting, XSS sanitization, bcrypt
- **Uploads:** Multer
- **Docs:** Swagger UI (`/api/docs`)
- **Logging:** Winston

## Quick start

### 1. Create MySQL database

```sql
CREATE DATABASE tours_travels_crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your MySQL credentials and JWT secrets.

### 3. Install & run

```bash
npm install
npm run seed
npm run dev
```

- API: `http://localhost:5000/api`
- Swagger: `http://localhost:5000/api/docs`
- Health: `http://localhost:5000/api/health`

### Default admin

| Field    | Value           |
|----------|-----------------|
| Email    | `admin@tours.com` |
| Password | `Admin@123`     |

## Scripts

| Script        | Description              |
|---------------|--------------------------|
| `npm start`   | Production server        |
| `npm run dev` | Nodemon development      |
| `npm run seed`| Seed roles, admin, masters |

## Architecture

```
controllers → services → models
     ↑            ↑
  validators   utils / jobs
```

- Controllers never contain business logic.
- All responses use `ApiResponse`:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "errors": null,
  "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
}
```

## Auth

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |
| POST | `/api/auth/refresh` | Public |
| POST | `/api/auth/logout` | JWT |
| GET | `/api/auth/me` | JWT |
| GET | `/api/health` | Public |

All other `/api/*` routes require `Authorization: Bearer <accessToken>`.

- Access token: 15m (configurable)
- Refresh token: 7d / 30d with `rememberMe`
- Refresh token rotation on each refresh
- Logout blacklists access token and revokes refresh token

## Main modules

| Area | Base path |
|------|-----------|
| Users / Roles | `/api/users`, `/api/roles` |
| Masters | `/api/masters/branches`, `destinations`, `packages`, `hotels`, `vehicles`, `suppliers`, `settings` |
| CRM | `/api/leads`, `/enquiries`, `/follow-ups` |
| Sales | `/api/quotations`, `/bookings` (+ hotels/vehicles/flights sub-routes) |
| Finance | `/api/invoices`, `/receipts`, `/expenses`, `/refunds` |
| Itinerary | `/api/itineraries`, `POST /generate` (mock AI) |
| Insights | `/api/dashboard/stats`, `/api/reports/*` |
| System | `/api/notifications`, `/audit-logs`, `/calendar/events` |

List endpoints support `?page=&limit=&search=&sortBy=&sortOrder=`.

## Database sync

In development, `sequelize.sync({ alter: true })` keeps schema in sync with models.  
For production, prefer migrations (can be added later under `src/migrations`).

## Naming

- JS: `camelCase`
- DB columns: `snake_case` (`underscored: true`)
- Soft deletes: `paranoid: true` where appropriate
- Audit fields: `created_by`, `updated_by`
