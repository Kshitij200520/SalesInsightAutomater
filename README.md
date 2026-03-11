# Sales Insight Automator (Engineer's Log)

## 📖 Project Overview
The **Sales Insight Automator** is a production-ready, full-stack Quick-Response tool built for AI Cloud DevOps environments. It empowers sales and executive teams to upload large amounts of quarterly data (CSV or Excel formats), automatically parse it for key metrics, and use the Google Gemini 1.5 Flash AI Engine to generate a professional, polished executive summary. This summary is instantly compiled and emailed directly to the requester's inbox.

---

## 🏗 System Architecture
The application runs as a decoupled client-server architecture containing three core workflows optimized for containerized scaling:
- **Client (Frontend)**: A React Single Page Application (SPA), styled with modern, premium glassmorphism aesthetics. Deployed directly to Edge CDNs.
- **Microservice (Backend)**: An Express API utilizing Memory-Stream uploads, Data parsing, and LLM integrations. Designed to operate statelessly within Docker containers, ideal for scalable orchestrators like Render or ECS.
- **Intelligence Layer**: Native integration with Google Generative AI (Gemini) strictly through server-side environment bindings preventing key leakage. 

---

## 🛠 Technology Stack
- **Frontend**: React (Vite.js build environment), Lucide-React (Iconography), Vanilla CSS (Glassmorphism & Micro-animations)
- **Backend**: Node.js, Express.js, `multer` (Upload streams), `googleapis` (AI Engine), `nodemailer` (SMTP Email)
- **Security Protocols**: `cors`, `dotenv`, `express-rate-limit`
- **DevOps**: Docker, Docker Compose, GitHub Actions (CI/CD workflows), Alpine OS Node.js binaries.

---

## 🔌 API Endpoints
Comprehensive documentation is generated dynamically in open API spec via Swagger. You can access the UI at `/docs`.

**`POST /analyze`**
- **Description**: Securely accepts multipart/form-data for analysis. parses sales data, generates summary, and triggers email.
- **Requires Content-Type**: `multipart/form-data`
- **Body Forms**:
  - `email` (string, email format): The target recipient.
  - `file` (binary blob): Restricted strictly to `text/csv`, `.xlsx` file streams.
- **Success Response (200)**: Analysis Success payload marking completion boundaries.

**`GET /`**
- **Description**: Health check bounding endpoint for load balancers.

---

## 🧠 AI Summary Generation Flow
1. **Extraction**: `multer` caches the uploaded byte-stream natively in protected server RAM. `csv-parser` / `xlsx` safely interprets the rows.
2. **Transformation**: The Backend strips invalid data and compiles heavy numeric tracking variables (e.g. Best Performing Region, Top Products, Total Revenue).
3. **Generation**: The compiled array metrics are structured and injected into a strict `System Prompt` specifically designed for Executive data scientists. This payload is asynchronously shot to Google Gemini 1.5 Flash.
4. **Resolution**: The AI stream resolves a professional briefing.

---

## 🛡 Security Measures
Securing the API was prioritized against data poisoning and server instability:
1. **File Type Validation**: Hardcoded MIME-type validation actively blocks script hijacking by dropping all non `.csv` or `.xlsx` structures.
2. **Memory Barriers (Payload Limits)**: Capped global file executions at `5MB` ensuring large, malicious infinite datasets cannot trigger OOM (Out-of-memory) errors killing backend nodes.
3. **Rate Limiting**: Native `express-rate-limit` implementation blocks recursive payload dumping limiting single IP clusters to 100 requests per 15 minutes.
4. **CORS Restrictions**: Blocks unknown external DOM requests from reading the API interface ensuring requests route natively from tracked environments.
5. **Environment Loading**: Secret injection natively through standard `.env` patterns.

---

## 🐳 Docker Setup Instructions
The application runs entirely via containers, making environment-setup localized and instant. 
To launch locally:
1. Copy `.env.example` internally: `cp backend/.env.example backend/.env`
2. Spin up the orchestrator: 
   ```bash
   docker-compose up --build
   ```
Both Backend API (`localhost:8000`) and modern UI (`localhost:3000`) launch synchronously interacting securely over a shared Docker Network. 

---

## 🚀 CI/CD Pipeline Explanation
A GitHub Actions automated pipeline exists structurally at `.github/workflows/ci.yml`. This enforces build stability standards before production code reaches the `main` branch.
1. **Linting Check**: Boots an isolated Ubuntu runner installing Node.js `18`, verifies dependencies cleanly map in the lockfile, and runs `eslint` testing frontend/backend environments checking for syntax violations or undefined components. 
2. **Static Compilation Check**: Verifies the frontend Vite ecosystem can successfully compile optimizing into a production distribution folder (`dist/`).
3. **Docker Stage Check**: Probes the `docker-compose.yml` build configurations ensuring images can be successfully fetched and synthesized (eliminating broken imports natively).

---

## ☁️ Deployment Instructions

### Backend → Render
Render reads optimized server instances smoothly:
1. Make a completely fresh `Web Service` mapped to your targeted repository.
2. Select **Docker** as your runtime environment (it will auto-detect backend/Dockerfile!).
3. Bind standard Root Folder contexts directly matching `./backend`.
4. Render handles SSL proxy bounds natively meaning we don't declare ports explicitly (Node runs on `process.env.PORT`).

### Frontend → Vercel
Vite React apps integrate natively into Vercel's global edge:
1. Build a new Vercel project linking your target GitHub repo. 
2. Switch specific Root directory bounds matching `frontend/`. Vercel automatically maps `npm run build` targeting standard Dist configurations. 
3. *Crucial*: In your environment bindings mapping, link the live backend URL mapping. 

---

## 🔑 Environment Variables Setup
The system expects these specific secure structures bound privately to the runtime orchestration. 
**Backend Keys**:
- `GEMINI_API_KEY`: Generative Intelligence binding key for parsing execution. 
- `SMTP_USER` & `SMTP_PASS`: Target delivery service config bounds. 
- *(Optional)* `SMTP_HOST` & `SMTP_PORT`
**Frontend Keys**:
- `VITE_API_URL`: Your production backend bounding. (Eg: `https://your-api.onrender.com`).
