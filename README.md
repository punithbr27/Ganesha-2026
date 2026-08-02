# Ganesha Collection Manager

A production-ready, mobile-first web application for managing Ganesha Festival Collections and Expenses.

## Technology Stack
- **Frontend**: React (Vite), Vanilla CSS (Premium Black & White Theme), Chart.js
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL (Supabase)

## Environment Variables

### Backend (`/backend/.env`)
Your Supabase Project ID is `exwhsfzgkxhjitjajkbn`. Your Database URL should look like this (replace `[YOUR-DB-PASSWORD]` with your actual database password):

```
DATABASE_URL="postgresql://postgres.[YOUR-DB-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
JWT_SECRET="your_secure_jwt_secret"
PORT=5000
```
*(Note: If your Supabase region is different, verify the pooler URL from your Supabase Dashboard under Database -> Connect)*

### Frontend (`/frontend/.env` - optional if using default)
```
VITE_API_URL="http://localhost:5000/api"
```
*(By default, the frontend is configured to use `http://localhost:5000/api` in `src/api.js`. You must modify it to your deployed backend URL for production).*

## Installation & Local Setup

### 1. Database Setup
1. Create a project on [Supabase](https://supabase.com/).
2. Get your Database Password.
3. In `/backend`, create a `.env` file and paste the `DATABASE_URL` (as shown above).

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## First-time Admin Setup
When you run the application for the first time, there is no admin account.
1. Go to `http://localhost:5173/setup` (or your frontend URL + `/setup`).
2. Enter your desired username and password.
3. Once created, you will be redirected to `/login` to access the dashboard.

## Deployment Instructions

### Deploying Frontend (Vercel)
1. Push the repository to GitHub.
2. Go to Vercel and import the project.
3. Select the `frontend` folder as the Root Directory.
4. Framework Preset: `Vite`.
5. Deploy.

### Deploying Backend (Vercel)
You can deploy the backend as a Serverless function on Vercel seamlessly using the provided `vercel.json`:
1. In Vercel, create another New Project and select the same repository.
2. Set the Root Directory to `backend`.
3. Add the `DATABASE_URL` and `JWT_SECRET` environment variables in the Vercel Settings.
4. Framework Preset: `Other`.
5. Deploy. 
*(Vercel will read the `vercel.json` file inside the backend folder and deploy your Express app as a serverless function).*

*(Don't forget to update the `VITE_API_URL` or `API_URL` in the frontend `api.js` to point to your live backend Vercel URL!)*
