# DigiPandit

Full-stack DigiPandit monorepo with:

- `backend/` - Node.js + Express + MongoDB monolith
- `web/` - React + Vite + Tailwind + Redux Toolkit
- `mobile/` - React Native + Expo user app

## Folder structure

```text
digipandit/
├── backend/
├── web/
└── mobile/
```

## Environment setup

### Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### Web

1. Copy `web/.env.example` to `web/.env`
2. Ensure `VITE_API_URL=http://localhost:5000/api`
3. Ensure `VITE_SOCKET_URL=http://localhost:5000`

### Mobile

1. Copy `mobile/.env.example` to `mobile/.env`
2. Set `EXPO_PUBLIC_API_URL`
3. Set `EXPO_PUBLIC_SOCKET_URL`
4. For Android emulator use `http://10.0.2.2:5000`
5. For physical devices use your laptop LAN IP instead of `localhost`

## Run locally

### Backend

```bash
cd backend
npm install
npm run seed:admin
npm run seed:demo
npm run dev
```

### Web

```bash
cd web
npm install
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npm start
```

Then press:

- `a` for Android
- `i` for iOS
- `w` for web preview

## Default admin

Seeded from backend env values:

- email: `admin@digipandit.com`
- password: `Admin@12345`

Update these in `backend/.env` before production use.

## Demo credentials

After `npm run seed:demo`:

- user: `aarav.user@digipandit.demo` / `Demo@12345`
- user: `priya.user@digipandit.demo` / `Demo@12345`
- pandit: `neha.astrologer@digipandit.demo` / `Demo@12345`
- pandit: `raghav.pandit@digipandit.demo` / `Demo@12345`
# DIGIPANDIT
