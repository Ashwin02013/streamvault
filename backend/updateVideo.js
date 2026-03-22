const db = require('./src/config/db')

const url = 'https://streamvault-videos-281414431600.s3.ap-south-1.amazonaws.com/videos/1774079374538-IMG_8143.MOV'
const title = 'cherai beach'

db.query('UPDATE videos SET cloudfront_url = $1, s3_key = $2 WHERE title = $3', [
  url,
  'videos/1774079374538-IMG_8143.MOV',
  title
]).then(r => {
  console.log('Updated!', r.rowCount, 'rows affected')
  process.exit()
}).catch(e => {
  console.log('Error:', e.message)
  process.exit()
})