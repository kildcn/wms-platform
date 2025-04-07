# WMS Platform - Warehouse Management System

This project is a modern Warehouse Management System (WMS) built with Kotlin and Spring Boot. It provides a robust backend for managing warehouse operations including product management, order processing, inventory tracking, and more.

## Features

- **Product Management:** Create, update, and manage product catalog
- **Order Management:** Process customer orders through various fulfillment stages
- **Inventory Control:** Track inventory across warehouse locations
- **Warehouse Organization:** Manage physical warehouse spaces and optimize storage
- **Event-Driven Architecture:** Real-time notifications and processing using events
- **REST API:** Comprehensive API for integration with other systems

## Technology Stack

- **Language:** Kotlin 2.1.x
- **Framework:** Spring Boot 3.1.x
- **Database:** H2 Database (for development, can be replaced with PostgreSQL or MySQL for production)
- **Build Tool:** Gradle with Kotlin DSL
- **Testing:** JUnit 5 with MockK for mocking
- **Messaging:** Spring Kafka for event-driven communication

## Getting Started

### Prerequisites

- JDK 17 or higher
- Gradle (or use the included Gradle wrapper)
- IDE with Kotlin support (IntelliJ IDEA recommended)

### Building the Project

```bash
# Clone the repository
git clone https://github.com/yourusername/wms-platform.git
cd wms-platform

# Build the project
./gradlew clean build
```

### Running the Application

```bash
# Run the application
./gradlew bootRun
```

The application will start on http://localhost:8080 by default.

- H2 Console: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:wmsdb`
  - Username: `sa`
  - Password: `password`

### Running Tests

```bash
# Run all tests
./gradlew test

# Run a specific test class
./gradlew test --tests "com.wmsplatform.service.ProductServiceTest"

# View test reports at build/reports/tests/test/index.html
```

## API Testing with cURL

Below are examples of how to interact with the API using cURL commands.

### Product Management

#### Create a new product
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD001",
    "name": "Premium Laptop",
    "description": "High-end laptop with 16GB RAM",
    "weight": 2.5,
    "width": 35.0,
    "height": 1.5,
    "depth": 25.0,
    "category": "Electronics",
    "stockQuantity": 10
  }'
```

#### Get all products
```bash
curl -X GET http://localhost:8080/api/products
```

#### Get product by ID
```bash
curl -X GET http://localhost:8080/api/products/1
```

#### Get products by category
```bash
curl -X GET http://localhost:8080/api/products/category/Electronics
```

#### Update product
```bash
curl -X PUT http://localhost:8080/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD001",
    "name": "Premium Laptop Updated",
    "description": "High-end laptop with 32GB RAM",
    "weight": 2.5,
    "width": 35.0,
    "height": 1.5,
    "depth": 25.0,
    "category": "Premium Electronics",
    "stockQuantity": 15
  }'
```

#### Delete product
```bash
curl -X DELETE http://localhost:8080/api/products/1
```

### Order Management

#### Create a new order
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ORD1001",
    "customerId": 123,
    "status": "CREATED",
    "shippingAddress": "123 Main St, New York, NY 10001",
    "priorityLevel": 3,
    "items": [
      {
        "productId": 1,
        "productSku": "PROD001",
        "productName": "Premium Laptop",
        "quantity": 2,
        "price": 1299.99
      }
    ]
  }'
```

#### Get all orders
```bash
curl -X GET http://localhost:8080/api/orders
```

#### Get orders by status
```bash
curl -X GET "http://localhost:8080/api/orders?status=PROCESSING"
```

#### Get order by ID
```bash
curl -X GET http://localhost:8080/api/orders/1
```

#### Update order status
```bash
curl -X PATCH "http://localhost:8080/api/orders/1/status?status=PROCESSING"
```

#### Cancel order
```bash
curl -X POST http://localhost:8080/api/orders/1/cancel
```

### Inventory Management

#### Add inventory
```bash
curl -X POST "http://localhost:8080/api/inventory/add?productId=1&quantity=10&locationId=1&batchNumber=B001"
```

#### Get inventory for a product
```bash
curl -X GET http://localhost:8080/api/inventory/product/1
```

#### Move inventory
```bash
curl -X POST "http://localhost:8080/api/inventory/1/move?newLocationId=2&quantity=5"
```

#### Remove inventory
```bash
curl -X POST "http://localhost:8080/api/inventory/remove?productId=1&quantity=3"
```

#### Quarantine inventory
```bash
curl -X POST http://localhost:8080/api/inventory/1/quarantine
```

## Project Structure

```
src/
├── main/
│   ├── kotlin/
│   │   └── com/
│   │       └── wmsplatform/
│   │           ├── controller/      # REST API controllers
│   │           ├── domain/
│   │           │   ├── model/       # Domain entities
│   │           │   └── repository/  # Data access interfaces
│   │           ├── dto/             # Data Transfer Objects
│   │           ├── event/           # Event classes
│   │           ├── exception/       # Exception handling
│   │           ├── service/         # Business logic
│   │           └── WmsPlatformApplication.kt
│   └── resources/
│       └── application.yml          # Application configuration
├── test/
    └── kotlin/
        └── com/
            └── wmsplatform/
                ├── controller/      # Controller tests
                ├── repository/      # Repository tests
                └── service/         # Service tests
```

## Data Model

### Core Domain Entities
- **Product:** Represents items stored in the warehouse
- **Order:** Customer orders with items to be fulfilled
- **OrderItem:** Individual line items within an order
- **WarehouseLocation:** Physical locations within the warehouse
- **InventoryItem:** Tracks inventory at specific locations

## Event-Driven Architecture

The system uses events to handle asynchronous operations and ensure loose coupling between components:

- **OrderStatusChangedEvent:** Triggered when an order status changes
- **InventoryAddedEvent:** Triggered when new inventory is added
- **LowStockEvent:** Triggered when product stock falls below threshold

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
