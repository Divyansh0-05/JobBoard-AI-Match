# UI Redesign Prompts — JobBoard AI-Match
### Inspired by cofounder.co's visual style (dark, glassmorphic, animated)

Feed these to Antigravity **one at a time, in order**, same as the build prompts. After each step, actually look at the page in the browser before moving to the next — visual work is much easier to sanity-check yourself than functional code, so don't skip this.

**Important constraint carried through every prompt below:** this is a pure visual/styling pass. No prompt in this file should change any API call, route, data model, or business logic — only JSX structure for layout/animation purposes and CSS/Tailwind classes. If Antigravity's plan for any step touches a controller, route, or model file, stop and tell it to scope back down to frontend-only.

---

## PROMPT UI-0 — Design System Foundation

```
This is a pure visual/styling task. Do not modify any backend files, API calls, or data-fetching logic in this step — only design tokens and dependencies.

In /frontend, set up a design system inspired by a dark, modern SaaS aesthetic (glassmorphic cards, soft gradient glows, generous spacing):

1. Install framer-motion for animations: npm install framer-motion

2. In app/globals.css, define CSS custom properties for a dark theme:
   - Background: deep navy/near-black (e.g. #0A0A0F as base, #12121A for elevated surfaces)
   - Accent gradient: a blue-to-purple or blue-to-teal gradient for primary actions and highlights (your choice, pick something that feels premium, not neon)
   - Text: off-white primary (#F5F5F7), muted gray secondary (#9494A0)
   - Border: a very subtle translucent white/gray for card borders (e.g. rgba(255,255,255,0.08))
   - Success/warning/danger colors reused from the existing match-score badge system (green/yellow/gray) — keep those exact colors so match badges stay recognizable, just make sure they read well on the new dark background

3. Update tailwind.config to reference these CSS variables so utility classes like bg-surface, text-primary, border-subtle work throughout the app.

4. Add a Google Font import (e.g. Inter or a similar clean modern sans-serif) via next/font in the root layout.

5. Create a reusable GlassCard component (components/ui/GlassCard.js) — a div with: translucent background, backdrop-blur, subtle border, rounded corners (rounded-2xl), and a soft box-shadow. This will replace plain white cards across the app in later steps.

Do NOT apply this to any existing page yet — just set up the tokens, font, and the GlassCard component. Confirm npm run build still passes with zero errors before stopping.
```

---

## PROMPT UI-1 — Landing Page: Hero Section

```
This is a pure visual/styling task. Do not modify any backend files or API logic.

Currently the root route (/) likely just redirects to /login or shows a default Next.js page. Build a proper marketing landing page at app/page.js (only shown to logged-out visitors — if a user is already authenticated, redirect them to /jobs or /recruiter/jobs as appropriate, reusing the existing AuthContext).

Build a hero section using the dark theme and GlassCard component from the previous step:

1. A sticky top navbar (reuse/restyle the existing Navbar component) with the app name/logo on the left, and "Login" / "Get Started" buttons on the right (styled with the accent gradient for the primary button).

2. A large hero section, centered, with:
   - A big, bold headline (e.g. "Find your best-matched job — powered by AI" or similar, adjust wording to fit the product)
   - A short subheadline explaining the AI matching concept in one sentence
   - Two CTA buttons: "I'm a Candidate" -> /register?role=candidate, "I'm a Recruiter" -> /register?role=recruiter (if the register page doesn't already support a role query param, add that as a minor enhancement so this deep-link works)
   - A subtle animated gradient glow/blob behind the headline (a large soft blurred circle in the accent gradient color, positioned absolutely behind the text, using CSS blur — this recreates the "soft glow" look, no need for anything fancier)

3. Use framer-motion to fade+slide the headline, subheadline, and buttons in on page load (staggered, ~100ms apart), so the hero feels alive without being distracting.

Keep it to just the hero for this step — don't build the sections below it yet. Confirm the build passes and manually check the page loads correctly for a logged-out user, and redirects correctly for a logged-in user.
```

---

## PROMPT UI-2 — Landing Page: Logo Marquee + Feature Sections

```
This is a pure visual/styling task. Do not modify any backend files or API logic.

Continue building app/page.js from the previous step, adding sections below the hero:

1. "Trusted by" logo marquee section:
   - A horizontally auto-scrolling row of company-style logotypes, looping infinitely (CSS animation, translateX loop, duplicate the logo list once so the loop is seamless).
   - IMPORTANT: do not use real company logos/trademarks (no Google, Microsoft, Amazon, etc. logos or names). Instead, generate 8-10 generic placeholder logotypes — simple text-based wordmarks in a clean sans-serif font with a small abstract icon shape next to each (e.g. a colored square, circle, or simple geometric mark), using invented, generic-sounding company names (e.g. "Nortex", "Bluepeak", "Vantage Labs", "Corewave" — clearly fictional, not resembling any real brand). Render these as small reusable components, grayscale/muted by default with a slight opacity, since this is a stylistic trust signal, not real client claims. Add a caption above them like "Built for candidates and recruiters everywhere" (avoid any specific false claim like a company count, since this is a student project, not a company with real users).

2. A 3-column feature section (using GlassCard for each column) highlighting:
   - "AI-Powered Matching" — briefly describes the resume-to-job embedding match feature
   - "For Candidates" — browse, apply, track applications in one place
   - "For Recruiters" — post jobs, see ranked applicants automatically
   Each card gets a simple icon (use lucide-react, e.g. Sparkles, User, Briefcase), a heading, and 1-2 lines of description.

3. Use framer-motion's whileInView (with viewport={{ once: true }}) to fade+slide each feature card in as the user scrolls to it, staggered slightly.

4. A simple footer with the app name and a couple of nav links (Login, Register).

Confirm the build passes, and manually scroll through the page checking the marquee loops smoothly and the scroll-in animations trigger correctly.
```

