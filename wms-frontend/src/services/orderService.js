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

export const getHighPriorityOrders = async (minPriority = 4) => {
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

    if (!response.ok) {
      // Try to get a more detailed error message
      let errorMsg = 'Failed to create order';
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        // If we can't parse JSON, use the default message
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    console.log(`Updating order ${orderId} status to ${status}...`);

    // The backend expects a JSON object with a "status" property
    const statusData = { status: status };

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(statusData)
    });

    if (!response.ok) {
      let errorMsg = `Failed to update order status: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        // If we can't parse JSON, use the default message
      }
      throw new Error(errorMsg);
    }

    // Handle 204 No Content response
    if (response.status === 204) {
      return { id: orderId, status: status };
    }

    // Parse the response if possible
    try {
      return await response.json();
    } catch (e) {
      // If we can't parse JSON but the request was successful, return the status object
      return { id: orderId, status: status };
    }
  } catch (error) {
    console.error(`Error updating status for order ID ${orderId}:`, error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'POST'
    });

    if (!response.ok) {
      let errorMsg = `Failed to cancel order with ID: ${orderId}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorMsg;
      } catch (e) {
        // If we can't parse JSON, use the default message
      }
      throw new Error(errorMsg);
    }

    // If the request was successful but there's no response body, return a default object
    if (response.status === 204) {
      return { id: orderId, status: 'CANCELED' };
    }

    return await response.json();
  } catch (error) {
    console.error(`Error canceling order with ID ${orderId}:`, error);
    throw error;
  }
};
