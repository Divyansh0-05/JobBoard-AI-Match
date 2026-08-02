# JobBoard AI-Match

JobBoard AI-Match is a two-sided job platform where recruiters post job openings and candidates apply to them with AI-powered resume-to-job match scoring powered by Google Gemini API.

## Project Structure

- `/backend` - Express.js API server, Node.js, MongoDB (Mongoose), JWT Auth, Gemini Embeddings.
- `/frontend` - Next.js (App Router), React, Tailwind CSS, Axios.

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas connection string
- Google Gemini API key (from Google AI Studio)

## Getting Started

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and fill in your variables:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/jobboard_aimatch
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

Start the backend development server:

```bash
npm run dev
```

The backend server will start on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Ensure `.env.local` exists with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend app will be available at `http://localhost:3000`.
