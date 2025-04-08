// wms-frontend/src/services/orderService.js
import { API_BASE_URL } from '../config/api';

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

export const updateOrderStatus = async (orderId, status) => {
  try {
    console.log(`Updating order ${orderId} status to ${status}`);  // Add logging

    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status?status=${status}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${response.status} - ${errorText}`);
      throw new Error(`Failed to update status for order ID: ${orderId}`);
    }

    return await response.json();
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
    if (!response.ok) throw new Error(`Failed to cancel order with ID: ${orderId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error canceling order with ID ${orderId}:`, error);
    throw error;
  }
};
