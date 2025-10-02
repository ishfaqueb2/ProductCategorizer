# Product Categorizer - AI-Powered Taxonomy

## Overview

This is a Progressive Web App (PWA) built with React and Express that uses Google's Gemini AI to automatically categorize products into a taxonomy hierarchy. The application provides a wizard-based interface for uploading product data (CSV/XLSX), mapping columns to required fields, uploading taxonomy definitions, configuring confidence thresholds, and processing products in batches. It features dark/light theme support, offline capabilities via service workers, and a professional Linear-inspired design system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**State Management**: 
- TanStack Query (React Query) for server state management
- Local React state (useState) for UI state
- LocalStorage for persisting API keys and theme preferences

**Routing**: Wouter for lightweight client-side routing

**UI Component Library**: Radix UI primitives with custom styled components via shadcn/ui pattern
- Consistent component variants using class-variance-authority
- Tailwind CSS for styling with custom design tokens
- Custom CSS variables for theme switching (light/dark mode)

**Design System**:
- Linear-inspired aesthetic with Material Design patterns
- Focus on clarity, data density, and professional appearance
- Custom color palette with semantic color naming (success, warning, info)
- Typography using Inter font family
- Component system located in `client/src/components/ui/`

**Progressive Web App Features**:
- Service Worker (`public/sw.js`) for offline caching
- Web App Manifest (`public/manifest.json`) for installability
- Cache-first strategy for static assets

**Key UI Patterns**:
- Wizard stepper workflow (upload → map → taxonomy → configure → process → export)
- File upload with drag-and-drop support
- Interactive column mapping interface
- Real-time progress tracking during batch processing
- Results table with confidence score visualization

### Backend Architecture

**Framework**: Express.js with TypeScript

**Server Structure**:
- `server/index.ts`: Main server entry point with middleware setup
- `server/routes.ts`: API route handlers for file uploads and processing
- `server/storage.ts`: Data persistence abstraction layer
- `server/vite.ts`: Development server integration with Vite HMR

**Storage Strategy**:
- Interface-based storage abstraction (`IStorage`)
- In-memory implementation (`MemStorage`) for development
- Schema designed for PostgreSQL migration via Drizzle ORM
- Session-based processing with progress tracking

**File Processing**:
- CSV parsing via PapaParse library
- Excel file support (.xlsx/.xls) via XLSX library
- Multer for multipart form-data handling
- Column header detection and mapping

**API Endpoints**:
- File upload endpoints for product and taxonomy files
- Session management for tracking processing state
- Batch processing with chunk-based approach (500 products per API call)

### Data Storage

**ORM**: Drizzle ORM with PostgreSQL dialect

**Database Schema** (`shared/schema.ts`):

1. **process_sessions table**:
   - Stores processing session metadata
   - Tracks column mappings, file names, confidence threshold
   - Progress tracking (totalProducts, processedProducts)
   - Status field for workflow state management

2. **products table**:
   - Individual product records linked to sessions
   - Stores mapped product data (id, name, brand, description, images)
   - AI categorization results (taxonomyId, taxonomyPath, confidenceScore)
   - Status tracking (pending, high-confidence, low-confidence, error)
   - Error message storage for failed categorizations

**Schema Validation**: Zod schemas via drizzle-zod for type-safe inserts

**Migration Strategy**: Drizzle Kit for schema migrations to PostgreSQL

**Current Implementation**: In-memory storage with Map-based data structures for development, designed to be easily swapped for database-backed storage

### External Dependencies

**AI Service Integration**:
- **Google Gemini API** (`@google/genai` package) for product categorization
- Client-side API key storage (localStorage)
- Batch processing approach (500 products per request)
- Returns taxonomy ID, taxonomy path, and confidence scores

**Database Service**:
- **Neon Database** (`@neondatabase/serverless`) for PostgreSQL hosting
- Serverless-optimized PostgreSQL driver
- Connection via DATABASE_URL environment variable

**Third-Party Libraries**:
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, popovers, etc.)
- **TailwindCSS**: Utility-first CSS framework with PostCSS
- **Lucide React**: Icon library
- **PapaParse**: CSV parsing
- **XLSX**: Excel file parsing
- **Multer**: File upload handling
- **React Hook Form** with Zod resolvers for form validation
- **date-fns**: Date formatting utilities

**Development Tools**:
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Server-side bundling for production
- **Drizzle Kit**: Database schema management

**PWA Infrastructure**:
- Service Worker API for offline caching
- Cache API for asset storage
- Web App Manifest for installation metadata

**Design Rationale**:
- Separation of concerns with shared schema types between client and server
- Type-safe API layer with TypeScript throughout
- Flexible storage abstraction allowing easy database integration
- Component-driven UI with reusable design system
- Wizard pattern for complex multi-step workflow
- Progressive enhancement with offline-first approach