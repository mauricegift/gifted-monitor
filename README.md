<h1 align="center">🟢 Gifted Monitor</h1>
<p align="center"><b>Keep free-hosted sites awake. Know the moment yours goes down — before your users do.</b></p>

<p align="center">
  <a href="https://monitor.giftedtech.co.ke"><img src="https://img.shields.io/badge/LIVE%20APP-monitor.giftedtech.co.ke-green?style=for-the-badge&logo=googlechrome" alt="Live App"/></a>
</p>

<p align="center">
  <a href="https://github.com/mauricegift"><img src="https://img.shields.io/badge/GITHUB-GIFTED%20TECH-red?style=for-the-badge&logo=github"/></a>
  <img src="https://img.shields.io/badge/stack-React%20%2B%20Node.js-blue?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge"/>
</p>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 1. OVERVIEW

<details>
<summary>TAP TO EXPAND</summary>

**Gifted Monitor** solves two real problems developers face with free hosting:

1. **Free-tier sleep** — Platforms like Render, Railway, and Fly.io put your app to sleep after a period of inactivity. Gifted Monitor pings your service at your chosen interval so it stays awake and ready to respond instantly.

2. **Silent downtime** — When your deployed site goes down, you're usually the last to know — after your users do. Gifted Monitor detects the outage immediately and sends you an email alert so you can fix it before anyone else notices.

It's a full-stack self-hostable uptime monitoring SaaS with multi-DB support. It watches your websites 24/7, keeps free-tier services alive with regular pings, and sends instant email alerts when something goes down — and again when it recovers.

