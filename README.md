<h1 align="center">🟢 Gifted Monitor</h1>
<p align="center"><b>24/7 uptime monitoring with instant WhatsApp alerts</b></p>

<p align="center">
  <a href="https://monitor.giftedtech.co.ke"><img src="https://img.shields.io/badge/LIVE%20APP-monitor.giftedtech.co.ke-green?style=for-the-badge&logo=googlechrome" alt="Live App"/></a>
</p>

<p align="center">
  <a href="https://github.com/mauricegift"><img src="https://img.shields.io/badge/GITHUB-GIFTED%20TECH-red?style=for-the-badge&logo=github"/></a>
  <a href="https://github.com/mauricegift/gifted-monitor/stargazers"><img src="https://img.shields.io/github/stars/mauricegift/gifted-monitor?style=social" alt="Stars"/></a>
  <a href="https://github.com/mauricegift/gifted-monitor/network/members"><img src="https://img.shields.io/github/forks/mauricegift/gifted-monitor?style=social" alt="Forks"/></a>
</p>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 1. OVERVIEW

<details>
<summary>TAP TO EXPAND</summary>

**Gifted Monitor** is a full-stack uptime monitoring SaaS. It watches your websites 24/7 and sends instant WhatsApp alerts when something goes down — and again when it recovers.

