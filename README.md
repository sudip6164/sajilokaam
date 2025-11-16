# Sajilo Kaam - Freelance Management System

A modern, full-stack freelance management platform built with React.js and Spring Boot, designed to streamline freelance workflows and enhance freelancer-client collaboration.

## 🎨 Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Job Management**: Clients can post jobs, freelancers can browse and bid
- **Bidding System**: Freelancers can submit bids on jobs, clients can accept/reject bids
- **Project Management**: Create and manage projects with task tracking
- **Task Management**: Create, assign, and track tasks within projects
- **Dashboard**: Role-specific dashboards with statistics and recent activity
- **Profile Management**: Update user profile and password

### User Roles
- **Client**: Post jobs, review bids, accept/reject bids, manage projects
- **Freelancer**: Browse jobs, place bids, manage projects, track tasks

## 🛠️ Technology Stack

### Frontend
- **React.js** (v19.1.1) - Component-based UI
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
- **React Router DOM** (v7.9.6) - Client-side routing
- **Context API** - State management

### Backend
- **Spring Boot** (v3.5.7) - Java framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database abstraction
- **MySQL/MariaDB** - Relational database
- **Flyway** (v8.5.13) - Database migrations
- **JWT** - Token-based authentication

### Development Tools
- **Docker Compose** - Containerized development environment
- **Maven** - Dependency management
- **Git** - Version control

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Java 17+
- Maven
- MySQL/MariaDB (or use Docker Compose)
- Docker & Docker Compose (optional, for containerized setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sudip6164/sajilokaam.git
   cd SajiloKaam
   ```

2. **Backend Setup**
   ```bash
   cd backend
   # Update application.properties with your database credentials
   ./mvnw spring-boot:run
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Using Docker Compose (Recommended)**
   ```bash
   docker-compose up -d
   ```

### Environment Configuration

#### Backend (`backend/src/main/resources/application.properties`)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sajilokaam
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
jwt.secret=your_jwt_secret_key
```

## 📁 Project Structure

```
SajiloKaam/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/sajilokaam/
│   │       ├── auth/        # Authentication & JWT
│   │       ├── job/         # Job management
│   │       ├── bid/         # Bidding system
│   │       ├── project/     # Project management
│   │       ├── task/        # Task management
│   │       └── user/        # User management
│   └── src/main/resources/
│       └── db/migration/    # Flyway migrations
├── frontend/                # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── hooks/          # Custom hooks
│   └── public/
└── docker-compose.yml      # Docker configuration
```

## 🎨 Design System

The application features a modern dark theme with:
- **Base Color**: #101820
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Gradient Accents**: Violet/purple/fuchsia gradients
- **Animated Backgrounds**: Subtle animated patterns
- **Micro-interactions**: Smooth hover effects and transitions

## 🔐 Security

- JWT-based authentication
- Password encryption with BCrypt
- Role-based access control (RBAC)
- CORS configuration
- Secure API endpoints

## 📚 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with all endpoints
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions
- **[Production Checklist](./PRODUCTION_CHECKLIST.md)** - Pre-deployment checklist
- **[Implementation Plan](./IMPLEMENTATION_PLAN_10_STEPS.md)** - Feature implementation roadmap
- **[Project Status](./PROJECT_STATUS.md)** - Current project status and progress

## 📝 API Endpoints

For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick Reference
- **Authentication**: `/api/auth/*` - Register, login, profile management
- **Jobs**: `/api/jobs/*` - Job CRUD, bidding
- **Projects**: `/api/projects/*` - Project management
- **Tasks**: `/api/projects/{id}/tasks/*` - Task management
- **Time Tracking**: `/api/timer/*`, `/api/projects/{id}/tasks/{id}/time-logs/*`
- **Invoicing**: `/api/invoices/*` - Invoice creation and management
- **Payments**: `/api/payments/*` - Payment processing (Khalti, eSewa)
- **ML Document Processing**: `/api/projects/{id}/documents/*` - OCR and task extraction
- **Search**: `/api/search/global` - Global search
- **Sprints**: `/api/projects/{id}/sprints/*` - Sprint planning
- **Admin**: `/api/admin/*` - Admin dashboard and management

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
./mvnw test

# Frontend linting
cd frontend
npm run lint
```

### Building for Production
```bash
# Backend
cd backend
./mvnw clean package

# Frontend
cd frontend
npm run build
```

## 📄 License

This project is part of an academic project.
