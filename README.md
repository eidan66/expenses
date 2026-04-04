# NestEgg - Personal Finance & Savings Tracker 🏠💰

A modern, Hebrew-language personal finance application for couples to track expenses, manage budgets, and save towards shared goals like buying a home.

## 🌟 Features

- **Real-time Expense Tracking**: Log income, expenses, and savings transfers
- **Goal Setting**: Create and track progress towards financial goals
- **Budget Management**: Categorized spending with visual charts
- **Analytics Dashboard**: Comprehensive financial insights
- **Secure Authentication**: Email/password and Google OAuth support
- **Multi-user Support**: Each user has their own isolated data
- **RTL Hebrew Interface**: Fully localized for Hebrew speakers

## 🏗️ Architecture

**Frontend-Only Stack:**
- React 19 + TypeScript
- Vite for fast development
- TanStack Query for data fetching
- shadcn/ui + Tailwind CSS for beautiful UI
- Wouter for routing

**Backend:**
- Supabase (PostgreSQL + Auth + Real-time)
- Row Level Security (RLS) for data isolation
- Direct database access via Supabase client SDK

**Deployment:**
- Vercel (Frontend hosting + CDN)
- Free tier friendly

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Yarn
- Supabase account (free tier)
- Vercel account (optional, for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/eidan66/expenses.git
cd expenses
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Set Up Supabase

Follow the comprehensive guide in [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md):

1. Create a Supabase project
2. Run the SQL migration (`supabase-rls-setup.sql`)
3. Enable authentication
4. Copy your credentials

### 4. Configure Environment Variables

```bash
cd client
cp .env.local.example .env.local
```

Edit `client/.env.local` with your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For **Analytics → אנליטיקה חכמה** (AI chat), set `MOONSHOT_API_KEY` from the [international Moonshot console](https://platform.moonshot.ai/console/api-keys) in the **repository root** `.env` / `.env.local` **or** in `client/.env.local` — both are loaded in dev. **Important:** keys from [platform.moonshot.cn](https://platform.moonshot.cn) (China) and [platform.moonshot.ai](https://platform.moonshot.ai) are not interchangeable; a 401 `Invalid Authentication` on `api.moonshot.ai` usually means you need `MOONSHOT_BASE_URL=https://api.moonshot.cn/v1` for a `.cn` key, or create a key on the `.ai` console. **NVIDIA NIM (Kimi on integrate.api.nvidia.com)** is supported via `OPENAI_COMPATIBLE_BASE_URL=https://integrate.api.nvidia.com/v1` and `OPENAI_COMPATIBLE_API_KEY` (your `nvapi-…` key), or the aliases `NVIDIA_OPENAI_BASE_URL` / `INTEGRATE_API_BASE_URL` and `NVIDIA_API_KEY` / `NGC_API_KEY`. Use `ANALYTICS_AI_MODEL=moonshotai/kimi-k2.5`, and optionally `OPENAI_COMPATIBLE_EXTRA_BODY_JSON={"chat_template_kwargs":{"thinking":true}}` to match NVIDIA’s sample payload. Set `ANALYTICS_AI_PROVIDER=openai-compatible` to force it; if that variable is **unset** but both OpenAI-compat URL and key are set, the app **prefers OpenAI-compatible** over Moonshot so an old `MOONSHOT_API_KEY` does not override NVIDIA. On Vercel, set the same env vars. Locally, **`yarn dev`** serves `/api/analytics-chat`; or use **`yarn dev:all`**. See `client/.env.local.example`.

### 5. Start Development Server

```bash
yarn dev
```

Visit `http://localhost:4321`

## 📚 Documentation

- **[Supabase Setup](SUPABASE_SETUP.md)** - Database and authentication configuration
- **[OpenClaw Quick Start](docs/OPENCLAW_QUICKSTART.md)** - Invoice/receipt automation with OpenClaw
- **[OpenClaw Integration](docs/OPENCLAW_INTEGRATION.md)** - Full guide for OpenClaw (APIs, flow, rules)
- **[Testing Guide](TESTING_GUIDE.md)** - Local testing and verification steps
- **[Vercel Deployment](VERCEL_DEPLOYMENT.md)** - Production deployment guide

## 🎯 Usage

### Sign Up / Sign In

1. Navigate to `/auth`
2. Create an account or sign in with Google
3. Verify your email (if email confirmation is enabled)

### Create a Goal

1. Go to the Dashboard
2. Click **"הגדר יעד חדש"** (Set New Goal)
3. Enter goal name and target amount
4. Track progress as you add savings

### Add Transactions

1. Click **"+ הוסף עסקה"** (Add Transaction)
2. Select transaction type:
   - **הכנסה** (Income): Salary, bonuses
   - **Category Name** (Expense): Bills, groceries, etc.
   - **חיסכון** (Savings): Explicit savings transfers

### View Analytics

- Monthly income/expense breakdown
- Savings rate tracking
- Goal progress visualization
- Category-wise spending analysis

## 🔐 Security

- Row Level Security (RLS) ensures users can only access their own data
- Supabase Auth handles secure authentication
- Environment variables keep credentials safe
- HTTPS enforced on production (via Vercel)

## 🏢 Deployment

Deploy to Vercel in minutes:

```bash
vercel
```

See [`VERCEL_DEPLOYMENT.md`](VERCEL_DEPLOYMENT.md) for detailed instructions.

## 🛠️ Development

### Project Structure

```
expenses/
├── client/               # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── contexts/    # React contexts (Auth)
│   │   ├── lib/         # Utilities (Supabase client, queries)
│   │   ├── pages/       # Route pages
│   │   └── hooks/       # Custom React hooks
│   └── public/          # Static assets
├── shared/              # Shared TypeScript types
├── supabase-rls-setup.sql  # Database security setup
└── vercel.json          # Vercel configuration
```

### Key Technologies

- **React Query**: Efficient server state management
- **Supabase Client SDK**: Direct database access with RLS
- **shadcn/ui**: High-quality UI components
- **Recharts**: Beautiful data visualizations
- **Framer Motion**: Smooth animations

### Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build locally
- `yarn check` - TypeScript type checking

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (see `TESTING_GUIDE.md`)
5. Submit a pull request

## 💬 Support

For issues and questions:
- Open a GitHub issue
- Check documentation in `/docs` folder

## 🎉 Acknowledgments

- Built with [Supabase](https://supabase.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Deployed on [Vercel](https://vercel.com)

---

**Made with ❤️ for couples saving for their dream home**
