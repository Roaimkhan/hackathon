# NayaCapital — Crowdfunding Platform

> A full-stack equity crowdfunding platform connecting **founders** and **investors** in Pakistan. Founders list startups, define milestones, and raise capital; investors browse and back opportunities with real-time fund tracking.

---

## 📸 Overview

| Role | Capabilities |
|---|---|
| **Founder** | Create startup listing, set milestones, submit proof → instant fund release from escrow |
| **Investor** | Browse startups, invest PKR, track portfolio, view milestone progress |
| **Admin** | Approve/reject startups and milestones, manage platform |

---

## 🪄 Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| **FastAPI** | REST API framework |
| **Supabase** | PostgreSQL database + Auth + Storage |
| **Python 3.12** | Runtime |
| **python-multipart** | File upload support |
| **python-jose** | JWT validation |

### Frontend
| Tool | Purpose |
|---|---|
| **React 19 + Vite** | UI framework + dev server |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Framer Motion** | Animations |
| **Recharts** | Portfolio charts |
| **Axios** | API client |
| **Supabase JS** | Realtime subscriptions |

---

## 📁 Project Structure

```
hackathon/
├── backend/                  # FastAPI application
│   ├── main.py               # App entry point, CORS, router mounting
│   ├── config.py             # Supabase client setup
│   ├── schemas.py            # Pydantic request/response models
│   ├── dependencies.py       # JWT auth, role guards
│   ├── compat.py             # DB column name normalisation layer
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # ⚙️ Your secrets (not committed)
│   └── routers/
│       ├── auth.py           # Register, login, KYC
│       ├── startups.py       # CRUD + milestone management
│       ├── invest.py         # Investment endpoint
│       ├── portfolio.py      # Investor portfolio view
│       ├── milestones.py     # Proof submission + fund release
│       └── wallet.py         # Deposit / balance
│
└── frontend/nayacapital/     # React + Vite application
    ├── src/
    │   ├── pages/            # Route pages (Landing, Founder, Investor, …)
    │   ├── hooks/            # Custom React hooks (useFounder, useInvestor, …)
    │   ├── components/       # Reusable UI components
    │   ├── contexts/         # AuthContext
    │   └── lib/              # Axios instance, Supabase client
    ├── .env                  # ⚙️ Your frontend env vars (not committed)
    └── package.json
```

---

## ⚙️ Prerequisites

