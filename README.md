# AI Learning Platform

A minimal MVP learning platform that lets users pick a subject, send prompts to an AI, receive generated lessons, and review their learning history. Admins can view all users and their full prompt history.

---

## Technologies Used

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Language | TypeScript 5.6 |
| Framework | Express 5 |
| Database | MongoDB 7 via Mongoose 9 |
| Authentication | JWT (jsonwebtoken) |
| AI Integration | OpenAI GPT-3.5-turbo (with offline fallback) |
| API Docs | Swagger / OpenAPI 3.0 (swagger-jsdoc + swagger-ui-express) |
| Testing | Jest + ts-jest |
| Containerisation | Docker + Docker Compose |

---

## Project Structure

```
AILearningPlatform/
├── .env.example            # minimal vars for Docker Compose interpolation
├── Backend/
│   ├── src/
│   │   ├── config/          # typed env readers (Mongo URI, port, JWT, AI mode)
│   │   ├── controllers/     # request handlers (thin layer)
│   │   ├── middleware/       # JWT guard, global error handler
│   │   ├── models/          # Mongoose schemas (User, Category, SubCategory, Prompt)
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic + AI providers
│   │   │   └── AI/          # EducationalContentProvider interface + OpenAI / offline implementations
│   │   ├── shared/          # HttpError, input sanitisers, text helpers
│   │   ├── types/           # Express augmentation, API contracts
│   │   ├── app.ts           # Express app entry point
│   │   └── seed.ts          # Optional DB seed script
│   ├── .env.example
│   ├── Dockerfile
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
├── Frontend/
├── docker-compose.yml
└── README.md
```

---

## Database Models

### Users
| Field | Type | Notes |
|-------|------|-------|
| _id | String | National ID or custom string primary key |
| name | String | required |
| phone | String | required, unique |
| email | String | optional, unique when set (admin email login) |
| password_hash | String | optional, select:false (bcrypt; admin sign-in) |
| role | String | `user` \| `admin`, default `user` |
| created_at / updated_at | Date | automatic |

### Categories
| Field | Type | Notes |
|-------|------|-------|
| _id | ObjectId | auto |
| name | String | required, unique |

### SubCategories
| Field | Type | Notes |
|-------|------|-------|
| _id | ObjectId | auto |
| category_id | ObjectId | ref → Category |
| name | String | required |

### Prompts
| Field | Type | Notes |
|-------|------|-------|
| _id | ObjectId | auto |
| user_id | String | ref → User |
| category_id | String | category at time of request |
| sub_category_id | String | sub-category at time of request |
| prompt | String | learner's question (max 8 000 chars) |
| response | String | JSON-serialised AI lesson |
| content_origin | String | `live_model` \| `offline_stub` |
| created_at | Date | auto timestamp |

---

## API Endpoints

### Users — `/api/users`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | public | Register a new user, returns JWT |
| POST | `/login` | public | Login, returns JWT |
| GET | `/` | admin | List all users (paginated) |
| GET | `/:id` | user | Get user by ID |

### Categories — `/api/categories`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | public | Create category (idempotent) |
| GET | `/` | public | List all categories |

### Sub-categories — `/api/sub-categories`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | public | Create sub-category |
| GET | `/:categoryId` | public | List sub-categories for a category |

### AI / Lessons — `/api/ai`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/generate` | user | Generate AI lesson, saves to history |
| GET | `/history/:user_id` | user | Get learning history for a user (self only unless `role=admin`) |
| GET | `/all` | admin | Get all prompts, paginated |

Full interactive docs available at `http://localhost:5000/api-docs` when the server is running.

---

## AI Provider Toggle

The platform supports three modes, controlled by the `AI_PROVIDER_MODE` environment variable:

| Mode | Behaviour |
|------|-----------|
| `auto` (default) | Uses OpenAI if `OPENAI_API_KEY` is set, otherwise falls back to the offline stub |
| `remote` | Forces OpenAI. Falls back to offline stub if key is missing |
| `offline` | Always uses the built-in offline stub — no external calls |

---

## Working Assumptions

- **Learners** register with `id`, `name`, and `phone` (no password). They sign in with the same three fields; JWTs are stateless with no revocation in this MVP.
- **Administrators** are bootstrapped via `npm run seed:admin` using `ADMIN_*` variables in `.env` (email + password + profile fields). Admins sign in with **email and password** or with the same national-ID flow as learners if configured.
- **English-only policy**: UI copy and mock/offline lesson payloads are English. Persisted lessons are sanitized server-side to strip Hebrew script; catalog seed `npm run seed:catalog:english` resets categories to English labels when needed.
- `category_id` and `sub_category_id` on `Prompt` are stored as string snapshots at request time so history stays accurate if catalog labels change later.
- Docker Compose is the recommended way to run MongoDB (and optionally the full stack) locally.

---

## Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for the Docker path)
- An OpenAI API key (optional — the offline stub works without one)

---

## Running Locally (without Docker)

### 1. Install dependencies

```bash
cd Backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
MONGO_URI=mongodb://localhost:27017/ai_learning
PORT=5000
JWT_SECRET=your-long-random-secret
JWT_EXPIRE=30d
OPENAI_API_KEY=sk-...        # leave empty to use offline stub
AI_PROVIDER_MODE=auto
```

### 3. Start MongoDB

Make sure a local MongoDB instance is running on port `27017`, or start one with Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo:7
```

### 4. (Optional) Seed the database

```bash
npx ts-node src/seed.ts
```

### 5. Start the development server

```bash
npm run dev
```

The API is now available at `http://localhost:5000`.
Swagger UI is at `http://localhost:5000/api-docs`.

---

## Running with Docker Compose (recommended)

This starts MongoDB, the API server, and the frontend together.

### 1. Configure environment

Create a `.env` file at the project root (Docker Compose reads it for variable substitution). The simplest approach is to copy the backend template, then ensure at least `JWT_SECRET` is set:

```bash
cp Backend/.env.example .env
```

The `api` service in `docker-compose.yml` sets `MONGO_URI` to the `mongo` container, overriding a localhost value from the file when you use Compose.

### 2. Build and start

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| API | http://localhost:5000 |
| Swagger UI | http://localhost:5000/api-docs |
| Frontend | http://localhost:8080 |
| MongoDB | localhost:27017 |

### 3. Stop

```bash
docker-compose down
```

To also remove the database volume:

```bash
docker-compose down -v
```

---

## Running Tests

```bash
cd Backend
npm test
```

To watch for changes:

```bash
npm run test:watch
```

---

## Building for Production

```bash
cd Backend
npm run build       # compiles TypeScript → dist/
npm start           # runs dist/app.js
```
