# Student Information API

A RESTful backend API and interactive CRUD web client built with Node.js, Express, TypeScript, and PostgreSQL (Supabase / local Docker) for **ITE 303 — Web Systems and Technologies 2**.

## Features

- Interactive CRUD Web User Interface (Create, Read, Update, Delete)
- Health Check and System Status monitoring (`GET /health`)
- Read all student records (`GET /students`)
- Read a single student record by ID (`GET /students/:id`)
- Create a new student record (`POST /students`)
- Update an existing student record (`PUT /students/:id`)
- Delete a student record with confirmation (`DELETE /students/:id`)

## CRUD Demo UI

A lightweight, responsive web client is bundled with the server to demonstrate all four CRUD operations without external frontend framework dependencies:

- **Files Location**:
  - `public/index.html`: Responsive interface with forms, tables, modals, and toasts.
  - `public/css/styles.css`: Clean, accessible styling with high contrast and focus states.
  - `public/js/api.js`: Decoupled API service module handling HTTP requests.
  - `public/js/app.js`: Application controller managing state, DOM events, and validations.

### How to Run the Demo

1. Start the server (via `pnpm dev`, Docker, or Render):
   ```bash
   pnpm dev
   ```
2. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```
3. Test the operations:
   - **Read**: Records are automatically fetched on page load and displayed in the table.
   - **Create**: Fill in the "Add New Student" form and click **Add Student**. The new record appears in the list instantly.
   - **Update**: Click **Edit** on any student row. The form pre-fills with existing data. Modify fields and click **Update Student**.
   - **Delete**: Click **Delete** on any row. A confirmation modal will appear to confirm deletion before removing the record.

## Local Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy `.env.example` to `.env` and add your private Supabase PostgreSQL connection string.
3. Start the development server:
   ```bash
   pnpm dev
   ```

## Running with Docker

### 1. Environment Preparation
Copy the example environment file:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

By default, `.env.example` is configured to connect to the local containerized PostgreSQL database (`db:5432`). If you prefer using your remote Supabase instance, update `DATABASE_URL` in `.env`.

### 2. Development Mode (with Live Hot-Reloading)
- **Start the stack** (builds images and runs the API and PostgreSQL in background):
  ```bash
  docker compose up -d
  ```
- **View real-time logs**:
  ```bash
  docker compose logs -f
  # or specifically for the api service:
  docker compose logs -f api
  ```
- **Rebuild images** (e.g., after installing new packages in `package.json`):
  ```bash
  docker compose up --build -d
  ```
- **Stop the stack**:
  ```bash
  docker compose down
  ```
- **Reset database and volumes** (wipes persistent database data):
  ```bash
  docker compose down -v
  ```

### 3. Production Mode
The production setup uses a multi-stage Docker build targeting the lightweight Alpine runner image with no source mounts or dev dependencies:
- **Build and start production stack**:
  ```bash
  docker compose -f docker-compose.prod.yml up --build -d
  ```
- **Check service health & status**:
  ```bash
  docker compose -f docker-compose.prod.yml ps
  ```
- **Stop production stack**:
  ```bash
  docker compose -f docker-compose.prod.yml down
  ```

## Deploying to Render

This project is configured for deployment to [Render](https://render.com) as a **Web Service**.

### Required Environment Variables
| Variable | Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `22` |
| `DATABASE_URL` | Your Supabase (or Render Postgres) connection string (e.g. `postgresql://...`) |

### Method 1: Deploy with Render Blueprint (Recommended)
This repository includes a `render.yaml` blueprint file for zero-config setup.
1. In the Render Dashboard, click **New +** and select **Blueprint**.
2. Connect your repository.
3. Render reads `render.yaml` and prepares the `student-api` service.
4. When prompted, enter your `DATABASE_URL` (your Supabase PostgreSQL URL).
5. Click **Apply**. Render will automatically build, deploy, and verify the health check.

### Method 2: Manual Web Service Setup
If creating the service manually in the Render dashboard:
1. Click **New +** -> **Web Service** and connect your GitHub repository.
2. Configure the following service settings:
   - **Name**: `student-api`
   - **Runtime**: `Node`
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     pnpm install --prod=false && pnpm run build
     ```
   - **Start Command**:
     ```bash
     pnpm start
     ```
   - **Health Check Path**: `/health`
3. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `NODE_VERSION`: `22`
   - `DATABASE_URL`: `your_supabase_postgresql_connection_string`
4. Click **Deploy Web Service**.

### Redeploying
- **Automatic**: Pushes to the `main` branch automatically trigger a new deployment.
- **Manual**: In the Render dashboard, open your service and click **Manual Deploy** -> **Deploy latest commit** or **Clear build cache & deploy**.

## API Endpoints

| Method | Endpoint | Description | Success Status |
| --- | --- | --- | --- |
| `GET` | `/` | Web UI (HTML) or status check | `200 OK` |
| `GET` | `/health` | Health check endpoint | `200 OK` |
| `GET` | `/students` | Retrieve all student records | `200 OK` |
| `GET` | `/students/:id` | Retrieve one student by ID | `200 OK` |
| `POST` | `/students` | Create a new student record | `201 Created` |
| `PUT` | `/students/:id` | Replace all editable fields of a student | `200 OK` |
| `DELETE` | `/students/:id` | Delete a student record by ID | `200 OK` |

### Created By
Student for demonstrating a CRUD, Github and GIT useage.
