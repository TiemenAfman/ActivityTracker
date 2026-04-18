import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const usersFile = join(__dirname, '..', 'data', 'users.json')

function loadUsers() {
  try {
    return JSON.parse(readFileSync(usersFile, 'utf8'))
  } catch {
    return []
  }
}

export function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' })
  next()
}

export function registerAuthRoutes(app) {
  app.get('/api/setup-needed', (_req, res) => {
    res.json({ needed: loadUsers().length === 0 })
  })

  app.post('/api/setup', (req, res) => {
    if (loadUsers().length > 0) return res.status(403).json({ error: 'Al ingesteld' })
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ error: 'Vul alle velden in' })
    const user = { id: `usr_${Date.now()}`, username, password }
    writeFileSync(usersFile, JSON.stringify([user], null, 2))
    req.session.userId = user.id
    req.session.username = user.username
    res.json({ id: user.id, username: user.username })
  })

  app.post('/api/login', (req, res) => {
    const users = loadUsers()
    if (users.length === 0) return res.status(503).json({ setup: true })
    const { username, password } = req.body
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password)
    if (!user) return res.status(401).json({ error: 'Onjuiste gebruikersnaam of wachtwoord' })
    req.session.userId = user.id
    req.session.username = user.username
    res.json({ id: user.id, username: user.username })
  })

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => res.json({ ok: true }))
  })

  app.post('/api/change-username', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' })
    const { newUsername, password } = req.body
    const users = loadUsers()
    const idx = users.findIndex(u => u.id === req.session.userId)
    if (idx === -1) return res.status(404).json({ error: 'User not found' })
    if (users[idx].password !== password)
      return res.status(401).json({ error: 'Wachtwoord klopt niet' })
    if (users.some(u => u.id !== req.session.userId && u.username.toLowerCase() === newUsername.toLowerCase()))
      return res.status(409).json({ error: 'Gebruikersnaam is al in gebruik' })
    users[idx].username = newUsername
    writeFileSync(usersFile, JSON.stringify(users, null, 2))
    req.session.username = newUsername
    res.json({ ok: true, username: newUsername })
  })

  app.post('/api/change-password', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' })
    const { currentPassword, newPassword } = req.body
    const users = loadUsers()
    const idx = users.findIndex(u => u.id === req.session.userId)
    if (idx === -1) return res.status(404).json({ error: 'User not found' })
    if (users[idx].password !== currentPassword)
      return res.status(401).json({ error: 'Huidig wachtwoord klopt niet' })
    users[idx].password = newPassword
    writeFileSync(usersFile, JSON.stringify(users, null, 2))
    res.json({ ok: true })
  })

  app.get('/api/me', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' })
    res.json({ id: req.session.userId, username: req.session.username })
  })

  app.get('/api/users', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' })
    res.json(loadUsers().map(u => ({ id: u.id, username: u.username })))
  })
}
