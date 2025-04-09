#!/bin/bash
# Testing script for verifying backend functionality

# 1. Test the Product API
echo "Testing Product API..."

# Get all products
echo "Getting all products..."
curl -X GET http://localhost:8080/api/products | json_pp

# Get a specific product (ID 1 should exist from DataInitializer)
echo "Getting product with ID 1..."
curl -X GET http://localhost:8080/api/products/1 | json_pp

# Create a new product
echo "Creating a new product..."
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "TST001",
    "name": "Test Product",
    "description": "A test product for API validation",
    "weight": 1.5,
    "width": 10.0,
    "height": 5.0,
    "depth": 2.0,
    "category": "Test"
  }' | json_pp

# 2. Test the Inventory API
echo "Testing Inventory API..."

# Get inventory for product 1
echo "Getting inventory for product 1..."
curl -X GET http://localhost:8080/api/inventory/product/1 | json_pp

# Get available quantity for product 1
echo "Getting available quantity for product 1..."
curl -X GET http://localhost:8080/api/inventory/product/1/quantity | json_pp

# Add inventory for the last product we created
echo "Adding inventory for a product..."
curl -X POST "http://localhost:8080/api/inventory/add?productId=14&quantity=20&locationId=1" | json_pp

# 3. Test the Order API
echo "Testing Order API..."

# Get all orders
echo "Getting all orders..."
curl -X GET http://localhost:8080/api/orders | json_pp

# Create a new test order with proper format
echo "Creating a new order..."
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "TEST001",
    "customerId": 1001,
    "status": "CREATED",
    "shippingAddress": "123 Test St, Test City, 12345",
    "items": [
      {
        "productId": 1,
        "productSku": "ELEC001",
        "productName": "Smartphone X12",
        "quantity": 1,
        "price": 10.99
      }
    ]
  }' | json_pp

# Get order by number
echo "Getting order by number..."
curl -X GET http://localhost:8080/api/orders/number/TEST001 | json_pp

# Get a specific order by ID (assumes we have order with ID 1)
echo "Getting order with ID 1..."
curl -X GET http://localhost:8080/api/orders/1 | json_pp

# Update order status (assumes we have order with ID 1)
echo "Updating order status to PROCESSING..."
curl -X PATCH http://localhost:8080/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PROCESSING"}' | json_pp

# 4. Test the Location API
echo "Testing Location API..."

# Get all locations
echo "Getting all locations..."
curl -X GET http://localhost:8080/api/locations | json_pp

# Get available locations
echo "Getting available locations..."
curl -X GET http://localhost:8080/api/locations/available | json_pp

# Get locations by type
echo "Getting PICKING locations..."
curl -X GET http://localhost:8080/api/locations/type/PICKING | json_pp

echo "Backend API testing complete!"
