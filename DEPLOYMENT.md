# MealNest Production Deployment

MealNest is deployed as two services from this repository:

- Vercel root directory: `frontend`
- Render root directory: `backend`
- Production database: MongoDB Atlas

No real credentials should be committed. Copy the provided `.env.example` files and fill values only in local untracked files or provider dashboards.

## 1. Required software

- Git
- Node.js 20 or newer
- npm
- Docker Desktop for local container testing
- MongoDB Atlas, Render, and Vercel accounts
- SMTP credentials for email features

## 2. Local environment variables

Create `backend/.env` from `backend/.env.example`:

```dotenv
PORT=8088
MONGODB_URI=mongodb://127.0.0.1:27017/mealnest
JWT_SECRET=replace-with-a-long-random-development-secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
FRONTEND_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
GEMINI_API_KEY=
GEMINI_CHAT_MODEL=gemini-3.6-flash
```

`MONGO_URI` remains supported for existing local/test environments, but production should use `MONGODB_URI`.

Create `frontend/.env.local` from `frontend/.env.example`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8088
```

Do not append `/api`; the application already owns its endpoint paths. A trailing slash is accepted and normalized.

## 3. Run the backend locally

```bash
cd backend
npm ci
npm run dev
```

The local API listens at `http://localhost:8088`.

## 4. Run the frontend locally

In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`.

## 5. Build the backend Docker image

From the repository root:

```bash
docker build -t mealnest-backend ./backend
```

The multi-stage image compiles TypeScript and contains production dependencies only.

## 6. Run the Docker image

```bash
docker run --rm --name mealnest-backend -p 8088:8088 --env-file backend/.env mealnest-backend
```

When Docker connects to a database on the host, `127.0.0.1` refers to the container. Prefer Atlas or use a Docker-compatible host address for local testing.

## 7. Test the health endpoint

```bash
curl http://localhost:8088/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "MealNest API is running"
}
```

## 8. Create MongoDB Atlas credentials

1. Create an Atlas project and cluster.
2. Create a dedicated database user with a strong generated password.
3. Add Render's outbound access through Atlas Network Access. For an initial test, Atlas permits `0.0.0.0/0`; restrict this when a stable outbound range is available.
4. Copy the Node.js connection string.
5. Replace its username, password, and database name.
6. Store the result only as Render's `MONGODB_URI`.
7. URL-encode special characters in the database username or password.

## 9. Deploy the backend to Render

1. Push the repository to GitHub.
2. In Render, create a new Web Service from the repository.
3. Set **Root Directory** to `backend`.
4. Select **Docker** as the runtime.
5. The Dockerfile path is `Dockerfile` relative to that root.
6. Set the health check path to `/api/health`.
7. Do not add a separate build/start command that conflicts with the Dockerfile.
8. Deploy after configuring the variables below.

Render supplies `PORT`; the server reads it and binds to `0.0.0.0`.

## 10. Render environment variables

Set these for the complete application:

```text
MONGODB_URI
JWT_SECRET
FRONTEND_URL
EMAIL_HOST
EMAIL_PORT
EMAIL_SECURE
EMAIL_USER
EMAIL_PASS
EMAIL_FROM
GEMINI_API_KEY
GEMINI_CHAT_MODEL
```

Optional tuning variables:

```text
JWT_EXPIRES_IN
BCRYPT_SALT_ROUNDS
```

`GEMINI_API_KEY` and `GEMINI_CHAT_MODEL` are required only for the chatbot. SMTP variables are required for booking, cancellation, modification, and password-reset emails. Never expose these values through Vercel `NEXT_PUBLIC_` variables.

## 11. Deploy the frontend to Vercel

1. Import the same repository in Vercel.
2. Set **Root Directory** to `frontend`.
3. Keep the detected Next.js framework and default `npm run build`.
4. Configure `NEXT_PUBLIC_API_URL` before the first production build.
5. Deploy.

No `vercel.json` is needed.

## 12. Add the Vercel API variable

In Vercel Project Settings → Environment Variables:

```text
NEXT_PUBLIC_API_URL=https://your-render-service.onrender.com
```

Set it for Production and Preview as appropriate. Do not include `/api`.

## 13. Add the final frontend URL to Render

After Vercel assigns the production domain, set:

```text
FRONTEND_URL=https://your-mealnest-project.vercel.app
```

The backend normalizes a trailing slash and allows `http://localhost:3000` for local development. It does not use wildcard CORS with credentials.

