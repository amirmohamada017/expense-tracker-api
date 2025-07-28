# Expense Tracker API

This project provides a secure and scalable backend for tracking user expenses with features like authentication, expense management, and statistical analysis.

## Features

- User authentication with JWT (register, login, profile management)
- CRUD operations for expense management
- Expense filtering and pagination
- Statistical analysis of expenses by category and time period
- Input validation with Joi
- Rate limiting and security headers with Helmet
- CORS support for cross-origin requests
- Type-safe code with TypeScript
- Database management with Prisma ORM
- Error handling and logging
- Development and production-ready configurations

## Prerequisites

- Node.js (>=18.0.0)
- PostgreSQL (local or cloud instance)
- npm or yarn
- Git

## Installation

1. Clone the repository:

```bash
git clone https://github.com/amirmohamada017/expense-tracker-api.git
cd expense-tracker-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:
   - Ensure PostgreSQL is running
   - Create a database for the project
   - Configure the database connection in the `.env` file (see Environment Variables)

4. Run database migrations:

```bash
npm run db:migrate
```

5. Generate Prisma client:

```bash
npm run db:generate
```

## Configuration

Create a `.env` file based on `.env.example` with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker"

# JWT Secret (use a strong, random string)
JWT_SECRET="your-super-secret-jwt-key-here"

# Server Configuration
PORT=3000
NODE_ENV=development

# Optional: Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Project Structure

The project follows a clean architecture pattern with separation of concerns:

- **`src/server.ts`** - Main application entry point
- **`src/app.ts`** - Express app configuration and middleware setup
- **`prisma/schema.prisma`** - Database schema and models
- **`src/controllers/`** - Request handling logic for auth and expenses
- **`src/routes/`** - API route definitions
- **`src/services/`** - Business logic layer
- **`src/middleware/`** - Authentication and validation middleware
- **`src/types/`** - TypeScript type definitions

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

1. Build the project:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and receive a JWT token
- `GET /api/auth/profile`: Get the authenticated user's profile (requires token)
- `PUT /api/auth/profile`: Update the authenticated user's profile (requires token)

### Expenses

- `POST /api/expenses`: Create a new expense (requires token)
- `GET /api/expenses`: Get all expenses for the authenticated user with optional filters (requires token)
- `GET /api/expenses/stats`: Get expense statistics (requires token)
- `GET /api/expenses/:id`: Get a specific expense by ID (requires token)
- `PUT /api/expenses/:id`: Update a specific expense by ID (requires token)
- `DELETE /api/expenses/:id`: Delete a specific expense by ID (requires token)

### Example Request (Create Expense)

```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dinner",
    "description": "Dinner at restaurant",
    "amount": 45.99,
    "category": "food",
    "expense_date": "2025-07-28"
  }'
```

### Example Response

```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "expense": {
      "id": 1,
      "user_id": 1,
      "title": "Dinner",
      "description": "Dinner at restaurant",
      "amount": 45.99,
      "category": "food",
      "expense_date": "2025-07-28T00:00:00.000Z",
      "created_at": "2025-07-28T08:58:00.000Z",
      "updated_at": "2025-07-28T08:58:00.000Z"
    }
  }
}
```

---

This project was completed as listed on roadmap.sh: https://roadmap.sh/projects/expense-tracker-api
