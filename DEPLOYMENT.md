# 🚀 Deployment Guide - Expenses App

This guide covers deploying your expenses tracking application using Vercel and Docker.

## 📋 Prerequisites

- Node.js 20+ installed
- Docker installed (for Docker deployment)
- A Neon PostgreSQL database (or any PostgreSQL instance)
- Vercel CLI (optional, for CLI deployment): `npm install -g vercel`

## 🔧 Environment Variables

Create a `.env` file (for local testing) or configure these in your deployment platform:

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NODE_ENV=production
SESSION_SECRET=your-super-secret-random-string-here
PORT=5000
```

### Generating SESSION_SECRET

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐳 Option 1: Docker Deployment

### Local Testing with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t expenses-app .
   ```

2. **Run the container:**
   ```bash
   docker run -p 5000:5000 \
     -e DATABASE_URL="your_postgres_url" \
     -e SESSION_SECRET="your_secret" \
     expenses-app
   ```

3. **Or use Docker Compose:**
   ```bash
   # Create .env file with your variables
   echo "DATABASE_URL=your_postgres_url" > .env
   echo "SESSION_SECRET=your_secret" >> .env
   
   # Start the application
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop the application
   docker-compose down
   ```

4. **Access your app:**
   Open `http://localhost:5000`

### Deploy to Cloud Providers

#### AWS ECS/Fargate

1. Push your image to Amazon ECR:
   ```bash
   aws ecr create-repository --repository-name expenses-app
   docker tag expenses-app:latest <your-ecr-url>/expenses-app:latest
   docker push <your-ecr-url>/expenses-app:latest
   ```

2. Create an ECS task definition with your environment variables
3. Deploy to Fargate or EC2

#### Google Cloud Run

```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/expenses-app

# Deploy to Cloud Run
gcloud run deploy expenses-app \
  --image gcr.io/YOUR_PROJECT_ID/expenses-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL="your_url",SESSION_SECRET="your_secret"
```

#### DigitalOcean App Platform

1. Push your code to GitHub
2. Go to DigitalOcean App Platform
3. Create a new app from your Docker repository
4. Configure environment variables
5. Deploy!

---

## ☁️ Option 2: Vercel Deployment

Vercel is great for serverless deployments, but **note**: Your current setup uses Express with sessions, which works better on platforms with persistent servers (like Railway, Render, or Docker).

### If you want to use Vercel anyway:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Configure environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add `DATABASE_URL`
   - Add `SESSION_SECRET`
   - Add `NODE_ENV=production`

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

### Vercel Configuration

The `vercel.json` file is already configured for you. It will:
- Build your application
- Serve static files from `dist/public`
- Route API calls to serverless functions

**Important Limitations on Vercel:**
- 10-second timeout on free tier
- Cold starts (first request might be slow)
- Sessions might not work reliably (serverless functions are stateless)

---

## 🚂 Option 3: Railway (Recommended Alternative)

Railway offers the best balance of simplicity and functionality for your app:

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize:**
   ```bash
   railway login
   railway init
   ```

3. **Add environment variables:**
   ```bash
   railway variables set DATABASE_URL="your_postgres_url"
   railway variables set SESSION_SECRET="your_secret"
   railway variables set NODE_ENV="production"
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Open your app:**
   ```bash
   railway open
   ```

**Benefits:**
- $5/month free credit
- Persistent servers (sessions work perfectly)
- Automatic HTTPS
- Easy integration with Neon Database
- GitHub integration for auto-deployments

---

## 🎨 Option 4: Render

1. **Go to [render.com](https://render.com)**

2. **Connect your GitHub repository**

3. **Configure the web service:**
   - **Build Command:** `yarn build`
   - **Start Command:** `yarn start`
   - **Environment Variables:**
     - `DATABASE_URL`
     - `SESSION_SECRET`
     - `NODE_ENV=production`

4. **Deploy!**

**Benefits:**
- Free tier available (spins down after inactivity)
- No cold starts on paid plans
- Automatic SSL
- Easy to use

---

## 📊 Post-Deployment Checklist

After deploying, make sure to:

1. **✅ Run database migrations:**
   ```bash
   # Locally or in your deployment environment
   yarn db:push
   ```

2. **✅ Test the health endpoint:**
   ```bash
   curl https://your-app-url/api/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

3. **✅ Test the application:**
   - Visit your deployment URL
   - Create a test transaction
   - Create a test goal
   - Verify the dashboard loads correctly

4. **✅ Monitor logs:**
   - Check for any errors in your deployment platform's logs
   - Verify database connections are successful

5. **✅ Set up monitoring (optional):**
   - Use Sentry for error tracking
   - Set up uptime monitoring (UptimeRobot, Pingdom, etc.)

---

## 🔒 Security Considerations

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong SESSION_SECRET** - Generate with crypto.randomBytes()
3. **Enable SSL/HTTPS** - Most platforms do this automatically
4. **Secure your database** - Use SSL connections, strong passwords
5. **Keep dependencies updated** - Run `yarn upgrade` regularly

---

## 🐛 Troubleshooting

### Docker Issues

**Problem:** Container won't start
```bash
# Check logs
docker logs <container-id>

# Verify environment variables
docker exec <container-id> env
```

**Problem:** Can't connect to database
- Ensure DATABASE_URL includes `?sslmode=require` for Neon
- Check firewall rules
- Verify database credentials

### Vercel Issues

**Problem:** Timeouts
- Vercel has a 10-second timeout on free tier
- Consider using a persistent server instead

**Problem:** Sessions not working
- Serverless functions are stateless
- Consider using JWT tokens or a different deployment platform

### General Issues

**Problem:** White screen / App won't load
```bash
# Check if build was successful
yarn build

# Test production build locally
yarn start

# Check browser console for errors
```

---

## 📝 Continuous Deployment

### GitHub Actions (Auto-deploy to Railway/Render)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: yarn install
      - run: yarn build
      # Add your deployment commands here
```

---

## 🎯 Recommended Deployment Path

For your expenses app, I recommend:

1. **Development:** Local Docker (`docker-compose up`)
2. **Staging:** Railway or Render (free tier)
3. **Production:** Railway ($5-10/month) or Docker on DigitalOcean/AWS

This gives you the best balance of cost, performance, and reliability!

---

## 📞 Need Help?

- Check platform-specific documentation
- Review application logs
- Test database connectivity
- Verify environment variables are set correctly

Good luck with your deployment! 🚀

