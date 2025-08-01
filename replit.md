# PC Builder Application

## Overview

This is a full-stack web application for building custom PC configurations. Users can select computer components, check compatibility between parts, calculate total prices, and save their builds. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database)
- **API Style**: RESTful endpoints with JSON responses
- **Build Tool**: esbuild for production bundling

### Development Setup
- **Monorepo Structure**: Shared types and schemas between client/server
- **Hot Reload**: Vite dev server with HMR for frontend
- **Process Management**: tsx for running TypeScript directly in development

## Key Components

### Database Schema (`shared/schema.ts`)
- **Products Table**: Stores component information (CPU, GPU, motherboard, etc.)
  - Includes specifications, pricing, compatibility data (socket types, wattage)
  - Uses JSON fields for flexible spec storage
- **Builds Table**: Stores user PC configurations
  - Maps component categories to selected product IDs
  - Tracks total pricing and creation timestamps

### Frontend Components
- **PC Builder Page**: Main interface for selecting components
- **Component Modal**: Product selection with filtering and pagination
- **Compatibility Sidebar**: Shows build progress and compatibility warnings
- **Selected Product Cards**: Displays chosen components with removal options

### Backend Services
- **Storage Layer**: Abstracted data access with in-memory implementation
- **Product API**: CRUD operations with advanced filtering (brand, price, search)
- **Build API**: Save and retrieve PC configurations
- **Compatibility API**: Validate component compatibility (socket matching, power requirements)

## Data Flow

1. **Component Selection**: User browses products by category with real-time filtering
2. **Compatibility Checking**: System validates CPU/motherboard socket compatibility and PSU wattage
3. **Build Management**: Users can save complete configurations with automatic price calculation
4. **Real-time Updates**: React Query provides optimistic updates and background synchronization

## WooCommerce Integration

### Features Added
- **WooCommerce REST API Integration**: Full support for connecting to WooCommerce stores
- **Direct Order Creation**: Users can create orders directly in WooCommerce from PC builds
- **Customer Information Collection**: Complete checkout form with Vietnamese interface
- **Real-time Order Status**: Integration with WooCommerce order management system
- **Product Synchronization**: Ability to sync products between PC Builder and WooCommerce

### API Endpoints
- `POST /api/woocommerce/order`: Create WooCommerce order from PC build
- `GET /api/woocommerce/status`: Check WooCommerce integration status
- `POST /api/woocommerce/sync`: Sync products from WooCommerce (future enhancement)

### Environment Variables Required
```env
WOOCOMMERCE_URL=https://yoursite.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxx
```

### Integration Methods
1. **Iframe Embedding**: Simple embed via iframe
2. **WordPress Plugin**: Custom plugin with shortcode support
3. **REST API Integration**: Full WooCommerce store integration (implemented)

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon Database
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI component primitives
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **wouter**: Lightweight React router
- **class-variance-authority**: Utility for component variant styling

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Enhanced error handling in Replit
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations handle schema updates

### Environment Configuration
- **Development**: Uses tsx for TypeScript execution with Vite dev server
- **Production**: Serves static files from Express with database connection
- **Database**: Configured for PostgreSQL with environment-based connection string

### Compatibility Notes
- Application uses Drizzle ORM with PostgreSQL dialect
- Database migrations stored in `./migrations` directory
- Schema changes managed through `drizzle-kit push` command
- Ready for PostgreSQL deployment (Neon Database optimized)