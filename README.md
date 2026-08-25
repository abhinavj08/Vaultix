# Smart Budget Tracker 💰

A modern, full-stack budget tracking application with **AI-powered transaction categorization** using Google Gemini. Built with React, Express, PostgreSQL, and Tailwind CSS.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Express](https://img.shields.io/badge/Express-4-000000?logo=express) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql) ![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss) ![Gemini](https://img.shields.io/badge/Gemini_AI-Flash-4285F4?logo=google)

## ✨ Features

- **AI-Powered Categorization** — Paste raw bank transaction text (e.g., "TST* STARBUCKS") and Gemini AI automatically categorizes it
- **Interactive Dashboard** — Pie chart for spending breakdown + bar chart for budget vs. actual
- **CSV Upload** — Bulk-import bank statements from CSV files
- **Budget Management** — Set monthly budget limits per category
- **AI Financial Tips** — Monthly personalized financial advice from Gemini
- **Dual Authentication** — Email/password signup + Google OAuth ("Sign in with Google")
- **Fully Responsive** — Works on desktop, tablet, and mobile

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         React Frontend (Vite)       │
│  Tailwind CSS + Recharts + Lucide   │
└──────────────┬──────────────────────┘
               │  REST API (JSON + JWT)
┌──────────────▼──────────────────────┐
│     Node.js / Express Backend       │
│  Auth (JWT + Google OAuth)          │
│  Gemini AI    │   PostgreSQL        │
│  (Categorize) │   (Prisma ORM)     │
└─────────────────────────────────────┘
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (local or cloud — [Supabase](https://supabase.com) / [Neon](https://neon.tech) free tier works)
- **Google Gemini API Key** — Get free at [Google AI Studio](https://aistudio.google.com/)
- **Google OAuth Credentials** (optional) — From [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# In server/ directory
cp .env.example .env
```

Edit `server/.env` with your values:

```env
DATABASE_URL=postgresql://user:password@host:5432/budget_tracker
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
JWT_SECRET=your_secret_key_min_32_characters
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
PORT=3001
CLIENT_URL=http://localhost:5173
```

### 3. Set Up Database

```bash
cd server

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Run Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Dashboard, TransactionTable, Charts, etc.
│   │   ├── pages/             # LoginPage, RegisterPage, DashboardPage
│   │   ├── context/           # AuthContext (JWT + user state)
│   │   └── api/               # Axios API client
│   └── ...config files
│
├── server/                    # Express backend
│   ├── prisma/schema.prisma   # Database schema
│   └── src/
│       ├── routes/            # auth, transactions, dashboard, budgets
│       ├── services/          # Gemini AI integration
│       ├── middleware/        # JWT authentication
│       └── utils/             # CSV parser
```

## 🔐 Authentication

The app supports two authentication methods:

1. **Email/Password** — Register with email and password, secured with bcrypt hashing
2. **Google OAuth** — "Sign in with Google" button for one-click login

All API routes are protected with JWT tokens. Tokens are stored in `localStorage` and automatically attached to API requests.

### Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Set Authorized redirect URI to: `http://localhost:3001/api/auth/google/callback`
4. Copy Client ID and Client Secret to your `.env` file

## 🤖 AI Features

### Transaction Categorization
When you add a transaction with raw bank text like:
- `"TST* STARBUCKS"` → **Food & Dining**
- `"UBER *TRIP"` → **Transportation**
- `"NETFLIX.COM"` → **Entertainment**

### Monthly Financial Tips
The AI analyzes your monthly spending and provides personalized advice like:
> "Consider reducing dining out expenses by 20% — cooking at home could save you $180 this month."

## 🚢 Deployment (Free Tier)

### Database — Supabase or Neon
1. Create a free PostgreSQL database
2. Copy the connection string to `DATABASE_URL`

### Backend — Render
1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your Git repository
3. Set root directory to `server`
4. Build command: `npm install && npx prisma generate`
5. Start command: `npm start`
6. Add all environment variables

### Frontend — Render or Vercel
1. Create a new **Static Site**
2. Set root directory to `client`
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`

## 📄 CSV Format

The CSV parser supports common bank statement formats. Expected columns:

| Column | Aliases |
|--------|---------|
| Date | Date, Transaction Date, Posted Date |
| Description | Description, Memo, Narrative |
| Amount | Amount, Debit, Credit |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3, Recharts, Lucide Icons |
| Backend | Node.js, Express 4, Prisma ORM |
| Auth | bcryptjs, JWT, Passport.js (Google OAuth) |
| AI | Google Gemini (via @google/genai SDK) |
| Database | PostgreSQL |

## 📝 License

MIT

