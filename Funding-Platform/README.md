## Contributors
Tien Nguyen
Shihab Marey
Sajid Rahman
Gowtham Basker
Shayan Mahmoudi
Reggie Ibe
Ashaz Khan
Riham 

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


# Finance System

A platform for connecting innovators with investors, managing project milestones, and handling escrow funds.

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI (MUI) with custom theme
- React Router for navigation
- React Query for data fetching
- Recharts for data visualization

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL for database
- JWT for authentication
- bcrypt for password hashing

## Project Structure

```
innocap-forge/
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
   createdb innocap_forge
   ```
3. Run the migration script:
   ```bash
   psql -d innocap_forge -f database/migrations.sql
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
   REACT_APP_API_URL=http://localhost:5000
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
