# Software Requirements Specification (SRS)
## JobBoard AI-Match – Two-Sided Job Platform with Resume-to-Job Matching

**Author:** Divyansh
**Program:** PEP MERN Stack
**Team Size:** Individual
**Stack:** MongoDB, Express.js, React (Next.js), Node.js, Google Gemini Embeddings API

---

## 1. Introduction

### 1.1 Purpose
JobBoard AI-Match is a two-sided job platform where recruiters post job openings and candidates apply to them. Its differentiator is an AI-powered match score: candidate resume text is compared against job description text using embedding-based semantic similarity (via Google's Gemini API, free tier), giving recruiters a ranked applicant list and candidates a match percentage before they apply.

### 1.2 Scope
MVP covers: role-based auth (recruiter/candidate), job posting and browsing, applying to jobs, AI match scoring, and ranked applicant views. Explicitly out of scope for the 3-day build: resume file upload/parsing (PDF), messaging between recruiter and candidate, payments, admin moderation panel, email notifications, and job scraping/auto-apply (a separate future personal-use extension, not part of this submission).

### 1.3 Intended Users
- **Recruiter:** posts and manages job listings, reviews applicants ranked by match score.
- **Candidate:** browses/searches jobs, submits resume text once (reused across applications), applies to jobs, sees match % per job.

---

## 2. Overall Description

### 2.1 Product Perspective
Standalone full-stack web app. React/Next.js frontend calls a REST API (Express) backed by MongoDB. A single server-side function computes match scores by calling the Gemini embeddings API and computing cosine similarity — no vector database needed at this scale (comparisons are done on the fly across a small job set).

### 2.2 User Stories
1. As a user, I can register as either a Recruiter or a Candidate.
2. As a recruiter, I can post a job (title, description, location, type, salary range).
3. As a recruiter, I can view all applicants for my job, ranked by match score (highest first).
4. As a recruiter, I can close/reopen a job listing.
5. As a candidate, I can save my resume as plain text once, and reuse it across all applications.
6. As a candidate, I can browse all open jobs and see a match % badge for each, based on my saved resume.
7. As a candidate, I can search/filter jobs by title, location, or type.
8. As a candidate, I can apply to a job with one click (resume already on file).
9. As a candidate, I can view a list of jobs I've applied to and their status.

---

## 3. Functional Requirements

### 3.1 Authentication & Roles
- FR1: Registration requires name, email, password, and role (`recruiter` | `candidate`).
- FR2: Passwords hashed with bcrypt; JWT issued on login.
- FR3: Route-level authorization — recruiter-only routes (post job, view applicants) reject candidate tokens and vice versa.

### 3.2 Job Management (Recruiter)
- FR4: Create a job: title, description, location, jobType (Full-time/Internship), salaryRange, status (default `open`).
- FR5: Edit or close a job (status → `closed`); closed jobs don't accept new applications.
- FR6: View own posted jobs with applicant count per job.
- FR7: View ranked applicant list for a specific job (sorted by matchScore descending), showing candidate name, resume text, matchScore, appliedDate.

### 3.3 Resume & Matching (Candidate)
- FR8: Candidate submits/edits resume as plain text (stored once on their user profile).
- FR9: On saving/updating resume text, compute and cache its embedding via the Gemini API; on browsing jobs, compute matchScore between the cached resume embedding and each open job's cached description embedding.
- FR10: Match score displayed as a percentage (0-100%) on each job card.
- FR11: Matching logic lives in a standalone reusable module: `computeMatchScore(resumeText, jobText) -> number` and `cosineSimilarity(vecA, vecB) -> number`, decoupled from any specific route — usable for future scraped-job matching too.

### 3.4 Applications (Candidate)
- FR12: Apply to an open job (one click, no re-entering resume). Prevent duplicate applications to the same job.
- FR13: On application, store the matchScore at time of applying (snapshot, so recruiter ranking stays stable even if resume changes later).
- FR14: Candidate can view "My Applications" — list with company, role, status, matchScore, appliedDate.

### 3.5 Search & Filter
- FR15: Candidates can filter job listings by jobType and location, and search by title/company (case-insensitive substring).

---

## 4. Non-Functional Requirements
- NFR1: Match score computation should not block page load — embeddings are precomputed and cached on save (resume save, job creation), so browsing only does a local cosine similarity calc, not a live API call.
- NFR2: A candidate can never see another candidate's resume or application data; a recruiter can only see applicants to their own jobs.
- NFR3: Gemini API calls should be minimized to respect free-tier rate limits — cache the embedding vector for resume text and for each job description (recompute only when the text changes), rather than re-embedding on every match calculation.
- NFR4: Responsive layout down to mobile width.
- NFR5: Standalone match-scoring module (FR11) must have no dependency on Express req/res objects — plain functions taking strings/arrays, returning numbers — so it can be reused outside the API context later (e.g., a scraper script).

---

## 5. System Architecture

```
[React/Next.js Frontend]
        |
        | REST (JSON, JWT auth)
        v
[Express.js API Server]
        |
        |--- [MongoDB Atlas]  (Users, Jobs, Applications, cached embeddings)
        |
        v
[Google Gemini Embeddings API (text-embedding-004)]
        |
        v
[cosine similarity calc -> matchScore]
```

- **Frontend:** Next.js, Tailwind CSS, `axios`, `recharts` (optional, for a simple "applications over time" view if time allows).
- **Backend:** Node/Express, Mongoose, `jsonwebtoken`, `bcrypt`, `@google/generative-ai` (official Gemini SDK).
- **Matching:** `lib/matchScore.js` — pure functions: get/cache embeddings via Gemini, compute cosine similarity, return a 0-100 score.
- **Deployment:** Frontend on Vercel, backend on Render/Railway, MongoDB Atlas free cluster. Gemini API key from Google AI Studio (free tier).

---

## 6. Data Model

### User
```
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  passwordHash: String,
  role: "recruiter" | "candidate",
  resumeText: String,           // candidate only
  resumeEmbedding: [Number],    // candidate only, cached vector from Gemini
  createdAt: Date
}
```

### Job
```
{
  _id: ObjectId,
  recruiterId: ObjectId (ref: User),
  title: String,
  description: String,
  descriptionEmbedding: [Number], // cached vector from Gemini
  location: String,
  jobType: String,   // "Full-time" | "Internship"
  salaryRange: String,
  status: "open" | "closed",
  createdAt: Date
}
```

### Application
```
{
  _id: ObjectId,
  jobId: ObjectId (ref: Job),
  candidateId: ObjectId (ref: User),
  matchScore: Number,   // snapshot at time of applying, 0-100
  status: "applied",    // extendable later
  appliedDate: Date
}
```

---

## 7. Screens (UI)
1. **Login / Register** (with role selection)
2. **Candidate: Job Browse** — searchable/filterable job cards, each showing match % badge, "Apply" button
3. **Candidate: Resume Editor** — textarea to save/update resume text
4. **Candidate: My Applications** — list of applied jobs with status and match score
5. **Recruiter: Post Job** — form
6. **Recruiter: My Jobs** — list of posted jobs with applicant counts
7. **Recruiter: Applicant List** — ranked by match score, per job

---

## 8. Milestones (3-Day Build Plan)
- **Day 1:** Auth with roles, Job model + CRUD (recruiter side), job browse UI (candidate side, no matching yet)
- **Day 2:** Resume text save, Gemini embeddings integration, `matchScore.js` module, match % badges on job cards, apply flow with score snapshot
- **Day 3:** Ranked applicant view (recruiter), search/filter, UI polish, deploy, seed realistic data, record demo

---

## 9. Future Enhancements (explicitly out of scope for this submission)
- Resume file upload with PDF text extraction
- Job scraping from external boards + auto-match against saved resume (personal-use tool, separate from this project)
- Email notifications for new high-match jobs
- Recruiter messaging / interview scheduling
