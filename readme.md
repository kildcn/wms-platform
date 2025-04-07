# WMS Platform - Warehouse Management System

This project is a modern Warehouse Management System (WMS) built with Kotlin and Spring Boot for the backend, and React for the frontend. It provides a robust solution for managing warehouse operations including product management, order processing, inventory tracking, and more.

## Features

- **Product Management:** Create, update, and manage product catalog
- **Order Management:** Process customer orders through various fulfillment stages
- **Inventory Control:** Track inventory across warehouse locations
- **Warehouse Organization:** Manage physical warehouse spaces and optimize storage
- **Event-Driven Architecture:** Real-time notifications and processing using events
- **RESTful API:** Comprehensive API for integration with other systems
- **Modern UI:** Responsive React frontend with intuitive dashboard

## Technology Stack

### Backend
- **Language:** Kotlin 2.1.x
- **Framework:** Spring Boot 3.1.x
- **Database:** H2 Database (for development, can be replaced with PostgreSQL or MySQL for production)
- **Build Tool:** Gradle with Kotlin DSL
- **Testing:** JUnit 5 with MockK for mocking
- **Messaging:** Spring Kafka for event-driven communication

### Frontend
- **Framework:** React 19.x
- **UI Components:** Custom components with Tailwind CSS styling
- **Charts & Visualization:** Recharts for data visualization
- **Icons:** Lucide React for modern iconography
- **API Integration:** Fetch API for REST endpoints

## Getting Started

### Prerequisites

- JDK 17 or higher
- Node.js 18+ and npm
- Gradle (or use the included Gradle wrapper)
- IDE with Kotlin support (IntelliJ IDEA recommended)

### Running the Backend

```bash
# Clone the repository
git clone https://github.com/yourusername/wms-platform.git
cd wms-platform

# Build and run the backend
./gradlew bootRun
```

The backend will start on http://localhost:8080 by default.

- H2 Console: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:wmsdb`
  - Username: `sa`
  - Password: `password`

### Running the Frontend

```bash
# Navigate to the frontend directory
cd wms-frontend

# Install dependencies
npm install

# Start the development server
npm start
```

The frontend will start on http://localhost:3000 by default.

## Usage Guide

### Product Management

1. Access the "Products" tab from the main dashboard.
2. Click "Add Product" to create a new product with details like SKU, name, dimensions, and category.
3. Edit existing products by clicking the edit icon on any product row.
4. Delete products by clicking the delete icon (use with caution).
5. View stock levels and low stock alerts in the Overview tab.

### Order Management

1. Navigate to the "Orders" tab from the main dashboard.
2. Click "Create Order" to create a new customer order.
3. Add multiple items to an order from your product catalog.
4. Track order status through the fulfillment process.
5. Update order status as it progresses through the pipeline.
6. High priority orders will appear in the dashboard alerts section.

### Inventory Management

1. Access the "Inventory" tab from the main dashboard.
2. Add inventory by clicking "Add Inventory" and specifying product, quantity, and location.
3. Move inventory between locations with the "Move Inventory" action.
4. View inventory details by clicking on an inventory item.
5. Monitor inventory levels and receive alerts for low stock items.

## Testing the Frontend

### User Scenarios

#### Product Management Scenarios:

1. **Creating a New Product:**
   - Click on the "Products" tab
   - Click "Add Product" button
   - Fill out the product form with required information (SKU, name, dimensions, category)
   - Click "Create Product"
   - Verify the product appears in the product list

2. **Editing a Product:**
   - Find an existing product in the products list
   - Click the edit (pencil) icon on that product's row
   - Modify some fields in the form that opens
   - Click "Update Product"
   - Verify the product details are updated in the list

3. **Viewing Low Stock Products:**
   - Navigate to the "Overview" tab
   - Check the "Low Stock" card to see products with low inventory
   - Alternatively, in the Products tab, look for products with stock levels highlighted in red

#### Order Management Scenarios:

1. **Creating a New Order:**
   - Click on the "Orders" tab
   - Click "Create Order" button
   - Fill in customer details, shipping address, and priority level
   - Add multiple order items from the product list
   - Set quantities and prices for each item
   - Click "Create Order"
   - Verify the order appears in the orders list

2. **Progressing an Order Through Stages:**
   - Find an order in the "CREATED" status
   - Click the status update icon (refresh icon)
   - Select "PROCESSING" from the dropdown
   - Verify the order status changes
   - Continue through the status flow: PICKING → PACKING → SHIPPED → DELIVERED

3. **Handling High Priority Orders:**
   - Create an order with priority level 5 (high)
   - Navigate to the Overview tab
   - Verify the order appears in the Alerts section

#### Inventory Management Scenarios:

1. **Adding Inventory:**
   - Click on the "Inventory" tab
   - Click "Add Inventory" button
   - Select a product, quantity, and warehouse location
   - Optionally add batch number and expiry date
   - Click "Add Inventory"
   - Verify the new inventory appears in the inventory list

2. **Moving Inventory:**
   - Click "Move Inventory" button
   - Select an existing inventory item
   - Choose a quantity to move and a new location
   - Click "Move Inventory"
   - Verify the inventory has been moved to the new location

3. **Viewing Inventory Details:**
   - Click the eye icon on any inventory item
   - Verify the detailed information appears
   - Close the detail view

4. **Examining Inventory by Location:**
   - Scroll down to the Warehouse Locations section in the Inventory tab
   - View the occupancy and weight usage for each location
   - Verify that locations show correct capacity information

## API Documentation

The system exposes a RESTful API for integration with other systems. The main endpoints include:

### Products API
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get a specific product
- `POST /api/products` - Create a new product
- `PUT /api/products/{id}` - Update a product
- `DELETE /api/products/{id}` - Delete a product

### Orders API
- `GET /api/orders` - List all orders
- `GET /api/orders/{id}` - Get a specific order
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/{id}/status` - Update order status

### Inventory API
- `GET /api/inventory/product/{productId}` - Get inventory for a product
- `POST /api/inventory/add` - Add inventory
- `POST /api/inventory/{id}/move` - Move inventory

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
