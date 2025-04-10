[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=16848314&assignment_repo_type=AssignmentRepo)

# Finance System

A platform for connecting innovators with investors, managing project milestones, and handling escrow funds.

# Dependencies (with PostgreSQL)

Here are all the dependencies used in the platform along with installation commands, updated for PostgreSQL instead of Microsoft SQL Server:

## Frontend Dependencies

```bash
# Navigate to the frontend directory
cd client

# Install all frontend dependencies
npm install react@19.0.0 react-dom@19.0.0 react-scripts@5.0.1 typescript@4.9.5 \
@types/react@19.0.10 @types/react-dom@19.0.4 @types/node@16.18.126 \
react-router-dom@7.3.0 \
@mui/material@6.4.7 @mui/icons-material@6.4.7 @emotion/react@11.14.0 @emotion/styled@11.14.0 \
@tanstack/react-query@5.67.2 axios@1.8.2 \
react-hook-form@7.54.2 @hookform/resolvers@4.1.3 zod@3.24.2 \
recharts@2.15.1 \
@testing-library/react@16.2.0 @testing-library/jest-dom@6.6.3 @testing-library/dom@10.4.0 \
@testing-library/user-event@13.5.0 @types/jest@27.5.2 \
web-vitals@2.1.4
```

You can also simply run:
```bash
cd client
npm install
```
This will install all dependencies as defined in the client/package.json file.

### Frontend Dependencies Breakdown:

- **Core React**:
  - react: ^19.0.0
  - react-dom: ^19.0.0
  - react-scripts: 5.0.1
  - typescript: ^4.9.5
  - @types/react: ^19.0.10
  - @types/react-dom: ^19.0.4
  - @types/node: ^16.18.126

- **Routing**:
  - react-router-dom: ^7.3.0

- **UI Components**:
  - @mui/material: ^6.4.7
  - @mui/icons-material: ^6.4.7
  - @emotion/react: ^11.14.0
  - @emotion/styled: ^11.14.0

- **Data Management**:
  - @tanstack/react-query: ^5.67.2
  - axios: ^1.8.2

- **Form Handling**:
  - react-hook-form: ^7.54.2
  - @hookform/resolvers: ^4.1.3
  - zod: ^3.24.2

- **Data Visualization**:
  - recharts: ^2.15.1

- **Testing**:
  - @testing-library/react: ^16.2.0
  - @testing-library/jest-dom: ^6.6.3
  - @testing-library/dom: ^10.4.0
  - @testing-library/user-event: ^13.5.0
  - @types/jest: ^27.5.2

- **Performance Monitoring**:
  - web-vitals: ^2.1.4

## Backend Dependencies (with PostgreSQL)

The backend with PostgreSQL as the database:

```bash
# Navigate to the backend directory
cd server

# Install core backend dependencies
npm install express typescript ts-node @types/express @types/node \
jsonwebtoken bcrypt pg \
dotenv cors helmet \
@azure/storage-blob \
nodemailer

# Install dev dependencies
npm install --save-dev nodemon typescript @types/jsonwebtoken @types/bcrypt @types/pg @types/cors
```

### Backend Dependencies Breakdown:

- **Server Framework**:
  - express (for API server)
  - typescript (for type safety)
  - ts-node (for TypeScript execution)

- **Database**:
  - pg (PostgreSQL client)

- **Authentication & Security**:
  - jsonwebtoken (JWT implementation)
  - bcrypt (for password hashing)
  - helmet (for HTTP security headers)

- **Storage**:
  - @azure/storage-blob (for document storage)

- **Communication**:
  - nodemailer (for email notifications)
  - cors (for Cross-Origin Resource Sharing)

- **Environment**:
  - dotenv (for environment variables)