- **Python 3.12+** — [python.org](https://www.python.org/downloads/)
- **Node.js 20+** — [nodejs.org](https://nodejs.org/)
- **A Supabase project** — [supabase.com](https://supabase.com) (free tier works)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd hackathon
```

---

### 2. Backend Setup

#### 2a. Create and activate a virtual environment

```bash
cd backend

# Create virtual environment
python3 -m venv .venv

# Activate (Linux / macOS)
source .venv/bin/activate

# Activate (Windows)
.venv\Scripts\activate
```

#### 2b. Install Python dependencies

```bash
pip install -r requirements.txt
pip install python-multipart   # required for file upload (proof documents)
```

#### 2c. Configure environment variables

Create a `.env` file inside the `backend/` folder:

```bash
cp .env.example .env   # if example exists, otherwise create manually
```

Edit `backend/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-service-role-key
```

> ⚠️ **Use the Service Role key** (not the anon key) for the backend — it bypasses Row Level Security for server-side operations. Find it in your Supabase dashboard under **Project Settings → API → service_role**.

#### 2d. Run the backend server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at: **http://localhost:8000**  
Interactive docs (Swagger UI): **http://localhost:8000/docs**

---

### 3. Frontend Setup

```bash
cd frontend/nayacapital
```

#### 3a. Install Node dependencies

```bash
npm install
```

#### 3b. Configure environment variables

```bash
cp .env.example .env
```

Edit `frontend/nayacapital/.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:8000
VITE_FRONTEND_ONLY_MODE=false
VITE_USE_MOCK=false
VITE_ALLOW_AUTH_FALLBACK_MOCK=false
```

> 💡 The frontend uses the **anon key** (safe to expose). Find it in Supabase under **Project Settings → API → anon public**.

#### 3c. Run the frontend dev server

```bash
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## 🗄️ Database Setup (Supabase)

The platform uses the following Supabase tables:

| Table | Description |
|---|---|
| `users` | User profiles, roles (`founder`, `investor`, `admin`), wallet balance |
| `startups` | Startup listings with funding goal, equity, story |
| `milestones` | Startup milestones with fund_percentage, status, proof_url |
| `investments` | Investment records linking users and startups |
| `transactions` | Wallet transaction history (deposits, fund releases) |

### Storage Bucket

A storage bucket named **`milestone-proofs`** is required for proof document uploads. It is created automatically via migration, or you can create it manually:

1. Go to your Supabase dashboard → **Storage**
2. Create a new bucket named `milestone-proofs`
3. Set it to **Public** (so proof URLs are accessible)

---

## 🔐 Authentication Flow

1. Users register with **email + password + role** (`founder` or `investor`)
2. JWT token is issued by Supabase Auth and stored in `localStorage`
3. All protected API endpoints require `Authorization: Bearer <token>` header
4. Role-based guards (`require_role`) enforce access per endpoint

---

## 📡 API Endpoints

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user |
| `POST` | `/auth/login` | Public | Login, returns JWT |
| `GET` | `/auth/me` | Any | Get current user profile |
| `GET` | `/startups` | Any | List all active startups |
| `POST` | `/startups` | Founder | Create a startup |
| `GET` | `/startups/mine` | Founder | Get own startups |
| `POST` | `/startups/{id}/milestones` | Founder | Add milestones |
| `POST` | `/invest/{startup_id}` | Investor | Invest in a startup |
| `GET` | `/portfolio` | Investor | View investment portfolio |
| `POST` | `/milestones/{id}/submit` | Founder | Submit proof → instant fund release |
| `POST` | `/milestones/{id}/approve` | Admin | Manually approve milestone |
| `POST` | `/milestones/{id}/reject` | Admin | Reject a milestone |
| `GET` | `/wallet/balance` | Any | Check wallet balance |
| `POST` | `/wallet/deposit` | Any | Add funds to wallet |

Full interactive documentation: **http://localhost:8000/docs**

---

## 💡 Key Features

### For Founders
- **Instant Milestone Completion** — Submit proof (URL) → milestone instantly marked `approved` → funds released from escrow to wallet
- **Smart Escrow** — Release amount = `min(milestone% × amount_raised, current_escrow_balance)` — never over-releases
- **Pitch Deck Support** — YouTube videos embed inline; links to Google Drive, Canva, PDF etc. open externally
- **Real-time Dashboard** — Live funding progress, escrow balance, investor count

### For Investors
- **Portfolio Tracking** — View all investments with real-time status
- **Transaction History** — Searchable, filterable transaction log
- **Milestone Visibility** — See milestone completion status for each startup backed
- **Equity Calculator** — Estimate equity share based on investment amount

---

## 🧪 Running Smoke Tests

```bash
cd backend
source .venv/bin/activate
python smoke_persistence_check.py
```

---

## 🏗️ Building for Production

### Backend
Deploy to any ASGI-compatible host (Railway, Render, Fly.io):
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend/nayacapital
npm run build
# Output in dist/ — deploy to Vercel, Netlify, or any static host
```

---

## 🛠️ Troubleshooting

| Issue | Fix |
|---|---|
| `Address already in use` on port 8000 | Run `lsof -i :8000` then `kill -9 <PID>` |
| `Form data requires python-multipart` | Run `pip install python-multipart` |
| Frontend can't reach backend | Check `VITE_API_BASE_URL=http://localhost:8000` in `.env` |
| `SUPABASE_URL and SUPABASE_KEY must be set` | Create `backend/.env` with your Supabase credentials |
| Negative escrow balance displayed | Fixed — was a display bug using `funding_goal` instead of `amount_raised` |

---

## 👥 User Roles Quick Guide

```
Register as Founder  →  Create startup  →  Add milestones  →  Get funded  →  Submit proof  →  Receive funds
Register as Investor →  Browse startups →  Invest PKR      →  Track portfolio via dashboard
```

---

## 📄 License

MIT