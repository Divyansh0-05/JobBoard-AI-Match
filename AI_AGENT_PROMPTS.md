# AI Agent Build Prompts — JobBoard AI-Match (Gemini API)

Feed these to Antigravity **one prompt at a time, in the exact order given**. Wait for each step to finish, run/test it yourself, and confirm it works before pasting the next prompt. Do NOT paste multiple prompts together — each one is deliberately small so the agent doesn't go off track or hallucinate parts of later steps.

Get a free Gemini API key first from Google AI Studio (aistudio.google.com) before starting Prompt 0.

---

## PROMPT 0 — Project Skeleton

```
Set up a MERN stack project called "jobboard-ai-match" with this exact structure:

/backend
  - Express.js server (server.js as entry point)
  - Mongoose for MongoDB
  - dotenv for environment variables
  - CORS enabled for the frontend origin
  - Folder structure: /models, /routes, /controllers, /middleware, /lib
  - package.json with scripts: "dev" (nodemon), "start"

/frontend
  - Next.js (App Router) with Tailwind CSS pre-configured
  - axios installed for API calls
  - A basic .env.local with NEXT_PUBLIC_API_URL=http://localhost:5000

Create a root README.md explaining how to run both frontend and backend locally.
Create /backend/.env.example listing required variables: MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, PORT.

Do not write any business logic yet — just the skeleton, dependencies installed. Confirm both the backend (npm run dev) and frontend (npm run dev) start with zero errors before stopping.
```

---

## PROMPT 1 — User Model Only

```
In /backend, create ONLY the User model at models/User.js with these fields:
- name (String, required)
- email (String, required, unique)
- passwordHash (String, required)
- role (String, enum: ["recruiter", "candidate"], required)
- resumeText (String, default "")
- resumeEmbedding (Array of Numbers, default [])
- createdAt (Date, default Date.now)

Do not build any routes or controllers yet. Just the schema and model export. Confirm it compiles with no errors by requiring it in a throwaway test file and deleting that test file after.
```

---

## PROMPT 2 — Auth Routes (Register + Login)

```
In /backend, implement authentication using the User model from the previous step:

1. controllers/authController.js:
   - register(req, res): body { name, email, password, role }. Hash password with bcrypt (10 salt rounds). Create the user. Return a JWT (payload: { userId, role }, signed with process.env.JWT_SECRET, expires in 7d) and basic user info (no passwordHash) in the response.
   - login(req, res): body { email, password }. Find user by email, compare password with bcrypt. Return the same JWT + user info shape as register on success, 401 on failure.

2. routes/authRoutes.js:
   - POST /api/auth/register -> register
   - POST /api/auth/login -> login

3. Wire authRoutes into server.js under /api/auth.

Test both endpoints with curl or a REST client and show me the example requests/responses in your summary. Confirm registering a recruiter and a candidate both work, and login returns a valid JWT for each.
```

---

## PROMPT 3 — Auth Middleware

```
In /backend, create two middleware files:

1. middleware/authMiddleware.js — a function that reads the Authorization header (format "Bearer <token>"), verifies it with jsonwebtoken using process.env.JWT_SECRET, and on success attaches req.user = { userId, role } and calls next(). On missing/invalid token, respond 401 with a JSON error message (not a stack trace).

2. middleware/requireRole.js — a function factory requireRole(role) that returns middleware checking req.user.role === role. If not, respond 403 with a JSON error message.

Do not attach these to any routes yet — just create and export them. Confirm both files have no syntax errors by requiring them in a throwaway test file, then delete that test file.
```

---

## PROMPT 4 — Job Model Only

```
In /backend, create ONLY the Job model at models/Job.js with these fields:
- recruiterId (ObjectId, ref: "User", required)
- title (String, required)
- description (String, required)
- descriptionEmbedding (Array of Numbers, default [])
- location (String)
- jobType (String, enum: ["Full-time", "Internship"])
- salaryRange (String)
- status (String, enum: ["open", "closed"], default "open")
- createdAt (Date, default Date.now)

Do not build routes or controllers yet. Just the schema and model export. Confirm it compiles with no errors.
```

---

## PROMPT 5 — Job Routes (Recruiter Side, No AI Yet)

