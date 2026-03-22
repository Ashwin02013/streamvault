require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
})

pool.connect(function(err, client, release) {
  if (err) { console.log('Connect error:', err.message); process.exit() }
  client.query(
    "UPDATE videos SET cloudfront_url = $1 WHERE title = 'hawk'",
    ['https://streamvault-videos-281414431600.s3.ap-south-1.amazonaws.com/videos/1774080831287-IMG_4293.MP4'],
    function(err2, result) {
      release()
      if (err2) { console.log('Query error:', err2.message) }
      else { console.log('Updated rows:', result.rowCount) }
      process.exit()
    }
  )
})
```

Save with **Ctrl+S** then run:
```