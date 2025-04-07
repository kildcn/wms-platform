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

export const getOrdersByStatus = async (status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders?status=${status}`);
    if (!response.ok) throw new Error(`Failed to fetch orders with status: ${status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching orders with status ${status}:`, error);
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

export const updateOrderStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status?status=${status}`, {
      method: 'PATCH'
    });
    if (!response.ok) throw new Error(`Failed to update order status to ${status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error updating order status to ${status}:`, error);
    throw error;
  }
};

export const cancelOrder = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/cancel`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error(`Failed to cancel order with ID: ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error canceling order with ID ${id}:`, error);
    throw error;
  }
};

export const getHighPriorityOrders = async (minPriority = 5) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/priority?minPriority=${minPriority}`);
    if (!response.ok) throw new Error(`Failed to fetch high priority orders`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching high priority orders:`, error);
    throw error;
  }
};