```
In /backend, using the Job model and the authMiddleware/requireRole middleware from previous steps, implement:

1. controllers/jobController.js:
   - createJob(req, res): recruiter only. Body: { title, description, location, jobType, salaryRange }. Set recruiterId = req.user.userId. Create and return the job. (Do not compute any embedding yet — that comes in a later step.)
   - getMyJobs(req, res): recruiter only. Return all jobs where recruiterId = req.user.userId. For each job, also include applicantCount as 0 for now (we'll wire real counts once Applications exist in a later step).
   - updateJob(req, res): recruiter only. Find job by :id, verify job.recruiterId === req.user.userId (else 403), update allowed fields (title, description, location, jobType, salaryRange, status), save, return updated job.
   - deleteJob(req, res): recruiter only. Same ownership check as updateJob, then delete.
   - getOpenJobs(req, res): public (no auth middleware). Return all jobs where status = "open". Support optional query params: search (case-insensitive match on title), jobType, location.

2. routes/jobRoutes.js wiring:
   - POST /api/jobs -> authMiddleware, requireRole("recruiter"), createJob
   - GET /api/jobs/mine -> authMiddleware, requireRole("recruiter"), getMyJobs
   - PATCH /api/jobs/:id -> authMiddleware, requireRole("recruiter"), updateJob
   - DELETE /api/jobs/:id -> authMiddleware, requireRole("recruiter"), deleteJob
   - GET /api/jobs -> getOpenJobs (no auth)

3. Wire jobRoutes into server.js under /api/jobs.

Test: register a recruiter, create 2 jobs, confirm GET /api/jobs/mine shows both, confirm GET /api/jobs (public) shows only open ones, confirm a second recruiter account gets 403 trying to edit the first recruiter's job.
```

---

## PROMPT 6 — Gemini Embedding Module (Standalone, No Routes)

```
In /backend, install the official Gemini SDK: npm install @google/generative-ai

Create /backend/lib/matchScore.js as a STANDALONE module — it must NOT import or reference Express req/res, and must NOT be wired into any route in this step. Export these three functions:

1. async function getEmbedding(text)
   - Uses @google/generative-ai's GoogleGenerativeAI client, initialized with process.env.GEMINI_API_KEY.
   - Calls the "text-embedding-004" model's embedContent method with the given text.
   - Returns the embedding as a plain array of numbers.
   - Wrap the call in a try/catch; on error, log it clearly and rethrow so the caller can handle it.

2. function cosineSimilarity(vecA, vecB)
   - Pure function, no external calls.
   - Computes cosine similarity between two equal-length numeric arrays.
   - Returns a number between -1 and 1.
   - Throw a clear error if the arrays are missing, empty, or of different lengths.

3. async function computeMatchScore(resumeText, jobText)
   - Calls getEmbedding on both resumeText and jobText.
   - Computes cosineSimilarity between the two resulting vectors.
   - Maps the similarity (-1 to 1) to a 0-100 integer score: Math.round(((similarity + 1) / 2) * 100).
   - Returns that integer.

After creating this file, write a small throwaway test script (test-match.js) at the repo root that calls computeMatchScore with two example strings — one clearly related pair (e.g. a resume mentioning "React, Node.js, MongoDB" vs a job description for a "Full-stack Developer" role) and one clearly unrelated pair (e.g. the same resume vs a job description for a "Warehouse Forklift Operator"). Log both scores. Confirm the related pair scores meaningfully higher than the unrelated pair. Then delete test-match.js once confirmed working.

Report the actual scores you got in your summary so I can sanity-check them.
```

---

## PROMPT 7 — Wire Embeddings into Resume Save and Job Creation

```
In /backend, now connect the matchScore.js module (from the previous step) into the app:

1. Add a new route PUT /api/users/resume -> authMiddleware, requireRole("candidate"), a new controller function updateResume(req, res):
   - Body: { resumeText }.
   - Save resumeText onto the logged-in user.
   - Call getEmbedding(resumeText) from lib/matchScore.js, save the result into resumeEmbedding on the same user.
   - Return the updated user (without passwordHash).
   - Wire this route into server.js under /api/users.

2. Modify createJob (from Prompt 5) so that after creating the job, it also calls getEmbedding(job.description) and saves the result into descriptionEmbedding on that job before returning it.

Test: log in as a candidate, PUT a resume, confirm resumeEmbedding is populated (non-empty array) in the database. Log in as a recruiter, POST a new job, confirm descriptionEmbedding is populated too.
```

---

## PROMPT 8 — Matched Jobs Endpoint (Uses Cached Embeddings, No New API Calls)

```
In /backend, add a new endpoint GET /api/jobs/matched -> authMiddleware, requireRole("candidate"), controller function getMatchedJobs(req, res):

- Fetch the logged-in candidate's resumeEmbedding from their User document. If it's empty, return a 400 with a clear message telling them to save a resume first.
- Fetch all open jobs (same filters as getOpenJobs: search, jobType, location).
- For each job, compute a matchScore using cosineSimilarity(candidate.resumeEmbedding, job.descriptionEmbedding) from lib/matchScore.js, mapped to 0-100 the same way computeMatchScore does internally (extract that mapping into a small reusable helper in matchScore.js if it isn't already, so you're not duplicating the formula).
- IMPORTANT: this endpoint must NOT call the Gemini API at all — it only uses the already-cached embeddings from Prompt 7. This keeps it fast and avoids burning free-tier quota on every job browse.
- Sort the returned jobs by matchScore descending, include matchScore in each job object in the response.

Wire this into jobRoutes.js. Test: with the candidate resume and jobs created in earlier steps, confirm the response returns jobs sorted by matchScore, and confirm no Gemini API calls happen during this request (check your terminal logs / add a temporary console.log in getEmbedding to prove it's not being called from this route, then remove that log).
```

