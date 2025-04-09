#!/bin/bash
# Comprehensive order test script

echo "==== Testing Order Creation with Items ===="
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "COMPLEX-ORD-001",
    "customerId": 1001,
    "status": "CREATED",
    "shippingAddress": "123 Test Street, Testville, 12345",
    "priorityLevel": 2,
    "items": [
      {
        "productId": 1,
        "productSku": "ELEC001",
        "productName": "Smartphone X12",
        "quantity": 1,
        "price": 599.99,
        "isPicked": false,
        "isPacked": false
      },
      {
        "productId": 2,
        "productSku": "ELEC002",
        "productName": "Laptop Pro",
        "quantity": 1,
        "price": 1299.99,
        "isPicked": false,
        "isPacked": false
      }
    ]
  }'

echo -e "\n\n==== Retrieving Created Order ===="
curl -X GET http://localhost:8080/api/orders/number/COMPLEX-ORD-001 | json_pp

echo -e "\n\n==== Testing Order Status Update ===="
# First, get the ID of the created order
ORDER_ID=$(curl -s http://localhost:8080/api/orders/number/COMPLEX-ORD-001 | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "Order ID: $ORDER_ID"

# Update status to PROCESSING
echo -e "\n-> Updating to PROCESSING"
curl -X PATCH http://localhost:8080/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PROCESSING"}'

# Update status to PICKING
echo -e "\n-> Updating to PICKING"
curl -X PATCH http://localhost:8080/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PICKING"}'

# Update status to PACKING
echo -e "\n-> Updating to PACKING"
curl -X PATCH http://localhost:8080/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "PACKING"}'

# Update status to SHIPPED
echo -e "\n-> Updating to SHIPPED"
curl -X PATCH http://localhost:8080/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "SHIPPED"}'

# Final check of order status
echo -e "\n\n==== Final Order Status ===="
curl -X GET http://localhost:8080/api/orders/$ORDER_ID | json_pp

echo -e "\n\n==== Testing Order Cancellation ===="
# Create an order to cancel
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderNumber": "CANCEL-ORD-001",
    "customerId": 1002,
    "status": "CREATED",
    "shippingAddress": "456 Cancel Street, Testville, 12345",
    "priorityLevel": 1,
    "items": [
      {
        "productId": 3,
        "productSku": "ELEC003",
        "productName": "Wireless Headphones",
        "quantity": 1,
        "price": 149.99,
        "isPicked": false,
        "isPacked": false
      }
    ]
  }'

# Get the ID of the order to cancel
CANCEL_ID=$(curl -s http://localhost:8080/api/orders/number/CANCEL-ORD-001 | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "Order to cancel ID: $CANCEL_ID"

# Cancel the order
echo -e "\n-> Cancelling order"
curl -X POST http://localhost:8080/api/orders/$CANCEL_ID/cancel

# Check the cancelled order
echo -e "\n\n==== Cancelled Order Status ===="
curl -X GET http://localhost:8080/api/orders/$CANCEL_ID | json_pp

echo -e "\n\n==== Testing Filtered Order Queries ===="
# Get CREATED orders
echo -e "\n-> Retrieving CREATED orders"
curl -X GET "http://localhost:8080/api/orders?status=CREATED" | json_pp

# Get SHIPPED orders
echo -e "\n-> Retrieving SHIPPED orders"
curl -X GET "http://localhost:8080/api/orders?status=SHIPPED" | json_pp

# Get CANCELED orders
echo -e "\n-> Retrieving CANCELED orders"
curl -X GET "http://localhost:8080/api/orders?status=CANCELED" | json_pp

# Get orders by customer
echo -e "\n-> Retrieving orders for customer 1001"
curl -X GET http://localhost:8080/api/orders/customer/1001 | json_pp

echo -e "\n\n==== Testing Complete! ===="