## 14. Redeploy after environment changes

- Redeploy Render after changing `MONGODB_URI`, `FRONTEND_URL`, JWT, SMTP, or Gemini variables.
- Redeploy Vercel after changing `NEXT_PUBLIC_API_URL` because public variables are embedded during the Next.js build.

## 15. Test signup and login

1. Register a new account from the deployed frontend.
2. Confirm the account appears in Atlas.
3. Log out and log back in.
4. Confirm authenticated user and admin routes work.

## 16. Test restaurant browsing

Open Discover and restaurant detail pages. Confirm restaurant API data and existing frontend-public images render.

## 17. Test booking

Select a restaurant, date, time, and guest count. Continue to payment and confirm that validation messages are returned by the Render API.

## 18. Test payment simulation

Test both eSewa and Mobile Banking. A successful simulation must create one confirmed reservation and redirect to the booking-confirmation page.

## 19. Test booking confirmation email

Use an account with an accessible email address. Confirm the email is delivered to that authenticated account and that SMTP logs contain no authentication error.

## 20. Test forgot-password email

Request a reset for a registered account. The email should use the deployed `FRONTEND_URL`, not localhost.

## 21. Test the reset link

Open the emailed `/reset-password/TOKEN` URL, change the password, then verify the new password works and the old password does not.

## 22. Test admin restaurant creation and images

The current upload middleware stores restaurant and profile images under `backend/uploads`. Render's default filesystem is ephemeral, so uploads disappear after a restart or redeploy unless storage is configured.

For the current implementation, attach a Render persistent disk mounted at:

```text
/app/uploads
```

This preserves files for one service instance. Existing images from `frontend/public` are unaffected.

For a future horizontally scalable deployment, migrate the existing Multer storage adapter to Cloudinary:

1. Add Cloudinary credentials only in Render.
2. Upload the Multer file stream/buffer to Cloudinary.
3. Save Cloudinary's secure hosted URL in the existing restaurant `image` field.
4. Keep local disk storage when `NODE_ENV` is not `production`.
5. Add `res.cloudinary.com` to strict Next.js `remotePatterns` only after Cloudinary is enabled.

Cloudinary is not currently installed or partially configured, so this deployment does not introduce an untested storage rewrite.

## 23. Common troubleshooting

### CORS error

- Confirm `FRONTEND_URL` exactly matches the deployed Vercel origin.
- Do not include paths such as `/login`.
- Redeploy Render after changing the value.
- Preview Vercel URLs are separate origins; set the intended preview origin in Render when testing a preview.

### Frontend still calls localhost

- Confirm Vercel has `NEXT_PUBLIC_API_URL`.
- Ensure it contains the Render origin without `/api`.
- Redeploy Vercel.

### MongoDB fails to connect

- Verify `MONGODB_URI`, database-user permissions, URL encoding, and Atlas Network Access.
- The production server exits clearly if the URI is missing or connection fails.

### Images fail in production

- Confirm `NEXT_PUBLIC_API_URL` existed at frontend build time so the Render upload host was added to Next.js `remotePatterns`.
- Confirm a Render persistent disk is mounted at `/app/uploads`.

### Email fails

- Verify SMTP host, port, secure mode, sender, user, and app password.
- For Gmail, use an app password rather than an account password.
- Confirm `FRONTEND_URL` for password-reset links.

## Deployment checklist

- [ ] Backend health route works
- [ ] MongoDB connects
- [ ] Signup works
- [ ] Login works
- [ ] JWT or cookie authentication works
- [ ] Restaurants load
- [ ] Admin dashboard data loads
- [ ] Booking works
- [ ] Payment simulation works
- [ ] Confirmation email works
- [ ] Forgot-password email works
- [ ] Reset link opens the deployed frontend
- [ ] Uploaded restaurant images persist
- [ ] Vercel frontend can call Render backend
- [ ] No secrets are committed
