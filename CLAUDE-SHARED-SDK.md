# CLAUDE-SHARED-SDK.md

This file provides guidance to Claude Code (claude.ai/code) when working with the BidScents shared SDK code.

## Common Development Commands

### Development Setup
```bash
# Install dependencies
bun install  # or npm install

# Build the SDK
bun run build

# Development mode with watch
bun run dev

# Clean build artifacts
bun run clean

# Regenerate API client from backend
bun run generate-api
```

### Package Management
```bash
# Lint code
bun run lint

# Type checking
bun run type-check

# Run tests
bun run test

# Prepare for publishing
bun run prepublishOnly

# Publish to npm
bun publish --access public
```

## Architecture Overview

### Technology Stack
- **Language**: TypeScript for type safety
- **State Management**: Zustand with persistence via AsyncStorage
- **Validation**: Zod for runtime schema validation
- **API Client**: OpenAPI-generated TypeScript client
- **Build Tool**: TypeScript compiler
- **Package Manager**: Bun (compatible with npm/yarn)

### Project Structure
```
shared-sdk/src/
├── index.ts                # Main SDK export file
├── api/                    # Auto-generated OpenAPI client
│   ├── core/              # Core API functionality
│   │   ├── ApiError.ts
│   │   ├── OpenAPI.ts
│   │   └── request.ts
│   ├── models/            # TypeScript models (auto-generated)
│   │   ├── User.ts
│   │   ├── Listing.ts
│   │   ├── Auction.ts
│   │   └── ...
│   └── services/          # API service classes
│       ├── AuthService.ts
│       ├── ListingService.ts
│       ├── AuctionsService.ts
│       └── ...
├── stores/                # Zustand state management
│   ├── index.ts          # Store exports
│   ├── auth.ts           # Authentication store
│   └── loading.ts        # Global loading store
├── utils/                 # Utility modules
│   ├── index.ts          # Utility exports
│   ├── auth/             # Auth utilities
│   ├── validation/       # Zod schemas
│   ├── currency/         # Currency formatting
│   ├── timezone/         # Time zone handling
│   └── common/           # Common utilities
├── types/                # Shared TypeScript types
├── config/               # Configuration
└── tests/                # Future test files
```

### Key Architecture Patterns

#### Auto-Generated API Client
- OpenAPI client generated from backend schema
- Type-safe API calls with proper TypeScript interfaces
- Centralized error handling and request configuration
- Automatic serialization/deserialization

#### Zustand State Management
- Lightweight state management with minimal boilerplate
- Persistent storage using AsyncStorage for React Native
- Type-safe stores with TypeScript interfaces
- Selective persistence to avoid storing sensitive data

#### Validation with Zod
- Runtime validation for form inputs and API responses
- Type-safe schema definitions
- Integration with form libraries
- Consistent validation across platforms

#### Modular Utility System
- Domain-specific utility modules (auth, currency, validation)
- Platform-agnostic implementations
- Reusable across web and mobile applications
- Consistent API patterns

### Core Stores

#### Authentication Store (`stores/auth.ts`)
```typescript
interface AuthState {
  user: User | null              // Current user profile
  session: any | null            // Supabase session
  isAuthenticated: boolean       // Authentication status
  isOnboarded: boolean          // Onboarding completion
  loading: boolean              // Loading state
  error: string | null          // Error messages
  // Actions
  setUser: (user: User | null) => void
  setSession: (session: any | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
}
```

**Key Features:**
- Automatic persistence with AsyncStorage
- Onboarding status derived from user data
- Session management for Supabase integration
- Error state management
- Loading states for UI feedback

#### Loading Store (`stores/loading.ts`)
- Global loading state management
- Multiple loading states for different operations
- UI components can subscribe to specific loading states

### Validation Schemas

#### Common Schemas (`utils/validation/schemas.ts`)
- **Login Schema**: Email and password validation
- **Sign-up Schema**: Registration with password confirmation
- **Profile Schema**: User profile data validation
- **Listing Schema**: Listing creation and editing

#### Usage Pattern:
```typescript
import { loginSchema } from '@bid-scents/shared-sdk'

const validationResult = loginSchema.safeParse(formData)
if (!validationResult.success) {
  // Handle validation errors
}
```

### API Integration Patterns

#### Service Usage
```typescript
import { AuthService, OpenAPI } from '@bid-scents/shared-sdk'

// Configure base URL
OpenAPI.BASE = 'http://localhost:8000'

// Use service methods
const loginResponse = await AuthService.login({
  email: 'user@example.com',
  password: 'password'
})
```

#### Error Handling
- Consistent error types across all API calls
- Proper HTTP status code handling
- Type-safe error responses
- Integration with store error states

### Development Patterns

#### Adding New Stores
1. Create store file in `stores/` directory
2. Define TypeScript interface for state
3. Implement Zustand store with actions
4. Add persistence if needed
5. Export from `stores/index.ts`
6. Update main `index.ts` export

#### Adding Validation Schemas
1. Create schema using Zod in `utils/validation/`
2. Export from validation index file
3. Use in consuming applications for form validation
4. Keep schemas focused and reusable

#### Updating API Client
1. Ensure backend is running with updated schema
2. Run `bun run generate-api`
3. Review generated types and services
4. Update consuming code if interfaces changed
5. Test integration with applications

#### Utility Functions
1. Create domain-specific utility modules
2. Keep functions pure and testable
3. Export from module index files
4. Maintain platform compatibility

### Integration with Applications

#### React Native Mobile App
```typescript
import { useAuthStore, AuthService } from '@bid-scents/shared-sdk'

const LoginScreen = () => {
  const { setUser, setSession, loading } = useAuthStore()
  
  const handleLogin = async (credentials) => {
    const response = await AuthService.login(credentials)
    setSession(response.session)
    setUser(response.user)
  }
}
```

#### State Persistence
- Auth store automatically persists user and session
- Loading states are not persisted (reset on app restart)
- Error states are not persisted
- Custom persistence can be added per store

### Development Workflow

#### Local Development
1. Make changes to SDK source code
2. Run `bun run build` to compile TypeScript
3. Test changes in consuming applications
4. Use `bun run dev` for watch mode during development

#### Publishing Updates
1. Update version in `package.json`
2. Run `bun run prepublishOnly` to clean and build
3. Publish with `bun publish --access public`
4. Update consuming applications to use new version

#### API Schema Updates
1. Start backend server locally
2. Run `bun run generate-api` to regenerate client
3. Review changes in `src/api/` directory
4. Update consuming applications if needed
5. Test integration thoroughly

### Important Notes

#### Version Compatibility
- SDK version should align with backend API version
- Breaking changes require major version updates
- Keep consuming applications updated with latest SDK

#### Type Safety
- All API responses are fully typed
- Store states have complete TypeScript interfaces
- Validation schemas provide runtime type checking
- Use TypeScript strict mode

#### Platform Compatibility
- SDK works with both React Native and web applications
- AsyncStorage fallback for web environments
- Platform-specific utilities when needed
- Consistent API across platforms

#### Performance Considerations
- Zustand stores are lightweight and performant
- API client uses efficient serialization
- Validation happens client-side to reduce server load
- Minimal bundle size impact on applications