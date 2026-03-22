const pool = require('./src/config/db')

const createTables = async () => {
  try {
    console.log('Setting up database tables...')

    // USERS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        cognito_id VARCHAR(255) UNIQUE,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        plan VARCHAR(20) DEFAULT 'free',
        role VARCHAR(20) DEFAULT 'client',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Users table ready')

    // VIDEOS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        genre VARCHAR(100),
        tier VARCHAR(20) DEFAULT 'free',
        duration VARCHAR(20),
        year INTEGER,
        rating VARCHAR(10),
        s3_key VARCHAR(500),
        cloudfront_url TEXT,
        thumbnail_url TEXT,
        uploaded_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Videos table ready')

    // WATCH HISTORY TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS watch_history (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
        watched_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, video_id)
      )
    `)
    console.log('✅ Watch history table ready')

    // SUBSCRIPTIONS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        plan VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        started_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Subscriptions table ready')

    // Insert sample videos
    await pool.query(`
      INSERT INTO videos (title, description, genre, tier, duration, year, rating, cloudfront_url, thumbnail_url)
      VALUES 
        ('The Free Adventure', 'An epic adventure available to all users', 'Action', 'free', '1h 45m', 2024, 'PG-13', '', ''),
        ('Mystery of the Deep', 'A thrilling mystery for free users', 'Thriller', 'free', '2h 00m', 2024, 'PG', '', ''),
        ('Basic Chronicles', 'Exclusive content for basic subscribers', 'Drama', 'basic', '1h 30m', 2024, 'PG-13', '', ''),
        ('Premium Universe', 'Premium sci-fi experience', 'Sci-Fi', 'premium', '2h 15m', 2024, 'PG-13', '', ''),
        ('Action Blast', 'High octane action for free users', 'Action', 'free', '1h 55m', 2023, 'R', '', ''),
        ('Basic Romance', 'A beautiful love story for basic users', 'Romance', 'basic', '1h 40m', 2023, 'PG', '', ''),
        ('Premium Thriller', 'Edge of your seat premium thriller', 'Thriller', 'premium', '2h 05m', 2024, 'R', '', ''),
        ('Comedy Gold', 'Hilarious comedy for everyone', 'Comedy', 'free', '1h 35m', 2023, 'PG', '', '')
      ON CONFLICT DO NOTHING
    `)
    console.log('✅ Sample videos inserted')

    console.log('')
    console.log('🎉 Database setup complete!')
    process.exit(0)

  } catch (err) {
    console.error('❌ Database setup failed:', err.message)
    process.exit(1)
  }
}

createTables()