# NyayaSetu Development Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Setup](#development-setup)
4. [Database Management](#database-management)
5. [API Development](#api-development)
6. [Frontend Development](#frontend-development)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [Contributing](#contributing)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NyayaSetu-Integrated-DBT-and-Grievance-System
   git checkout feat/sudhi
   ```

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Project Structure

```
NyayaSetu-Integrated-DBT-and-Grievance-System/
├── backend/                    # FastAPI backend
│   ├── app/                   # Application code
│   │   ├── api/              # API routes
│   │   ├── core/             # Core functionality
│   │   ├── models/           # Pydantic models
│   │   └── services/         # Business logic
│   ├── prisma/               # Database schema and migrations
│   ├── uploads/              # File uploads
│   ├── main.py              # FastAPI application entry point
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Backend container
├── frontend/                 # Next.js frontend
│   ├── src/                 # Source code
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and API clients
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile         # Frontend container
├── nginx/                  # Nginx configuration
├── docker-compose.yml     # Development environment
├── docker-compose.prod.yml # Production environment
├── setup.sh              # Setup script
└── README.md             # Project documentation
```

## Development Setup

### Backend Development

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp ../env.example .env
   # Edit .env with your configuration
   ```

5. **Generate Prisma client**
   ```bash
   prisma generate
   ```

6. **Run database migrations**
   ```bash
   prisma migrate dev
   ```

7. **Seed the database**
   ```bash
   python prisma/seed.py
   ```

8. **Start the development server**
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Development

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

### Using Docker for Development

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## Database Management

### Prisma Commands

```bash
# Generate Prisma client
prisma generate

# Create a new migration
prisma migrate dev --name migration_name

# Reset database
prisma migrate reset

# Deploy migrations to production
prisma migrate deploy

# View database in Prisma Studio
prisma studio
```

### Database Schema

The database schema is defined in `backend/prisma/schema.prisma`. Key models include:

- **User**: User accounts with role-based access
- **Application**: Benefit applications
- **Document**: Uploaded documents
- **Case**: Legal cases
- **Notification**: System notifications
- **AuditLog**: System audit trail

### Seeding Data

Run the seed script to populate the database with sample data:

```bash
cd backend
python prisma/seed.py
```

## API Development

### Adding New Endpoints

1. **Create endpoint file**
   ```bash
   touch backend/app/api/v1/endpoints/new_feature.py
   ```

2. **Define routes**
   ```python
   from fastapi import APIRouter
   
   router = APIRouter()
   
   @router.get("/")
   async def get_items():
       return {"message": "Hello World"}
   ```

3. **Add to main router**
   ```python
   # In backend/app/api/v1/api.py
   from app.api.v1.endpoints import new_feature
   
   api_router.include_router(new_feature.router, prefix="/new-feature", tags=["new-feature"])
   ```

### Request/Response Models

Define Pydantic models in `backend/app/models/`:

```python
from pydantic import BaseModel
from typing import Optional

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ItemResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### Error Handling

Use custom exceptions from `backend/app/core/exceptions.py`:

```python
from app.core.exceptions import NotFoundException, ValidationException

@router.get("/items/{item_id}")
async def get_item(item_id: str):
    item = await get_item_by_id(item_id)
    if not item:
        raise NotFoundException("Item not found")
    return item
```

## Frontend Development

### Component Structure

Components are organized in `frontend/src/components/`:

```
components/
├── ui/              # Reusable UI components
├── layout/          # Layout components
├── forms/           # Form components
├── providers/       # Context providers
└── features/        # Feature-specific components
```

### State Management

The application uses:
- **Zustand** for global state management
- **React Query** for server state
- **React Hook Form** for form state

### API Integration

API calls are centralized in `frontend/src/lib/api/`:

```typescript
// frontend/src/lib/api/items.ts
import axios from 'axios'

export const itemsApi = {
  getItems: async () => {
    const response = await axios.get('/api/v1/items')
    return response.data
  },
  
  createItem: async (data: ItemCreate) => {
    const response = await axios.post('/api/v1/items', data)
    return response.data
  }
}
```

### Styling

The application uses:
- **Tailwind CSS** for utility-first styling
- **Shadcn/ui** for component library
- **Framer Motion** for animations

## Testing

### Backend Testing

```bash
cd backend
pytest
```

### Frontend Testing

```bash
cd frontend
npm test
```

### Integration Testing

```bash
# Run all tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## Deployment

### Production Build

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build backend**
   ```bash
   cd backend
   # Dependencies are already installed
   ```

3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables

Set the following environment variables for production:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET_KEY=your-secret-key

# API
NEXT_PUBLIC_API_URL=https://api.nyayasetu.gov.in

# External Services
GEMINI_API_KEY=your-gemini-key
AADHAAR_API_KEY=your-aadhaar-key
```

## Contributing

### Code Style

- **Python**: Follow PEP 8, use Black for formatting
- **TypeScript**: Follow ESLint rules, use Prettier for formatting
- **Commits**: Use conventional commit messages

### Pull Request Process

1. Create a feature branch from `feat/sudhi`
2. Make your changes
3. Add tests for new functionality
4. Update documentation
5. Submit a pull request

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Frontend Build Issues

```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run build
```

#### API Issues

```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Performance Optimization

#### Database

- Add indexes for frequently queried columns
- Use database connection pooling
- Implement query optimization

#### Frontend

- Use React.memo for expensive components
- Implement code splitting
- Optimize bundle size

#### API

- Implement caching with Redis
- Use async/await properly
- Add rate limiting

### Security Considerations

- Validate all inputs
- Use HTTPS in production
- Implement proper authentication
- Regular security audits
- Keep dependencies updated

## Support

For development support:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com/)

