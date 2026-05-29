import express from 'express'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_FILE = join(__dirname, 'seatplan.json')
const PORT = process.env.PORT || 3001

const app = express()
app.use(express.json())

// In production, serve the built frontend from dist/
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')))
}

// GET /api/plan — return the saved plan, or null if none exists yet
app.get('/api/plan', (req, res) => {
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

// POST /api/plan — save the plan to disk
app.post('/api/plan', (req, res) => {
  try {
    const payload = { ...req.body, savedAt: new Date().toISOString() }
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
