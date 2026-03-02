# TaskFlow - Multi-Tenant Project Management Platform

<div align="center">

![TaskFlow Logo](https://via.placeholder.com/200x200?text=TaskFlow)

**A modern, scalable SaaS platform for team collaboration and project management**

[![Python](https://img.shields.io/badge/Python-3.14+-blue.svg)](https://www.python.org/downloads/)
[![Django](https://img.shields.io/badge/Django-5.0-green.svg)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 Overview

TaskFlow is a production-ready, multi-tenant SaaS application designed for modern teams to manage projects efficiently. Built with Django and Next.js, it provides real-time collaboration, secure authentication, and scalable architecture suitable for teams of any size.

### Why TaskFlow?

- **🏢 Multi-Tenant Architecture** - Support unlimited organizations with complete data isolation
- **⚡ Real-Time Collaboration** - WebSocket-powered live updates across all connected users
- **🔒 Enterprise Security** - JWT authentication with HTTP-only cookies, CSRF/XSS protection
- **📊 Interactive Kanban Boards** - Drag-and-drop task management with smooth animations
- **☁️ Cloud-Native** - AWS-ready with Terraform IaC for one-command deployment
- **🎨 Modern UI/UX** - Responsive design with Tailwind CSS and Shadcn UI components

---

## ✨ Features

### 🔐 Authentication & Authorization
- ✅ Secure JWT authentication with HTTP-only cookies
- ✅ User registration with email verification
- ✅ Password reset functionality
- ✅ Role-based access control (Owner, Admin, Member)
- ✅ Organization-level permissions

### 🏢 Organization Management
- ✅ Create and manage multiple organizations
- ✅ Invite members via email with tokenized links
- ✅ Role assignment (Owner, Admin, Member)
- ✅ Member management (add, remove, update roles)
- ✅ Organization settings and branding

### 📊 Project Management
- ✅ Create unlimited projects per organization
- ✅ Customizable project colors and descriptions
- ✅ Project members with granular permissions
- ✅ Archive/restore projects
- ✅ Project activity logging

### 📋 Task Management
- ✅ Interactive Kanban boards with drag-and-drop
- ✅ Default board lists (To Do, In Progress, In Review, Done)
- ✅ Custom list creation and ordering
- ✅ Task creation with rich descriptions
- ✅ Task assignments (multiple assignees)
- ✅ Priority levels (Low, Medium, High, Urgent)
- ✅ Due dates with overdue detection
- ✅ Labels/tags for categorization
- ✅ Task filtering (search, priority, assignee, overdue)
- ✅ Task position management within lists

### 💬 Collaboration
- ✅ Threaded comments on tasks
- ✅ Real-time updates via WebSockets
- ✅ User presence indicators
- ✅ @mentions in comments (coming soon)
- ✅ Activity feed with comprehensive audit log

### 📎 File Management
- ✅ File attachments on tasks
- ✅ AWS S3 integration with pre-signed URLs
- ✅ Support for images, documents, PDFs
- ✅ File metadata tracking
- ✅ Secure, time-limited file access

### ⚡ Real-Time Features
- ✅ Live task updates across all users
- ✅ Real-time position changes during drag-and-drop
- ✅ Instant comment notifications
- ✅ Online user presence
- ✅ WebSocket reconnection with exponential backoff

### 🎨 User Experience
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support (coming soon)
- ✅ Keyboard shortcuts
- ✅ Loading states and optimistic updates
- ✅ Error handling with user-friendly messages
- ✅ Accessibility (WCAG 2.1 AA compliant)

---

## 🎬 Demo

### Screenshots

<details>
<summary>Click to view screenshots</summary>

#### Dashboard
![Dashboard](https://via.placeholder.com/800x450?text=Dashboard)

#### Kanban Board
![Kanban Board](https://via.placeholder.com/800x450?text=Kanban+Board)

#### Task Details
![Task Details](https://via.placeholder.com/800x450?text=Task+Details)

#### Organization Management
![Organization](https://via.placeholder.com/800x450?text=Organization)

</details>

### Live Demo

🚀 **[Try TaskFlow Demo](https://taskflow-demo.com)** *(Coming Soon)*

**Demo Credentials:**
- Email: `demo@taskflow.com`
- Password: `demo123456`

---

## 🛠️ Tech Stack

### Backend
- **[Python 3.14+](https://www.python.org/)** - Core programming language
- **[Django 5.0](https://www.djangoproject.com/)** - Web framework
- **[Django REST Framework](https://www.django-rest-framework.org/)** - RESTful API
- **[Django Channels](https://channels.readthedocs.io/)** - WebSocket support
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database
- **[Redis](https://redis.io/)** - Cache & WebSocket message broker
- **[Celery](https://docs.celeryq.dev/)** - Background task processing
- **[Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)** - AWS SDK

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework (App Router)
- **[React 18](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Shadcn UI](https://ui.shadcn.com/)** - Component library
- **[DnD Kit](https://dndkit.com/)** - Drag-and-drop functionality
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management
- **[Axios](https://axios-http.com/)** - HTTP client

### Infrastructure & DevOps
- **[Docker](https://www.docker.com/)** - Containerization
- **[AWS](https://aws.amazon.com/)** - Cloud platform
  - ECS Fargate - Container orchestration
  - RDS PostgreSQL - Managed database
  - ElastiCache Redis - Managed cache
  - S3 - Object storage
  - CloudFront - CDN
  - ALB - Load balancing
- **[Terraform](https://www.terraform.io/)** - Infrastructure as Code
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD

### Development Tools
- **[Git](https://git-scm.com/)** - Version control
- **[ESLint](https://eslint.org/)** - JavaScript linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Black](https://black.readthedocs.io/)** - Python formatting
- **[pytest](https://pytest.org/)** - Python testing
- **[Jest](https://jestjs.io/)** - JavaScript testing

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                        │
│                     (React + Next.js)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   CloudFront (CDN)                           │
│                 (Static Assets + Caching)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Application Load Balancer (ALB)                 │
│           (HTTP/HTTPS + WebSocket Support)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        ↓                                 ↓
┌───────────────┐                 ┌───────────────┐
│  ECS Task 1   │                 │  ECS Task 2   │
│ Django + Daphne│                │ Django + Daphne│
│  (ASGI Server) │                │  (ASGI Server) │
└───────┬───────┘                 └───────┬───────┘
        │                                 │
        └────────────────┬────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
┌──────────────┐  ┌─────────────┐  ┌────────────┐
│   RDS        │  │ ElastiCache │  │     S3     │
│  PostgreSQL  │  │    Redis    │  │  (Media)   │
│  (Primary    │  │  (Cache &   │  │            │
│   Database)  │  │  WebSocket) │  │            │
└──────────────┘  └─────────────┘  └────────────┘
```

### Multi-Tenant Data Isolation

```python
# Every request includes organization context
request.organization → Organization Model
    ↓
All database queries filter by organization
    ↓
User only sees data from their organization(s)
```

### WebSocket Flow

```
User Action (e.g., move task)
    ↓
Frontend sends WebSocket message
    ↓
Django Channels Consumer receives message
    ↓
Broadcast to all users in project group (Redis)
    ↓
All connected clients receive update
    ↓
Frontend updates UI optimistically
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.14+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/download/)
- **Redis 7+** - [Download](https://redis.io/download/)
- **Git** - [Download](https://git-scm.com/downloads/)

Optional (for production):
- **Docker** - [Download](https://www.docker.com/products/docker-desktop/)
- **AWS CLI** - [Install Guide](https://aws.amazon.com/cli/)
- **Terraform** - [Install Guide](https://www.terraform.io/downloads)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/kusiLaw/taskflow.git
cd taskflow
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd taskflow-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Generate Django secret key
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Edit .env and add the generated secret key
nano .env
```

**Backend `.env` configuration:**

```env
# Django
SECRET_KEY=your-generated-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=taskflow
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
FRONTEND_URL=http://localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# AWS (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=taskflow-media
AWS_S3_REGION_NAME=us-east-1

# Email (Optional - for invitations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@taskflow.com
```

**Create PostgreSQL database:**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE taskflow;

# Create user (optional)
CREATE USER taskflow_user WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE taskflow TO taskflow_user;

# Exit
\q
```

**Run migrations:**

```bash
python manage.py makemigrations
python manage.py migrate
```

**Create superuser:**

```bash
python manage.py createsuperuser
```

**Load initial data (optional):**

```bash
python manage.py loaddata initial_data
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd ../taskflow-frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local
nano .env.local
```

**Frontend `.env.local` configuration:**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Running the Application

#### Development Mode

**Start Backend (Terminal 1):**

```bash
cd taskflow-backend

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Start Django server
python manage.py runserver 0.0.0.0:8000

# The backend will be available at http://localhost:8000
```

**Start Redis (Terminal 2):**

```bash
redis-server

# Or if installed via Homebrew on macOS:
brew services start redis
```

**Start Frontend (Terminal 3):**

```bash
cd taskflow-frontend

# Start Next.js development server
npm run dev

# The frontend will be available at http://localhost:3000
```

**Access the Application:**

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or login with superuser credentials
3. Create an organization and start managing projects!

#### Production Mode

See [Deployment Guide](aws-deployment/DEPLOYMENT_GUIDE.md) for production setup.

---

## 🔧 Environment Variables

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SECRET_KEY` | Django secret key | ✅ Yes | - |
| `DEBUG` | Debug mode | No | `False` |
| `ALLOWED_HOSTS` | Allowed host headers | ✅ Yes | - |
| `DB_NAME` | Database name | ✅ Yes | - |
| `DB_USER` | Database user | ✅ Yes | - |
| `DB_PASSWORD` | Database password | ✅ Yes | - |
| `DB_HOST` | Database host | ✅ Yes | `localhost` |
| `DB_PORT` | Database port | No | `5432` |
| `REDIS_URL` | Redis connection URL | ✅ Yes | - |
| `FRONTEND_URL` | Frontend URL | ✅ Yes | - |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | ✅ Yes | - |
| `AWS_ACCESS_KEY_ID` | AWS access key | No | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | No | - |
| `AWS_STORAGE_BUCKET_NAME` | S3 bucket name | No | - |
| `EMAIL_HOST` | SMTP host | No | - |
| `EMAIL_PORT` | SMTP port | No | `587` |
| `EMAIL_HOST_USER` | SMTP username | No | - |
| `EMAIL_HOST_PASSWORD` | SMTP password | No | - |

### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | ✅ Yes | - |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | ✅ Yes | - |

---

## 📚 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe"
  },
  "message": "Registration successful"
}
```

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
Set-Cookie: access_token=...; HttpOnly
Set-Cookie: refresh_token=...; HttpOnly

{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  },
  "message": "Login successful"
}
```

#### Get Current User
```http
GET /api/auth/me/
Cookie: access_token=...

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "avatar": null
}
```

#### Logout
```http
POST /api/auth/logout/
Cookie: access_token=...

Response: 200 OK
{
  "message": "Logout successful"
}
```

### Organization Endpoints

#### List Organizations
```http
GET /api/organizations/
Cookie: access_token=...

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "My Organization",
    "description": "Our awesome company",
    "owner": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    "member_count": 5,
    "user_role": "owner",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

#### Create Organization
```http
POST /api/organizations/
Cookie: access_token=...
Content-Type: application/json

{
  "name": "New Organization",
  "description": "Our new venture"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "New Organization",
  "description": "Our new venture",
  "owner": {...},
  "member_count": 1,
  "user_role": "owner"
}
```

#### Invite Member
```http
POST /api/organizations/{org_id}/invite/
Cookie: access_token=...
X-Organization-ID: {org_id}
Content-Type: application/json

{
  "email": "newmember@example.com",
  "role": "member"
}

Response: 201 Created
{
  "message": "Invitation sent to newmember@example.com",
  "invitation": {...},
  "invite_url": "http://localhost:3000/invite/token-here"
}
```

### Project Endpoints

#### List Projects
```http
GET /api/projects/?organization={org_id}
Cookie: access_token=...
X-Organization-ID: {org_id}

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Website Redesign",
    "description": "Redesign company website",
    "color": "#3B82F6",
    "organization": "uuid",
    "members": [...],
    "created_at": "2025-01-15T00:00:00Z"
  }
]
```

#### Create Project
```http
POST /api/projects/
Cookie: access_token=...
X-Organization-ID: {org_id}
Content-Type: application/json

{
  "name": "Mobile App Development",
  "description": "Build iOS and Android apps",
  "color": "#10B981"
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Mobile App Development",
  "description": "Build iOS and Android apps",
  "color": "#10B981",
  "boards": [
    {
      "id": "uuid",
      "name": "Main Board",
      "lists": [
        {"id": "uuid", "name": "To Do", "position": 0},
        {"id": "uuid", "name": "In Progress", "position": 1},
        {"id": "uuid", "name": "In Review", "position": 2},
        {"id": "uuid", "name": "Done", "position": 3}
      ]
    }
  ]
}
```

### Task Endpoints

#### Get Board Tasks
```http
GET /api/boards/?project={project_id}
Cookie: access_token=...
X-Organization-ID: {org_id}

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Main Board",
    "project": "uuid",
    "lists": [
      {
        "id": "uuid",
        "name": "To Do",
        "position": 0,
        "tasks": [
          {
            "id": "uuid",
            "title": "Design homepage",
            "description": "Create mockups for new homepage",
            "priority": "high",
            "due_date": "2025-02-01",
            "assignees": [...],
            "labels": [...],
            "position": 0
          }
        ]
      }
    ]
  }
]
```

#### Create Task
```http
POST /api/tasks/
Cookie: access_token=...
X-Organization-ID: {org_id}
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT authentication system",
  "priority": "high",
  "due_date": "2025-02-15",
  "board_list": "list-uuid",
  "project": "project-uuid"
}

Response: 201 Created
{
  "id": "uuid",
  "title": "Implement user authentication",
  "description": "Add JWT authentication system",
  "priority": "high",
  "due_date": "2025-02-15",
  "position": 0,
  "created_by": {...},
  "assignees": [],
  "labels": []
}
```

#### Move Task
```http
PATCH /api/tasks/{task_id}/move/
Cookie: access_token=...
X-Organization-ID: {org_id}
Content-Type: application/json

{
  "board_list_id": "new-list-uuid",
  "position": 2
}

Response: 200 OK
{
  "id": "uuid",
  "title": "Implement user authentication",
  "board_list": "new-list-uuid",
  "position": 2
}
```

For complete API documentation, see [API_DOCS.md](docs/API_DOCS.md) or visit `/api/docs/` when running the backend.

---

## 🧪 Testing

### Backend Tests

```bash
cd taskflow-backend

# Run all tests
python manage.py test

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report

# Run specific test file
python manage.py test apps.accounts.tests

# Run with pytest (recommended)
pip install pytest pytest-django
pytest

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=apps --cov-report=html
```

### Frontend Tests

```bash
cd taskflow-frontend

# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- TaskCard.test.tsx

# E2E tests with Playwright (if configured)
npm run test:e2e
```

---

## 🚢 Deployment

### AWS Deployment (Recommended)

TaskFlow includes complete Infrastructure as Code (IaC) using Terraform for AWS deployment.

**Quick Start:**

```bash
cd aws-deployment

# 1. Install prerequisites
brew install awscli terraform

# 2. Configure AWS
aws configure

# 3. Setup Terraform
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 4. Deploy infrastructure
terraform init
terraform plan
terraform apply

# 5. Build and deploy application
cd ../scripts
./build-and-push.sh
./deploy.sh
```

**Full deployment guide:** [aws-deployment/DEPLOYMENT_GUIDE.md](aws-deployment/DEPLOYMENT_GUIDE.md)

**What gets deployed:**
- ✅ ECS Fargate cluster (2-4 auto-scaled tasks)
- ✅ RDS PostgreSQL (Multi-AZ for production)
- ✅ ElastiCache Redis
- ✅ Application Load Balancer
- ✅ S3 bucket for media files
- ✅ CloudWatch logging
- ✅ Auto-scaling policies
- ✅ Security groups and VPC

**Estimated monthly cost:**
- Development: $67/month
- Production: $165/month

### Docker Deployment

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

For manual deployment to other platforms (DigitalOcean, Heroku, etc.), see [DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 📁 Project Structure

```
taskflow/
├── taskflow-backend/              # Django backend
│   ├── apps/                      # Django apps
│   │   ├── accounts/              # User authentication
│   │   ├── organizations/         # Multi-tenant organizations
│   │   └── projects/              # Projects, tasks, boards
│   ├── config/                    # Django configuration
│   │   ├── settings/
│   │   │   ├── base.py           # Base settings
│   │   │   ├── development.py   # Dev settings
│   │   │   └── production.py    # Prod settings
│   │   ├── urls.py               # URL routing
│   │   ├── asgi.py               # ASGI config (WebSockets)
│   │   └── wsgi.py               # WSGI config
│   ├── core/                      # Core utilities
│   │   └── middleware/            # Custom middleware
│   ├── manage.py
│   └── requirements.txt
│
├── taskflow-frontend/             # Next.js frontend
│   ├── app/                       # Next.js 14 App Router
│   │   ├── (auth)/               # Auth pages (login, register)
│   │   ├── (dashboard)/          # Protected pages
│   │   │   └── dashboard/        # Main dashboard
│   │   │       ├── projects/     # Projects pages
│   │   │       └── organizations/ # Org settings
│   │   └── layout.tsx            # Root layout
│   ├── components/                # React components
│   │   ├── ui/                   # Shadcn UI components
│   │   ├── kanban/               # Kanban board components
│   │   ├── projects/             # Project components
│   │   └── organizations/        # Organization components
│   ├── lib/                       # Utilities
│   │   ├── api/                  # API client
│   │   ├── hooks/                # Custom React hooks
│   │   └── utils.ts              # Helper functions
│   ├── store/                     # Zustand state management
│   ├── types/                     # TypeScript types
│   ├── public/                    # Static assets
│   └── package.json
│
├── aws-deployment/                # AWS Infrastructure as Code
│   ├── terraform/                 # Terraform configs
│   ├── docker/                    # Production Dockerfiles
│   ├── scripts/                   # Deployment scripts
│   └── DEPLOYMENT_GUIDE.md
│
├── docs/                          # Documentation
│   ├── API_DOCS.md               # API documentation
│   ├── ARCHITECTURE.md           # Architecture details
│   └── CONTRIBUTING.md           # Contributing guide
│
├── .github/                       # GitHub configuration
│   └── workflows/                 # GitHub Actions
│       └── deploy.yml            # CI/CD pipeline
│
├── docker-compose.yml             # Docker Compose config
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Getting Started

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/kusiLaw/taskflow.git
   cd taskflow
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes**
5. **Commit your changes:**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
6. **Push to your branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

#### Code Style

**Backend (Python):**
- Follow PEP 8
- Use Black for formatting
- Use isort for import sorting
- Maximum line length: 100 characters

```bash
# Format code
black .
isort .

# Lint
flake8
```

**Frontend (TypeScript):**
- Follow Airbnb Style Guide
- Use Prettier for formatting
- Use ESLint for linting

```bash
# Format code
npm run format

# Lint
npm run lint
```

#### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add user profile page
fix: resolve WebSocket reconnection issue
docs: update API documentation
style: format code with prettier
refactor: simplify authentication logic
test: add tests for task API
chore: update dependencies
```

#### Pull Request Process

1. Update README.md with details of changes if needed
2. Update documentation if you changed APIs
3. Add tests for new features
4. Ensure all tests pass
5. Update CHANGELOG.md
6. Request review from maintainers

### Reporting Bugs

Use GitHub Issues and include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, versions)

### Feature Requests

Use GitHub Issues with `enhancement` label and describe:
- Problem you're trying to solve
- Proposed solution
- Alternative solutions considered
- Impact on existing features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 TaskFlow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **[Django](https://www.djangoproject.com/)** - The web framework for perfectionists with deadlines
- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[Shadcn UI](https://ui.shadcn.com/)** - Beautifully designed components
- **[Vercel](https://vercel.com/)** - For Next.js and inspiration
- **[Tailwind CSS](https://tailwindcss.com/)** - For utility-first CSS
- All our [contributors](https://github.com/kusiLaw/taskflow/graphs/contributors)

---

## 📞 Contact

**Project Maintainer:** Lawrence Kusi

- Email: lawrence.kusi.addai@gmail.com
- GitHub: [@lawrencekusi](https://github.com/kusiLaw)
- LinkedIn: [Lawrence Kusi](https://www.linkedin.com/in/lawrence-addai-kusi)
- Website: [lawrencekusi.site](https://lawrencekusi.site)

**Project Link:** [https://github.com/kusiLaw/taskflow](https://github.com/kusiLaw/taskflow)

**Live Demo:** [https://taskflow-demo.com](https://taskflow-demo.com) *(Coming Soon)*

---

## 🌟 Show Your Support

If you find this project useful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🔀 Submitting pull requests
- 📢 Sharing with others

---

## 📊 Project Status

![GitHub last commit](https://img.shields.io/github/last-commit/kusiLaw/taskflow)
![GitHub issues](https://img.shields.io/github/issues/kusiLaw/taskflow)
![GitHub pull requests](https://img.shields.io/github/issues-pr/kusiLaw/taskflow)
![GitHub stars](https://img.shields.io/github/stars/kusiLaw/taskflow?style=social)

**Current Version:** 1.0.0

**Status:** ✅ Production Ready

---

## 🗺️ Roadmap

### Phase 1 - Core Features ✅ (Completed)
- [x] User authentication
- [x] Organization management
- [x] Project management
- [x] Kanban boards
- [x] Real-time collaboration
- [x] File attachments

### Phase 2 - Enhanced Features 🚧 (In Progress)
- [ ] Dark mode
- [ ] Gantt chart view
- [ ] Time tracking
- [ ] Advanced search
- [ ] Bulk operations
- [ ] Keyboard shortcuts

### Phase 3 - Integrations 📅 (Planned)
- [ ] Slack integration
- [ ] GitHub integration
- [ ] Google Drive integration
- [ ] Email notifications
- [ ] Calendar sync
- [ ] Webhooks API

### Phase 4 - Mobile 📅 (Planned)
- [ ] iOS app (React Native)
- [ ] Android app (React Native)
- [ ] Progressive Web App (PWA)

### Phase 5 - Enterprise 📅 (Future)
- [ ] Single Sign-On (SSO)
- [ ] Advanced analytics
- [ ] Custom workflows
- [ ] API rate limiting
- [ ] White-labeling
- [ ] Audit logs

---

<div align="center">

**Built with ❤️ by [Lawrence Kusi](https://github.com/kusiLaw)**

⭐ **Star this repo if you find it useful!** ⭐

[Report Bug](https://github.com/kusiLaw/taskflow/issues) • [Request Feature](https://github.com/kusiLaw/taskflow/issues) • [Documentation](https://taskflow-docs.com)

</div>
