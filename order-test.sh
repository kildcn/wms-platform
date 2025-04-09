#!/bin/bash
# Testing script for verifying order-related functionality

# Test the Order API
echo "Testing Order API..."

# Create a new test order with proper format
echo "Creating a new test order..."
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ORD-TEST-001",
    "customerId": 1001,
    "status": "CREATED",
    "shippingAddress": "123 Test St, Test City, 12345",
    "priorityLevel": 3,
    "items": [
      {
        "productId": 1,
        "productSku": "ELEC001",
        "productName": "Smartphone X12",
        "quantity": 1,
        "price": 10.99,
        "isPicked": false,
        "isPacked": false
      }
    ]
  }' | json_pp

# Get order by number
echo "Getting order by number..."
curl -X GET http://localhost:8080/api/orders/number/ORD-TEST-001 | json_pp

# Get a specific order by ID (should work with any existing ID)
echo "Getting order with a specific ID..."
curl -X GET http://localhost:8080/api/orders/1 | json_pp

# Get orders by status
echo "Getting CREATED orders..."
curl -X GET http://localhost:8080/api/orders?status=CREATED | json_pp

# Create another test order for status updates
echo "Creating another test order for status update testing..."
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ORD-TEST-002",
    "customerId": 1002,
    "status": "CREATED",
    "shippingAddress": "456 Test Ave, Test Town, 67890",
    "priorityLevel": 2,
    "items": [
      {
        "productId": 2,
        "productSku": "ELEC002",
        "productName": "Laptop Pro",
        "quantity": 1,
        "price": 35.99,
        "isPicked": false,
        "isPacked": false
      }
    ]
  }' | json_pp

# Get the order ID for the new order
echo "Getting order ID for the new order..."
ORDER_ID=$(curl -s -X GET http://localhost:8080/api/orders/number/ORD-TEST-002 | jq '.id')
echo "New order ID: $ORDER_ID"

# Update order status
echo "Updating order status to PROCESSING..."
curl -X PATCH http://localhost:8080/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PROCESSING"}' | json_pp

# Update again to test next status
echo "Updating order status to PICKING..."
curl -X PATCH http://localhost:8080/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PICKING"}' | json_pp

# Cancel an order
echo "Creating one more order to test cancellation..."
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "ORD-TEST-003",
    "customerId": 1003,
    "status": "CREATED",
    "shippingAddress": "789 Test Blvd, Test City, 54321",
    "priorityLevel": 1,
    "items": [
      {
        "productId": 3,
        "productSku": "ELEC003",
        "productName": "Wireless Headphones",
        "quantity": 1,
        "price": 17.50,
        "isPicked": false,
        "isPacked": false
      }
    ]
  }' | json_pp

# Get the order ID for the new order
echo "Getting the ID for the order to cancel..."
CANCEL_ID=$(curl -s -X GET http://localhost:8080/api/orders/number/ORD-TEST-003 | jq '.id')
echo "Order to cancel ID: $CANCEL_ID"

# Cancel the order
echo "Cancelling the order..."
curl -X POST http://localhost:8080/api/orders/$CANCEL_ID/cancel | json_pp

echo "Order API testing complete!"