---

## PROMPT 9 — Application Model & Apply Flow

```
In /backend:

1. Create models/Application.js:
   - jobId (ObjectId, ref: "Job", required)
   - candidateId (ObjectId, ref: "User", required)
   - matchScore (Number, required)
   - status (String, default "applied")
   - appliedDate (Date, default Date.now)
   - Add a compound unique index on (jobId, candidateId) to prevent duplicate applications.

2. controllers/applicationController.js:
   - applyToJob(req, res): candidate only. Body: { jobId }. Look up the job, confirm status === "open" (else 400). Compute matchScore via cosineSimilarity(candidate.resumeEmbedding, job.descriptionEmbedding) — no new Gemini call, reuse cached embeddings same as Prompt 8. Create the Application. If a duplicate (jobId, candidateId) already exists, catch the Mongo duplicate key error and return 409 with a clear message.
   - getMyApplications(req, res): candidate only. Return all applications by req.user.userId, populated with job title, location, and recruiter name (via a populate on jobId -> recruiterId).
   - getApplicantsForJob(req, res): recruiter only. Find the job by :jobId, verify job.recruiterId === req.user.userId (403 if not). Return all applications for that job, populated with candidate name and resumeText, sorted by matchScore descending.

3. routes/applicationRoutes.js:
   - POST /api/applications -> authMiddleware, requireRole("candidate"), applyToJob
   - GET /api/applications/mine -> authMiddleware, requireRole("candidate"), getMyApplications
   - GET /api/jobs/:jobId/applicants -> authMiddleware, requireRole("recruiter"), getApplicantsForJob

4. Wire into server.js.

5. Also update getMyJobs (from Prompt 5) so applicantCount is now a real count from the Application collection instead of hardcoded 0.

Test the full flow: candidate applies to a job, confirm a second identical apply attempt returns 409, confirm recruiter sees the ranked applicant list for their own job, confirm 403 for a job they don't own.
```

---

## PROMPT 10 — Frontend: Auth Pages

```
In /frontend, build authentication:

1. context/AuthContext.js — React Context storing { user, token }, with functions login(email, password), register(name, email, password, role), logout(). Store the token in React state (in-memory) plus a cookie (e.g. via js-cookie) so a page refresh doesn't immediately log the user out. Expose the context via a useAuth() hook.

2. app/login/page.js — email + password form. On submit, call login from AuthContext. On success, redirect to /jobs if role is "candidate" or /recruiter/jobs if role is "recruiter". Show an inline error message on failure.

3. app/register/page.js — name, email, password fields plus a role selector (radio buttons: Candidate / Recruiter). On submit, call register, then redirect the same way as login.

4. app/layout.js — wrap the app in AuthProvider, add a top nav bar that shows "Login / Register" when logged out, and when logged in shows different links based on role: candidate sees "Browse Jobs", "My Resume", "My Applications"; recruiter sees "Post Job", "My Jobs". Include a "Logout" button.

Style everything simply with Tailwind — clean and minimal, no component libraries. Test the full register -> login -> redirect -> logout flow against the backend from Prompts 1-3.
```

---

## PROMPT 11 — Frontend: Candidate Resume Page

```
In /frontend, build app/resume/page.js (candidate only — redirect to /login if not authenticated as a candidate):

- A large textarea bound to resumeText state, pre-filled by fetching the current user's saved resume if the backend exposes it (if not already available, add a GET /api/users/me endpoint on the backend that returns the logged-in user's data including resumeText, and wire it in).
- A "Save Resume" button that calls PUT /api/users/resume (from Prompt 7) with the textarea content.
- Show a loading state while saving and a success message after.
- Show a brief note near the textarea: "Paste your resume as plain text. This will be used to calculate your match score against job listings."

Test: log in as a candidate, paste some resume text, save, refresh the page, confirm it's still there.
```

---

## PROMPT 12 — Frontend: Candidate Job Browse + Apply

