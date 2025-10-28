# SajiloKaam Monorepo

Modules:
- backend (Spring Boot, MySQL, JWT)
- frontend (React + Tailwind, mobile-first)
- ml (Python OCR/ML service)

Environment config
- Single root `.env` file is used. No module-level env examples.
- Suggested `.env` keys:
  - BACKEND_PORT=8080
  - FRONTEND_PORT=5173
  - ML_SERVICE_URL=http://localhost:8001
  - DB_HOST=localhost
  - DB_PORT=3306
  - DB_NAME=sajilokaam
  - DB_USER=your_user
  - DB_PASS=your_password
  - CORS_ORIGINS=http://localhost:5173

See `docs/` for architecture and ERD.
