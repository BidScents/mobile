# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Setup
```bash
# Install dependencies
bun install

# Start development server
bun expo start --dev-client --clear

# Platform-specific runs
bun expo run:ios
bun expo run:android
bun expo start --web
```

### Linting and Code Quality
```bash
# Lint code
bun expo lint

# Clear Metro cache (most common fix for red boxes)
bun expo start --clear

# Reset all caches
pkill -f "expo\|metro"
bun expo start --clear --reset-cache
```

### Build and Deployment
```bash
# Development builds
eas build --platform ios --profile development
eas build --platform android --profile development

# Clean prebuild (for native dependency changes)
bun expo prebuild --clean

# Android direct build (requires ANDROID_HOME set)
ANDROID_HOME=/Users/muhammadabdullah/Library/Android/sdk ./gradlew app:assembleDebug
NODE_ENV=development ANDROID_HOME=/Users/muhammadabdullah/Library/Android/sdk ./gradlew app:assembleDebug
```

## Architecture Overview

### Technology Stack
- **Framework**: Expo Router with React Native
- **UI Library**: Tamagui (universal UI system with platform-specific fonts)
- **State Management**: Zustand via `@bid-scents/shared-sdk`
- **API Integration**: OpenAPI SDK from shared package
- **Data Fetching**: TanStack Query with AsyncStorage persistence
- **Authentication**: Supabase Auth with automatic session management
- **Navigation**: Expo Router with typed routes
- **Bottom Sheets**: Gorhom Bottom Sheet for modals
- **Notifications**: Expo Notifications with deep linking

### Project Structure
```
app/                    # Expo Router pages
├── (auth)/            # Authentication flow screens  
├── (screens)/         # Authenticated screens
├── (tabs)/            # Main tab navigation
├── listing/           # Listing detail pages
└── _layout.tsx        # Root layout with providers

components/            # Reusable UI components
├── auth/              # Authentication components
├── forms/             # Form controls and bottom sheets
├── listing/           # Listing-specific components
├── profile/           # Profile-related components
├── suspense/          # Loading states and skeletons
└── ui/                # Base UI components

hooks/                 # Custom React hooks
├── queries/           # TanStack Query hooks
└── use-*.ts          # Feature-specific hooks

lib/                   # Core libraries
└── supabase.ts       # Supabase client configuration

providers/             # React context providers
utils/                 # Utility functions
types/                 # TypeScript type definitions
```

### Key Architecture Patterns

#### Authentication Flow
- Uses Supabase for authentication with automatic session management
- Session state synchronized with Zustand store from shared SDK
- Auth state listener handles session changes globally
- Deep linking support for OAuth flows

#### Data Layer
- TanStack Query for server state management with AsyncStorage persistence
- Query keys centralized in `hooks/queries/query-keys.ts`
- Custom hooks in `hooks/queries/` for each data domain
- Automatic background refetch and offline support

#### UI System
- Tamagui with platform-specific font configuration (System font on iOS, Roboto on Android)  
- Custom theme tokens with light/dark mode support
- Reusable components following atomic design principles
- Bottom sheets for modal interactions

#### Navigation
- Expo Router with file-based routing
- Typed routes with TypeScript support
- Tab-based main navigation with nested stacks
- Deep linking for notifications and external links

### Environment Configuration

The app requires these environment variables in `.env`:
```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.XXX:8000
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_IMAGE_BASE_URL=base-url-for-supabase-storage
EXPO_PUBLIC_PROJECT_ID=expo-project-id
```

### Common Development Patterns

#### Adding New Screens
- Create files in `app/` directory following Expo Router conventions
- Use TypeScript for type safety with typed routes
- Implement loading states and error handling

#### Creating Components
- Follow the existing component structure by domain
- Use Tamagui components and design tokens
- Implement proper TypeScript interfaces
- Add loading and error states where applicable

#### Data Fetching
- Create query hooks in `hooks/queries/` 
- Use proper query keys from the centralized file
- Implement optimistic updates for mutations
- Handle loading and error states consistently

#### Testing Strategy
- Use development builds on physical devices for full feature testing
- Test authentication flows thoroughly
- Verify deep linking and notifications
- Check both light and dark theme support

### Important Notes
- Always use development builds for testing push notifications and native features
- Environment variable changes don't require rebuilding - just restart the dev server
- Use `--clear` flag when encountering module resolution issues
- Platform fonts are configured automatically (iOS uses System, Android uses Roboto)
- Bottom sheets are the preferred modal pattern throughout the app