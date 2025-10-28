
MoDeBarber — Starter

A professional, deployable Next.js site with booking, shop, and online payments.

Quickstart
1) Install deps: `pnpm i` (or `npm i` / `yarn`)
2) Copy envs: `cp .env.example .env`
3) Run dev server: `pnpm dev` then open http://localhost:3000

Deploy
- Vercel: import the repo, set env vars from `.env.example`, deploy.
- Database: SQLite by default. For production use Postgres; update `DATABASE_URL` then run `npx prisma migrate deploy`.

Payments
- Stripe Checkout via `/api/checkout`. Replace keys in `.env`. To use PayFast/Paystack, swap the code in that route.

Booking API
- GET /api/services – catalog
- GET /api/availability?date=YYYY-MM-DD – available slots
- POST /api/bookings – saves booking (extend to write DB + send email/SMS)

Customize
- Colors in `tailwind.config.js` (brand + accent from logo).
- Services: `/app/api/services/route.ts`
- Products: `/app/api/products/route.ts`
