# Task Management System (Node.js + Express + MongoDB + JWT)

A secure REST API for managing personal tasks. Each user registers/logs in, receives a JWT, and can then create, view, update, and delete **only their own** tasks.

## Tech Stack
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken) for authentication
- bcryptjs for password hashing

## Project Structure
```
task-manager-api/
├── server.js              Entry point
├── config/db.js           MongoDB connection
├── models/
│   ├── User.js             User schema
│   └── Task.js             Task schema (linked to a User via `owner`)
├── middleware/auth.js      JWT verification middleware
├── controllers/
│   ├── authController.js   Register / login logic
│   └── taskController.js   Task CRUD logic
└── routes/
    ├── authRoutes.js
    └── taskRoutes.js
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Fill in:
   - `MONGO_URI` — your MongoDB connection string. Easiest free option: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — create a free cluster, click "Connect" → "Drivers", copy the connection string, replace `<password>` with your database user's password.
   - `JWT_SECRET` — any long random string (used to sign tokens).

3. Run the server:
   ```bash
   npm run dev
   ```
   (or `npm start` without auto-reload)

   You should see:
   ```
   MongoDB connected successfully
   Server running on http://localhost:5000
   ```

## API Reference

All request/response bodies are JSON. Protected routes require this header:
```
Authorization: Bearer <your_jwt_token>
```

### Auth

**Register** — `POST /api/auth/register`
```json
{
  "name": "Asha Rao",
  "email": "asha@example.com",
  "password": "password123"
}
```
Response (201):
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "name": "Asha Rao", "email": "asha@example.com" }
}
```

**Login** — `POST /api/auth/login`
```json
{ "email": "asha@example.com", "password": "password123" }
```
Response (200): same shape as register, with a fresh token.

### Tasks (all require the `Authorization: Bearer <token>` header)

**Create a task** — `POST /api/tasks`
```json
{
  "title": "Finish project report",
  "description": "Write the final section and proofread",
  "priority": "high",
  "dueDate": "2026-07-01"
}
```

**Get all my tasks** — `GET /api/tasks`
→ Returns only tasks created by the logged-in user.

**Get one task** — `GET /api/tasks/:id`

**Update a task** — `PUT /api/tasks/:id`
```json
{ "title": "Finish project report (v2)", "priority": "medium" }
```

**Mark as completed/pending** — `PATCH /api/tasks/:id/status`
```json
{ "status": "completed" }
```

**Delete a task** — `DELETE /api/tasks/:id`

## Testing with Postman / Thunder Client

1. Call `POST /api/auth/register` (or `/login`) → copy the `token` from the response.
2. For every `/api/tasks...` request, go to the **Headers** tab and add:
   - Key: `Authorization`
   - Value: `Bearer <paste your token here>`
3. Try creating a task, then fetching `/api/tasks` to confirm it only shows tasks for that logged-in user (register a second user and confirm they don't see the first user's tasks — this proves the access control works).

## Security Notes (useful for explaining the design)
- Passwords are never stored in plain text — hashed with **bcrypt** before saving.
- JWTs are signed with a server-side secret (`JWT_SECRET`) and expire after a set time (`JWT_EXPIRES_IN`), limiting damage if a token is leaked.
- Every task query/update/delete filters by `{ _id, owner: req.userId }` — even if a user guesses another user's task ID, they get a 404, not the data, because the `owner` field won't match.
- `middleware/auth.js` runs before every task route (`router.use(protect)`), so there's no route that accidentally skips authentication.

## Possible Extensions
- Pagination and filtering (`GET /api/tasks?status=pending&priority=high`)
- Refresh tokens for longer sessions without re-login
- Input validation library (e.g. Joi/Zod) for stricter request validation
- Role-based access (e.g. an admin who can see all users' tasks)
