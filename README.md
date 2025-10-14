# 🏛️ NyayaSetu - Integrated DBT and Grievance System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

> A comprehensive, production-ready platform for implementing Direct Benefit Transfer (DBT) under the Centrally Sponsored Scheme for effective implementation of PCR Act and PoA Act.

## 📑 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

## 🌟 Overview

NyayaSetu is an end-to-end digital platform designed to streamline the implementation of Direct Benefit Transfer (DBT) schemes under the Protection of Civil Rights (PCR) Act, 1955 and the Scheduled Castes and the Scheduled Tribes (Prevention of Atrocities) Act, 1989. The system provides a transparent, secure, and efficient mechanism for application submission, verification, approval, and fund disbursement.

### 🎯 Problem Statement

This system addresses the need for smart, tech-enabled modalities to effectively implement DBT under schemes related to:
- **PCR Act, 1955**: Elimination of untouchability and protection of civil rights
- **PoA Act, 1989**: Prevention of atrocities against Scheduled Castes and Scheduled Tribes

**Current Challenges:**
- Manual, paper-based application processes
- Lack of transparency in application tracking
- Delayed document verification and fund disbursement
- Limited accessibility for rural citizens
- No centralized system for grievance redressal

**Our Solution:**
- Digital-first approach with Aadhaar-based authentication
- Real-time application tracking and status updates
- Integrated document verification (DigiLocker, CCTNS)
- Multi-stakeholder workflow automation
- Accessible interface with multi-language support

## ✨ Key Features

### For Citizens (Public Users)
- 🔐 **Aadhaar-based Authentication**: Secure OTP-based login linked to Aadhaar
- 📝 **Smart Onboarding**: Step-by-step guided process with UIDAI integration
- 📄 **Document Upload**: Support for multiple document types with DigiLocker integration
- 📊 **Real-time Tracking**: Track application status through multiple approval stages
- 🌐 **Multi-language Support**: Available in 6 Indian languages (EN, HI, BN, MR, TA, TE)
- 💬 **AI Chatbot**: 24/7 assistance with multilingual support
- ♿ **Accessibility**: WCAG-compliant design with screen reader support

### For District Authorities
- 📋 **Application Management**: Review and process pending applications
- 🔍 **CCTNS Integration**: Verify FIR details through Crime and Criminal Tracking Network
- ✅ **Document Verification**: Approve/reject submitted documents with comments
- 📈 **Dashboard Analytics**: Real-time statistics and workflow monitoring
- 📝 **Case Management**: Handle grievances and escalations

### For Social Welfare Departments
- 🏛️ **State-level Review**: Final approval workflow for applications
- 💰 **Fund Allocation**: Approve disbursement amounts
- 📊 **Reporting**: Generate reports and analytics
- 🔔 **Notifications**: Real-time updates on application status

### For Financial Institutions
- 💳 **Disbursement Management**: Process approved fund transfers
- 🏦 **Bank Verification**: Validate bank account details
- 📊 **Transaction Tracking**: Monitor disbursement status
- � **Batch Processing**: Handle multiple transactions efficiently

### For Administrators
- 👥 **User Management**: Manage users across all roles
- 🔐 **Access Control**: Role-based permissions and security
- 📊 **System Analytics**: Comprehensive dashboard with insights
- 🔍 **Audit Logs**: Track all system activities

## 🏗️ Architecture

### System Design

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js 14    │────▶│   FastAPI        │────▶│   PostgreSQL    │
│   (Frontend)    │◀────│   (Backend)      │◀────│   (Database)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                         │
        │                        │                         │
        ▼                        ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Tailwind CSS   │     │   SQLAlchemy     │     │    Alembic      │
│  Shadcn UI      │     │   Pydantic       │     │   (Migrations)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Key Components

**Frontend (Next.js 14)**
- TypeScript for type safety
- App Router for modern routing
- Server Components for performance
- Client Components for interactivity
- Middleware for authentication
- next-intl for internationalization

**Backend (FastAPI)**
- RESTful API design
- JWT-based authentication
- Role-based access control (RBAC)
- SQLAlchemy ORM
- Pydantic data validation
- Structured logging with structlog

**Database (PostgreSQL)**
- Normalized schema design
- Foreign key relationships
- Indexes for performance
- Alembic for migrations
- Seed data for testing

**External Integrations**
- UIDAI API for Aadhaar verification (simulated)
- DigiLocker for document verification
- CCTNS for FIR verification
- Gemini AI for chatbot
- Twilio/SMS Gateway for OTP

### Security Architecture

- 🔒 **JWT Tokens**: Secure authentication with 1-hour expiration
- � **Password Hashing**: Bcrypt for password security
- �️ **SQL Injection Prevention**: Parameterized queries
- 🚫 **XSS Protection**: Input sanitization
- � **Audit Logging**: Track all critical operations
- � **Environment Variables**: Sensitive data protection

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| TypeScript | 5.x | Type-safe development |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| Shadcn UI | Latest | Accessible component library |
| React Hook Form | 7.x | Form state management |
| Zod | 3.x | Schema validation |
| next-intl | 3.x | Internationalization |
| Axios | 1.x | HTTP client |
| React Query | 5.x | Data fetching & caching |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.104+ | High-performance Python API framework |
| Python | 3.11+ | Programming language |
| SQLAlchemy | 2.x | SQL toolkit and ORM |
| Alembic | 1.x | Database migrations |
| Pydantic | 2.x | Data validation |
| Structlog | Latest | Structured logging |
| Jose | Latest | JWT handling |
| Passlib | 1.7+ | Password hashing |
| Uvicorn | Latest | ASGI server |

