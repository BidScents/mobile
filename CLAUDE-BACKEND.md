# CLAUDE-BACKEND.md

This file provides guidance to Claude Code (claude.ai/code) when working with the BidScents backend code.

## Common Development Commands

### Setup and Installation
```bash
# Install dependencies
pip install -r requirements.txt

# Start local infrastructure (Redis & Typesense)
docker compose up -d

# Run development server
fastapi dev app/main.py

# Alternative production server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Testing Commands
```bash
# Run all tests (integration by default)
pytest

# Run unit tests only
pytest -m unit

# Run integration tests only  
pytest -m integration

# Run end-to-end tests only
pytest -m e2e

# Run smoke tests
pytest -m smoke

# Generate coverage report
pytest --cov=app --cov-report=html
```

### Environment Management
```bash
# Use local testing environment
export TESTING="1"

# Repopulate search index
python -m scripts.populate_typesense

# Clear Redis cache
redis-cli FLUSHDB

# Database migrations
python -m scripts.migrate_db
```

## Architecture Overview

### Technology Stack
- **Framework**: FastAPI with async/await support
- **Database**: Supabase (PostgreSQL) with realtime subscriptions
- **Cache Layer**: Redis (local development) / Upstash Redis (production)
- **Search Engine**: Typesense for full-text and faceted search
- **Authentication**: Supabase Auth with JWT tokens
- **Real-time**: WebSockets for live bidding and messaging
- **Notifications**: Expo push notifications
- **Containerization**: Docker Compose for local services

### Project Structure (Clean Architecture)
```
backend/app/
├── main.py                 # FastAPI application entry point
├── core/                   # Core configuration and utilities
│   ├── container.py        # Dependency injection container
│   └── utils.py           # Common utilities
├── domain/                 # Business entities and rules
│   ├── entities/          # Domain entities (User, Listing, Auction, etc.)
│   ├── base.py           # Base classes and enums
│   └── exceptions.py     # Domain-specific exceptions
├── infrastructure/        # External concerns
│   ├── repositories/     # Data access layer
│   │   ├── base.py      # Repository interfaces
│   │   └── supabase/    # Supabase implementations
│   ├── external/        # External service clients
│   │   ├── auth_client.py
│   │   ├── cache_client.py
│   │   ├── search_client.py
│   │   └── notification_client.py
│   ├── cache/           # Caching infrastructure
│   ├── search/          # Search infrastructure
│   └── websockets/      # WebSocket infrastructure
├── services/              # Business logic layer
│   ├── auth_service.py
│   ├── listing_service.py
│   ├── auction_service.py
│   ├── user_service.py
│   ├── message_service.py
│   ├── transaction_service.py
│   └── notification_service.py
└── api/                   # API layer
    ├── deps.py           # FastAPI dependencies
    └── v1/              # API version 1
        ├── api.py       # Router aggregation
        ├── models/      # Pydantic models for API
        └── routers/     # FastAPI route handlers
```

### Key Architecture Patterns

#### Dependency Injection Container
- Centralized service initialization in `core/container.py`
- Single source of truth for all dependencies
- Supports both local (testing) and production configurations
- Handles environment-specific client initialization

#### Repository Pattern
- Abstract repository interfaces in `infrastructure/repositories/base.py`
- Concrete implementations for Supabase in `infrastructure/repositories/supabase/`
- Domain entities converted from/to database models
- Supports caching and search integration

#### Service Layer
- Business logic encapsulated in service classes
- Services depend on repositories and external clients
- Handle complex workflows like auction bidding, messaging
- Implement cache invalidation strategies

#### Clean API Layer
- FastAPI routers handle HTTP concerns only
- Pydantic models for request/response validation
- Dependency injection for service access
- Proper error handling and status codes

### Environment Configuration

The application requires these environment variables:

**Database & Auth:**
```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
MESSAGE_ENCRYPTION_KEY=your-encryption-key
```

**Cache (Production):**
```bash
REDIS_URL=your-upstash-redis-url
REDIS_TOKEN=your-upstash-token
```

**Cache (Local Testing):**
```bash
TESTING=1
REDIS_URL=redis://localhost:6379
```

**Search Engine:**
```bash
TYPESENSE_HOST=localhost
TYPESENSE_PORT=8108
TYPESENSE_PROTOCOL=http
TYPESENSE_API_KEY=dev-api-key
```

### Common Development Patterns

#### Adding New Features
1. Define domain entities in `domain/entities/`
2. Create repository interface and implementation
3. Implement business logic in service layer
4. Add Pydantic models for API in `api/v1/models/`
5. Create router endpoints in `api/v1/routers/`
6. Update dependency container if needed
7. Add comprehensive tests

#### Database Operations
- All database operations go through repository pattern
- Use domain entities, not database models directly
- Implement proper error handling for database exceptions
- Consider caching strategy for read operations

#### Caching Strategy
- Cache frequently accessed data (user profiles, listing details)
- Implement cache invalidation on data updates
- Use structured cache keys for easy management
- Consider cache warming for critical data

#### Search Integration
- Index data changes in Typesense automatically
- Use service layer to coordinate database and search updates
- Implement fallback strategies for search failures
- Keep search schema in sync with domain models

#### Real-time Features
- WebSocket manager handles connection lifecycle
- Broadcast updates to relevant connected clients
- Integrate with notification service for offline users
- Handle connection drops gracefully

#### Testing Strategy
- Unit tests for isolated business logic
- Integration tests for service interactions with real dependencies
- E2E tests for complete user workflows
- Use local Docker services for consistent test environment

### Important Development Notes

#### Local Development Setup
- Always run `docker compose up -d` for Redis and Typesense
- Set `TESTING=1` environment variable for local services
- Use `.env.local` for local development configuration
- Repopulate Typesense after database changes

#### Performance Considerations
- Use async/await consistently throughout the codebase
- Implement proper database indexing for queries
- Cache expensive computations and frequent queries
- Use connection pooling for external services

#### Security Best Practices
- Validate all inputs using Pydantic models
- Use Supabase RLS policies for data access control
- Encrypt sensitive data like messages
- Implement proper authentication and authorization

#### Error Handling
- Use domain-specific exceptions
- Implement proper HTTP status codes
- Log errors with sufficient context
- Return user-friendly error messages

### Deployment and Infrastructure
- FastAPI runs on Uvicorn ASGI server
- Redis cache layer for performance
- Typesense for search capabilities
- Supabase handles database and authentication
- Docker Compose for local development
- Environment-specific configurations via container