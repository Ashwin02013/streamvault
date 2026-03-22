require('dotenv').config()
const {Client}=require('pg')
async function run(){const c=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();const r=await c.query('SELECT title,cloudfront_url FROM videos');r.rows.forEach(x=>console.log(x.title,x.cloudfront_url));await c.end()}
run()