- **Development**:
  - nodemon (for hot reloading during development)
  - TypeScript type definitions (@types/*)

## Optional but Recommended Backend Packages

```bash
# ORM for PostgreSQL
npm install sequelize sequelize-typescript pg-hstore

# Migration tools
npm install umzug

# Validation
npm install class-validator class-transformer

# Logging
npm install winston [Mandatory]
```

## Database Setup (PostgreSQL)

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install PostgreSQL (macOS with Homebrew)
brew install postgresql

# Create database
createdb funding_platform

# Run migrations (if using Sequelize or similar)
npx sequelize-cli db:migrate
```

## Infrastructure Dependencies (not installed via npm)

- **Cloud Services** for hosting (Azure or similar)
- **PostgreSQL** for database
- **Docker** for containerization
- **GitHub Actions** for CI/CD

To install all dependencies for the full-stack application, you would need to run the installation commands in both the client and server directories.

## Project Structure

```
Fudig-platform/
├── client/                  # React frontend
│   ├── public/              # Static files
│   └── src/
│       ├── components/      # UI components
│       ├── contexts/        # React context providers
│       ├── hooks/           # Custom React hooks
│       ├── pages/           # Page components
│       ├── services/        # API services
│       ├── themes/          # MUI theme customization
│       ├── types/           # TypeScript type definitions
│       └── utils/           # Utility functions
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── .env                 # Environment variables
│
├── database/                # SQL scripts and migrations
└── README.md                # Project documentation

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn
- PostgreSQL database

### Database Setup
1. Install PostgreSQL if you haven't already
2. Create a new database:
   ```bash
   createdb funding_platform
   ```
3. Run the migration script:
   ```bash
   psql -d funding_platform -f database/migrations.sql
   do the same for all sql files i database folder
   ```

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the `.env.example` file:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your PostgreSQL credentials
5. Run the server in development mode:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
4. Set the API URL in the `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5050
   ```
5. Run the frontend in development mode:
   ```bash
   npm start
   ```

## User Roles
- **Admin**: Manage users, verify projects, handle escrow funds
- **EscrowManager**: Focus on escrow management and milestone verification
- **Innovator**: Create and manage projects, submit milestones
- **Investor**: Browse and fund projects, form syndicates, vote on milestone completions

## Features
- User registration and role-based authentication
- Project creation and management
- Milestone tracking and verification
- Escrow fund management
- Investor syndicates
- Real-time notifications
- Admin dashboard for user and project management

After analyzing the project files, I can see this is a comprehensive full-stack application called "InnoCap Forge" - a platform designed to connect innovators with investors, manage project funding, and handle milestone-based fund releases through an escrow system.

## Architecture Overview

This project follows a modern full-stack architecture with:

### Frontend
- React with TypeScript
- Material-UI (MUI) for UI components with a custom dark theme
- React Router for navigation
- State management through React context
- React Query for data fetching and caching
- Responsive design for various device sizes

### Backend
- Node.js with Express
- TypeScript for type safety
- PostgreSQL database
- JWT for authentication
- Role-based authorization system

## Key Components and Flows

### 1. State Transition System

The application revolves around a state transition model where entities (users, projects, milestones, escrow funds) move through defined states:

- **User Registration Flow**:
  - User submits registration → PendingApproval → Admin Verification → Verified or Rejected
  - Only verified users can access platform functionality based on their roles

- **Project Creation Flow**:
  - Verified Innovator creates project → PendingApproval → Admin Review → SeekingFunding or Rejected
  - Projects progress from SeekingFunding → PartiallyFunded → FullyFunded → InProgress → Completed

- **Milestone Management Flow**:
  - Projects in progress have milestones → Innovator submits verification docs → PendingVerification → Investor/Admin Review → Approved or Rejected
  - When a milestone is approved, escrow funds are released to the innovator

- **Investor Syndicate Flow**:
  - Investors can form syndicates → Admin approves → OpenForContributions → Active
  - Milestone verification requires majority investor vote to release escrow funds

### 2. Context Providers

The application uses React's Context API for state management across components:

- **AuthContext**: Manages user authentication state
  - Stores user information, authentication status, and tokens
  - Provides login/logout functionality
  - Handles JWT token storage and renewal
  - Secures routes based on user roles and authentication status
  - Initializes with a token check on app load to maintain sessions

- **StateTransitionManager**: Tracks and records entity state changes
  - Records transitions with before/after states and reasons
  - Maintains audit trail for compliance and transparency
  - Provides history of state changes for any entity

### 3. User Roles and Permissions

- **Admin**: Complete platform oversight, approval authority for users, projects, and escrow releases
- **EscrowManager**: Focused on fund management and milestone verification
- **Innovator**: Creates projects, submits milestones, and receives funding
- **Investor**: Browses projects, contributes funding, forms syndicates, votes on milestone approvals

### 4. Key Pages and Components

- **Authentication Pages**: 
  - Login.tsx: User login with email/password
  - Register.tsx: New user registration with role selection and validation

- **Dashboard System**:
  - Dashboard.tsx: Role-specific dashboard showing relevant metrics and actions
  - AppLayout.tsx: Common navigation structure with sidebar, header, and notifications

- **Project Management**:
  - Projects.tsx: Browse and filter available projects
  - CreateProject.tsx: Multi-step form for innovators to create new projects
  - ProjectDetails.tsx: Detailed view of a project with milestone tracking

- **Admin Components**:
  - TransactionVerificationPanel.tsx: Complex component for administrators to verify financial transactions
    - Tab-based interface for pending/completed/rejected transactions
    - Detailed transaction analysis with risk assessment
    - Verification and rejection workflows with audit trails
    - User activity tracking and document verification

- **Virtual Wallet**:
  - VirtualWallet.tsx: Component for managing financial transactions
    - Displays balance and transaction history
    - Handles deposits with different payment methods
    - Requires proof of payment uploads
    - Manages transaction status flow (pending → verification → completed/rejected)

### 5. Database Schema

The system uses a relational database (PostgreSQL) with tables for:
- Users: Stores authentication and profile details with statuses
- Projects: Tracks project lifecycle, funding goals and status
- Milestones: Manages project milestones and verification status
- Escrow: Handles locked/released funds for milestones
- Investors: Stores investor profiles and preferences
- Syndicates: Manages investor groups and voting rights
- Notifications: System-generated alerts and messages
- Transactions: Financial operations with verification status

### 6. UI/UX Design

- Custom dark theme with brand colors (forge red, orange accents)
- Gradient elements and glass-morphism design
- Card-based interfaces with subtle shadows
- Responsive sidebar navigation that collapses on mobile
- Tab-based interfaces for complex workflows
- Status indicators using chips with semantic colors
- Notification system with unread indicators

### 7. Data Flow and Business Logic

- The AdminLogic utility provides encapsulated business logic for admin operations
- State transitions are formally recorded for audit purposes
- Form validations enforce data integrity rules
- The system uses TypeScript interfaces to maintain type safety
- Transaction processing includes risk assessment and verification workflows
- Wallet management includes multi-step deposit verification

### 8. Transaction Verification Workflow

The TransactionVerificationPanel component demonstrates a comprehensive workflow:

1. Admin views pending transactions with risk indicators
2. Can filter/sort transactions by various criteria
3. Views transaction details and proof documents
4. Accesses user activity history for context
5. Can approve or reject transactions with notes
6. System records all decisions and updates transaction status
7. Notifications are generated for relevant stakeholders

This platform is designed with significant attention to process integrity, ensuring transparency and trust between innovators and investors while providing administrators with robust tools for oversight and management. The state transition system ensures all entities follow a defined lifecycle with appropriate verifications at each stage.

### Tips
All passwords are "Password123"
users  sarah@example.com ,  emily@example.com and admin@innocapforge.com can be used to login
Login and registration component and logic  already implemented

### Note
Please document your work process, component implementation, flows, difficulties and how you worked it out.

Clone repo and work on your cloned repository, this helps log  errors  and prevets clashes


