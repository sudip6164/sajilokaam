# Changelog

All notable changes to the Sajilo Kaam project will be documented in this file.

## [Unreleased]

### Added
- Centralized API utility (`frontend/src/utils/api.js`) for better code organization
- Comprehensive README with installation instructions and API documentation
- HTML metadata improvements (title, description, font preconnect)

### Changed
- Complete dark theme redesign with #101820 base color
- Updated all 11 pages to use dark theme
- Updated all 4 components to use dark theme
- Improved loading states with dark theme skeletons
- Enhanced badge styles for dark theme
- Updated select dropdown options for dark theme
- Card-compact and glass-effect utilities updated for dark theme

### Design System
- **Base Color**: #101820
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Gradient Accents**: Violet/purple/fuchsia gradients
- **Animated Backgrounds**: Subtle animated patterns
- **Micro-interactions**: Smooth hover effects and transitions
- **Custom Scrollbar**: Dark theme scrollbar styling

## [1.0.0] - Initial Release

### Features
- User authentication with JWT
- Role-based access control (Client/Freelancer)
- Job management (CRUD operations)
- Bidding system (submit, accept, reject bids)
- Project management (CRUD operations)
- Task management (create, assign, track tasks)
- Dashboard with role-specific statistics
- Profile management
- Pagination for Jobs and Projects pages
- Search and filter functionality
- Responsive design

### Technical Stack
- **Frontend**: React.js 19.1.1, Vite, Tailwind CSS 3.4.17
- **Backend**: Spring Boot 3.5.7, Spring Security, JWT
- **Database**: MySQL/MariaDB with Flyway migrations
- **Development**: Docker Compose support

