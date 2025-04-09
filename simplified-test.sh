#!/bin/bash
# Extremely simplified test to create a basic order

echo "Creating a very simple order..."
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "SIMPLE-ORD-123",
    "customerId": 1001,
    "status": "CREATED",
    "shippingAddress": "123 Test Street, Testville, 12345",
    "priorityLevel": 1,
    "items": []
  }'

echo -e "\n\nChecking if order was created..."
curl -X GET http://localhost:8080/api/orders/number/SIMPLE-ORD-123
