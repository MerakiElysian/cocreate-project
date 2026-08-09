# CoCreate — Full-Stack Collaborative Platform

A complete, modular full-stack scaffold matching the "Create Together, Build Better" landing page, built with the requested stack:

**Frontend:** Next.js 14 (App Router) · Shadcn/UI-style components + Tailwind CSS · Redux Toolkit · Socket.IO client · React Hook Form + Zod

**Backend:** Node.js + TypeScript · Express.js · JWT auth · Socket.IO + Redis adapter · Multer + Sharp · modular routes/controllers/services

**Data layer:** PostgreSQL (via Prisma ORM) · Redis (cache + sessions + socket scaling) · Elasticsearch (search) · Cloudinary (file storage)

---

## 1. Project structure

```
cocreate-project/
├── frontend/                      # Next.js app
│   ├── app/                       # App Router pages (page.tsx, layout.tsx, login/)
│   ├── components/
│   │   ├── ui/                    # button.tsx, card.tsx (shadcn-style primitives)
│   │   └── sections/              # Navbar, Hero, Footer
│   ├── store/                     # Redux Toolkit store + slices
│   ├── hooks/                     # useSocket.ts
│   ├── lib/                       # utils.ts, socket.ts
│   ├── schemas/                   # Zod validation schemas
│   └── package.json
│
├── backend/                       # Express + TypeScript API
│   ├── src/
│   │   ├── config/                # env.ts, db.ts, redis.ts, elasticsearch.ts, cloudinary.ts
│   │   ├── middlewares/           # auth, validate, error, rateLimiter, upload
│   │   ├── modules/
│   │   │   ├── auth/              # routes → controller → service → validation
│   │   │   ├── users/
│   │   │   ├── projects/
│   │   │   ├── search/            # Elasticsearch-backed search
│   │   │   ├── uploads/           # Multer + Sharp + Cloudinary
│   │   │   └── chat/              # Socket.IO event handlers
│   │   ├── sockets/                # Socket.IO server bootstrap + Redis adapter
│   │   ├── utils/                  # logger, jwt, apiError, apiResponse
│   │   ├── app.ts                  # Express app wiring
│   │   └── server.ts               # Entry point
│   ├── prisma/schema.prisma        # User, Project, ProjectCollaborator, RefreshToken
│   └── package.json
│
└── docker-compose.yml              # Postgres + Redis + Elasticsearch + backend + frontend
```

---

## 2. Prerequisites

- Node.js **v20+** and npm
- Docker + Docker Compose (recommended, for Postgres/Redis/Elasticsearch)
- A free [Cloudinary](https://cloudinary.com) account (for image uploads) — optional to start

---

## 3. Quick start with Docker (recommended)

This spins up Postgres, Redis, Elasticsearch, the backend API, and the frontend all together.

```bash
# 1. Clone/unzip the project and move into it
cd cocreate-project

# 2. (optional) create a root .env to override JWT secrets / Cloudinary creds
cat > .env << 'EOF'
JWT_ACCESS_SECRET=your_long_random_access_secret
JWT_REFRESH_SECRET=your_long_random_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EOF

# 3. Build and start every service
docker compose up --build

# 4. Run Prisma migrations against the Dockerized Postgres (in a new terminal)
docker compose exec backend npx prisma migrate deploy
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:5000/health
- Elasticsearch → http://localhost:9200

---

## 4. Manual local setup (without Docker)

### 4.1 Install PostgreSQL, Redis, Elasticsearch locally
Or run just the data layer with Docker while running the apps natively:

```bash
docker compose up -d postgres redis elasticsearch
```

### 4.2 Backend setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and fill in real values
cp .env.example .env

# Generate the Prisma client
npm run prisma:generate

# Run database migrations (creates tables)
npm run prisma:migrate

# Start the dev server (ts-node + nodemon, hot reload)
npm run dev
```

The API will run on **http://localhost:5000**, with these route groups:

| Method | Route                                    | Description                     |
|--------|-------------------------------------------|----------------------------------|
| POST   | `/api/auth/register`                      | Create account                  |
| POST   | `/api/auth/login`                         | Log in                          |
| POST   | `/api/auth/refresh`                       | Refresh access token            |
| POST   | `/api/auth/logout`                        | Revoke refresh token            |
| GET    | `/api/users/me`                           | Current user profile            |
| PATCH  | `/api/users/me`                           | Update profile                  |
| GET    | `/api/users`                              | List users                      |
| POST   | `/api/projects`                           | Create project                  |
| GET    | `/api/projects`                           | List my projects                |
| GET    | `/api/projects/:id`                       | Get project detail              |
| PATCH  | `/api/projects/:id`                       | Update project                  |
| DELETE | `/api/projects/:id`                       | Delete project                  |
| POST   | `/api/projects/:id/collaborators`         | Add collaborator                |
| DELETE | `/api/projects/:id/collaborators/:userId` | Remove collaborator             |
| GET    | `/api/search/projects?q=`                 | Search projects (Elasticsearch) |
| GET    | `/api/search/users?q=`                    | Search users (Elasticsearch)    |
| POST   | `/api/uploads/image`                      | Upload + optimize image         |

Socket.IO runs on the same HTTP server/port, authenticated via JWT passed as `auth: { token }`.

### 4.3 Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start the dev server
npm run dev
```

The site will run on **http://localhost:3000** and matches the provided design (logo, hero headline with gradient text, CTA buttons, and the three feature cards: Collaborate / Innovate / Succeed).

---

## 5. Environment variables reference

### backend/.env
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cocreate
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
JWT_ACCESS_SECRET=replace_with_a_long_random_string
JWT_REFRESH_SECRET=replace_with_another_long_random_string
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:3000
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 6. Useful backend commands

```bash
npm run dev              # start dev server with hot reload
npm run build             # compile TypeScript to dist/
npm start                 # run compiled build
npm run prisma:generate   # regenerate Prisma client after schema changes
npm run prisma:migrate    # create + apply a new migration
npm run prisma:studio     # open Prisma Studio GUI to browse the DB
npm run lint               # lint the codebase
```

## 7. Useful frontend commands

```bash
npm run dev     # start Next.js dev server
npm run build    # production build
npm start        # run production build
npm run lint      # lint the codebase
```

---

## 8. Architecture notes

- **Modular backend:** each domain (`auth`, `users`, `projects`, `search`, `uploads`, `chat`) is self-contained with its own `routes → controller → service` layers, so any module can be extracted into its own microservice later with minimal changes — just move the folder, give it its own `server.ts`/`package.json`, and point an API gateway or the frontend at its own port.
- **Auth:** access + refresh JWT pattern. Refresh tokens are persisted in Postgres so they can be revoked; access tokens are short-lived and stateless.
- **Real-time:** Socket.IO is authenticated via JWT on the handshake and uses the `@socket.io/redis-adapter` so it can scale horizontally across multiple Node instances behind a load balancer.
- **Caching:** Redis caches hot reads (e.g. user profiles) with short TTLs and is invalidated on writes.
- **Search:** Elasticsearch indices are created on boot; projects/users are indexed on write so `/api/search/*` can do fuzzy multi-field search.
- **Uploads:** images are streamed through Multer (memory storage) → optimized/resized/converted to WebP with Sharp → uploaded to Cloudinary, keeping the API stateless (no local disk writes).
