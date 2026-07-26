# Vercel production deployment

DigiPandit is deployed as two Vercel projects from the same repository. This keeps the Vite frontend and Express API independently configurable.

## 1. Create the API project

- Import `bharshit63880/DIGIPANDIT` in Vercel.
- Set **Root Directory** to `backend` and framework to **Other**.
- Set the production environment variables below, then deploy.

```text
NODE_ENV=production
MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://<your-frontend>.vercel.app
CORS_ORIGINS=https://<your-frontend>.vercel.app
ADMIN_NAME=DigiPandit Admin
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<strong admin password>
EMAIL_FROM=DigiPandit <no-reply@your-domain>
SMTP_HOST=<smtp host>
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<smtp username>
SMTP_PASSWORD=<smtp app password>
PAYU_MERCHANT_KEY=<optional until payments are enabled>
PAYU_MERCHANT_SALT=<optional until payments are enabled>
PAYU_BASE_URL=https://secure.payu.in
CLOUDINARY_CLOUD_NAME=<optional until uploads are enabled>
CLOUDINARY_API_KEY=<optional until uploads are enabled>
CLOUDINARY_API_SECRET=<optional until uploads are enabled>
```

Confirm `https://<your-api>.vercel.app/api/health` responds successfully before moving on.

## 2. Create the frontend project

- Import the same repository again in Vercel.
- Set **Root Directory** to `web`.
- Configure these production variables with the API URL from step 1:

```text
VITE_API_URL=https://<your-api>.vercel.app/api
VITE_SOCKET_URL=https://<your-api>.vercel.app
```

Deploy and open the provided frontend URL.

## 3. Production checks

1. Update `CLIENT_URL` and `CORS_ORIGINS` in the API project with the final frontend domain, then redeploy the API.
2. Use a MongoDB Atlas database user limited to this application database and allow Vercel network access according to your Atlas security policy.
3. Seed only the production-safe admin and approved Hawan records; do not run demo seeding against production.
4. Test registration, email verification, login, booking, payment callback, and chat message persistence.

## Realtime chat note

Message persistence works through the REST API. The current Socket.IO server is designed for a continuously running Node server, so instant multi-user delivery should use a dedicated realtime service or a Socket.IO adapter with a shared Redis store before relying on it in production.
