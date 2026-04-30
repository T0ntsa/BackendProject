# 🐾 Dog Training Task Manager

A web application for managing dog training tasks, supporting two user roles — Admin and Employee — to help training organizations efficiently assign and track each dog's training progress.

---

## Project Overview

This project is a task management system designed for pet training businesses. Admins can manage employees, dogs, and training tasks all in one place. Regular employees can view all tasks for any dog, but can only edit tasks assigned to themselves.

---

## Features

### Admin

- View, create, update, and delete all tasks
- View, create, update, and delete all dogs
- View task assignments across all emplyees

### Employee

- Edit only **tasks assigned to themselves**
- Cannot delete tasks or manage other employees' data
- View dogs' data

---

## Tech Stack

| Layer               | Technology                       |
| ------------------- | -------------------------------- |
| Backend Framework   | Node.js + Express                |
| Database            | MongoDB + Mongoose               |
| Authentication      | JWT (JSON Web Token)             |
| Password Encryption | bcrypt                           |
| Template Engine     | Express Handlebars               |
| Frontend            | Vanilla JavaScript + Bootstrap 5 |

---

## Database Models

The project has three core data models:

- **User** — Stores name, email, password; the `role` (admin or employee)
- **Dog** — Stores name, breed, age, owner, photo, and notes
- **Task** — Stores title, description, status, priority, due date, and references to a dog and a trainer.

## API Routes

### Auth

| Method | Route              | Access    |
| ------ | ------------------ | --------- |
| POST   | /api/auth/register | Public    |
| POST   | /api/auth/login    | Public    |
| GET    | /api/auth/trainers | Protected |

### Dogs

| Method | Route         | Access     |
| ------ | ------------- | ---------- |
| GET    | /api/dogs     | Protected  |
| POST   | /api/dogs     | Admin only |
| PUT    | /api/dogs/:id | Admin only |
| DELETE | /api/dogs/:id | Admin only |

### Tasks

| Method | Route             | Access                    |
| ------ | ----------------- | ------------------------- |
| GET    | /api/tasks        | Protected                 |
| GET    | /api/tasks/:id    | Protected                 |
| POST   | /api/tasks/create | Admin only                |
| PATCH  | /api/tasks/:id    | Admin or assigned trainer |
| DELETE | /api/tasks/:id    | Admin only                |

---

## Getting Started

1. Clone the repository
2. Run `npm install`
3. Create a `.env` file and add your MongoDB URI and JWT secret:

```
MONGODB_URI=your_mongodb_uri
JWT_TOKEN=your_secret_key
PORT=5000
```

4. Run `npm start`
5. Open `http://localhost:5000`
