# AI-Driven Learning Platform

A full-stack MVP learning platform where users select a subject, send prompts to an AI, receive generated lessons, and review their learning history. Administrators can view all registered users and their full prompt history.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 |
| Language | TypeScript 5.6 |
| Framework | Express 5 |
| Database | MongoDB 7 via Mongoose 9 |
| Authentication | JWT (jsonwebtoken) |
| AI Integration | OpenAI GPT-3.5-turbo (with offline fallback) |
| Frontend | Angular 20 + Angular Material |
| API Docs | Swagger / OpenAPI 3.0 |
| Testing | Jest + ts-jest |
| Containerisation | Docker + Docker Compose |

---

## Features

- **User registration & login** — learners register with ID, name, and phone (no password required)
- **Admin login** — administrators sign in with email and password
- **Category & sub-category selection** — users pick a subject area before generating a lesson
- **AI lesson generation** — prompts are sent to OpenAI GPT-3.5-turbo; an offline stub is used when no API key is provided
- **Learning history** — each user can view their own past lessons
- **Admin dashboard** — admins can view all registered users and the full global lesson log, paginated

---

## Architecture

The backend follows a clean layered structure:

```
Routes → Controllers → Services → Models (MongoDB)
```

- **Routes** — define HTTP endpoints and attach middleware
- **Controllers** — thin request/response handlers, no business logic
- **Services** — all business logic, DB queries, and AI provider calls
- **Models** — Mongoose schemas (User, Category, SubCategory, Prompt)
- **AI providers** — pluggable interface (`EducationalContentProvider`) with OpenAI and offline implementations

---

## Project Structure

```
AILearningPlatform/
├── Backend/
│   ├── src/
│   │   ├── config/          # Typed env readers
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/       # JWT guard, error handler
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic + AI providers
│   │   │   └── AI/          # OpenAI / offline implementations
│   │   ├── shared/          # HttpError, sanitisers, helpers
│   │   ├── types/           # Express augmentation, API contracts
│   │   ├── app.ts
│   │   └── seed.ts
│   ├── .env.example
│   └── Dockerfile
├── Frontend/                # Angular 20 SPA
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Database Schema

### Users
| Field | Type | Notes |
|-------|------|-------|
| _id | String | National ID |
| name | String | required |
| phone | String | required, unique |
| email | String | optional, unique (admin login) |
| password_hash | String | optional, bcrypt (admin only) |
| role | String | `user` \| `admin` |

### Categories
| Field | Type |
|-------|------|
| _id | ObjectId |
| name | String (unique) |

### SubCategories
| Field | Type |
|-------|------|
| _id | ObjectId |
| category_id | ObjectId → Category |
| name | String |

### Prompts
| Field | Type | Notes |
|-------|------|-------|
| _id | ObjectId | |
| user_id | String | ref → User |
| category_id | String | snapshot at request time |
| sub_category_id | String | snapshot at request time |
| prompt | String | learner's question |
| response | String | JSON-serialised AI lesson |
| content_origin | String | `live_model` \| `offline_stub` |
| created_at | Date | auto |

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- An OpenAI API key *(optional — offline stub works without one)*

### 1. Clone the repository

```bash
git clone https://github.com/MiriamGarfunkel/AILearningPlatform.git
cd AILearningPlatform
```

### 2. Configure environment variables

```bash
cp Backend/.env.example .env
```

Edit `.env` and set at minimum:

```env
JWT_SECRET=your-long-random-secret
```

### 3. Start the full stack

```bash
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| API | http://localhost:5000 |
| Swagger UI | http://localhost:5000/api-docs |
| MongoDB | localhost:27017 |

### 4. Seed the admin user

In a separate terminal, after the containers are running:

```bash
docker-compose exec api node dist/seed-admin.js
```

Admin credentials (from `.env`):
- **Email:** `admin@ailocal.test`
- **Password:** `AdminLocal#2026`

### 5. Stop

```bash
docker-compose down
```

---

## Environment Variables

Create a `.env` file at the project root (used by Docker Compose):

```env
# Required
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE=30d

# Optional — leave empty to use the offline stub
OPENAI_API_KEY=sk-...

# AI provider mode: auto | remote | offline
AI_PROVIDER_MODE=auto

# Admin seed credentials
ADMIN_EMAIL=admin@ailocal.test
ADMIN_PASSWORD=AdminLocal#2026
ADMIN_ID=900000001
ADMIN_NAME=<your-name>
ADMIN_PHONE=<your-phone>
```

---

## AI Provider Modes

| Mode | Behaviour |
|------|-----------|
| `auto` *(default)* | Uses OpenAI if `OPENAI_API_KEY` is set, otherwise falls back to offline stub |
| `remote` | Forces OpenAI; falls back to offline stub if key is missing |
| `offline` | Always uses the built-in offline stub — no external calls |

> The offline stub generates a personalised response based on the user's category, topic, and question — no API key required.

---

## API Endpoints

### Users — `/api/users`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | public | Register a new user |
| POST | `/login` | public | Login, returns JWT |
| GET | `/` | admin | List all users (paginated) |
| GET | `/:id` | user | Get user by ID |

### Categories — `/api/categories`
| Method | Path | Auth |
|--------|------|------|
| POST | `/` | public |
| GET | `/` | public |

### Sub-categories — `/api/sub-categories`
| Method | Path | Auth |
|--------|------|------|
| POST | `/` | public |
| GET | `/:categoryId` | public |

### AI / Lessons — `/api/ai`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/generate` | user | Generate AI lesson, saves to history |
| GET | `/history/:user_id` | user | Get learning history (self or admin) |
| GET | `/all` | admin | Get all prompts, paginated |

Full interactive docs: `http://localhost:5000/api-docs`

---

## Running Tests

```bash
cd Backend
npm install
npm test
```

---

## Assumptions

- Learners register and sign in with **ID + name + phone** (no password). JWTs are stateless with no revocation in this MVP.
- Administrators are bootstrapped via `npm run seed:admin` and sign in with **email + password**.
- The offline stub always returns an English lesson personalised to the user's category, topic, and question.
- `category_id` and `sub_category_id` on `Prompt` are stored as string snapshots so history stays accurate if catalog labels change later.
