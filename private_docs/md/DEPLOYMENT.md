# Deployment Guide

Complete guide for deploying Sajilo Kaam to production.

## Prerequisites

- Docker & Docker Compose
- MySQL 8.0+ (or use Docker)
- Java 17+ (for backend)
- Node.js 18+ (for frontend)
- Nginx (for reverse proxy, optional)

---

## Production Environment Variables

### Backend (.env or application.properties)

```properties
# Database
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=sajilokaam
DB_USER=sajilokaam_user
DB_PASS=secure_password_here

# JWT
JWT_SECRET=your-very-long-secret-key-minimum-48-characters-for-hs384-algorithm

# Server
SERVER_PORT=8080

# CORS (update with your frontend domain)
SPRING_WEB_CORS_ALLOWED_ORIGINS=https://sajilokaam.com,https://www.sajilokaam.com

# Payment Gateways (Production keys)
KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_PUBLIC_KEY=your_khalti_public_key
ESEWA_MERCHANT_ID=your_esewa_merchant_id
ESEWA_SECRET_KEY=your_esewa_secret_key

# Tesseract OCR (if using ML features)
TESSDATA_PREFIX=/usr/share/tesseract-ocr/4.00/tessdata
```

### Frontend (.env)

```env
VITE_API_BASE_URL=https://api.sajilokaam.com/api
VITE_WS_URL=wss://api.sajilokaam.com/ws
```

---

## Docker Deployment

### 1. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: sajilokaam-mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: sajilokaam
      MYSQL_USER: sajilokaam_user
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: unless-stopped
    networks:
      - sajilokaam-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: sajilokaam-backend
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: sajilokaam
      DB_USER: sajilokaam_user
      DB_PASS: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      SPRING_PROFILES_ACTIVE: prod
    depends_on:
      - mysql
    ports:
      - "8080:8080"
    restart: unless-stopped
    networks:
      - sajilokaam-network
    volumes:
      - ./uploads:/app/uploads

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: sajilokaam-frontend
    environment:
      VITE_API_BASE_URL: ${API_BASE_URL}
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - sajilokaam-network

volumes:
  mysql_data:

networks:
  sajilokaam-network:
    driver: bridge
```

### 2. Build and Deploy

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

---

## Manual Deployment

### Backend Deployment

1. **Build JAR**
```bash
cd backend
./mvnw clean package -DskipTests
```

2. **Run JAR**
```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --spring.datasource.url=jdbc:mysql://localhost:3306/sajilokaam \
  --spring.datasource.username=sajilokaam_user \
  --spring.datasource.password=secure_password \
  --jwt.secret=your_jwt_secret
```

3. **Systemd Service** (Linux)

Create `/etc/systemd/system/sajilokaam-backend.service`:

```ini
[Unit]
Description=Sajilo Kaam Backend
After=network.target mysql.service

[Service]
Type=simple
User=sajilokaam
WorkingDirectory=/opt/sajilokaam/backend
ExecStart=/usr/bin/java -jar target/backend-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable sajilokaam-backend
sudo systemctl start sajilokaam-backend
```

### Frontend Deployment

1. **Build**
```bash
cd frontend
npm install
npm run build
```

2. **Serve with Nginx**

Create `/etc/nginx/sites-available/sajilokaam`:

```nginx
server {
    listen 80;
    server_name sajilokaam.com www.sajilokaam.com;

    root /var/www/sajilokaam/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/sajilokaam /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL/HTTPS Setup

### Using Let's Encrypt (Certbot)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d sajilokaam.com -d www.sajilokaam.com
```

Certbot will automatically update your Nginx configuration.

---

## Database Setup

### 1. Create Database

```sql
CREATE DATABASE sajilokaam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'sajilokaam_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON sajilokaam.* TO 'sajilokaam_user'@'%';
FLUSH PRIVILEGES;
```

### 2. Run Migrations

Flyway will automatically run migrations on application startup.

### 3. Backup Script

Create `backup-db.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u sajilokaam_user -p sajilokaam > backup_${DATE}.sql
```

---

## Monitoring & Logging

### Application Logs

Backend logs are available via:
- Docker: `docker logs sajilokaam-backend`
- Systemd: `journalctl -u sajilokaam-backend -f`

### Health Checks

```bash
# Backend health
curl http://localhost:8080/actuator/health

# Database connection
curl http://localhost:8080/actuator/health/db
```

### Log Rotation

Configure logrotate for application logs:

```bash
/var/log/sajilokaam/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 sajilokaam sajilokaam
    sharedscripts
}
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (minimum 48 characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable database SSL connections
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Monitor for security vulnerabilities
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up intrusion detection

---

## Performance Optimization

### Backend

1. **Connection Pooling**
```properties
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
```

2. **Caching** (add to pom.xml)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
```

3. **Enable Compression**
```properties
server.compression.enabled=true
server.compression.mime-types=application/json,application/xml,text/html,text/xml,text/plain
```

### Frontend

1. **Code Splitting** (already in Vite)
2. **Lazy Loading** routes
3. **Image Optimization**
4. **CDN for static assets**

---

## Troubleshooting

### Backend won't start
- Check database connection
- Verify JWT_SECRET is set
- Check port 8080 is available
- Review application logs

### Frontend shows blank page
- Check API_BASE_URL is correct
- Verify CORS settings
- Check browser console for errors
- Ensure backend is running

### Database connection errors
- Verify MySQL is running
- Check credentials
- Ensure database exists
- Check network connectivity

---

## Rollback Procedure

1. Stop services
2. Restore database backup
3. Revert code to previous version
4. Rebuild and restart

```bash
docker-compose -f docker-compose.prod.yml down
mysql -u sajilokaam_user -p sajilokaam < backup_20241201_120000.sql
git checkout previous-version
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Support

For deployment issues, check:
- Application logs
- Database logs
- Nginx error logs
- System resources (CPU, memory, disk)

