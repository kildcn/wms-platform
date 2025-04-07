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

- **Language:** Kotlin 1.8.x
- **Framework:** Spring Boot 3.1.x
- **Database:** H2 Database (for development, can be replaced with PostgreSQL or MySQL for production)
- **Build Tool:** Gradle with Kotlin DSL
- **Testing:** JUnit 5 with MockK for mocking
- **API Documentation:** Springdoc OpenAPI (Swagger)
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
- API Documentation: http://localhost:8080/swagger-ui.html

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

## Core Domain Models

- **Product:** Represents items stored in the warehouse
- **Order:** Customer orders with items to be fulfilled
- **WarehouseLocation:** Physical locations within the warehouse
- **InventoryItem:** Tracks inventory at specific locations

## API Endpoints

### Products API

- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Orders API

- `GET /api/orders` - List orders (filtered by status)
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create new order
- `PATCH /api/orders/{id}/status` - Update order status

### Inventory API

- `GET /api/inventory/product/{productId}` - Get inventory for a product
- `POST /api/inventory/add` - Add inventory
- `POST /api/inventory/{id}/move` - Move inventory
- `POST /api/inventory/remove` - Remove inventory

## Event-Driven Design

The system uses events to handle asynchronous operations and ensure loose coupling between components. Key events include:

- `OrderStatusChangedEvent`: Triggered when an order status changes
- `InventoryAddedEvent`: Triggered when new inventory is added
- `LowStockEvent`: Triggered when product stock falls below threshold

## Testing Strategy

- **Unit Tests:** Test individual components in isolation
- **Integration Tests:** Test interaction between components
- **API Tests:** Test REST API endpoints

## Future Enhancements

- Integration with shipping providers
- Advanced picking algorithms
- Mobile app for warehouse staff
- Real-time dashboards for warehouse KPIs
- Machine learning for demand forecasting

## License

This project is licensed under the MIT License - see the LICENSE file for details.