**Live at:** [https://monitor.giftedtech.co.ke](https://monitor.giftedtech.co.ke)

| Feature | Details |
|---|---|
| Uptime Monitoring | HTTP/HTTPS checks via GET, HEAD, or POST |
| Custom Intervals | Per-monitor check intervals (minimum: 30 seconds) |
| Email Alerts | Down + recovery alerts via Resend (up to 5 domain round-robin) |
| Round-Robin Email | Exhausts all configured Resend domains before returning an error |
| Email Change | Confirm new email via link sent to the new address |
| OTP / Link Auth | Email link-based verification for signup and password reset |
| JWT Auth | 1-day tokens with 12-hour sliding auto-refresh |
| **API Keys** | Create/revoke personal API keys from Profile → API Keys tab |
| **REST API v1** | Full monitor CRUD + notification prefs via `X-API-Key` — no browser required |
| **Notification Prefs API** | `PATCH /api/v1/monitors/:id/notifications` — toggle `notify_down`/`notify_up` per monitor |
| **API Docs** | Built-in docs page at `/api-docs` (also `/docs`) with code examples (Node/Python/PHP) |
| **System Theme** | Default theme follows OS preference; switch to Light/Dark/System from the header menu |
| Admin Panel | Manage all users, monitors, and contact messages |
| Super Admin | First verified user becomes the platform Super Admin |
| Breadcrumb Navigation | Full breadcrumb trail on every authenticated page |
| Contact Form | Public contact page saves messages to the database |
| **Multi-DB** | Auto-detects PostgreSQL, MySQL, or MongoDB from `DATABASE_URL` |
| Mobile-Responsive | Curved mobile sidebar, hamburger nav, full footer on all pages |
| Monitor Limit | Per-user monitor quota with admin-configurable limits |
| Bulk Actions | Select-all + bulk operations on monitors, users, and messages |
| Pagination | Paginated monitor and user lists with smart page controls |
| Monorepo | Backend builds and serves the React frontend as static files |
| Auto-Refresh | Dashboard and monitor pages auto-refresh every 5 seconds |

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 2. TECH STACK

<details>
<summary>TAP TO EXPAND</summary>

**Backend**
- **Runtime:** Node.js 18+ (CommonJS)
- **Framework:** Express 4
- **Database:** PostgreSQL, MySQL, or MongoDB — auto-detected from `DATABASE_URL`
- **Auth:** JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`, 12 rounds) + SHA-256 hashed API keys
- **HTTP Client:** Axios (for pinging monitors)
- **Email:** Resend API — up to 5 domain/key pairs in round-robin rotation
- **Security:** Helmet, express-rate-limit

**Frontend**
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no PostCSS needed)
- **State:** Zustand (persisted to localStorage)
- **Data Fetching:** TanStack Query v5
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion, AOS
- **Icons:** Lucide React
- **Routing:** React Router v7

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 3. PROJECT STRUCTURE

<details>
<summary>TAP TO EXPAND</summary>

```
gifted-monitor/
├── package.json              # Root monorepo scripts (build, start, start:prod)
├── README.md
├── .gitignore
│
├── backend/                  # Node.js/Express API
│   ├── index.js              # Entry point — starts server + ping engine
│   ├── config.js             # All env vars with defaults
│   ├── package.json
│   ├── .env.example          # Example environment file
│   ├── lib/
│   │   ├── server.js         # Express setup — global rate limiter + API routes + static file serving
│   │   ├── auth.js           # JWT sign/verify, requireAuth, requireApiKey middleware
│   │   ├── ping.js           # Monitoring engine (interval-based pinger)
│   │   ├── email.js          # Resend API email helpers (round-robin multi-domain)
│   │   ├── ipcheck.js        # VPN/proxy/datacenter detection (ip-api.com, 24h cache)
│   │   └── db/
│   │       ├── index.js      # DB adapter selector (auto-detects from DATABASE_URL)
│   │       └── adapters/
│   │           ├── postgres.js   # PostgreSQL adapter
│   │           ├── mysql.js      # MySQL adapter
│   │           └── mongo.js      # MongoDB adapter
│   └── routes/
│       ├── index.js          # Route aggregator
│       ├── auth.js           # /api/auth/* endpoints
│       ├── monitors.js       # /api/monitors/* endpoints
│       ├── apikeys.js        # /api/apikeys/* endpoints (JWT-authenticated key management)
│       ├── v1.js             # /api/v1/* public REST API (API key auth)
│       ├── admin.js          # /api/admin/* endpoints
│       └── public.js         # /api/contact, /api/status
│
└── frontend/                 # React + Vite SPA
    ├── index.html
    ├── vite.config.ts        # Dev proxy: /api → localhost:3000; Tailwind via plugin
    ├── src/
    │   ├── App.tsx           # Routes + route guards (PrivateRoute, AdminRoute, GuestRoute)
    │   ├── layouts/
    │   │   ├── AppLayout.tsx         # Authenticated layout (header + sidebar + footer)
    │   │   └── PublicLayout.tsx      # Public layout (nav + footer)
    │   ├── pages/
    │   │   ├── public/       # Home, About, Contact, Terms, Privacy, ApiDocs
    │   │   ├── auth/         # Login, Signup, ForgotPassword, VerifyOtp, ResetPassword
    │   │   └── main/
    │   │       ├── Dashboard.tsx
    │   │       ├── Monitors.tsx
    │   │       ├── MonitorDetail.tsx
    │   │       ├── CreateMonitor.tsx
    │   │       ├── Profile.tsx       # 5 tabs: Profile / Notifications / Security / API Keys / Account
    │   │       └── admin/
    │   │           ├── AdminDashboard.tsx
    │   │           ├── Users.tsx
    │   │           ├── AdminMonitors.tsx
    │   │           └── Messages.tsx
    │   ├── components/
    │   │   ├── ui/           # Breadcrumb, Modal, InputWithIcon, ButtonWithLoader, etc.
    │   │   └── main/         # MonitorCard, StatusBadge, UptimeBar
    │   ├── store/            # Zustand auth store (persisted)
    │   ├── helpers/          # formatDate, intervals, cropImage
    │   ├── schemas/          # Zod validation schemas
    │   ├── hooks/            # useTheme
    │   ├── config/
    │   │   └── api.ts        # Axios instance with JWT interceptor + auto-refresh
    │   └── types/            # TypeScript types
    └── dist/                 # Built output — served by backend in production
```

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 4. QUICK START — DEVELOPMENT

<details>
<summary>TAP TO EXPAND</summary>

In development, the frontend Vite dev server and the backend API run as separate processes. The Vite dev server proxies `/api` requests to the backend automatically.

**1. Clone the repo**
```bash
git clone https://github.com/mauricegift/gifted-monitor.git
cd gifted-monitor
```

**2. Install dependencies**
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

**3. Configure environment**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

**4. Run both services**

Open two terminals:

```bash
# Terminal 1 — Backend API (port 3000)
cd backend && node index.js

# Terminal 2 — Frontend dev server (port 5173, with HMR)
cd frontend && npm run dev
```

Visit **http://localhost:5173** — the Vite dev server proxies all `/api/*` calls to `localhost:3000` automatically.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 5. PRODUCTION SETUP (MONOREPO)

<details>
<summary>TAP TO EXPAND</summary>

In production, the backend builds the React frontend and serves its compiled static files directly. This means you only need **one process** and **one port** for the entire application.

**How it works:**
1. `npm run build` compiles the React app into `frontend/dist/`
2. The backend detects `frontend/dist/` at startup and enables static file serving
3. All `/api/*` routes are handled by the backend as before
4. All other routes serve `frontend/dist/index.html` (SPA fallback)

**Build and start:**
```bash
# From the project root — builds frontend then starts backend
npm run start:prod

# Or separately:
npm run build       # builds frontend/dist/
npm start           # starts backend (auto-detects and serves the built frontend)
```

**Using backend scripts directly:**
```bash
cd backend
npm run start:prod   # build frontend + start server
# or
npm run build        # just build
npm start            # just start (assumes dist already exists)
```

**Environment variables for production:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=your_strong_random_secret
FRONTEND_URL=https://monitor.yourdomain.com
```

> **Note:** In production mode, `ALLOWED_ORIGINS` is enforced strictly. Same-origin requests (frontend served from the backend) do not require any CORS configuration.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 6. ENVIRONMENT VARIABLES

<details>
<summary>TAP TO EXPAND</summary>

Create a `.env` file in the `backend/` directory (or set them in your hosting platform). See `backend/.env.example` for the full template.

```env
# ── Server ───────────────────────────────────────────────────────────
PORT=3000
NODE_ENV=production

# ── Database ─────────────────────────────────────────────────────────
# PostgreSQL (Neon, Supabase, Railway, local)
DATABASE_URL=postgresql://user:password@host/dbname

# MySQL
# DATABASE_URL=mysql://user:password@host:3306/dbname

# MongoDB
# DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname

# ── Auth ─────────────────────────────────────────────────────────────
JWT_SECRET=your_strong_random_secret_here
SESSION_SECRET=another_strong_random_secret

# ── Email via Resend ─────────────────────────────────────────────────
# Up to 5 domain/key pairs — tried in round-robin order
# All keys are exhausted before an error is returned
RESEND1_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND1_DOMAIN=alerts.yourdomain.com
RESEND2_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND2_DOMAIN=alerts2.yourdomain.com
# RESEND3, RESEND4, RESEND5 — optional

# ── App URL ──────────────────────────────────────────────────────────
# Used in verification/reset/email-change links sent by email
FRONTEND_URL=https://monitor.yourdomain.com

# ── Monitoring Engine ─────────────────────────────────────────────────
PING_CHECK_INTERVAL_SECS=10
MIN_PING_INTERVAL_MINS=0.5

# ── Timezone ─────────────────────────────────────────────────────────
TIMEZONE=Africa/Nairobi

# ── CORS ─────────────────────────────────────────────────────────────
# Not needed if frontend is served by the backend (monorepo mode)
# Required if frontend is hosted separately
ALLOWED_ORIGINS=https://monitor.yourdomain.com
```

> **Security note:** Always set strong, unique secrets for `JWT_SECRET` and `SESSION_SECRET` in production.

> **Resend:** Get API keys and configure sending domains at [resend.com](https://resend.com). The free tier allows 3,000 emails/month. Adding multiple domains provides round-robin failover — all domains are tried before an error is thrown.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 7. DATABASE SETUP

<details>
<summary>TAP TO EXPAND — PostgreSQL (Neon / Supabase / Railway)</summary>

**Recommended for most deployments.** Free-tier Neon is sufficient for self-hosted use.

```env
DATABASE_URL=postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

All tables are created automatically on first startup — no manual migrations needed.

**Schema (auto-created):**

```sql
users          (id, username, name, email, password_hash, is_verified, is_admin,
                is_superadmin, is_disabled, avatar, monitor_limit, notify_down,
                notify_up, pending_email, registration_ip, created_at)

monitors       (id, user_id, name, url, path, method, body, interval_mins,
                last_status, last_checked, uptime_pct, notify_down, notify_up,
                is_active, incident_start, last_reminder_at, created_at)

check_history  (id, monitor_id, status, response_time, error_msg, checked_at)

otp_codes      (id, email, code, type, expires_at, used, created_at)

contact_messages (id, name, email, subject, message, is_read, created_at)

api_keys       (id, user_id, name, key_hash, key_prefix, last_used, is_active, created_at)
```

> `users.monitor_limit` defaults to `20`. Admins/superadmins have no limit applied.

</details>

<details>
<summary>TAP TO EXPAND — MySQL (PlanetScale / Railway / local)</summary>

```env
DATABASE_URL=mysql://user:password@host:3306/dbname
```

All tables are auto-created on startup, identical schema to PostgreSQL. Requires `mysql2` package (already in `backend/package.json`).

</details>

<details>
<summary>TAP TO EXPAND — MongoDB (Atlas / Railway / local)</summary>

```env
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/gifted-monitor
```

Collections are created automatically. The MongoDB adapter uses `_id` as the document identifier (auto-converted to `id` in all responses for API consistency).

</details>

<details>
<summary>TAP TO EXPAND — Local PostgreSQL (localhost dev)</summary>

For local development without a cloud DB:

**1. Install PostgreSQL**
```bash
# macOS
brew install postgresql@16 && brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib && sudo systemctl start postgresql
```

**2. Create a database and user**
```bash
sudo -u postgres psql
```
```sql
CREATE USER monitor_user WITH PASSWORD 'strongpassword';
CREATE DATABASE gifted_monitor OWNER monitor_user;
GRANT ALL PRIVILEGES ON DATABASE gifted_monitor TO monitor_user;
\q
```

**3. Set DATABASE_URL in your `.env`**
```env
DATABASE_URL=postgresql://monitor_user:strongpassword@localhost:5432/gifted_monitor
```

All tables are created automatically when the backend starts. No manual SQL needed.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 8. RESEND EMAIL SETUP

<details>
<summary>TAP TO EXPAND — Single account</summary>

1. Create an account at [resend.com](https://resend.com)
2. Add and verify your sending domain (e.g. `alerts.yourdomain.com`)
3. Create an API key scoped to that domain
4. Set in your `.env`:

```env
RESEND1_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND1_DOMAIN=alerts.yourdomain.com
```

The `From` address on all emails will be `Gifted Monitor <no-reply@alerts.yourdomain.com>`.

</details>

<details>
<summary>TAP TO EXPAND — Multiple accounts / domains (round-robin failover)</summary>

You can configure up to **5 Resend accounts or domains** for round-robin failover. On every email send, the system tries `RESEND1` first. If it fails (rate limit, domain error, etc.), it tries `RESEND2`, then `RESEND3`, and so on. An error is only returned to the caller after **all** configured domains have been tried.

```env
# First account / domain
RESEND1_API_KEY=re_AAAAaaaa11111111111111
RESEND1_DOMAIN=alerts.yourdomain.com

# Second account / domain (different Resend account or same account, different domain)
RESEND2_API_KEY=re_BBBBbbbb22222222222222
RESEND2_DOMAIN=alerts2.anotherdomain.com

# Optional third, fourth, fifth
RESEND3_API_KEY=re_CCCCcccc33333333333333
RESEND3_DOMAIN=notify.thirddomain.com
```

**Why use multiple domains?**
- Resend free tier: 3,000 emails/month per account
- Multiple accounts multiply your free allowance
- If one domain's reputation drops, alerts still go through on the others
- Zero-downtime failover — no code changes needed

**Tips:**
- Each `RESEND_DOMAIN` must be verified in its corresponding Resend account
- API keys should be scoped to "Sending access" only
- Only `RESEND1_*` is required — RESEND2–5 are all optional

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 9. AUTH FLOW

<details>
<summary>TAP TO EXPAND</summary>

**Signup:**
1. User submits email, username, name, and password to `POST /api/auth/signup`
2. Backend sends a verification link to their email (valid 30 minutes)
3. User clicks the link → `GET /verify?email=...&token=...&type=signup`
4. Frontend posts to `/api/auth/verify-otp` automatically; on success returns JWT + user

**Login:**
1. User submits email (or username) + password to `POST /api/auth/login`
2. Backend validates credentials and checks `is_verified` and `is_disabled`
3. Returns JWT (1-day expiry) + user object

**Token refresh:**
- On every authenticated request, the backend checks remaining token lifetime
- If less than 12 hours remain, a fresh token is returned in `x-refresh-token` header
- The Axios interceptor reads this header and updates the store silently

**Auto-logout:**
- Any `401` response triggers `logout()` in the Axios response interceptor
- `GET /api/auth/me` is called on every app load to validate the token

**Password reset:**
1. User requests link via `POST /api/auth/forgot-password`
2. Frontend auto-verifies on link click; returns a short-lived reset token
3. User sets new password via `POST /api/auth/reset-password`

**Email change:**
1. User enters new email on Profile page → `POST /api/auth/request-email-change`
2. Confirmation link sent to the **new** email address
3. Clicking the link → `POST /api/auth/confirm-email-change`
4. Email updated; a new JWT is issued (old email stays active until confirmed)

**Route guards (frontend):**

| Guard | Behavior |
|---|---|
| `PrivateRoute` | Redirects to `/login` if not authenticated |
| `AdminRoute` | Redirects to `/dashboard` if authenticated but not admin/superadmin |
| `GuestRoute` | Redirects to `/dashboard` if already logged in |

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 10. MONITORING ENGINE

<details>
<summary>TAP TO EXPAND</summary>

The ping engine runs in the backend process as a recurring loop.

**How it works:**
1. Every `PING_CHECK_INTERVAL_SECS` (default: 10s), the engine queries all active monitors
2. For each monitor whose `last_checked + interval_mins` is in the past, a ping is dispatched
3. The ping is an HTTP request (`GET`, `HEAD`, or `POST`) using Axios with a 15-second timeout
4. A `2xx` response → **UP**; anything else → **DOWN**
5. Before sending a down alert, the engine waits 8 seconds and retries once to prevent false alarms
6. Check results are written to `check_history` (last 60 kept per monitor)
7. Uptime percentage is calculated from the last 60 checks

**Intervals supported:**
30 seconds, 1 min, 3 min, 5 min, 10 min, 15 min, 30 min, 1 hour, 3 hours, 6 hours, 12 hours, 24 hours

**Alert lifecycle:**
- **Down alert:** Sent when a monitor transitions UP → DOWN (after retry confirmation)
- **Recovery alert:** Sent when a monitor transitions DOWN → UP
- **24h reminder:** Sent every 24 hours if the monitor remains down

**POST monitors:**
- An optional JSON request body can be stored per monitor
- Sent as `Content-Type: application/json` on every POST ping

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 11. ADMIN PANEL

<details>
<summary>TAP TO EXPAND</summary>

Accessible via the **Admin** dropdown in the navigation — requires admin or superadmin privileges.

| Section | Path | What You Can Do |
|---|---|---|
| Dashboard | `/admin/dashboard` | Platform-wide stats (users, monitors, up/down counts) |
| Users | `/admin/users` | Search, view, edit, suspend, promote, demote, or delete users; set monitor limits; bulk actions |
| All Monitors | `/admin/monitors` | View and manage every monitor across all accounts; bulk actions |
| Messages | `/admin/messages` | Read contact form submissions, mark as read, or delete |

**Monitor limit management:**
- Regular users default to **20 monitors**
- Admins and superadmins have **no limit**
- Limits can be changed per-user from the Users admin panel

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 12. BULK ACTIONS

<details>
<summary>TAP TO EXPAND</summary>

Bulk selection is available across three areas. Select items using checkboxes — a sticky action bar appears with available operations.

**User Monitors (`/monitors`):**

| Action | Details |
|---|---|
| Pause | Stops pinging selected monitors |
| Activate | Resumes pinging selected monitors |
| Delete | Permanently deletes selected monitors + their history (requires password) |

**Admin — Users (`/admin/users`):**

| Action | Details |
|---|---|
| Enable | Re-enables disabled selected users |
| Disable | Blocks login for selected users (superadmins are skipped) |
| Delete | Permanently deletes selected users and all their monitors (requires password; superadmins skipped) |

**Admin — Monitors (`/admin/monitors`):**

| Action | Details |
|---|---|
| Pause | Stops pinging selected monitors |
| Activate | Resumes pinging selected monitors |
| Set Interval | Applies the same check interval to all selected monitors |
| Delete | Permanently deletes selected monitors + history (requires password) |

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 13. API KEYS

<details>
<summary>TAP TO EXPAND</summary>

Each user can create up to **10 personal API keys** from **Profile → API Keys** tab. Keys authenticate requests to the public REST API (`/api/v1/*`) using the `X-API-Key` header.

**Key format:** `gm_` + 64 hex characters (e.g. `gm_4a8f2b1c...`)

**Security:**
- The full key is shown **only once** at creation — copy it immediately
- Only the SHA-256 hash is stored in the database — the plaintext is never persisted
- Each key tracks `last_used` timestamp
- Keys can be revoked instantly from the Profile page
- Revoking a key invalidates it immediately for all future requests

**Creating a key via the API (JWT required):**
```bash
curl -X POST https://monitor.giftedtech.co.ke/api/apikeys \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"My CI Key"}'
```

**Response:**
```json
{
  "key": "gm_4a8f2b1c...",
  "prefix": "gm_4a8f2b1c00",
  "name": "My CI Key",
  "message": "Copy this key — it will not be shown again."
}
```

**Listing keys:**
```bash
curl https://monitor.giftedtech.co.ke/api/apikeys \
  -H "Authorization: Bearer YOUR_JWT"
```

**Revoking a key:**
```bash
curl -X DELETE https://monitor.giftedtech.co.ke/api/apikeys/KEY_ID \
  -H "Authorization: Bearer YOUR_JWT"
```

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 14. PUBLIC REST API v1

<details>
<summary>TAP TO EXPAND — Overview</summary>

The public REST API is available at `/api/v1/*`. All endpoints require an `X-API-Key` header. Create keys from **Profile → API Keys** tab. Full interactive documentation is available in-app at `/docs`.

**Base URL:** `https://monitor.giftedtech.co.ke/api/v1`

**Authentication:**
```
X-API-Key: gm_your_api_key_here
```

**Error responses:**

| Status | Meaning |
|---|---|
| `401` | Missing or invalid API key |
| `403` | Key is valid but you don't own this resource |
| `404` | Resource not found |
| `400` | Validation error (see `error` field) |
| `500` | Server error |

</details>

<details>
<summary>TAP TO EXPAND — Monitors endpoints</summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/monitors` | List all your monitors with last 30 checks each |
| `POST` | `/monitors` | Create a new monitor |
| `GET` | `/monitors/:id` | Get one monitor with full 60-check history |
| `PUT` | `/monitors/:id` | Update monitor settings |
| `DELETE` | `/monitors/:id` | Delete a monitor (no password required) |
| `POST` | `/monitors/:id/ping` | Manually trigger an immediate ping |
| `GET` | `/monitors/:id/history` | Get check history (up to 200 records, use `?limit=N`) |

**Create monitor — request body:**
```json
{
  "name": "My API",
  "url": "https://api.example.com/health",
  "method": "GET",
  "interval_mins": 5,
  "notify_down": true,
  "notify_up": true
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | Yes | Max 100 chars |
| `url` | string | Yes | Must start with `http://` or `https://` |
| `method` | string | No | `GET` (default), `HEAD`, or `POST` |
| `path` | string | No | Appended to URL before pinging |
| `body` | string | No | JSON body for POST monitors |
| `interval_mins` | number | No | Default 3, min 0.5 (30s), max 1440 (24h) |
| `notify_down` | boolean | No | Default `true` |
| `notify_up` | boolean | No | Default `true` |

</details>

<details>
<summary>TAP TO EXPAND — Code examples</summary>

**Node.js**
```javascript
const BASE = 'https://monitor.giftedtech.co.ke/api/v1';
const KEY  = 'gm_your_api_key_here';

// List monitors
const res = await fetch(`${BASE}/monitors`, {
  headers: { 'X-API-Key': KEY }
});
const { monitors } = await res.json();
console.log(monitors);

// Create a monitor
const create = await fetch(`${BASE}/monitors`, {
  method: 'POST',
  headers: { 'X-API-Key': KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'My API', url: 'https://api.example.com', interval_mins: 5 })
});
const monitor = await create.json();
console.log(monitor.id);
```

**Python**
```python
import requests

BASE = 'https://monitor.giftedtech.co.ke/api/v1'
HEADERS = {'X-API-Key': 'gm_your_api_key_here'}

# List monitors
monitors = requests.get(f'{BASE}/monitors', headers=HEADERS).json()

# Create a monitor
new = requests.post(f'{BASE}/monitors', headers=HEADERS, json={
    'name': 'My API', 'url': 'https://api.example.com', 'interval_mins': 5
}).json()
print(new['id'])
```

**PHP**
```php
$base = 'https://monitor.giftedtech.co.ke/api/v1';
$key  = 'gm_your_api_key_here';

$ch = curl_init("$base/monitors");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ["X-API-Key: $key"],
]);
$data = json_decode(curl_exec($ch), true);
print_r($data['monitors']);
```

**cURL**
```bash
# List monitors
curl https://monitor.giftedtech.co.ke/api/v1/monitors \
  -H "X-API-Key: gm_your_api_key_here"

# Create a monitor
curl -X POST https://monitor.giftedtech.co.ke/api/v1/monitors \
  -H "X-API-Key: gm_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{"name":"My API","url":"https://api.example.com","interval_mins":5}'

# Delete a monitor
curl -X DELETE https://monitor.giftedtech.co.ke/api/v1/monitors/42 \
  -H "X-API-Key: gm_your_api_key_here"
```

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 15. INTERNAL API REFERENCE

<details>
<summary>AUTH — /api/auth</summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Register — sends verification link |
| POST | `/verify-otp` | No | Verify signup or reset link/token |
| POST | `/resend-otp` | No | Resend verification link |
| POST | `/login` | No | Login — returns JWT + user |
| POST | `/forgot-password` | No | Send password reset link |
| POST | `/reset-password` | No | Reset password with reset token |
| GET | `/me` | Yes | Get current user profile |
| PUT | `/profile` | Yes | Update name or avatar |
| POST | `/change-password` | Yes | Change account password |
| POST | `/notification-prefs` | Yes | Save email notification preferences |
| POST | `/request-email-change` | Yes | Send confirmation link to new email |
| POST | `/confirm-email-change` | No | Confirm email change from link |

</details>

<details>
<summary>MONITORS — /api/monitors</summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | List all monitors for the current user |
| POST | `/` | JWT | Create a monitor (respects `monitor_limit`) |
| GET | `/:id` | JWT | Get monitor details + last 60 checks |
| PUT | `/:id` | JWT | Update monitor settings |
| DELETE | `/:id` | JWT | Delete a monitor (requires password) |
| POST | `/:id/ping` | JWT | Manually trigger an immediate ping |
| POST | `/bulk` | JWT | Bulk action — body: `{ action, ids, password? }` |

**Bulk actions for monitors:** `pause`, `activate`, `delete`

</details>

<details>
<summary>API KEYS — /api/apikeys</summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | JWT | List all your API keys (hashed — plaintext never returned after creation) |
| POST | `/` | JWT | Create a new API key — body: `{ name }` |
| DELETE | `/:id` | JWT | Revoke / delete an API key |

</details>

<details>
<summary>REST API v1 — /api/v1</summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/monitors` | API Key | List all monitors + last 30 checks |
| POST | `/monitors` | API Key | Create a monitor |
| GET | `/monitors/:id` | API Key | Get monitor + last 60 checks |
| PUT | `/monitors/:id` | API Key | Update monitor settings |
| DELETE | `/monitors/:id` | API Key | Delete a monitor (no password required) |
| POST | `/monitors/:id/ping` | API Key | Trigger an immediate ping |
| GET | `/monitors/:id/history` | API Key | Get check history (max 200, `?limit=N`) |

</details>

<details>
<summary>ADMIN — /api/admin</summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Platform-wide stats |
| GET | `/users` | Admin | Paginated user list |
| GET | `/users/:id` | Admin | Single user + their monitors |
| PUT | `/users/:id` | Admin | Edit user (promote, suspend, set limit) |
| DELETE | `/users/:id` | SuperAdmin | Delete user (requires password) |
| POST | `/users/bulk` | Admin | Bulk user action |
| GET | `/monitors` | Admin | All monitors (paginated) |
| PUT | `/monitors/:id` | Admin | Edit any monitor |
| DELETE | `/monitors/:id` | Admin | Delete any monitor (requires password) |
| POST | `/monitors/bulk` | Admin | Bulk monitor action |
| GET | `/contact` | Admin | Paginated contact messages |
| PUT | `/contact/:id/read` | Admin | Mark message as read |
| POST | `/contact/bulk` | Admin | Bulk message action |

</details>

<details>
<summary>PUBLIC — No auth required</summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/contact` | Submit a contact/support message |
| GET | `/api/status` | System health check |

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 16. DEPLOYMENT

<details>
<summary>TAP TO EXPAND — Railway (Recommended — free tier available)</summary>

Railway auto-detects Node.js projects and uses the included `railway.toml` config.

**1. Push to GitHub**
```bash
git push origin main
```

**2. Create a Railway project**
- Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
- Select your `gifted-monitor` repo
- Railway reads `railway.toml` and sets `npm run build` / `npm start` automatically

**3. Provision a PostgreSQL database**
- In your Railway project: **New** → **Database** → **Add PostgreSQL**
- Railway automatically sets the `DATABASE_URL` environment variable in your service

**4. Set environment variables**

In Railway → your service → **Variables** tab, add:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | A long random string (use a password generator) |
| `SESSION_SECRET` | Another long random string |
| `FRONTEND_URL` | Your Railway public URL, e.g. `https://gifted-monitor.up.railway.app` |
| `RESEND1_API_KEY` | Your Resend API key |
| `RESEND1_DOMAIN` | Your verified Resend sending domain |

`DATABASE_URL` is injected automatically by Railway's Postgres service.

**5. Deploy**
Railway triggers a build automatically on every push. The first deploy builds the frontend and starts the backend — all from one service on one port.

**6. Custom domain (optional)**
Railway service → **Settings** → **Domains** → **Add Custom Domain**

> **Tip:** Railway free tier includes $5/month of usage — enough for a low-traffic personal instance.

</details>

<details>
<summary>TAP TO EXPAND — Heroku (includes free Postgres via app.json)</summary>

The included `Procfile` and `app.json` make Heroku deployment one-click or CLI-driven.

**Option A — Deploy button (one-click)**

Add this badge to your own fork's README and share it:

```markdown
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/mauricegift/gifted-monitor)
```

This uses `app.json` to provision a free Postgres add-on and prompt for required env vars automatically.

**Option B — Heroku CLI**

```bash
# Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
heroku login
heroku create your-app-name
heroku addons:create heroku-postgresql:essential-0 -a your-app-name

# Set required environment variables
heroku config:set NODE_ENV=production -a your-app-name
heroku config:set JWT_SECRET=$(openssl rand -hex 32) -a your-app-name
heroku config:set SESSION_SECRET=$(openssl rand -hex 32) -a your-app-name
heroku config:set FRONTEND_URL=https://your-app-name.herokuapp.com -a your-app-name
heroku config:set RESEND1_API_KEY=re_xxxx -a your-app-name
heroku config:set RESEND1_DOMAIN=alerts.yourdomain.com -a your-app-name

# Deploy
git push heroku main
```

**3. Open the app**
```bash
heroku open -a your-app-name
```

**4. View logs**
```bash
heroku logs --tail -a your-app-name
```

> **Note:** Heroku no longer has a free dyno tier. Use the **Eco** ($5/month) or **Basic** ($7/month) plan.

</details>

<details>
<summary>TAP TO EXPAND — Render (free tier available)</summary>

The included `render.yaml` provides full Infrastructure-as-Code setup: web service + free PostgreSQL database.

**Option A — Blueprint (recommended — deploys everything from render.yaml)**

1. Go to [render.com](https://render.com) → **New** → **Blueprint**
2. Connect your GitHub repo
3. Render detects `render.yaml` and creates both the web service and the database
4. Fill in the prompted `sync: false` variables:
   - `FRONTEND_URL` → your Render URL, e.g. `https://gifted-monitor.onrender.com`
   - `RESEND1_API_KEY` → your Resend API key
   - `RESEND1_DOMAIN` → your verified sending domain
5. Click **Apply** → Render builds and deploys automatically

**Option B — Manual service**

1. **New** → **Web Service** → connect your repo
2. Set:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
3. **New** → **PostgreSQL** → create a database named `gifted-monitor-db`
4. Copy the database **Internal Connection String** into your web service's `DATABASE_URL` env var
5. Add remaining env vars (`NODE_ENV`, `JWT_SECRET`, `SESSION_SECRET`, `FRONTEND_URL`, `RESEND1_API_KEY`, `RESEND1_DOMAIN`)
6. Click **Create Web Service**

**Auto-deploys**
Render re-deploys automatically on every push to `main`.

> **Note:** On the free tier, the web service spins down after 15 minutes of inactivity. The first request after a spin-down may take ~30 seconds. Free PostgreSQL databases are available for 90 days then require an upgrade.

</details>

<details>
<summary>TAP TO EXPAND — VPS / Self-hosted (Ubuntu/Debian) with PM2 + Nginx</summary>

**1. Install Node.js 20 (via nvm)**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 && nvm use 20
```

**2. Clone and install dependencies**
```bash
git clone https://github.com/mauricegift/gifted-monitor.git /srv/gifted-monitor
cd /srv/gifted-monitor
cd backend && npm install && cd ../frontend && npm install && cd ..
```

**3. Build the frontend**
```bash
cd frontend && npm run build && cd ..
```

**4. Configure environment variables**
```bash
cp backend/.env.example backend/.env
nano backend/.env   # fill in all required values
```

**5. Start with PM2**
```bash
npm install -g pm2
pm2 start backend/index.js --name gifted-monitor
pm2 save
pm2 startup   # follow the printed command to enable auto-start on reboot
```

**6. Configure Nginx as a reverse proxy**
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/gifted-monitor
```

Paste:
```nginx
server {
    listen 80;
    server_name monitor.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/gifted-monitor /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**7. Enable HTTPS with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d monitor.yourdomain.com
```

**8. Update on new releases**
```bash
cd /srv/gifted-monitor
git pull origin main
cd frontend && npm run build && cd ..
pm2 restart gifted-monitor
```

</details>

<details>
<summary>TAP TO EXPAND — Environment variable checklist for all platforms</summary>

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL / MySQL / MongoDB connection URL |
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Auto | Platform sets this; defaults to `3000` if not set |
| `JWT_SECRET` | Yes | Long random string for signing JWTs |
| `SESSION_SECRET` | Yes | Long random string for session management |
| `FRONTEND_URL` | Yes | Full public URL of your app — used in email links |
| `RESEND1_API_KEY` | Yes | Resend API key |
| `RESEND1_DOMAIN` | Yes | Verified Resend sending domain |
| `RESEND2_API_KEY` | No | Second Resend key (round-robin failover) |
| `RESEND2_DOMAIN` | No | Second sending domain |
| `RESEND3–5_*` | No | Up to 5 Resend accounts total |
| `TIMEZONE` | No | Server timezone, e.g. `UTC` or `Africa/Nairobi` |
| `PING_CHECK_INTERVAL_SECS` | No | Ping loop frequency (default: `10`) |
| `MIN_PING_INTERVAL_MINS` | No | Minimum monitor interval (default: `0.5` = 30 s) |
| `ALLOWED_ORIGINS` | No | CORS — only needed if frontend is hosted separately |

> **After first deploy:** Register your account immediately — the first verified user automatically becomes the platform Super Admin.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 17. IMPORTANT NOTES

<details>
<summary>TAP TO EXPAND</summary>

**First user is Super Admin**
Register your own account immediately after deployment. The first account to complete email verification becomes the platform Super Admin automatically.

**Email delivery via Resend**
- Create an account at [resend.com](https://resend.com)
- Add and verify your sending domain(s)
- Create API keys (one per domain recommended)
- Set `RESEND1_API_KEY` + `RESEND1_DOMAIN` (and optionally RESEND2–5)
- The system tries each domain in order on every send; if one fails (rate limit or error), it tries the next
- All domains are exhausted before an error is returned to the caller

**Email change flow**
- A confirmation link is sent to the **new** email address
- The old email stays active until the link is clicked and verified
- Links expire in 30 minutes
- The `pending_email` column on the `users` table tracks the in-progress change

**Token auto-refresh**
- JWTs are valid for 24 hours
- If less than 12 hours remain on the token, the backend issues a fresh one in `x-refresh-token`
- The frontend Axios interceptor silently applies the new token — users are never interrupted

**Rate limiting**
- Global (all routes): 300 requests per 15 minutes per IP
- Auth endpoints (login, signup, reset): 10 requests per 15 minutes per IP
- Signup specifically: 3 attempts per hour per IP
- OTP / verification endpoints: 5 requests per 15 minutes per IP
- REST API v1: 60 requests per minute per IP

**Monitor false-alarm prevention**
- When a monitor returns a non-2xx response, the engine waits 8 seconds and retries once
- Only if the retry also fails is the monitor marked DOWN and an alert sent

**API key security**
- API keys are stored as SHA-256 hashes — the plaintext is never retrievable after creation
- Each key shows only its first 12 characters as a visible prefix in the UI
- Revoking a key takes effect immediately with no cache delay
- Keys only grant access to monitor operations — they cannot change account details, passwords, or billing

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 18. LICENSE

MIT — see [LICENSE](LICENSE)

---

<p align="center">Built by <a href="https://me.giftedtech.co.ke">Maurice Gift</a> · <a href="https://giftedtech.co.ke">Gifted Tech</a></p>
