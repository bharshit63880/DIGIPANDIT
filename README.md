# DigiPandit

**DigiPandit** ek complete full-stack spiritual services platform hai jo pandit discovery, astrology consultations, puja bookings, devotional content, puja samagri store, real-time chat, video calls, payments aur admin management ko ek hi jagah laata hai.

Yeh ek modern **monorepo** structure mein bana hai jo scalable, maintainable aur production-ready hai.

---

## ✨ Key Features

### 👤 User Experience
- User registration, login, email verification & password reset
- Pandit & Astrologer discovery with smart filters
- Online/Offline booking for Puja, Hawan, Astrology Chat & Calls
- Real-time chat with experts
- Video consultation support
- Puja products store with cart & checkout

### 🛕 Expert Dashboard (Pandit/Astrologer)
- Profile management & service catalog
- Availability calendar
- Booking management (Accept/Reject/Complete)
- Earnings & withdrawal tracking

### ⚙️ Admin Dashboard
- User, Pandit & Product management
- Booking & Order oversight
- Analytics & reports
- Content & media management

### 💳 Additional Features
- Secure payments via Razorpay
- Real-time notifications with Socket.IO
- AI-powered PanditJi assistant
- Responsive design (Web + Mobile)
- Cloudinary media uploads

---

## 🏗️ Monorepo Architecture
digipandit/
├── backend/          # Node.js + Express API
├── web/              # React + Vite + Tailwind
├── mobile/           # React Native + Expo
├── SRS.md
└── README.md
text---

## 🛠️ Tech Stack

| Layer     | Technologies |
|---------|-------------|
| **Backend** | Node.js, Express, MongoDB, Mongoose, Socket.IO, Zod, JWT, Razorpay, Cloudinary |
| **Web**     | React 18, Vite, Tailwind CSS, Redux Toolkit, React Router |
| **Mobile**  | React Native, Expo, React Navigation |
| **Others**  | Docker (optional), Vercel/Netlify ready |

---

## 🚀 Local Setup Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (local or cloud)
- Razorpay & Cloudinary credentials (for payments & uploads)

### 2. Clone Repository
```bash
git clone https://github.com/yourusername/digipandit.git
cd digipandit
3. Environment Setup
Backend:
Bashcp backend/.env.example backend/.env
# Edit backend/.env with your credentials
Web:
Bashcp web/.env.example web/.env
Mobile:
Bashcp mobile/.env.example mobile/.env
4. Install Dependencies
Bash# Backend
cd backend && npm install

# Web
cd ../web && npm install

# Mobile
cd ../mobile && npm install
5. Seed Database
Bashcd backend
npm run seed:admin
npm run seed:demo
6. Run Applications
Bash# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Web
cd web && npm run dev

# Terminal 3 - Mobile
cd mobile && npm start
Default Admin Login:

Email: admin@digipandit.com
Password: Admin@12345

Demo Users:

aarav.user@digipandit.demo / Demo@12345
neha.astrologer@digipandit.demo / Demo@12345


📱 Available Scripts
Backend
Bashnpm run dev          # Development
npm start            # Production
npm run seed:admin
npm run seed:demo
Web
Bashnpm run dev
npm run build
npm run preview
Mobile
Bashnpm start
npm run android
npm run ios

📊 API Routes Summary

/api/auth — Authentication
/api/users — User profile
/api/pandits — Expert management
/api/bookings — Booking system
/api/store — E-commerce orders
/api/chat — Real-time messaging
/api/payments — Razorpay integration
/api/admin — Admin operations


🚀 Deployment

Backend: Vercel / Render / Railway
Web: Vercel / Netlify
Mobile: Expo EAS Build
Database: MongoDB Atlas
Media: Cloudinary


🤝 Contributing
Contributions welcome! Please read our Contributing Guide before submitting a PR.

Fork the project
Create your feature branch
Commit your changes
Push to the branch
Open a Pull Request


📄 License
MIT License
Copyright © 2026 [Your Name / Organization]
This project is open source and free to use.

🙏 Acknowledgments

All the pandits and spiritual experts who inspired this platform
Open source community
Contributors & testers


📧 Support & Contact

For issues: Open a GitHub Issue
Business inquiries: hello@digipandit.in
Follow updates on Twitter/X


Made with ❤️ for the spiritual community
