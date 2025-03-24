# VoiceCAD Backend

<img src="readme-files/train.jpg" alt="a train" width="200" height="200">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Backend API service for VoiceCAD, handling user accounts, projects, and file storage.

## 🏗️ Tech Stack

- Node.js/Express
- SQLite with Prisma
- LocalStack for S3 simulation
- Docker

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/    # Route controllers
│   ├── models/        # Prisma models
│   ├── services/      # Business logic
│   └── middleware/    # Express middleware
├── prisma/
│   └── schema.prisma  # Database schema
└── tests/            # Integration & unit tests
```

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose

### Development Setup

1. Start the services:
   ```bash
   docker-compose up
   ```

2. The API will be available at `http://localhost:3000`

## 📚 API Endpoints

### User Management
- `POST /api/users` - Create user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/:id` - Get user details

### Project Management
- `POST /api/projects` - Create project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project details

### File Management
- `POST /api/files/upload` - Upload file
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/:id` - Get file details

## ⚙️ Environment Variables

The `.env` file is automatically configured in Docker. For local development:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key"
S3_ENDPOINT="http://localhost:4566"
AWS_ACCESS_KEY_ID="test"
AWS_SECRET_ACCESS_KEY="test"
```

### Making migrations

we use dbmate to make migrations in the backend directory with something like

dbmate --url sqlite:///$(pwd)/dev.db -d ./src/database/migrations status

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.