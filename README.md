# 🐾 Dog Training Task Manager

A web application for managing dog training tasks, supporting two user roles — Admin and Employee — to help training organizations efficiently assign and track each dog's training progress.

---

## Project Overview

This project is a task management system designed for pet training businesses. Admins can manage employees, dogs, and training tasks all in one place. Regular employees can view all tasks for any dog, but can only edit tasks assigned to themselves.

---

## Features

### Admin
- View, create, update, and delete all tasks
- Add and manage employee accounts
- Add and manage dog profiles
- View task assignments across all employees

### Employee
- View the full task history of any dog
- Edit only **tasks assigned to themselves**
- Cannot delete tasks or manage other employees' data

---

## Tech Stack

| Layer               | Technology           |
| ------------------- | -------------------- |
| Backend Framework   | Node.js + Express    |
| Database            | MongoDB + Mongoose   |
| Authentication      | JWT (JSON Web Token) |
| Password Encryption | bcrypt               |

---

## Database Models

The project has three core data models:

- **User** — Stores admin and employee info; the `role` field controls access permissions
- **Dog** — Stores each dog's basic profile information
- **Task** — Stores training tasks, linked to a specific dog and an assigned employee. A dog's tasks may be assigned to different employees over time — there is no fixed ownership between a dog and an employee