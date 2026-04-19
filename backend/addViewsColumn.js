require('dotenv').config()
const { Client } = require('pg')

async function run() {
  const c = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  })
  await c.connect()

  await c.query(`
    ALTER TABLE videos
    ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0
  `)
  console.log('✅ views column added to videos table')

  await c.query(`UPDATE videos SET views = 0 WHERE views IS NULL`)
  console.log('✅ Existing videos set to 0 views')

  const r = await c.query('SELECT id, title, views FROM videos ORDER BY id')
  console.log('\nVideos with views column:')
  r.rows.forEach(v => console.log(`  [${v.id}] ${v.title} → ${v.views} views`))

  await c.end()
}

run()