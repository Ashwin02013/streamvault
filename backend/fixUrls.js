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

  // Fix S3 URLs -> CloudFront URLs for rows 9 and 11
  const fix = await c.query(`
    UPDATE videos
    SET
      cloudfront_url = REPLACE(
        cloudfront_url,
        'https://streamvault-videos-281414431600.s3.ap-south-1.amazonaws.com',
        'https://d2hr465hlafi8g.cloudfront.net'
      ),
      updated_at = NOW()
    WHERE cloudfront_url LIKE '%streamvault-videos-281414431600.s3.ap-south-1.amazonaws.com%'
  `)
  console.log('Fixed ' + fix.rowCount + ' S3 URLs -> CloudFront')

  // Rows 1-8 have no URL at all — that's OK for now (sample data with no real video)
  const empty = await c.query(`
    SELECT COUNT(*) AS count FROM videos
    WHERE cloudfront_url IS NULL OR cloudfront_url = ''
  `)
  console.log('Videos still with no URL: ' + empty.rows[0].count + ' (these are sample placeholder videos)')

  // Verify rows 9 and 11
  const check = await c.query(`
    SELECT id, title, cloudfront_url FROM videos
    WHERE id IN (9, 11)
  `)
  console.log('\nVerification:')
  check.rows.forEach(x => console.log('  [' + x.id + '] ' + x.title + ' -> ' + x.cloudfront_url))

  await c.end()
}

run()