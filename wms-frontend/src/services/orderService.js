// wms-frontend/src/services/orderService.js
import { API_BASE_URL } from '../config/api';

// Helper to handle API responses consistently
const handleResponse = async (response, errorMessage) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}): ${errorText}`);
    throw new Error(errorMessage || `API Error: ${response.status}`);
  }

  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    return null; // Return null for empty responses
  }
};

export const getAllOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch order with ID: ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error;
  }
};

export const getOrderByNumber = async (orderNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/number/${orderNumber}`);
    if (!response.ok) throw new Error(`Failed to fetch order with number: ${orderNumber}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching order with number ${orderNumber}:`, error);
    throw error;
  }
};

export const getOrdersByCustomer = async (customerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/customer/${customerId}`);
    if (!response.ok) throw new Error(`Failed to fetch orders for customer ID: ${customerId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching orders for customer ID ${customerId}:`, error);
    throw error;
  }
};

export const getHighPriorityOrders = async (minPriority = 5) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/priority?minPriority=${minPriority}`);
    if (!response.ok) throw new Error('Failed to fetch high priority orders');
    return await response.json();
  } catch (error) {
    console.error('Error fetching high priority orders:', error);
    throw error;
  }
};

export const createOrder = async (order) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!response.ok) throw new Error('Failed to create order');
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Improved order status update function with timeout handling
export const updateOrderStatus = async (orderId, status) => {
  try {
    console.log(`Updating order ${orderId} status to ${status}...`);

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    console.log(`Sending request to: ${API_BASE_URL}/orders/${orderId}/status`);
    console.log(`Request body: ${JSON.stringify({ status: status })}`);

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: status }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log(`Response received with status: ${response.status}`);

    // Don't proceed with success path for error responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error updating order status: ${errorText || 'No error details provided'}`);
      throw new Error(`Failed to update order status: ${response.status} ${response.statusText}`);
    }

    // Handle 204 No Content response
    if (response.status === 204) {
      return { id: orderId, status: status };
    }

    try {
      return await response.json();
    } catch (e) {
      // If we can't parse JSON but the request was successful, return the status update object
      return { id: orderId, status: status };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. The server is taking too long to respond.');
    }
    console.error(`Error updating status for order ID ${orderId}:`, error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error(`Failed to cancel order with ID: ${orderId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error canceling order with ID ${orderId}:`, error);
    throw error;
  }
};