```
In /frontend, build app/jobs/page.js (candidate only):

- On load, fetch GET /api/jobs/matched (from Prompt 8). If the backend returns the 400 "save a resume first" error, show a friendly message with a link to /resume instead of a raw error.
- Render each job as a card: title, jobType, location, salaryRange, and a match % badge — color it green if matchScore >= 70, yellow if 40-69, gray if below 40.
- Add a search text input and jobType/location filter dropdowns above the list; on change, refetch /api/jobs/matched with the corresponding query params.
- Each card has an "Apply" button that calls POST /api/applications with { jobId }. On success, change the button to a disabled "Applied" state. If the API returns 409 (already applied), also show it as "Applied" rather than an error.

Test: with a resume saved and a few jobs in the DB, confirm match scores display, filters work, and applying updates the button state correctly.
```

---

## PROMPT 13 — Frontend: Candidate My Applications

```
In /frontend, build app/applications/page.js (candidate only):

- Fetch GET /api/applications/mine (from Prompt 9).
- Render as a simple table or card list: company/recruiter name, job title, matchScore, status, appliedDate (formatted readably, e.g. "Aug 2, 2026").
- Show an empty state message ("You haven't applied to any jobs yet — browse jobs to get started.") if the list is empty, with a link to /jobs.

Test: apply to a job via the /jobs page, then confirm it shows up here with the correct match score.
```

---

## PROMPT 14 — Frontend: Recruiter Post Job + My Jobs

```
In /frontend, build two recruiter-only pages:

1. app/recruiter/jobs/new/page.js — a form with fields: title, description (textarea), location, jobType (dropdown: Full-time / Internship), salaryRange. On submit, call POST /api/jobs (from Prompt 5/7). On success, redirect to /recruiter/jobs.

2. app/recruiter/jobs/page.js — fetch GET /api/jobs/mine (from Prompt 5/9), list each job with title, status (open/closed), applicantCount, and: a button to toggle status via PATCH /api/jobs/:id, and a link to /recruiter/jobs/[id]/applicants. Include a prominent "+ Post New Job" link to app/recruiter/jobs/new.

Test: post 2 jobs as a recruiter, confirm they show up in My Jobs with correct applicant counts (0 until candidates apply), confirm the open/closed toggle works.
```

---

## PROMPT 15 — Frontend: Recruiter Applicant Ranking View

```
In /frontend, build app/recruiter/jobs/[id]/applicants/page.js (recruiter only):

- Fetch GET /api/jobs/:jobId/applicants (from Prompt 9), using the [id] route param as jobId.
- Render applicants sorted by matchScore descending (the backend already sorts, but don't re-sort differently on the frontend): candidate name, matchScore badge (same color scheme as the candidate job cards), appliedDate, and an expandable/collapsible section showing the candidate's full resumeText.
- Show a 403/empty state gracefully if the recruiter doesn't own this job or there are no applicants yet.

Test: with a candidate who has applied (from Prompt 12), confirm the recruiter sees them here with the correct match score, and that a recruiter viewing a job they don't own gets a clear "not authorized" message instead of a crash.
```

---

## PROMPT 16 — Seed Script + Final Polish

```
Final step:

1. In /backend, create scripts/seed.js: connects to MongoDB, clears existing Users/Jobs/Applications, then creates:
   - 1 recruiter account
   - 3 candidate accounts, each with a different sample resumeText (e.g. one frontend-leaning, one backend-leaning, one full-stack) — compute and save their embeddings via getEmbedding during seeding
   - 5 jobs from the recruiter with varied descriptions (frontend role, backend role, full-stack role, unrelated role like "Sales Associate", another tech role) — compute and save their embeddings too
   - 2-3 sample applications linking some candidates to some jobs with realistic matchScore snapshots
   Add a "seed" script to package.json to run this file.

2. Across the whole frontend, add loading spinners/states and error messages (inline, not silent failures) to every API call that doesn't already have one.

3. Add responsive Tailwind classes so job cards, forms, and tables don't break below ~375px width.

4. Update the root README.md with: setup instructions, how to get a free Gemini API key from Google AI Studio, how to run the seed script, and deployment notes (frontend on Vercel with NEXT_PUBLIC_API_URL set to the deployed backend URL; backend on Render or Railway with MONGODB_URI, JWT_SECRET, GEMINI_API_KEY env vars set; MongoDB Atlas free cluster for the database).

Run the seed script, then walk through the full demo flow once: log in as the seeded recruiter, view jobs and applicants; log in as a seeded candidate, browse matched jobs, apply to one, view it in My Applications. Report any bugs you find and fix them before finishing.
```

---

## Notes for you (not for the agent)
- Gemini's free tier has rate limits per minute — if Prompt 6's test script or the seed script (Prompt 16) hits a rate limit, just add small delays between calls (e.g. 1-2 seconds) rather than switching providers.
- Keep this file and SRS.md in your repo root — SRS.md doubles as your PEP documentation deliverable.
- If you want the future "scrape jobs + auto-apply for myself" idea later, the isolated `lib/matchScore.js` module is exactly what you'd import into a separate script — don't touch its function signatures when building the rest of the app, so it stays reusable.
