# JobBoard AI-Match — Two-Sided Job Platform with Resume-to-Job AI Matching

JobBoard AI-Match is a two-sided job platform where recruiters post job openings and candidates apply with automatic, instant AI match percentage calculations based on semantic vector embeddings (powered by Google Gemini API `text-embedding-004`).

---

## Key Features

- **Role-Based Authentication**: Separate candidate and recruiter user roles with JWT authentication and persistent sessions.
- **AI-Powered Resume Matching**: Precomputes and caches candidate resume text and job description vector embeddings.
- **Instant Match Scores (0-100%)**: Browsing jobs computes cosine similarity instantly without making repeated external API calls.
- **Candidate Portal**: Save/update plain text resume, browse jobs ranked by match score, apply with 1-click, and track applications.
- **Recruiter Portal**: Post job openings, toggle job open/closed status, and view ranked applicant lists (highest match score first) with expandable resume views.
- **Duplicate Prevention**: Database compound indexes prevent candidate duplicate applications to the same job.

---

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Axios, js-cookie.
- **Backend**: Node.js, Express.js, MongoDB / Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `@google/generative-ai` (Gemini API SDK).

---

## Getting Started Locally

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB server (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI
- **Gemini API Key**: Free tier API key from [Google AI Studio](https://aistudio.google.com)

---

### 1. Environment Setup

#### Backend Setup (`/backend`)

1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` file (copied from `.env.example`):
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/jobboard_aimatch
   JWT_SECRET=super_secret_jwt_key_12345
   GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
   PORT=5000
   ```

#### Frontend Setup (`/frontend`)

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure `.env.local` file exists:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

---

### 2. Database Seeding

Run the database seed script to populate realistic sample data (1 recruiter, 3 candidates with precomputed resume embeddings, 5 jobs with description embeddings, and 3 sample applications):

```bash
cd backend
npm run seed
```

#### Seeded Test Credentials

- **Recruiter**:
  - Email: `recruiter@example.com`
  - Password: `Password123!`
- **Candidate 1 (Frontend Leaning)**:
  - Email: `alex.frontend@example.com`
  - Password: `Password123!`
- **Candidate 2 (Backend Leaning)**:
  - Email: `brian.backend@example.com`
  - Password: `Password123!`
- **Candidate 3 (Full Stack)**:
  - Email: `claire.fullstack@example.com`
  - Password: `Password123!`

---

### 3. Running Development Servers

Start the backend API server:
```bash
cd backend
npm run dev
```
*(Backend runs on `http://localhost:5000`)*

Start the frontend Next.js app:
```bash
cd frontend
npm run dev
```
*(Frontend runs on `http://localhost:3000`)*

---

## How to Get a Free Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com).
2. Sign in with your Google account.
3. Click **"Get API key"** and select **"Create API key in new project"**.
4. Copy the generated API key string.
5. Paste it into your `/backend/.env` file under `GEMINI_API_KEY`.

---

## Deployment Notes

### Frontend Deployment (Vercel)

1. Push code repository to GitHub.
2. Import project into Vercel and set the Root Directory to `frontend`.
3. Add Environment Variable in Vercel project settings:
   - `NEXT_PUBLIC_API_URL` = `<your-backend-deployed-url>`
4. Deploy.

### Backend Deployment (Render or Railway)

1. Create a Web Service on Render / Railway pointing to the `/backend` folder.
2. Set Build Command: `npm install` and Start Command: `npm start`.
3. Add Environment Variables:
   - `MONGODB_URI` = `<your-mongodb-atlas-connection-string>`
   - `JWT_SECRET` = `<a-random-secure-secret-string>`
   - `GEMINI_API_KEY` = `<your-gemini-api-key>`
   - `PORT` = `5000`
4. Set up a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and add its URI string to `MONGODB_URI`.
