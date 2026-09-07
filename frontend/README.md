# Tours & Travels CRM — Frontend

Production-ready React 19 + Vite admin frontend for Tours & Travels CRM (Admindek-inspired UI).

## Stack

- React 19 + Vite
- Material UI + Emotion
- React Router
- TanStack React Query
- Axios (Bearer + refresh interceptors)
- React Hook Form + Zod
- Zustand
- DayJS, Recharts, react-data-table-component, notistack

## Quick start

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173).

API base URL defaults to `http://localhost:5000/api` (`VITE_API_URL`).

### Demo mode

With `VITE_DEMO_MODE=true`, if the API is unreachable you can still sign in with any email/password to preview the UI (admin permissions, demo table data).

Set `VITE_DEMO_MODE=false` when connecting to a real backend.

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start Vite dev server    |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |

## Structure

```
src/
  theme/          MUI theme (Admindek colors, Public Sans)
  layout/         Sidebar, TopNavbar, drawers, breadcrumbs
  routes/         Router, guards, menuConfig
  pages/          Feature modules (CRM, ops, finance, masters…)
  components/     DataTable, forms, charts, common UI
  hooks/          Auth, permissions, session timeout, queries
  services/       Axios API clients
  store/          Zustand auth + UI
  schemas/        Zod validation
  utils/          Constants, formatters, permissions, export
```

## Auth behaviour

- Access token attached via Axios request interceptor
- On 401: single refresh attempt; failure clears storage + React Query and redirects to login
- Session inactivity timeout via `useSessionTimeout`
- Remember me uses localStorage vs sessionStorage

## Environment

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Tours & Travels CRM
VITE_SESSION_TIMEOUT_MINUTES=30
VITE_DEMO_MODE=true
```
