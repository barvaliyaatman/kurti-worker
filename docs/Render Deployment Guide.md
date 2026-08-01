# 🚀 Render Deployment Guide - Kurti Worker ERP Backend

This guide outlines the step-by-step instructions to deploy the backend of the Kurti Manufacturing Worker Management ERP to Render, connecting it to a Supabase PostgreSQL database.

---

## 🔑 Required Environment Variables

Configure the following environment variables under **Environment** settings in your Render Web Service dashboard:

| Variable Name | Description | Example Value |
|---|---|---|
| `NODE_ENV` | Run mode for the application | `production` |
| `PORT` | Listening port for Express server | `10000` (Render defaults to this) |
| `DATABASE_URL` | Prisma pooler connection URL | `postgresql://postgres.[ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?schema=public` |
| `DIRECT_URL` | Direct connection URL (for migrations) | `postgresql://postgres.[ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?schema=public` |
| `JWT_SECRET` | Secret key for signing auth tokens | `a-secure-min-32-characters-secret-string` |
| `FRONTEND_URL` | URL of your deployed frontend client | `https://kurti-worker-erp.vercel.app` |

---

## 🛠️ Step-by-Step Deployment Instructions

### Step 1: Create a Render Web Service
1. Go to your **Render Dashboard** and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the following basic details:
   - **Name**: `kurti-worker-erp-backend`
   - **Region**: Select a region close to your database (e.g., `Singapore` or `Frankfurt`).
   - **Branch**: `main`
   - **Root Directory**: `backend` (Crucial: set this so Render deploys from the backend subfolder).
   - **Runtime**: `Node`

### Step 2: Configure Build and Start Commands
In the Web Service settings:
- **Build Command**:
  ```bash
  npm install && npx prisma generate
  ```
- **Start Command**:
  ```bash
  npm start
  ```

### Step 3: Add Environment Variables
1. Navigate to the **Environment** tab in your Render Web Service dashboard.
2. Click **Add Environment Variable** and enter the keys and values listed in the table above.
3. Click **Save Changes**. Render will automatically trigger a new deployment.

### Step 4: Verify Deployment
Once the build completes successfully and status is **Live**:
1. Visit the health check endpoint:
   `https://[your-service-name].onrender.com/api/health`
2. You should receive a JSON response:
   ```json
   {
     "status": "OK"
   }
   ```
3. If there is a configuration error or database connection issue, the logs will explicitly display the validation error, indicating exactly which variable is invalid/missing.
