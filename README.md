# Fullstack Ecommerce (Node + MongoDB + React JSX)

## Prerequisites

- Node.js installed
- MongoDB running locally on your PC

## Setup

### 1) Backend env

Copy the example env and edit if needed:

```bash
cd server
copy .env.example .env
```

Default local MongoDB URI is:

- `mongodb://127.0.0.1:27017/ecommerce`

### 2) Install deps

```bash
cd server
npm install

cd ..\web
npm install
```

## Run (dev)

From the repo root (`fullstack/`):

```bash
npm run dev
```

- API: `http://localhost:5000/api/health`
- Web: `http://localhost:3000`

## API routes (current)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (Bearer token)
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin, Bearer token)
- `POST /api/orders` (Bearer token)
- `GET /api/orders/mine` (Bearer token)

