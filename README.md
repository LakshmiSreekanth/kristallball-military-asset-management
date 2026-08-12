# Military Asset Management System (Kristallball)

Enterprise-grade Military Asset Management System for tracking vehicles, weapons, and ammunition across multiple military bases.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, HTML/CSS, JavaScript (Fetch API) |
| Backend | Node.js, Express.js, JavaScript ES6+ |
| Database | SQLite (via sql.js) — PostgreSQL schema included |
| Auth | JWT + Bcrypt |

## Features

- **Dashboard** — Real-time Opening Balance, Net Movement, Assigned, Expended, Closing Balance
- **Net Movement Modal** — Click to see Purchases / Transfers In / Transfers Out breakdown
- **Purchases** — Log incoming assets with history table
- **Transfers** — Atomic cross-base transfers with stock validation
- **Assignments & Expenditures** — Personnel allocation and consumption tracking
- **RBAC** — Admin (global), Base Commander (scoped to base), Logistics Officer (purchases/transfers)
- **Audit Trail** — Every mutation logged automatically

## Inventory Formula

```
Closing Balance = Opening Balance + Net Movement - Assigned - Expended
Net Movement    = Purchases + Transfers In - Transfers Out
```

## Quick Start

### Prerequisites
- Node.js v18+

### 1. Backend

```bash
cd backend
npm install
npm start
```

Server runs at `http://localhost:5000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

## Test Accounts

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Admin | admin_user | AdminPass123! | All bases (global) |
| Base Commander | commander_alpha | CommandPass123! | Fort Alpha (Base #1) |
| Logistics Officer | logistics_officer | LogisticsPass123! | Purchases & Transfers |

## API Endpoints

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/profile | All | Current user profile |
| GET | /api/assets/dashboard | All | Dashboard metrics |
| GET | /api/assets/bases | All | List bases |
| GET | /api/assets/equipment-types | All | List equipment types |
| GET | /api/assets/audit-logs | All | Audit trail |
| GET/POST | /api/purchases | Admin, Logistics, Commander | Purchase records |
| GET/POST | /api/transfers | Admin, Logistics | Cross-base transfers |
| GET | /api/transfers/stock | All | Current stock levels |
| GET/POST | /api/operations/assignments | Admin, Commander | Personnel assignments |
| GET/POST | /api/operations/expenditures | Admin, Commander | Asset expenditures |

## RBAC Matrix

| Feature | Admin | Base Commander | Logistics Officer |
|---------|-------|----------------|-------------------|
| Dashboard (all bases) | Yes | Own base only | Yes |
| Purchases | Yes | Own base | Yes |
| Transfers | Yes | No | Yes |
| Assignments | Yes | Own base | No |
| Expenditures | Yes | Own base | No |
| Audit Trail | Yes | Yes | No |

## Project Structure

```
kristalball/
├── backend/
│   ├── config/          # Database & JWT config
│   ├── controllers/     # Business logic
│   ├── middlewares/     # Auth, RBAC, Audit logging
│   ├── routes/          # API routes
│   ├── schema.sql       # PostgreSQL schema
│   ├── seed.js          # Sample data
│   └── server.js        # Express entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Sidebar, StatCard, Modal, etc.
│   │   ├── pages/       # Dashboard, Purchases, Transfers, etc.
│   │   ├── context/     # AuthContext
│   │   └── services/    # API client (fetch)
│   └── index.html
└── README.md
```

## Deployment

- **Backend**: Deploy to Render/Railway with `PORT` and `JWT_SECRET` env vars
- **Frontend**: Deploy to Vercel/Netlify with `VITE_API_BASE_URL` pointing to backend

## License

Assessment project — Kristallball Reference Material
