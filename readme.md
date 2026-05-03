```
# 🎬 StreamVault

A full-stack video streaming platform built with React, Node.js, AWS, and Razorpay — similar to Netflix with tiered subscription plans, real video streaming, and an admin dashboard.

**Live Demo:** [https://d2hr465hlafi8g.cloudfront.net](https://d2hr465hlafi8g.cloudfront.net)

---

## 📸 Screenshots

>Landing page
<img width="1895" height="856" alt="image" src="https://github.com/user-attachments/assets/4a276800-438c-4493-8686-f6eba458c69c" />

>Home page
<img width="1897" height="844" alt="image" src="https://github.com/user-attachments/assets/55e7f6be-bfe7-4e65-9cd5-966cd4b6b1f7" />

>Video player
<img width="1889" height="860" alt="image" src="https://github.com/user-attachments/assets/8156c344-13bb-45a0-bc8e-6702f75bf3f4" />

>Admin dashboard


---

## 🚀 Features

### User Features
- 🔐 Register, login, email verification, forgot password, forgot username
- 🎬 Browse and stream videos based on subscription tier
- 🔒 Tier-locked content (Free / Basic / Premium)
- ▶️ Resume playback from where you left off
- 🔍 Search videos by title or description
- 📜 Watch history with "Continue Watching" section
- 💳 Razorpay payment integration for plan upgrades
- 👤 Profile page with plan details
- 📱 Fully responsive on mobile and desktop

### Admin Features
- 📊 Dashboard with stats (users, videos, views, paid users)
- 📤 Upload videos with auto thumbnail capture
- 🗑️ Delete videos
- 👥 Manage user plans
- 🎞️ Thumbnail capture from video frame or custom upload

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React.js | UI framework |
| React Router | Client-side routing |
| Axios | API calls |
| React Hot Toast | Notifications |
| AWS CloudFront | CDN for static hosting |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | REST API server |
| PostgreSQL (AWS RDS) | Database |
| AWS Cognito | Authentication & user management |
| AWS S3 | Video and thumbnail storage |
| AWS CloudFront | Video delivery CDN |
| Razorpay | Payment gateway |
| PM2 | Process management on EC2 |
| Nginx | Reverse proxy |

---

## ☁️ AWS Architecture

```
User → CloudFront (CDN)
          ├── S3 (React frontend)
          └── EC2 (Backend API via Nginx)
                ├── Node.js (PM2)
                ├── AWS Cognito (Auth)
                ├── RDS PostgreSQL (Database)
                └── S3 (Videos & Thumbnails)
```

---

## 📁 Project Structure

```
streamvault/
├── frontend/                  # React app
│   ├── src/
│   │   ├── pages/             # Landing, Home, VideoPlayer, Plans, Profile, Admin
│   │   ├── context/           # AuthContext (JWT + Cognito)
│   │   └── services/          # API service (Axios)
│   └── build/                 # Production build → deployed to S3
│
└── backend/                   # Node.js Express API
    └── src/
        └── routes/
            ├── auth.js        # Register, login, refresh, forgot password
            ├── videos.js      # Browse, stream, upload, delete, view count
            └── users.js       # Profile, plan upgrade, admin stats
```

---

## 🗄️ Database Schema

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'free',
  role VARCHAR(50) DEFAULT 'client',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Videos
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  s3_key VARCHAR(500),
  thumbnail_url TEXT,
  cloudfront_url TEXT,
  required_plan VARCHAR(50) DEFAULT 'free',
  duration VARCHAR(20),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Watch History
CREATE TABLE watch_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  watched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);
```

---

## 🔑 Key Implementation Details

### Authentication Flow
- AWS Cognito handles user registration, email verification, and login
- JWT tokens (ID token) stored in localStorage
- Auto token refresh every 45 minutes
- 30-day sessions using Cognito refresh tokens

### Video Streaming
- Videos uploaded to S3 via admin dashboard
- Served through CloudFront CDN for fast global delivery
- Signed S3 URLs for secure access
- Auto thumbnail capture from video frame at upload time

### Subscription Tiers
| Plan | Access |
|------|--------|
| Free | Free videos only |
| Basic | Free + Basic videos |
| Premium | All videos |

### View Count Logic
- Each user is counted only once per video (using watch_history unique constraint)
- Watch history tracks resume position for "Continue Watching"

### Payment Flow
1. User clicks Upgrade → selects plan
2. Razorpay payment modal opens
3. On success → backend verifies payment → updates user plan in DB and Cognito group
4. Content unlocks immediately

---

## 🚀 Deployment

### Frontend
```bash
cd frontend
npm run build
aws s3 sync build/ s3://YOUR_BUCKET --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Backend (EC2)
```bash
pm2 start src/index.js --name streamvault-backend
pm2 save
pm2 resurrect
```

### Environment Variables (backend/.env)
```env
PORT=5000
DB_HOST=your-rds-endpoint
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
S3_VIDEOS_BUCKET=your-bucket
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

---

## 🧑‍💻 Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL
- AWS account with Cognito, S3 set up
- Razorpay account

### Backend
```bash
cd backend
npm install
cp .env.example .env  # fill in your values
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📋 Pending / Future Improvements
- [ ] Permanent HTTPS with custom domain
- [ ] Mobile app (React Native)
- [ ] Video categories and genres
- [ ] Comments and ratings
- [ ] Email notifications for new content
- [ ] Analytics dashboard

---

## 👨‍💻 Author

**Ashwin** — [GitHub](https://github.com/Ashwin02013)

---

## 📄 License

This project is for portfolio and educational purposes.
```

