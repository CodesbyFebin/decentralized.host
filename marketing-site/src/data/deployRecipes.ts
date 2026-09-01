import { DeployRecipe } from '../types';

export const DEPLOY_RECIPES: DeployRecipe[] = [
  {
    id: 'deploy-fastapi',
    name: 'Python FastAPI',
    slug: 'fastapi',
    category: 'backend-api',
    runtime: 'Python 3.11+ / Uvicorn',
    claimStatus: 'IMPLEMENTED',
    autoDetectFiles: ['main.py', 'requirements.txt', 'pyproject.toml'],
    prerequisites: [
      'FastAPI application with uvicorn entrypoint in main.py or app/main.py',
      'requirements.txt containing `fastapi` and `uvicorn[standard]`',
      'dhost CLI installed locally (see Quick Start: git clone + `pip install -e ./cli`)'
    ],
    dockerfileSnippet: `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
    steps: [
      'Initialize dhost configuration in your project root: `dhost init`',
      'Verify auto-detected FastAPI framework and exposed port (8000)',
      'Deploy to the active node mesh: `dhost ship`',
      'Access your live Swagger docs at `https://<app>.decentralized.host/docs`'
    ]
  },
  {
    id: 'deploy-nextjs',
    name: 'Next.js (SSR & Standalone)',
    slug: 'nextjs',
    category: 'web-framework',
    runtime: 'Node.js 20+ / Standalone Server',
    claimStatus: 'IMPLEMENTED',
    autoDetectFiles: ['package.json', 'next.config.js', 'next.config.mjs'],
    prerequisites: [
      'Next.js 13/14/15 project with `output: "standalone"` enabled in next.config',
      'package.json with build script `next build`',
      'Target domain or cluster subdomain configured'
    ],
    dockerfileSnippet: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]`,
    steps: [
      'Add `output: "standalone"` inside your `next.config.js` or `next.config.mjs`',
      'Run `dhost init` to generate the multi-stage build recipe',
      'Run `dhost ship` to build and deploy across worker nodes with automatic Traefik SSL',
      'Inspect streaming server logs with `dhost logs nextjs-app --tail 50`'
    ]
  },
  {
    id: 'deploy-docker',
    name: 'Custom Dockerfile / Container',
    slug: 'docker-container',
    category: 'backend-api',
    runtime: 'Any Linux OCI Container',
    claimStatus: 'IMPLEMENTED',
    autoDetectFiles: ['Dockerfile', 'docker-compose.yml'],
    prerequisites: [
      'Valid Dockerfile in repository root exposing an HTTP service port',
      'No privileged kernel requirements (runs inside standard Docker isolation)'
    ],
    dockerfileSnippet: `# Multi-stage custom build example (Go, Rust, C#, Ruby, PHP)
FROM alpine:3.19
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY my-binary /app/
EXPOSE 8080
ENTRYPOINT ["/app/my-binary"]`,
    steps: [
      'Ensure your `Dockerfile` defines `EXPOSE <port>` and valid `CMD`/`ENTRYPOINT`',
      'Run `dhost ship` — the scheduler assigns the build to the node agent with the most free memory',
      'The node agent builds the container, registers it with Traefik, and starts health monitoring'
    ]
  },
  {
    id: 'deploy-express',
    name: 'Node.js & Express API',
    slug: 'nodejs',
    category: 'backend-api',
    runtime: 'Node.js 20 LTS',
    claimStatus: 'IMPLEMENTED',
    autoDetectFiles: ['package.json', 'server.js', 'app.js', 'index.js'],
    prerequisites: [
      'Node.js project with `start` script in package.json',
      'Server listens on `process.env.PORT || 3000`'
    ],
    dockerfileSnippet: `FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`,
    steps: [
      'Initialize config with `dhost init`',
      'Deploy with `dhost ship`',
      'Add custom environment variables with `dhost env set JWT_SECRET=...`'
    ]
  },
  {
    id: 'deploy-django',
    name: 'Python Django & Gunicorn',
    slug: 'django',
    category: 'web-framework',
    runtime: 'Python 3.11 / Gunicorn',
    claimStatus: 'IMPLEMENTED',
    autoDetectFiles: ['manage.py', 'requirements.txt'],
    prerequisites: [
      'Django project with `wsgi.py`',
      'requirements.txt containing `django`, `gunicorn`, and database adapters'
    ],
    dockerfileSnippet: `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput
EXPOSE 8000
CMD ["gunicorn", "myproject.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]`,
    steps: [
      'Link PostgreSQL database credentials into environment variables',
      'Run `dhost ship` to execute collectstatic and launch Gunicorn workers'
    ]
  },
  {
    id: 'deploy-static',
    name: 'Static Site (HTML / Astro / Vite / React)',
    slug: 'static-site',
    category: 'static-site',
    runtime: 'Nginx Alpine Edge',
    claimStatus: 'IMPLEMENTED',
    autoDetectFiles: ['index.html', 'astro.config.mjs', 'vite.config.ts'],
    prerequisites: [
      'Static build directory (`dist/` or `build/` or raw HTML/CSS/JS)'
    ],
    dockerfileSnippet: `FROM nginx:alpine
COPY ./dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,
    steps: [
      'Build your static output (`npm run build`) or push raw HTML',
      'Run `dhost ship` to launch a high-performance Nginx static web server with automated gzip and cache headers'
    ]
  },
  {
    id: 'deploy-postgres',
    name: 'PostgreSQL Datastore',
    slug: 'postgresql',
    category: 'database',
    runtime: 'PostgreSQL 16 Alpine',
    claimStatus: 'IMPLEMENTED',
    autoDetectFiles: [],
    prerequisites: [
      'Persistent volume directory configured on target node',
      'Strong database password'
    ],
    dockerfileSnippet: `# Pre-configured official image
FROM postgres:16-alpine
ENV POSTGRES_DB=app_db
ENV POSTGRES_USER=dhost_user
EXPOSE 5432`,
    steps: [
      'Deploy the database service: `dhost ship --config dhost.postgres.yml`',
      'Connect internal applications using the node agent private network bridge'
    ]
  }
];
