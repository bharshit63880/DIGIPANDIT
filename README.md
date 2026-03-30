# DigiPandit

DigiPandit is a full-stack spiritual services platform that combines pandit discovery, astrology consultations, puja bookings, devotional content, store orders, chat, payments, and admin operations in a single monorepo.

This repository contains:

- `backend/` - Express + MongoDB API with authentication, bookings, chat, store, admin, uploads, and AI support
- `web/` - React + Vite + Tailwind web application for users, pandits, and admins
- `mobile/` - React Native + Expo mobile application for the user experience

## What The Platform Covers

- User registration, login, email verification, and password reset
- Pandit and astrologer discovery with filters for puja, astrology chat, and astrology calls
- Booking flow for online and offline spiritual services
- Storefront for puja kits, idols, incense, and related devotional products
- Real-time chat and consultation continuity with Socket.IO
- Video consultation entry flow from bookings and chat
- Admin dashboard for users, products, experts, bookings, orders, and withdrawals
- Pandit dashboard for profile management, services, schedule, and bookings
- AI-powered PanditJi assistant flow on the web app

## Monorepo Structure

```text
digipandit/
├── backend/
│   ├── src/
│   └── .env.example
├── web/
│   ├── public/
│   ├── src/
│   └── .env.example
├── mobile/
│   ├── src/
│   └── .env.example
├── SRS.md
└── README.md
```

## Tech Stack

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- Socket.IO
- Zod validation
- Razorpay
- Cloudinary

### Web

- React 18
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios

### Mobile

- React Native
- Expo
- React Navigation
- Async Storage
- Axios

## Core Backend Modules

The backend exposes the following main route groups under `/api`:

- `/auth` - authentication, verification, password reset
- `/users` - user profile and account operations
- `/pandits` - pandit listing, details, and dashboard data
- `/bookings` - booking creation and booking lifecycle
- `/products` - product catalogue and product details
- `/store` - store order creation and order retrieval
- `/chat` - chat rooms and messages
- `/payments` - payment flows
- `/admin` - admin dashboards and operations
- `/uploads` - media upload endpoints
- `/ai` - AI assistant integration

## Environment Setup

Create local `.env` files from the provided examples before running the apps.

### Backend

Copy:

```bash
cp backend/.env.example backend/.env
```

Required keys in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/digipandit
JWT_SECRET=change_this_super_secret_key
JWT_EXPIRES_IN=7d
EMAIL_FROM=no-reply@digipandit.local
RAZORPAY_KEY_ID=rzp_test_your_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ADMIN_NAME=DigiPandit Admin
ADMIN_EMAIL=admin@digipandit.com
ADMIN_PASSWORD=Admin@12345
```

### Web

Copy:

```bash
cp web/.env.example web/.env
```

Required keys in `web/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Mobile

Copy:

```bash
cp mobile/.env.example mobile/.env
```

Required keys in `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
EXPO_PUBLIC_SOCKET_URL=http://10.0.2.2:5000
```

Mobile URL notes:

- For Android Emulator use `http://10.0.2.2:5000`
- For iOS Simulator use your local machine URL as needed
- For a physical device use your laptop's LAN IP instead of `localhost`

## Installation

Install dependencies separately for each app:

```bash
cd backend
npm install

cd ../web
npm install

cd ../mobile
npm install
```

## Running The Project Locally

### 1. Start MongoDB

Make sure MongoDB is running locally and matches your `MONGO_URI`.

### 2. Seed Admin And Demo Data

From the `backend/` folder:

```bash
npm run seed:admin
npm run seed:demo
```

### 3. Start The Backend

```bash
cd backend
npm run dev
```

### 4. Start The Web App

```bash
cd web
npm run dev
```

### 5. Start The Mobile App

```bash
cd mobile
npm start
```

Expo shortcuts:

- `a` for Android
- `i` for iOS
- `w` for web preview

## Available Scripts

### Backend

```bash
npm run dev
npm start
npm run seed:admin
npm run seed:demo
```

### Web

```bash
npm run dev
npm run build
npm run preview
```

### Mobile

```bash
npm start
npm run android
npm run ios
npm run web
```

## Default Admin Credentials

Configured through backend environment variables:

- Email: `admin@digipandit.com`
- Password: `Admin@12345`

Change these before using the project outside local development.

## Demo Credentials

After running `npm run seed:demo`, you can use the following sample accounts:

### Users

- `aarav.user@digipandit.demo` / `Demo@12345`
- `priya.user@digipandit.demo` / `Demo@12345`

### Pandits / Astrologers

- `neha.astrologer@digipandit.demo` / `Demo@12345`
- `raghav.pandit@digipandit.demo` / `Demo@12345`

## Suggested Local Startup Order

If you want the smoothest local workflow:

1. Start MongoDB
2. Run backend seeds
3. Start backend server
4. Start web app
5. Start mobile app

## Deployment Notes

- The backend expects valid MongoDB, Razorpay, and Cloudinary credentials
- The web app should point to the deployed backend API and socket host
- The mobile app should use public API and socket URLs reachable from devices
- Replace demo secrets and admin defaults before production deployment

## Repository Purpose

This repository is useful as:

- A spiritual services marketplace product base
- A full-stack portfolio project
- A SaaS-style monorepo with web, mobile, admin, and backend layers
- A starting point for marketplace, consultation, and devotional commerce workflows

## License

Add your preferred license here if you plan to open-source the project publicly.
