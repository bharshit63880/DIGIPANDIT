# DigiPandit Backend

Single Express + MongoDB backend for DigiPandit.

## Run locally

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Start MongoDB locally
4. Seed admin with `npm run seed:admin`
5. Seed realistic demo data with `npm run seed:demo`
6. Start API with `npm run dev`

## Main API areas

- Auth and profile management
- Pandit profile and dashboard APIs
- Puja and astrology bookings
- Puja samagri store orders
- Razorpay order creation and payment verification
- Socket.io chat with stored message history
- Admin analytics and approvals
