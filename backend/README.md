# Retail Inventory Management System

A complete REST API for a Retail Inventory Management System built with Java Spring Boot and PostgreSQL.

## Technologies Used
- Java 21
- Spring Boot (Web, Data JPA, Validation)
- Hibernate
- PostgreSQL
- Maven
- BCrypt (for password hashing)

## Project Structure
This project follows a standard layered architecture:
- `controller`: Exposes REST API endpoints.
- `service`: Contains business logic and transactional boundaries.
- `repository`: Interfaces with PostgreSQL database using Spring Data JPA.
- `model`: Maps Java entities to database tables.

## PostgreSQL Setup
The application connects to an existing PostgreSQL database named `retail`.

### Environment Configuration
The database connection is configured in `src/main/resources/application.properties`. 
You can provide the database password via an environment variable `DB_PASSWORD` or it will default to `postgres`.

```bash
export DB_PASSWORD=your_password
```

## How to Run
1. Ensure PostgreSQL is running on `localhost:5432` with a database named `retail`.
2. Compile and package the application:
   ```bash
   ./mvnw clean package
   ```
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```

The application will start on `http://localhost:8080`.

## API Endpoints

### 1. Authentication API
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Authenticate a user.

### 2. User API
- `GET /api/users`: Get all users.
- `GET /api/users/{id}`: Get a user by ID.
- `POST /api/users`: Create a new user.
- `PUT /api/users/{id}`: Update a user.
- `DELETE /api/users/{id}`: Delete a user.

### 3. Category API
- `GET /api/categories`: Get all categories.
- `GET /api/categories/{id}`: Get category by ID.
- `POST /api/categories`: Create a category.
- `PUT /api/categories/{id}`: Update a category.
- `DELETE /api/categories/{id}`: Delete a category.

### 4. Supplier API
- `GET /api/suppliers`
- `GET /api/suppliers/{id}`
- `POST /api/suppliers`
- `PUT /api/suppliers/{id}`
- `DELETE /api/suppliers/{id}`

### 5. Product API
- `GET /api/products` (Supports `?categoryId=1`, `?supplierId=1`, `?search=term`)
- `GET /api/products/{id}`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`

### 6. Warehouse API
- `GET /api/warehouses`
- `GET /api/warehouses/{id}`
- `POST /api/warehouses`
- `PUT /api/warehouses/{id}`
- `DELETE /api/warehouses/{id}`

### 7. Inventory API
- `GET /api/inventory`
- `GET /api/inventory/{id}`
- `GET /api/inventory/warehouse/{warehouseId}`
- `GET /api/inventory/low-stock`
- `POST /api/inventory`
- `PUT /api/inventory/{id}`
- `DELETE /api/inventory/{id}`

### 8. Customer API
- `GET /api/customers`
- `GET /api/customers/{id}`
- `POST /api/customers`
- `PUT /api/customers/{id}`
- `DELETE /api/customers/{id}`

### 9. Order API
- `GET /api/orders`
- `GET /api/orders/{id}`
- `POST /api/orders`: Creates an order, deducts inventory, and records a SALE stock movement.
- `PUT /api/orders/{id}/status`
- `DELETE /api/orders/{id}`

### 10. Purchase Order API
- `GET /api/purchase-orders`
- `GET /api/purchase-orders/{id}`
- `POST /api/purchase-orders`
- `PUT /api/purchase-orders/{id}/status`: Updating to "RECEIVED" increases inventory and records a PURCHASE stock movement.
- `DELETE /api/purchase-orders/{id}`

### 11. Stock Movement API
- `GET /api/stock-movements`
- `GET /api/stock-movements/{id}`
- `GET /api/stock-movements/product/{productId}`
- `GET /api/stock-movements/warehouse/{warehouseId}`

### 12. Dashboard API
- `GET /api/dashboard`: Returns aggregate statistics (total products, low stock, pending orders, etc.).

## Example API Requests

### Register User
```bash
curl -X POST http://localhost:8080/api/auth/register \
-H "Content-Type: application/json" \
-d '{"name": "Admin User", "email": "admin@example.com", "password": "password123", "role": "ADMIN"}'
```

### Create Product
```bash
curl -X POST http://localhost:8080/api/products \
-H "Content-Type: application/json" \
-d '{"name": "Laptop", "sku": "LPT-001", "description": "Gaming Laptop", "price": 1200.00}'
```

## Example Responses

### Success Response
```json
{
    "message": "User registered successfully",
    "data": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "ADMIN"
    }
}
```

### Error Response
```json
{
    "message": "Email already in use"
}
```
