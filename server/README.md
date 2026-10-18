# Merkle Games API

Welcome to the games DB assignment. As this repo serves as a foundation for multiple frontend technical assignments, it includes a backend RESTful API, GraphQL, GraphQL Playground, database schema, and documentation to help you get started quickly.

## Getting Started

### Prerequisites
- Docker and Docker Compose installed on your machine. ([Docker Installation Guide](https://docs.docker.com/get-docker/)
- Alternatively, Podman can be used as a drop-in replacement for Docker.

### Running the Application

```bash
cp .env.example .env   # Optional: customize environment variables
docker-compose up --build
```

**API Endpoints:**
- **REST API**: `http://localhost:8000/api/v1`
- **GraphQL**: `http://localhost:8000/graphql`
- **GraphQL Playground**: `http://localhost:8000/graphql-sandbox`
- **Swagger Documentation**: `http://localhost:8000/api-docs`
- **Media Generator**: `http://localhost:8000/media/{seed}?w=400&h=300`

## For Frontend Developers

**Add your frontend project to the `client/` folder.**

Build a frontend application (Next.js, Nuxt, React, Vue, etc.) that connects to this API to display games, reviews, companies, and genres.

**Available Data:**
- 520 games
- 200 companies (developers/publishers)
- 30 genres
- 2400 user reviews
- 1038 images

**Documentation:**
- REST API: Visit the [Swagger UI](http://localhost:8000/api-docs) for interactive documentation
- GraphQL: Use the [GraphQL Playground](http://localhost:8000/graphql-sandbox) to explore the schema

## Prerequisites

- Docker and Docker Compose
- That's it!

## Database Access (Optional)

**Database Type:** SQLite

**File Location:** `./server/data/gameapi.sqlite`

**Compatible Tools:** DB Browser for SQLite, TablePlus, DBeaver, DataGrip

## Docker/Podman Commands

# Stopping the Application
```bash
# From the server/ directory
# cd server

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

---

## Additional Information

### Database Schema

- `games` - Video game information
- `companies` - Developers and publishers
- `genres` - Game categories
- `users` - User profiles
- `user_reviews` - Ratings and reviews
- `images` - Screenshots and covers
- `image_relations` - Polymorphic image relationships

### Local Development (Without Docker)

```bash
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

### Testing

```bash
npm test              # All tests
npm run test:coverage # Coverage report
npm run test:rest     # REST tests only
npm run test:graphql  # GraphQL tests only
```

### Unstable Mode

The API can be put into an "unstable" mode that randomly fails requests so you can exercise your frontend's error handling, retries, and loading states. Documentation (`/api-docs`, `/graphql-sandbox`), `/health`, and the toggle endpoints themselves are never affected.

When a request is selected to fail, the failure is one of three randomly chosen modes:
- **500 error** — body is `{ error: { message, status, simulated: true, source: 'unstable-mode' } }`, response carries an `X-Unstable-Mode: simulated-failure` header
- **Hang/timeout** — request hangs for 5–10s, then resolves with a 504 marked the same way (`simulated: true` + `X-Unstable-Mode` header)
- **Dropped connection** — TCP socket is destroyed before any bytes are sent; the client sees a raw network error (`ECONNRESET` / empty reply) with no marker. This one is indistinguishable from real network failures by design

**Start the server with unstable mode already on (5% default failure rate, all modes, all endpoints):**

```bash
npm run dev:unstable      # development (ts-node + nodemon)
npm run start:unstable    # production (built JS)
```

Or pass `UNSTABLE_MODE=true` to any boot command, including `docker-compose`.

**Toggle at runtime:**

| Endpoint | Effect |
| --- | --- |
| `GET /admin/unstable-mode-on` | Enable unstable mode (with optional query params, see below) |
| `GET /admin/unstable-mode-off` | Disable unstable mode and **reset config to defaults** |
| `GET /admin/unstable-mode` | Current status + active config + usage examples |

**Configure via query params on `/admin/unstable-mode-on`:**

| Param | Type | Default | Valid values |
| --- | --- | --- | --- |
| `errorRate` | float | `0.05` | `0` – `0.9` |
| `failureModes` | comma list | all three | any non-empty subset of `error500`, `hang`, `dropConnection` |
| `endpoints` | string | `all` | `all`, `images-only` (only `/media` fails), `apis-only` (only `/api/v1` and `/graphql` fail) |

Any invalid param returns `400` and does **not** change state.

**Examples:**

```bash
# Default config (5% errors, all modes, all endpoints)
curl http://localhost:8000/admin/unstable-mode-on

# 30% error rate, only 500s and hangs, all endpoints
curl 'http://localhost:8000/admin/unstable-mode-on?errorRate=0.3&failureModes=error500,hang'

# Break only the image endpoint
curl 'http://localhost:8000/admin/unstable-mode-on?endpoints=images-only'

# Hammer the data APIs hard
curl 'http://localhost:8000/admin/unstable-mode-on?errorRate=0.5&endpoints=apis-only'

# Disable everything and reset config
curl http://localhost:8000/admin/unstable-mode-off
```

State is in-memory and resets to the env-var default on restart.

### Media/Image Generator

The API includes a deterministic pattern generator for placeholder images. Image URLs are provided in the API responses and can be used directly in your frontend application.

**Endpoint:** `GET /media/:seed?w=400&h=300`

Images are returned in WebP format with caching headers. The same seed always produces the same pattern for consistency.

### Project Structure

```
game-api/
├── client/             # Your frontend project goes here
└── server/             # Backend API
    ├── src/
    │   ├── config/         # Database config
    │   ├── controllers/    # REST controllers
    │   ├── graphql/        # GraphQL schema
    │   ├── models/         # Sequelize models
    │   ├── routes/         # API routes
    │   ├── utils/          # Utilities (pattern generator)
    │   └── index.ts        # Entry point
    ├── scripts/            # Seed generation
    ├── seeders/            # Database seeders
    ├── migrations/         # Migrations
    ├── tests/              # Test suites
    ├── public/             # GraphQL Playground
    ├── data/               # SQLite database
    └── docker-compose.yml  # Docker config
```
