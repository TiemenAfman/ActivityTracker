import express from 'express'
import cors from 'cors'
import session from 'express-session'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

await import('./db.js')

import activitiesRouter from './routes/activities.js'
import categoriesRouter from './routes/categories.js'
import { requireAuth, registerAuthRoutes } from './auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '50mb' }))
app.use(session({
  secret: 'activity-tracker-home',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 dagen
}))

registerAuthRoutes(app)

app.use('/api/activities', requireAuth, activitiesRouter)
app.use('/api/categories', requireAuth, categoriesRouter)

const distDir = join(__dirname, '..', 'dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get('*', (_req, res) => res.sendFile(join(distDir, 'index.html')))
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`)
})
