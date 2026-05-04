# MassForm — Commercial Massing Engine
**by Jade** · Prototype v0.1

A 5-step commercial building massing and facade analysis tool.

---

## Deploy to Vercel (no coding needed)

### Option A — GitHub + Vercel (recommended for custom domain)

1. **Create a GitHub account** at github.com if you don't have one
2. **Create a new repository** → click "+" → "New repository" → name it `massform` → click "Create repository"
3. **Upload these files**: drag the entire `massform` folder contents into the GitHub web interface, or use GitHub Desktop app
4. **Go to vercel.com** → sign up with your GitHub account
5. Click **"Add New Project"** → select your `massform` repository
6. Vercel auto-detects Vite — click **Deploy**
7. Your app is live at `massform.vercel.app`
8. For a custom domain: go to Project Settings → Domains → add your domain

### Option B — Vercel CLI (fastest)

```bash
npm install -g vercel
cd massform
npm install
vercel
```
Follow the prompts — your app deploys in ~60 seconds.

---

## Local development

```bash
cd massform
npm install
npm run dev
```
Opens at `http://localhost:5173`

---

## What's in each step

| Step | Feature |
|------|---------|
| 1 | Site setup — lot dimensions, zoning params, AI file extraction |
| 2 | Commercial program selection — 35+ programs in 7 categories, circulation, elevators |
| 3 | 3D massing — box, taper, stepped, solar-cut, podium+tower with live sun |
| 4 | Solar & ESG — annual sun chart, facing analysis, HVAC cost savings |
| 5 | Facade design — glazing ratios by face, window sizing, material costs |

---

## Tech stack

- **React 18** + **Vite** — fast builds, zero config
- **Three.js** — 3D massing engine
- **No backend required** — fully client-side

---

## To connect real AI document parsing (Step 1)

Replace the `simulateAIFill()` function in `Step1Setup.jsx` with a call to the Claude API:

```js
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: `Extract FAR, height limit, and setbacks from this zoning text: ${fileText}. Return JSON only.` }]
  })
})
```

Add your API key to a Vercel environment variable: `VITE_ANTHROPIC_KEY`.