### Database & Infrastructure
| Technology | Version | Purpose |
|-----------|---------|---------|
| PostgreSQL | 15+ | Primary database |
| Docker | Latest | Containerization |
| Docker Compose | Latest | Multi-container orchestration |
| Nginx | Latest | Reverse proxy (production) |

### Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | JavaScript linting |
| Prettier | Code formatting |
| Black | Python code formatting |
| Pytest | Python testing |
| Jest | JavaScript testing |

## � Quick Start

### Prerequisites

Ensure you have the following installed:
- **Docker** (20.10+) & **Docker Compose** (2.0+) - [Install Docker](https://docs.docker.com/get-docker/)
- **Git** - [Install Git](https://git-scm.com/downloads)
- **Node.js** (18+) - Only for local development (optional)
- **Python** (3.11+) - Only for local development (optional)

### ⚡ Super Simple Setup (Recommended for New Developers)

**Get started in under 2 minutes!**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/NyayaSetu-Integrated-DBT-and-Grievance-System.git
   cd NyayaSetu-Integrated-DBT-and-Grievance-System
   ```

2. **Start everything with Docker**
   ```bash
   docker-compose up -d
   ```

   **That's it!** The system will automatically:
   - ✅ Create and configure PostgreSQL database
   - ✅ Run all database migrations
   - ✅ Seed the database with test data
   - ✅ Start the FastAPI backend server
   - ✅ Start the Next.js frontend server
   - ✅ Configure networking between services

3. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **Interactive API Docs**: http://localhost:8000/redoc

### 🧑‍💻 Test Credentials

The system comes pre-populated with test users for each role:

| Role | Email | Phone | Password | Purpose |
|------|-------|-------|----------|---------|
| **Admin** | `admin@nyayasetu.gov.in` | N/A | `admin123` | System administration |
| **Public User** | `john.doe@example.com` | `+919876543210` | OTP-based | Citizen applying for benefits |
| **District Officer** | `district.officer@example.com` | N/A | `district123` | Application review |
| **Welfare Officer** | `welfare.officer@example.com` | N/A | `welfare123` | Final approval |
| **FI Officer** | `fi.officer@example.com` | N/A | `fi123` | Fund disbursement |

**Note**: Public users login via Aadhaar + OTP. Use the registered phone number to receive OTP.

### 🛠️ Advanced Setup Options

<details>
<summary><b>Option 1: Development Mode (Hot Reload Enabled)</b></summary>

For active development with instant code updates:

```bash
# Start in development mode
./start-dev.sh

# Or manually:
docker-compose -f docker-compose.dev.yml up
```

**Features:**
- 🔄 Hot reloading for frontend and backend
- 📁 Volume mounting for live code changes
- 🐛 Development-friendly logging
- 🔍 Source maps enabled

</details>

<details>
<summary><b>Option 2: Production Build</b></summary>

For production deployment:

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up -d --build

# With Nginx reverse proxy
docker-compose -f docker-compose.prod.yml -f docker-compose.nginx.yml up -d
```

**Features:**
- ⚡ Optimized production builds
- 🗜️ Minified assets
- 🔒 Enhanced security settings
- 📊 Performance monitoring

</details>

<details>
<summary><b>Option 3: Manual Setup (Without Docker)</b></summary>

For development without Docker:

**Backend Setup:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../.env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

**Database Setup:**
```bash
# Install PostgreSQL locally
# Create database
createdb nyayasetu_db

# Update DATABASE_URL in .env file
```

</details>

## � Database Architecture

### Schema Overview

The system uses **PostgreSQL** with **SQLAlchemy ORM** and **Alembic** for migrations.

**Core Tables:**
```
├── users                    # User accounts and profiles
├── roles                    # System roles (PUBLIC, DISTRICT_AUTHORITY, etc.)
├── user_role_assignments    # Many-to-many: users ↔ roles
├── applications             # Benefit applications
├── documents                # Uploaded documents
├── otp                      # OTP verification codes
├── uidai                    # Aadhaar/UIDAI data
└── onboarding               # User onboarding state
```

### Automatic Migration System

- **📁 Single Migration File**: All schema + seed data in one migration
- **🔄 Auto-Run**: Executes automatically on container startup
- **📊 Test Data**: Pre-populated with test users and applications
- **🔄 Idempotent**: Safe to run multiple times

### Database Management

<details>
<summary><b>View Database Schema</b></summary>

```bash
# Connect to database
docker-compose exec postgres psql -U nyayasetu nyayasetu_db

# List tables
\dt

# Describe table structure
\d users
\d applications
```

</details>

<details>
<summary><b>Reset Database</b></summary>

```bash
# Complete reset (removes all data)
docker-compose down -v
docker-compose up -d

# ✅ Fresh database with seed data restored
```

</details>

<details>
<summary><b>Backup & Restore</b></summary>

```bash
# Backup
docker-compose exec postgres pg_dump -U nyayasetu nyayasetu_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U nyayasetu nyayasetu_db < backup.sql
```

</details>

### Seed Data

The database comes pre-populated with:
- ✅ **5 User Roles** with permissions
- ✅ **6 Test Users** across all roles
- ✅ **3 Sample Applications** in different states
- ✅ **4 Document Attachments**
- ✅ **UIDAI Profile Data** for testing

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