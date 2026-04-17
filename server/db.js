import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'data')
mkdirSync(dataDir, { recursive: true })

const file = join(dataDir, 'activities.json')
const adapter = new JSONFile(file)
const db = new Low(adapter, { activities: [], categories: [] })

await db.read()

console.log(`Database: ${file}`)

export default db
