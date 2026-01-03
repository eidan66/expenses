# 💰 Expenses Tracker - Financial Management App

A modern, full-stack expense tracking application built with React, Express, and PostgreSQL. Track your income, expenses, and savings goals with a beautiful Hebrew interface.

## ✨ Features

- 📊 **Dashboard** - Comprehensive overview of your finances
- 💸 **Transaction Management** - Track income and expenses by category
- 🎯 **Savings Goals** - Set and monitor progress towards financial goals
- 📈 **Analytics** - Visualize your spending patterns (coming soon)
- 🔐 **Secure** - Built with security best practices
- 🌐 **Hebrew Interface** - Fully localized for Hebrew speakers

### Recent Updates

#### Income vs Savings Separation ✅
- **Income (הכנסה)**: Salary and revenue are now properly tracked separately
- **Savings Transfers (חיסכון)**: Explicit transfers to your goals
- **Net Savings**: Automatically calculated as Income - Expenses
- **Goal Progress**: Only updates when you transfer money to savings category

The system now clearly shows:
- Monthly income
- Monthly expenses  
- Money available for savings
- Actual amount transferred to your goal

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (we recommend [Neon](https://neon.tech))
- Yarn or npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd expenses
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

4. **Push database schema:**
   ```bash
   yarn db:push
   ```

5. **Start development server:**
   ```bash
   # In one terminal - start backend
   yarn dev

   # In another terminal - start frontend
   yarn dev:client
   ```

6. **Open your browser:**
   ```
   http://localhost:4321
   ```

## 📦 Deployment

This app supports multiple deployment options:

### Docker (Recommended)
```bash
# Quick start with Docker
./deploy.sh

# Or manually
docker build -t expenses-app .
docker run -p 5000:5000 --env-file .env expenses-app
```

### Vercel
```bash
vercel --prod
```

### Railway
```bash
railway up
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **React Query** - Data fetching
- **Wouter** - Routing
- **Recharts** - Data visualization

### Backend
- **Express** - Web framework
- **PostgreSQL** - Database
- **Drizzle ORM** - Type-safe database queries
- **Zod** - Schema validation
- **Express Session** - Session management

## 📊 How It Works

### Financial Tracking

1. **Income**: Add your salary or other income using the "הכנסה" category
2. **Expenses**: Record all your spending across various categories
3. **Savings**: Transfer money to your goal using the "חיסכון" category

### Goal Progress

The system tracks two important metrics:
- **Net Savings**: Income - Expenses (money available to save)
- **Goal Progress**: Only money explicitly transferred to "חיסכון" category

This prevents double-counting and gives you clear visibility into:
- How much you've earned
- How much you've spent
- How much you could save
- How much you've actually saved towards your goal

## 🗂️ Project Structure

```
expenses/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities
│   │   └── hooks/        # Custom hooks
│   └── index.html
├── server/                # Backend Express app
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── db.ts            # Database connection
│   └── storage.ts        # Data access layer
├── shared/               # Shared code
│   └── schema.ts        # Database schema & types
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose config
├── vercel.json         # Vercel configuration
└── deploy.sh           # Deployment helper script
```

## 🔧 Scripts

```bash
# Development
yarn dev              # Start backend server
yarn dev:client       # Start frontend dev server

# Building
yarn build           # Build for production
yarn start           # Start production server

# Database
yarn db:push         # Push schema to database

# Type Checking
yarn check           # Run TypeScript type check
```

## 🐛 Debugging

### Common Issues

**Database connection errors:**
- Ensure your `DATABASE_URL` is correct
- For Neon, make sure to include `?sslmode=require`

**Port already in use:**
```bash
# Kill process on port 5000
kill -9 $(lsof -t -i:5000)
```

**Build errors:**
```bash
# Clean and rebuild
rm -rf node_modules dist
yarn install
yarn build
```

## 📝 Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NODE_ENV=development|production
SESSION_SECRET=your-secret-key-here
PORT=5000
```

## 🔒 Security

- Passwords are hashed with bcrypt
- Sessions use secure cookies
- SQL injection protection via Drizzle ORM
- Input validation with Zod schemas
- HTTPS enforced in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes!

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Database by [Neon](https://neon.tech/)

## 📞 Support

For issues or questions:
1. Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
2. Review the code comments
3. Open an issue on GitHub

---

Made with ❤️ for managing personal finances in Hebrew