**Live at:** [https://monitor.giftedtech.co.ke](https://monitor.giftedtech.co.ke)

| Feature | Details |
|---|---|
| Uptime Monitoring | HTTP/HTTPS checks via GET, HEAD, or POST |
| Custom Intervals | Per-monitor check intervals (minimum: 3 mins) |
| WhatsApp Alerts | Down alert, recovery alert, 24h still-down reminder |
| OTP Verification | WhatsApp OTP for signup and password reset |
| JWT Auth | 3-day tokens with 12h sliding refresh |
| Admin Panel | Manage all users, monitors, and contact messages |
| Super Admin | First user to register becomes the platform Super Admin |
| Contact Form | Public contact page saves messages to the database |
| Multi-DB Support | PostgreSQL, MySQL, or MongoDB adapters |
| Mobile-Responsive | Hamburger nav, mobile sidebar, full footer on all pages |
| Monitor Limit | Per-user monitor quota with admin-configurable limits |
| Bulk Actions | Select-all + bulk operations on monitors, users, and messages |

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 2. TECH STACK

<details>
<summary>TAP TO EXPAND</summary>

- **Runtime:** Node.js (CommonJS)
- **Framework:** Express 4
- **Database:** PostgreSQL via Neon (primary), with MySQL and MongoDB adapters available
- **Auth:** JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`, 12 rounds)
- **HTTP Client:** Axios (for pinging monitors)
- **Security:** Helmet, express-rate-limit
- **Frontend:** Vanilla JS, multi-page HTML, Tailwind CDN, Font Awesome 6.5
- **Notifications:** WhatsApp Cloud API (Meta)

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 3. PROJECT STRUCTURE

<details>
<summary>TAP TO EXPAND</summary>

```
gifted-monitor/
├── index.js                  # Entry point — starts server + ping engine
├── config.js                 # All env vars with defaults
├── lib/
│   ├── server.js             # Express app setup, middleware, static files
│   ├── auth.js               # requireAuth, JWT verify, role middleware
│   ├── ping.js               # Monitoring engine (interval-based pinger)
│   ├── whatsapp.js           # WhatsApp Cloud API helpers
│   └── db/
│       ├── index.js          # DB adapter selector (auto-detects from URL)
│       └── adapters/
│           ├── postgres.js   # PostgreSQL adapter (recommended)
│           ├── mysql.js      # MySQL adapter
│           └── mongo.js      # MongoDB adapter
├── routes/
│   ├── auth.js               # /api/auth/* endpoints
│   ├── monitors.js           # /api/monitors/* endpoints
│   ├── admin.js              # /api/admin/* endpoints
│   └── public.js             # /api/contact, /api/status
└── public/
    ├── index.html            # Dashboard (monitor usage bar, warnings)
    ├── about/                # About page
    ├── contact/              # Contact form page
    ├── privacy/              # Privacy policy
    ├── terms/                # Terms of service
    ├── auth/
    │   ├── login/
    │   ├── signup/
    │   ├── forgot/
    │   ├── reset/
    │   └── verify/
    ├── monitors/             # User monitor list + detail view (limit display)
    ├── profile/              # User profile & settings
    ├── admin/                # Admin panel (dashboard, users, monitors, messages)
    └── assets/
        ├── style.css         # Global styles (custom responsive nav, animations)
        └── app.js            # Shared JS (auth helpers, renderLayout, scroll-lock)
```

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 4. ENVIRONMENT VARIABLES

<details>
<summary>TAP TO EXPAND</summary>

Create a `.env` file in the project root:

```env
# Server
PORT=5000
NODE_ENV=production

# Database (PostgreSQL recommended)
DATABASE_URL=postgresql://user:password@host/dbname

# Auth — use a strong random string
JWT_SECRET=your_strong_random_secret_here

# WhatsApp Cloud API
WHATSAPP_TOKEN=your_meta_whatsapp_api_token
WHATSAPP_PHONE_ID=your_whatsapp_phone_number_id

# WhatsApp Message Template Names
# You choose the names — they must match exactly what you registered in Meta
WA_TEMPLATE_OTP=your_otp_template_name
WA_TEMPLATE_MONITOR_CREATED=your_monitor_created_template_name
WA_TEMPLATE_SITE_DOWN=your_site_down_template_name
WA_TEMPLATE_SITE_RECOVERED=your_site_recovered_template_name

# Monitoring Engine
PING_CHECK_INTERVAL_SECS=10
MIN_PING_INTERVAL_MINS=3

# Timezone
TIMEZONE=Africa/Nairobi
```

> **Security note:** Always override `JWT_SECRET` in production. The default fallback in `config.js` is not secure.

> **Template names:** The values for `WA_TEMPLATE_*` are completely up to you — name them whatever you like in Meta, then use those exact same names here. They do not need to start with `gifted_monitor`.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 5. DATABASE SETUP

<details>
<summary>TAP TO EXPAND</summary>

All tables are created automatically on first startup — no manual migrations needed.

**PostgreSQL schema (auto-created):**

```sql
users (id, username, email, whatsapp, password_hash, is_verified,
       is_admin, is_superadmin, is_disabled, avatar, monitor_limit, created_at)

monitors (id, user_id, name, url, method, body, interval_mins,
          last_status, last_checked_at, uptime_pct,
          notify_down, notify_up, is_down, down_since, created_at)

check_history (id, monitor_id, status, response_time, error_msg, checked_at)

otp_codes (id, email, code, type, expires_at, used, created_at)

contact_messages (id, name, email, whatsapp, subject, message, is_read, created_at)
```

> `users.monitor_limit` defaults to `20` for regular users. It is `NULL` for admins and superadmins (no limit applied).

To switch databases, change `DATABASE_URL` to the appropriate connection string. The adapter is chosen automatically:
- `postgresql://` → PostgreSQL adapter
- `mysql://` → MySQL adapter
- `mongodb://` → MongoDB adapter

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 6. WHATSAPP CLOUD API SETUP

<details>
<summary>TAP TO EXPAND</summary>

### Step 1 — Create a Meta Business Account

Go to [business.facebook.com](https://business.facebook.com) and create or log in to your Meta Business account.

### Step 2 — Verify Your Account & Business

- Verify your **personal identity** (government-issued ID such as national ID, passport, or driver's licence)
- Verify your **business** by submitting relevant government/business documents (business registration certificate, tax PIN, utility bill, etc.)
- Verification can take a few days. You cannot send messages to non-test numbers until this is approved.

### Step 3 — Create a Developer App

Go to [developers.facebook.com](https://developers.facebook.com), create a new app, and add the **WhatsApp** product to it.

### Step 4 — Get Your Credentials

From the WhatsApp dashboard in your developer app:
- Copy your **Temporary or Permanent Access Token** → `WHATSAPP_TOKEN`
- Copy your **Phone Number ID** → `WHATSAPP_PHONE_ID`

### Step 5 — Create & Submit Message Templates

Go to [business.facebook.com](https://business.facebook.com) → WhatsApp Manager → Message Templates.

Create and submit four templates for approval. You choose the names — use whatever names make sense to you, then set those same names in your `.env`:

| ENV Variable | Purpose | Required Parameters |
|---|---|---|
| `WA_TEMPLATE_OTP` | Sends 6-digit OTP for signup and password reset | `{{1}}` = OTP code |
| `WA_TEMPLATE_MONITOR_CREATED` | Confirmation when a monitor is added | `{{1}}` = monitor name, `{{2}}` = URL |
| `WA_TEMPLATE_SITE_DOWN` | Alert when a monitored site goes down | `{{1}}` = monitor name, `{{2}}` = error |
| `WA_TEMPLATE_SITE_RECOVERED` | Alert when a site comes back online | `{{1}}` = monitor name, `{{2}}` = downtime |

> Template approval can take 24–48 hours. Alerts will fail silently if templates are pending or rejected.

> All users must have a valid WhatsApp number to receive alerts and to complete OTP verification.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 7. RUNNING THE APP

<details>
<summary>TAP TO EXPAND</summary>

```bash
npm install
PORT=5000 node index.js
```

On startup the app will:
1. Connect to the database and auto-create all tables if they don't exist
2. Start the Express server on the configured port
3. Start the ping engine — checks every `PING_CHECK_INTERVAL_SECS` seconds for due monitors

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 8. AUTHENTICATION SYSTEM

<details>
<summary>TAP TO EXPAND</summary>

- **Registration:** Email + WhatsApp number required. A 6-digit OTP is sent to WhatsApp. The account stays unverified until the OTP is confirmed.
- **Login:** Returns a JWT with a 3-day expiry. The token refreshes silently within a 12-hour sliding window.
- **Password Reset:** Sends a new OTP to the user's registered WhatsApp number.
- **Rate Limiting:** Signup, login, and OTP endpoints are rate-limited to prevent brute-force attacks.
- **Token Storage:** JWT is stored in `localStorage` on the client as `gm_token`.
- **OTP Expiry:** OTPs expire after 10 minutes. Users must request a new one if the window is missed.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 9. MONITORING ENGINE

<details>
<summary>TAP TO EXPAND</summary>

The ping engine runs on a fixed ticker (`PING_CHECK_INTERVAL_SECS`, default 10s). On each tick:

1. Fetches all monitors where `next_check_at <= now()`
2. Pings each due monitor using its configured method (GET / HEAD / POST)
3. On failure — waits 8 seconds, then retries once to avoid false alarms from transient blips
4. Records the result in `check_history` (retains last 60 checks per monitor)
5. Recalculates `uptime_pct` from the last 60 checks
6. Sends a WhatsApp alert if status changed (up → down or down → up)
7. Sends a "Still Down" reminder every 24 hours for monitors that remain offline

**Monitor configuration options:**

| Field | Description |
|---|---|
| Name | Human-readable label for the monitor |
| URL | Full URL to monitor (must include `https://` or `http://`) |
| Method | GET, HEAD, or POST |
| Body | JSON or plain text body (POST only) |
| Interval | Check frequency in minutes (minimum: 3) |
| Notify Down | Toggle down alerts for this specific monitor |
| Notify Up | Toggle recovery alerts for this specific monitor |

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 10. ALERT & NOTIFICATION SYSTEM

<details>
<summary>TAP TO EXPAND</summary>

All alerts are sent via the WhatsApp Cloud API using approved Meta message templates.

| Event | What Gets Sent |
|---|---|
| Monitor goes down | Down alert with error code + timestamp |
| Monitor recovers | Recovery alert with total downtime duration |
| Still down after 24h | Ongoing reminder alert |
| New monitor added | Confirmation message |
| Signup / password reset | 6-digit OTP |

Users can disable all notifications globally in their profile settings, or toggle alerts per monitor individually.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 11. USER ROLES & PERMISSIONS

<details>
<summary>TAP TO EXPAND</summary>

| Role | How Assigned | Capabilities |
|---|---|---|
| **Guest** | Not logged in | View public pages, submit contact form |
| **User** | Default on signup | Manage own monitors (up to their limit) and profile settings |
| **Admin** | Promoted by Super Admin | View all users/monitors, manage contact messages, set user monitor limits |
| **Super Admin** | First user to register | All admin powers + promote/demote other admins |

### ⚠️ Important: First User Registered = Super Admin

**The very first account created on the platform automatically becomes the Super Admin.** If no users exist when the first signup occurs, that account gets both `is_admin` and `is_superadmin` set to `true`.

**What this means for you:**
- After deploying, immediately register your own account before sharing the app URL with anyone else
- If you ever lose super admin access, you can manually run `UPDATE users SET is_admin=true, is_superadmin=true WHERE email='your@email.com';` against the database

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 12. MONITOR LIMIT SYSTEM

<details>
<summary>TAP TO EXPAND</summary>

Each regular user has a **monitor quota** that controls how many monitors they can create.

| Aspect | Detail |
|---|---|
| Default limit | 20 monitors per user |
| Admins / Super Admins | No limit (quota does not apply) |
| Storage | `users.monitor_limit` column (integer, default 20) |
| Enforcement | API returns HTTP 403 with a clear message when the limit is reached |

**What users see:**

- **Dashboard** — A progress bar shows current usage (e.g., `3 / 20`). A yellow warning appears at 80% of the limit. An orange banner appears when the limit is fully reached.
- **Monitors page** — The subtitle shows `"X monitors — X of Y"`. The **Add Monitor** button is replaced with a disabled **Limit Reached** button when the quota is full. Warning banners appear at 80% and 100%.

**What admins can do:**

- In the Edit User modal (`/admin/users/`), a **Monitor Limit** field shows the current limit and live usage. Admins can type any value from 1 to 10,000 and save it instantly.
- The field is automatically hidden when editing another admin or superadmin (limits do not apply to privileged accounts).

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 13. BULK ACTIONS

<details>
<summary>TAP TO EXPAND</summary>

Bulk selection is available across three areas of the app. Select items using checkboxes — a sticky action bar appears at the bottom of the screen with available operations.

**User Monitors (`/monitors/`):**

| Action | What It Does |
|---|---|
| Delete | Permanently deletes all selected monitors and their history (requires your password) |

**Admin — Users (`/admin/users/`):**

| Action | What It Does |
|---|---|
| Verify | Marks all selected users as verified |
| Enable | Re-enables any selected users who were previously disabled |
| Disable | Disables login for all selected users |
| Delete | Permanently deletes all selected users and their monitors (requires your password) |

**Admin — Monitors (`/admin/monitors/`):**

| Action | What It Does |
|---|---|
| Pause | Sets all selected monitors to inactive (stops pinging) |
| Activate | Resumes pinging for all selected monitors |
| Set Interval | Applies the same ping interval to all selected monitors |
| Delete | Permanently deletes all selected monitors and their history (requires your password) |

**Admin — Messages (`/admin/messages/`):**

| Action | What It Does |
|---|---|
| Mark Read | Marks all selected messages as read |
| Delete | Permanently deletes all selected messages (requires your password) |

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 14. ADMIN PANEL

<details>
<summary>TAP TO EXPAND</summary>

Accessible at `/admin/` — requires Super Admin privileges.

| Section | Path | What You Can Do |
|---|---|---|
| Dashboard | `/admin/` | View platform-wide stats (users, monitors, up/down counts) |
| Users | `/admin/users/` | Search, view, edit, suspend, promote, demote, or delete users; set per-user monitor limits; bulk-select to verify, enable, disable, or delete multiple users at once |
| Monitors | `/admin/monitors/` | View and manage all monitors across every account; bulk-select to pause, activate, set ping interval, or delete multiple monitors at once |
| Messages | `/admin/messages/` | Read contact form submissions, mark as read, or bulk-delete |

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 15. API REFERENCE

<details>
<summary>AUTH — /api/auth</summary>

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/signup` | No | Register new account (sends OTP to WhatsApp) |
| POST | `/verify-otp` | No | Verify signup OTP |
| POST | `/login` | No | Login, returns JWT |
| POST | `/forgot-password` | No | Request password reset OTP |
| POST | `/reset-password` | No | Reset password using OTP |
| GET | `/me` | Yes | Get current user profile (includes `monitor_limit`) |
| PUT | `/me` | Yes | Update name, WhatsApp number, or password |
| PUT | `/avatar` | Yes | Update profile avatar (base64 encoded) |
| PUT | `/notification-prefs` | Yes | Toggle global notification preference |

</details>

<details>
<summary>MONITORS — /api/monitors</summary>

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/` | Yes | List all monitors for the current user |
| POST | `/` | Yes | Create a new monitor (returns 403 if monitor limit reached) |
| GET | `/:id` | Yes | Get monitor details + check history |
| PUT | `/:id` | Yes | Update monitor settings |
| DELETE | `/:id` | Yes | Delete a monitor |
| POST | `/:id/ping` | Yes | Manually trigger a ping |
| POST | `/bulk` | Yes | Bulk delete — body: `{ action: "delete", ids, password }` |

</details>

<details>
<summary>ADMIN — /api/admin</summary>

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Platform-wide statistics |
| GET | `/users` | Admin | Paginated user list (supports search, returns `monitor_count` + `monitor_limit`) |
| GET | `/users/:id` | Admin | Single user profile + their monitors |
| PUT | `/users/:id` | Admin | Edit user (promote, suspend, set `monitor_limit`, etc.) |
| DELETE | `/users/:id` | Super Admin | Delete a user (requires password confirmation) |
| POST | `/users/bulk` | Admin | Bulk action on users — body: `{ action, ids, password? }`. Actions: `verify`, `enable`, `disable`, `delete` |
| GET | `/monitors` | Admin | All monitors across all users |
| PUT | `/monitors/:id` | Admin | Edit a monitor |
| DELETE | `/monitors/:id` | Admin | Delete a monitor (requires password confirmation) |
| POST | `/monitors/bulk` | Admin | Bulk action on monitors — body: `{ action, ids, password?, intervalMins? }`. Actions: `pause`, `activate`, `interval`, `delete` |
| GET | `/contact` | Admin | Paginated contact form submissions |
| PUT | `/contact/:id/read` | Admin | Mark a message as read |
| POST | `/contact/bulk` | Admin | Bulk action on messages — body: `{ action, ids, password? }`. Actions: `mark_read`, `delete` |

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

## 16. IMPORTANT NOTES

<details>
<summary>TAP TO EXPAND</summary>

**First user is Super Admin**
Register your own account immediately after deployment. Do not share the signup link before doing so.

**WhatsApp templates must be pre-approved**
Alerts silently fail if templates are pending or rejected in Meta Business Manager. Approval takes 24–48 hours. You must also have your business verified before messaging non-test numbers.

**Template names are your choice**
The `WA_TEMPLATE_*` env values are just the names you gave your templates in Meta. They do not need to follow any specific naming pattern.

**Monitor retry logic**
Before sending a down alert, the engine waits 8 seconds and retries once. This prevents false alarms from brief network blips.

**Uptime percentage**
Calculated from the last 60 checks only. Monitors with fewer than 60 checks show uptime based on available data.

**Avatar storage**
Avatars are stored as base64 strings in the `users` table. Resize large images on the client side before uploading.

**Admin access**
Both `is_admin` AND `is_superadmin` must be true to access the admin panel.

**Database adapter**
Chosen automatically at startup from `DATABASE_URL`. PostgreSQL via Neon is the tested and recommended setup.

**CSS architecture**
The navigation responsiveness does not rely on Tailwind CDN. Custom classes in `style.css` handle all breakpoints so the nav works even if Tailwind is slow or blocked.

**Monitor limit defaults**
Regular users default to 20 monitors. Admins and superadmins have no limit. Limits can be adjusted per-user via the admin panel at any time without any downtime.

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>

---

## 17. UPDATES & CONTACT

<details>
<summary>TAP TO EXPAND</summary>

- **[Contact Support](https://monitor.giftedtech.co.ke/contact/) for questions, bug reports, or feedback**
- **Join the [WhatsApp Channel](https://whatsapp.com/channel/0029Vb6lNd511ulWbxu1cT3A) for updates and announcements**
- **Visit the [Portfolio](https://me.giftedtech.co.ke) to explore more projects by Gifted Tech**

</details>

<img src='https://i.imgur.com/LyHic3i.gif'/>
