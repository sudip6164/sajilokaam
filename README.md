# Sajilo Kaam — Upwork + Jira-lite Platform

Sajilo Kaam is a full-stack marketplace that fuses Upwork-style talent workflows (two-sided onboarding, job marketplace, proposals, escrow, payments) with Jira-lite collaboration (teams, sprints, tasks, ML document parsing). The system runs as a multi-service Docker stack with a Spring Boot core, React front-end, and a Python spaCy service for ML task extraction.

---

## Feature Highlights

- **Two-sided onboarding & admin verification**
  - Role-aware flows for freelancers and clients with rich profile data + document uploads.
  - Admin review console (approve / reject / needs-update) gating access to posting or bidding.
- **Marketplace experience**
  - Job discovery with filters, talent search, rich proposal composer, bid drawer, messaging entry points.
  - Team hub for freelancers to create squads and apply together.
- **Jira-lite delivery**
  - Sprint planner, backlog, drag/drop tasks & subtasks, team assignments, collaboration notes.
  - ML-assisted requirements intake (OCR + spaCy) to auto-suggest tasks from uploaded specs.
- **Payments, escrow & disputes**
  - Invoice issuing, Khalti/eSewa payment initiation, escrow deposits/releases, payment history.
  - Dispute entities + admin dashboards with gateway mix, transaction pipeline, and dispute queue.
- **Admin workbench**
  - Overview analytics, verification console, payments/disputes dashboard, user/settings/audit panels.

> Detailed user journey documentation lives in `private_docs/md/HOW_TO_USE.md`.

---

## Architecture Overview

| Service            | Stack / Key libs                              | Notes |
| ------------------ | --------------------------------------------- | ----- |
| `backend`          | Spring Boot 3, Spring Security, JPA, Flyway   | Core REST APIs, JWT auth, payments, escrow, ML orchestration |
| `frontend`         | React 19 + Vite, Tailwind, React Router       | Full product UI with navigation, dashboards, modals, error boundary |
| `ml-service`       | Python 3.11, Flask, spaCy `en_core_web_sm`    | Task extraction API called by backend with OCR text |
| `mysql`            | MySQL 8 (Docker)                              | Primary datastore, schema managed via Flyway migrations |
| `phpmyadmin`       | phpMyAdmin (Docker)                           | Optional DB admin console |
| `ml` dependencies  | Apache PDFBox 3, Tess4J                       | OCR pipeline feeding ML suggestions |

The default `docker-compose.yml` wires all services plus network aliases (`backend`, `frontend`, `ml-service`, `db`, `phpmyadmin`).

---

## Repository Layout

```
C:\SajiloKaam
├── backend/                     # Spring Boot source (entities, services, controllers, Flyway)
├── frontend/                    # React/Vite app (components, pages, contexts, hooks)
├── ml-service/                  # Flask + spaCy task extraction microservice
├── private_docs/md/             # Internal docs (moved from root, e.g. API, deployment, how-to)
├── docker-compose.yml           # Orchestrates backend, frontend, db, phpMyAdmin, ML
└── scripts/                     # Utility scripts (e.g., JWT generator, DB helpers)
```

All Markdown references except `README.md` reside under `private_docs/md/*` as required.

---

## Quick Start (Docker-first)

1. **Clone**
   ```bash
   git clone https://github.com/sudip6164/SajiloKaam.git
   cd SajiloKaam
   ```
2. **Copy env files (optional)**
   - Backend uses `application.properties`; see sample below.
3. **Launch stack**
   ```bash
   docker-compose up --build
   ```
4. **Access**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080
   - ML service: http://localhost:5000 (internal) / http://localhost:5001 (if exposed)
   - phpMyAdmin: http://localhost:8081 (credentials from compose file)

### Local Dev (without Docker)

- **Backend**
  ```bash
  cd backend
  ./mvnw spring-boot:run
  ```
- **Frontend**
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- **ML Service**
  ```bash
  cd ml-service
  python -m venv .venv && source .venv/Scripts/activate
  pip install -r requirements.txt
  flask run --port 5000
  ```

Ensure MySQL is available locally (`jdbc:mysql://localhost:3306/sajilokaam`) or update the datasource URL.

---

## Environment & Configuration

Backend `application.properties` essentials:
```properties
spring.datasource.url=jdbc:mysql://db:3306/sajilokaam?useSSL=false&allowPublicKeyRetrieval=true
spring.datasource.username=${DB_USER:root}
spring.datasource.password=${DB_PASSWORD:root}
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
jwt.secret=${JWT_SECRET:change-me}

# Payment gateways (public sandbox keys provided for demo)
khalti.public.key=live_PUBLIC_KEY
khalti.secret.key=live_SECRET_KEY
khalti.base.url=https://khalti.com/api/v2/
esewa.merchant.id=EPAYTEST
esewa.secret.key=8gBm/:&EnhH.1/q
esewa.base.url=https://uat.esewa.com.np/epay/

# ML service endpoint (Docker service name)
ml.service.url=http://ml-service:5000
```

Other important env values:

| Variable                    | Description                                     |
| --------------------------- | ----------------------------------------------- |
| `TESSDATA_PREFIX`           | Optional path when running OCR with Tesseract   |
| `SPRING_PROFILES_ACTIVE`    | Switch between `dev`, `prod`, etc.               |
| `FRONTEND_VITE_API_URL`     | Vite env override when deploying frontend        |

---

## Role Workflows (Summary)

- **Freelancer**: Complete onboarding wizard → await admin approval → browse jobs → submit proposals → manage sprints/tasks → upload documents for ML parsing → issue invoices → monitor escrow releases.
- **Client**: Finish client profile → post jobs → review proposals → convert to projects → deposit to escrow → approve releases → pay invoices via Khalti/eSewa or offline.
- **Admin**: Navigate `Admin` area for verification queue, analytics, payment dashboards, users/settings/audit trail. All privileged endpoints require the `ADMIN` role via `RequiresAdmin`.

For step-by-step instructions with screenshots/flow notes, see `private_docs/md/HOW_TO_USE.md`.

---

## Testing, Linting & Builds

```bash
# Backend unit/integration tests
cd backend
./mvnw test

# Backend package build (produces JAR)
./mvnw clean package

# Frontend lint + type check (if TS types present)
cd frontend
npm run lint

# Frontend production bundle
npm run build
```

Seed data (Flyway `V14__seed_admin_user.sql`, `V15__create_profiles_and_verification.sql`) provisions:
- `admin@sajilokaam.com / admin123` (ADMIN)
- Sample freelancers/clients/teams/projects for demo walkthroughs.

---

## Documentation Index

All detailed documentation lives in `private_docs/md/`:

- `API_DOCUMENTATION.md` – REST endpoint reference
- `DEPLOYMENT.md` – Production deployment checklist + docker tips
- `FEATURE_GAP_ANALYSIS.md`, `PROJECT_STATUS.md`, `CHANGELOG.md`
- `HOW_TO_USE.md` – End-to-end user flow guide (new)

---

## Troubleshooting Tips

- **Blank frontend screen**: ensure Vite config polyfills `globalThis` and `buffer` for `sockjs-client`; check console for `global is not defined`.
- **Flyway failures**: run `./mvnw flyway:repair` inside backend container, then restart.
- **ML extraction errors**: verify `ml-service` container healthcheck, spaCy model download, and `ml.service.url`.
- **Payment gateway issues**: confirm sandbox keys, inspect `PaymentService` logs, and ensure callbacks/webhooks hit `/api/payments/webhook/{gateway}` if enabled.

---

## License

This repository is provided for academic coursework and evaluation. Use responsibly.