---

## PROMPT UI-3 — Auth Pages Redesign

```
This is a pure visual/styling task. Do not modify any auth logic, API calls, validation, or redirect behavior — only the visual layout of these two pages.

Restyle app/login/page.js and app/register/page.js to match the new dark theme:

1. Center the form in a GlassCard on top of the same dark background/gradient-glow treatment used on the landing page hero (reuse that background as a shared layout element if it makes sense, e.g. a components/ui/AuthLayout.js wrapper).

2. Style inputs with the dark theme: subtle border, focus state using the accent gradient/color (e.g. a glowing border or ring on focus), rounded corners consistent with GlassCard.

3. Style the primary submit button with the accent gradient, a hover state (slight scale or brightness change), and keep the existing loading-state behavior (spinner/disabled state) — just restyle it, don't remove it.

4. Use framer-motion to fade+slide the form card in on page load.

5. On register/page.js, if a role query param is present (from the landing page CTA links in the previous step), pre-select that role in the radio/selector.

Do not change the actual form fields, validation, or the login()/register() calls from AuthContext. Confirm the build passes, and manually test that login and register still function correctly (redirects still work) after the restyle.
```

---

## PROMPT UI-4 — Candidate Pages Redesign

```
This is a pure visual/styling task. Do not modify any API calls, data fetching, or state logic — only layout and styling.

Restyle the candidate-facing pages to match the new dark theme, reusing GlassCard and the established color tokens:

1. app/jobs/page.js — each job listing becomes a GlassCard with hover effect (slight lift/glow on hover using framer-motion or CSS transition). Keep the existing match % badge color logic (green/yellow/gray) exactly as-is, just make sure it's legible against the dark card background. Restyle the search input and filter dropdowns to match the dark theme. Use framer-motion whileInView to stagger-fade the job cards in as the list loads.

2. app/resume/page.js — restyle the textarea and save button to match the dark theme (same input styling as the auth pages). Keep all save/loading/success logic unchanged.

3. app/applications/page.js — restyle the table/list as GlassCards or a dark-themed table (your call on which reads better), keeping all existing data and empty-state logic unchanged.

Confirm the build passes, and manually verify: job browsing/filtering, resume saving, and viewing applications all still function exactly as before — only the visuals changed.
```

---

## PROMPT UI-5 — Recruiter Pages Redesign

```
This is a pure visual/styling task. Do not modify any API calls, data fetching, or state logic — only layout and styling.

Restyle the recruiter-facing pages to match the new dark theme, consistent with the candidate pages from the previous step:

1. app/recruiter/jobs/new/page.js — restyle the job-posting form to match the auth page input/button styling.

2. app/recruiter/jobs/page.js — restyle each posted job as a GlassCard showing status, applicant count, and the open/closed toggle button, with the same hover treatment as candidate job cards.

3. app/recruiter/jobs/[id]/applicants/page.js — restyle the ranked applicant cards as GlassCards, keeping the rank badges and match-score color coding exactly as-is, just legible on dark. Restyle the expandable resume section (monospace text block) to fit the dark theme (e.g. a slightly darker inset panel).

Confirm the build passes, and manually verify: posting a job, viewing my jobs, toggling status, and viewing ranked applicants all still function exactly as before — only the visuals changed.
```

---

## PROMPT UI-6 — Global Consistency & Final Animation Pass

```
This is a pure visual/styling task. Do not modify any API calls, data fetching, or state logic.

Final consistency pass across the whole app:

1. Restyle the Navbar component (shown on every logged-in page) to match the dark theme — glassmorphic background with backdrop-blur, consistent with the landing page navbar from Prompt UI-1.

2. Go through every page touched in Prompts UI-1 through UI-5 and confirm: consistent spacing/padding scale, consistent button styles (primary = gradient, secondary = outline/ghost), consistent card corner radius and border treatment, no leftover light-theme classes (white backgrounds, black text) anywhere.

3. Add a subtle page-transition fade (framer-motion's AnimatePresence, or a simple CSS fade on route change) so navigating between pages doesn't feel like a hard cut. Keep this lightweight — under 200ms — so it doesn't feel sluggish.

4. Add hover/active states to every clickable element that doesn't already have one (buttons, cards, nav links) — a small scale, glow, or brightness change is enough, nothing elaborate.

5. Do a final responsive check across all restyled pages at ~375px width, fixing anything that looks broken (overlapping text, cards too wide, marquee not scaling).

Run npm run build one final time and confirm zero errors. Then walk through the entire app once — landing page, register, login, browse jobs, save resume, apply, view applications (candidate), and post job, view my jobs, view applicants (recruiter) — confirming every single feature still works exactly as before and now looks visually consistent. Report any bugs found and fixed.
```

---

## Notes for you (not for the agent)
- If any step's output looks visually "off" (colors too dark to read, animations janky), don't move to the next prompt — tell the agent what's wrong specifically ("the muted text is unreadable on the card background, increase contrast") and let it fix that step before continuing, since later prompts reuse the tokens from UI-0.
- Commit after every 2 prompts here too, same discipline as the build phase — a UI pass is exactly the kind of thing that can visually break something in a way that's easy to miss until three steps later.
- If you want real animation flair beyond framer-motion fades (e.g. the scrolling keyword-cloud grid from cofounder's site), that's a nice-to-have for later — it's decorative, not worth the build time risk this close to your deadline.
