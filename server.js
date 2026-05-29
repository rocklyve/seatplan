import express from 'express'
import session from 'express-session'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, 'seatplan.json')
const SECRETS_FILE = join(__dirname, 'secrets.json')
const PORT = process.env.PORT || 3001

// Load secrets — abort early with a clear message if missing
if (!existsSync(SECRETS_FILE)) {
  console.error('ERROR: secrets.json not found. Copy secrets.template.json to secrets.json and fill in the values.')
  process.exit(1)
}
const secrets = JSON.parse(readFileSync(SECRETS_FILE, 'utf-8'))

const app = express()
app.use(express.json())

app.use(session({
  secret: secrets.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
}))

// In production, serve the built frontend from dist/
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')))
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

// POST /api/login — verify site password, establish session
app.post('/api/login', (req, res) => {
  const { password } = req.body
  if (password === secrets.sitePassword) {
    req.session.authenticated = true
    return res.json({ ok: true })
  }
  res.status(401).json({ error: 'Wrong password' })
})

// POST /api/logout
app.post('/api/logout', (req, res) => {
  req.session.destroy()
  res.json({ ok: true })
})

// GET /api/session — lets the client check if it is already logged in
app.get('/api/session', (req, res) => {
  res.json({ authenticated: req.session.authenticated === true })
})

// ── Auth middleware for all remaining routes ──────────────────────────────────
const requireAuth = (req, res, next) => {
  if (req.session.authenticated) return next()
  res.status(401).json({ error: 'Not authenticated' })
}

// ── Plan endpoints (all require login) ───────────────────────────────────────

// GET /api/plan — return the saved plan, or null if none exists yet
app.get('/api/plan', requireAuth, (req, res) => {
  if (!existsSync(DATA_FILE)) {
    return res.json(null)
  }
  try {
    const data = readFileSync(DATA_FILE, 'utf-8')
    res.json(JSON.parse(data))
  } catch (err) {
    console.error('Failed to read seatplan.json:', err)
    res.status(500).json({ error: 'Failed to read plan' })
  }
})

// POST /api/plan — save the plan; requires the save passcode in addition to session
app.post('/api/plan', requireAuth, (req, res) => {
  const { passcode, guests, tables, version } = req.body
  if (passcode !== secrets.savePasscode) {
    return res.status(403).json({ error: 'Wrong passcode' })
  }
  try {
    const payload = { guests, tables, version, savedAt: new Date().toISOString() }
    writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8')
    res.json({ ok: true })
  } catch (err) {
    console.error('Failed to write seatplan.json:', err)
    res.status(500).json({ error: 'Failed to save plan' })
  }
})

// In production, fall back to index.html for client-side routing
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  if (process.env.NODE_ENV === 'production') {
    console.log('Serving production build from dist/')
  }
})
