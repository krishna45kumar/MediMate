# MadimatBackend

MediMate Medicine Reminder backend built with Spring Boot 3.2.3 and Java 17.

## Requirements
- JDK 17
- Maven (or IntelliJ's bundled Maven)
- MySQL 8+

## Database configuration
The application connects to `medimate_db` on `localhost:3306` using MySQL user `root`.

If your MySQL root account has a password, set the `DB_PASSWORD` environment variable before running the application. The default is an empty password.

The JDBC URL includes `createDatabaseIfNotExist=true`, so MySQL creates the database automatically if the configured user has permission.

## Run
1. Start MySQL.
2. Open this folder in IntelliJ IDEA as a Maven project.
3. Reload Maven dependencies.
4. Run `MadimatBackendApplication.java`.

The server starts at `http://localhost:8080`.

## API endpoints

Base URL: `/api/medicines`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/medicines` | Add a medicine |
| GET | `/api/medicines` | Get all medicines |
| GET | `/api/medicines/{id}` | Get one medicine |
| PUT | `/api/medicines/{id}` | Update a medicine |
| DELETE | `/api/medicines/{id}` | Delete a medicine |
| PATCH | `/api/medicines/{id}/taken` | Mark medicine as taken |

## Example POST body
```json
{
  "name": "Paracetamol",
  "dosage": "500mg",
  "timing": "Morning"
}
```

`timing` must be one of `Morning`, `Afternoon`, or `Night`. New medicines are saved with `isTaken=false`.
