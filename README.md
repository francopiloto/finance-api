# 💸 Finance API

A modern, secure and scalable API for personal finance management. Built with **NestJS**, this backend system showcases a professional-grade architecture featuring advanced authentication, modular design, and full test coverage — everything companies hiring top-level engineers expect.

---

## ✨ Features

### ✅ Authentication & Authorization

- JWT-based **access token** and **refresh token** system
- Token revocation and session management by device (`aud`)
- Modular Passport strategies (`jwt`, `jwt-refresh`)
- Guards for:
  - Public/private route protection
  - Refresh token verification
  - Resource ownership enforcement
- Decorators for:
  - Current user injection
  - Custom authentication info (e.g., device)

### ✅ User Module

- Signup with hashed password
- Login with secure credentials
- Refresh & revoke tokens
- Update profile (`name`, `email`)
- Protected endpoints using guards and decorators

### ✅ Expense Management

- Create, update and delete **expenses**
- Support for recurring expenses via **installments**
- Categorize by priority and **expense groups** (global or user-defined)
- Track **payment status** (`pending`, `scheduled`, `paid`)
- Link **payment methods** with due/payment day support

### ✅ Code Quality & Best Practices

- Modular architecture (`src/modules`)
- Clean separation of entities, services, controllers, DTOs
- Swagger integration (`@nestjs/swagger`)
- Uses `@nestjs/config`, `class-validator`, `typeorm`, `bcrypt`, `passport`

### ✅ Tests

- Unit tests with `jest`
- Full coverage for services, controllers, strategies, and guards
- Mocks and isolated test environments

---

## 🛠️ Technologies

- **NestJS**: Progressive Node.js framework
- **TypeORM**: Database ORM for PostgreSQL
- **Passport**: Modular authentication middleware
- **JWT**: Stateless authentication
- **Jest**: Testing framework

---

## 🚀 Getting Started

```bash
# Install dependencies
yarn install

# Copy environment files and set the values according to your local environment. See the **Environment Variables** section below for the complete list of variables.
cp .env.example .env.dev
cp .env.example .env.test

# Generate database schema
# (Only if the database is empty or for the first time)
yarn build
npm run migration:run

# Start development server
yarn start:dev
```

---

## 🔄 Workflow

### 🧪 Running tests

```bash
yarn test      # run unit tests
yarn test:cov  # check coverage
```

### 📦 After editing any entity

```bash
# Generate a new migration (auto detects changes)
npm run migration:generate --name=migration-name

# Rebuild and apply migration
yarn build
npm run migration:run
```

### 🔁 After pulling updates from Git

```bash
yarn install

# Check for changes in the .env.example file
# Rebuild and apply any new migrations
yarn build
npm run migration:run
```

### 💡 Tip: How to revert a migration

```bash
yarn build
npm run migration:revert
```

---

## 📁 Environment Variables

Keep your environment files **out of version control**. Use `.env.example` as a reference.

```env
# Database
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=

# JWT configuration
AUTH_JWT_SECRET=
AUTH_JWT_EXPIRES_IN=
AUTH_JWT_REFRESH_EXPIRES_IN=
```

Create two local copies:

```bash
cp .env.example .env.dev
cp .env.example .env.test
```

---

## 🥪 Test Coverage

![Coverage Badge](https://img.shields.io/badge/test--coverage-100%25-brightgreen)

---

## 📌 Why This Project Stands Out

✅ Designed for **real-world scalability**  
✅ Implements **secure and granular access control**  
✅ Clean, modern **code structure**  
✅ Fully **tested** and **documented**  
✅ Showcases advanced **NestJS mastery**

---

## 📅 UUIDv7 for Entity IDs

This project uses **UUIDv7** as the default identifier for all database entities. UUIDv7 brings the best of both worlds:

- 📈 **Performance**: Sequentially sortable, improving write performance and index locality in PostgreSQL.
- 🔒 **Security**: Maintains randomness and uniqueness without relying on centralized ID generators.
- 🌐 **Scalability**: Ideal for distributed systems that require high-throughput insertions.

The implementation uses a custom `@PrimaryUuidColumn()` decorator that automatically generates UUIDv7 values for entity primary keys. This ensures consistency and eliminates the need for manual ID assignment.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🤝 Contact

📧 fjmanselmo@gmail.com
🔗 [LinkedIn Profile](https://www.linkedin.com/in/franco-marques/)
💼 Open to full-time **remote opportunities**

---

Made with ❤️ using NestJS
