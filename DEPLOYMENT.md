# Deployment Guide for SEO Web Analyzer

## Prerequisites
1. OpenAI API Key from https://platform.openai.com/api-keys
2. MongoDB Atlas account (free tier) from https://www.mongodb.com/cloud/atlas
3. Railway account from https://railway.app

## Step 1: MongoDB Atlas Setup
1. Create free cluster on MongoDB Atlas
2. Create database user with password
3. Whitelist all IPs (0.0.0.0/0) for Railway access
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/`

## Step 2: Railway Backend Deployment
1. Login to Railway with GitHub
2. Create "New Project" → "Deploy from GitHub repo"
3. Select `seo-web-anylyzer` repository
4. Add environment variables:
   - `MONGO_URL` = your MongoDB Atlas connection string
   - `DB_NAME` = seo_analyzer_db
   - `CORS_ORIGINS` = *
   - `OPENAI_API_KEY` = your OpenAI API key
5. Deploy will start automatically
6. Copy the generated Railway URL (e.g., https://yourapp.up.railway.app)

## Step 3: Frontend Deployment (Netlify/Vercel)
1. Create `frontend/.env` with:
