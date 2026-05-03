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

  const r = await c.query(`
    SELECT id, title, cloudfront_url
    FROM videos
    WHERE cloudfront_url LIKE '%s3.ap-south-1.amazonaws.com%'
       OR cloudfront_url LIKE '%s3.amazonaws.com%'
       OR cloudfront_url IS NULL
       OR cloudfront_url = ''
    ORDER BY id
  `)

  console.log('Found ' + r.rows.length + ' broken rows:\n')
  r.rows.forEach(x => console.log('  [' + x.id + '] ' + x.title + ' -> ' + (x.cloudfront_url || 'NULL/EMPTY')))

  await c.end()
}

run()