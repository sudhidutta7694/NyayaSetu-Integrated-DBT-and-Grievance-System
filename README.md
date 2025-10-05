# NyayaSetu - Integrated DBT and Grievance System

A comprehensive platform for implementing Direct Benefit Transfer (DBT) under the Centrally Sponsored Scheme for effective implementation of PCR Act and PoA Act.

## 🎯 Problem Statement

This system addresses the need for smart, tech-enabled modalities to effectively implement DBT under schemes related to the Protection of Civil Rights (PCR) Act, 1955 and the Scheduled Castes and the Scheduled Tribes (Prevention of Atrocities) Act, 1989.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and Shadcn UI
- **Backend**: FastAPI with Python
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Role-based with Aadhaar/OTP for public users
- **AI Integration**: Gemini API for chatbot functionality
- **Notifications**: Push notifications for real-time updates
- **Deployment**: Docker containerization

## 🚀 Features

### Phase 1 (Current)
- ✅ Role-based authentication system
- ✅ Aadhaar and OTP-based login for public users
- ✅ Step-by-step onboarding process
- ✅ Document upload and verification
- ✅ DigiLocker integration (simulated)
- ✅ Application form with comprehensive data collection

### Phase 2 (Planned)
- 🔄 Case registration and management
- 🔄 AI-powered chatbot with speech capabilities
- 🔄 User dashboard for tracking
- 🔄 Fund disbursement tracking
- 🔄 Multi-language support
- 🔄 Accessibility features

## 🛠️ Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Hook Form
- Zod validation
- NextAuth.js

### Backend
- FastAPI
- Python 3.11+
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Pydantic models

### Infrastructure
- Docker & Docker Compose
- PostgreSQL
- Redis (for caching)
- Nginx (reverse proxy)

## 📋 Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Git

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NyayaSetu-Integrated-DBT-and-Grievance-System
   ```

2. **Run the startup script**
   ```bash
   ./start.sh
   ```

   This script will:
   - ✅ Check all prerequisites (Docker, Docker Compose)
   - ✅ Build all Docker containers
   - ✅ Start PostgreSQL and Redis databases
   - ✅ Run database migrations automatically
   - ✅ Start backend and frontend services
   - ✅ Perform health checks
   - ✅ Display service URLs and status

3. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs

### Option 2: Development Mode (For Developers)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NyayaSetu-Integrated-DBT-and-Grievance-System
   ```

2. **Start in development mode**
   ```bash
   ./start-dev.sh
   ```

   This will start the system with:
   - 🔄 Hot reloading enabled
   - 📁 Volume mounting for live code changes
   - 🐛 Development-friendly logging

### Option 3: Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NyayaSetu-Integrated-DBT-and-Grievance-System
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services manually**
   ```bash
   # Start databases
   docker-compose up -d postgres redis
   
   # Run migrations
   docker-compose run --rm backend python -m alembic upgrade head
   
   # Start all services
   docker-compose up -d
   ```

## 🛠️ Management Scripts

The startup script creates several utility scripts for easy management:

- **`./start.sh`** - Complete system startup (production mode)
- **`./start-dev.sh`** - Development mode startup with hot reloading
- **`./stop.sh`** - Stop all services
- **`./restart.sh`** - Restart all services
- **`./check-status.sh`** - Check system health and status

## 🔧 Service Management

```bash
# Check system status
./check-status.sh

# View logs
docker-compose logs -f [service-name]

# Restart a specific service
docker-compose restart [service-name]

# Stop all services
./stop.sh

# Restart all services
./restart.sh
```

## 📊 Service URLs

Once started, the following services will be available:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Next.js application |
| **Backend API** | http://localhost:8000 | FastAPI backend |
| **API Docs** | http://localhost:8000/docs | Swagger documentation |
| **PostgreSQL** | localhost:5433 | Database |
| **Redis** | localhost:6380 | Cache and sessions |
| **Nginx** | http://localhost:80 | Reverse proxy |

## 🔐 User Roles

1. **Public Users**: Citizens applying for benefits
2. **District Authorities**: Local government officials
3. **Social Welfare Departments**: State-level welfare officers
4. **Financial Institutions**: Banking partners for fund disbursement

## 📱 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm run test

# Backend tests
cd backend
pytest
```

## 📦 Deployment

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000  # or 8000, 5433, 6380

# Kill the process
kill -9 <PID>

# Or use different ports by modifying docker-compose.yml
```

#### Docker Issues
```bash
# Restart Docker daemon
sudo systemctl restart docker

# Clean up Docker resources
docker system prune -a

# Rebuild containers
docker-compose build --no-cache
```

#### Database Connection Issues
```bash
# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Frontend Build Issues
```bash
# Clear Next.js cache
rm -rf frontend/.next
docker-compose build frontend --no-cache
```

#### Backend API Issues
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Health Checks

```bash
# Check all services
./check-status.sh

# Individual service checks
curl http://localhost:3000  # Frontend
curl http://localhost:8000/health  # Backend
curl http://localhost:8000/docs  # API Docs
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
```

## 🆘 Support

For support, email support@nyayasetu.gov.in or create an issue in the repository.

## 🔮 Future Enhancements

- Blockchain integration for data security
- Advanced analytics and reporting
- Mobile app development
- Integration with government databases
- AI-powered fraud detection