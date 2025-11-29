# Rebom - Australian Weather Data Platform

Rebom is a modern weather application that ingests and displays Australian weather data from the Bureau of Meteorology (BOM). It leverages Cloudflare's edge network and D1 database for high performance and scalability.

## 🛠 Tech Stack

- **Framework**: [Astro](https://astro.build/)
- **UI Library**: [Svelte](https://svelte.dev/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd rebom
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## 💻 Development

### Running the Frontend

Start the Astro development server to work on the UI:

```bash
npm run dev
```

The application will be available at `http://localhost:4321`.

### Running the Backend (Ingestion Worker)

To test the data ingestion worker locally, you can use the test worker script. This runs a local instance of the Cloudflare Worker.

**Local D1 Database:**

```bash
npx wrangler dev src/test-worker.ts --local --port 8788
```

**Remote D1 Database:**

To run the worker locally but connect to the remote production D1 database (requires Cloudflare authentication):

```bash
npx wrangler dev src/test-worker.ts --remote --port 8788
```

### Triggering Data Ingestion

Once the worker is running (on port 8788), you can trigger the BOM data ingestion process manually:

```bash
curl http://localhost:8788/test-ingest
```

This will fetch the latest Precis data from BOM and populate your D1 database.

## 🧪 Testing

The project includes both unit tests (Vitest) and end-to-end tests (Playwright).

**Run all tests:**
```bash
npm test
```

**Run unit tests only:**
```bash
npm run test:unit
```

**Run E2E tests only:**
```bash
npm run test:e2e
```

## � Deployment

The deployment process is automated via the `deploy` script, which builds the application, applies database migrations, and deploys to Cloudflare.

```bash
npm run deploy
```

This command executes:
1. `astro build`: Builds the static assets and worker code.
2. `wrangler d1 migrations apply`: Applies any pending SQL migrations to the remote D1 database.
3. `wrangler deploy`: Deploys the worker and assets to Cloudflare.
