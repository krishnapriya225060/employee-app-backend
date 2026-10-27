# Employee App backend

This backend serves the supplied frontend build and exposes the employee CRUD API at `/api/employeelist`.

## Setup

1. Install Node.js (18 or newer).
2. Run `npm install` in this folder.
3. Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB Atlas connection string. Replace the placeholders with your Atlas database username, password, cluster host, and database name. Do not commit `.env`.
4. In MongoDB Atlas, allow your development machine's IP address in Network Access and create a database user with read/write access to the chosen database.
5. Run `npm start`, then open `http://localhost:3000`.

The API endpoints are `GET /api/employeelist`, `GET /api/employeelist/:id`, `POST /api/employeelist`, `PUT /api/employeelist` (include the employee `_id` in the body), and `DELETE /api/employeelist/:id`.

The supplied files in `dist/` are kept unchanged. Employee records are stored in the MongoDB collection `employees`.
