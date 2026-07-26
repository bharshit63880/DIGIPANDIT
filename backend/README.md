# DigiPandit Backend

Single Express + MongoDB backend for DigiPandit.

## Run locally

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Start MongoDB locally
4. Seed admin with `npm run seed:admin`
5. Seed realistic demo data with `npm run seed:demo`
6. Start API with `npm run dev`

## Email OTP setup

OTP emails require a real SMTP mailbox in `backend/.env`. The app now returns a clear configuration error instead of claiming that an email was sent when SMTP is missing.

For Gmail, use an account with two-step verification enabled and create a Google App Password. Configure:

```env
EMAIL_FROM="DigiPandit <your-gmail-address@gmail.com>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASSWORD=your-16-character-google-app-password
```

Restart the backend after changing `.env`.

## Main API areas

- Auth and profile management
- Pandit profile and dashboard APIs
- Puja and astrology bookings
- Puja samagri store orders
- Razorpay order creation and payment verification
- Socket.io chat with stored message history
- Admin analytics and approvals
