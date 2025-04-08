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

export const getInventoryItemById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`);
    return await handleResponse(response, `Failed to fetch inventory item with ID: ${id}`);
  } catch (error) {
    console.error(`Error fetching inventory item with ID ${id}:`, error);
    throw error;
  }
};

export const getInventoryByProduct = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/product/${productId}`);
    return await handleResponse(response, `Failed to fetch inventory for product ID: ${productId}`);
  } catch (error) {
    console.error(`Error fetching inventory for product ID ${productId}:`, error);
    throw error;
  }
};

export const getInventoryByLocation = async (locationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/location/${locationId}`);
    return await handleResponse(response, `Failed to fetch inventory for location ID: ${locationId}`);
  } catch (error) {
    console.error(`Error fetching inventory for location ID ${locationId}:`, error);
    throw error;
  }
};

export const addInventory = async (inventory) => {
  try {
    // Build query params
    const params = new URLSearchParams();
    params.append('productId', inventory.productId);
    params.append('quantity', inventory.quantity);

    if (inventory.locationId) params.append('locationId', inventory.locationId);
    if (inventory.batchNumber) params.append('batchNumber', inventory.batchNumber);
    if (inventory.expiryDate) params.append('expiryDate', inventory.expiryDate);

    const response = await fetch(`${API_BASE_URL}/inventory/add?${params.toString()}`, {
      method: 'POST'
    });

    return await handleResponse(response, 'Failed to add inventory');
  } catch (error) {
    console.error('Error adding inventory:', error);
    throw error;
  }
};

export const moveInventory = async (inventoryItemId, newLocationId, quantity) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/inventory/${inventoryItemId}/move?newLocationId=${newLocationId}&quantity=${quantity}`,
      {
        method: 'POST'
      }
    );

    return await handleResponse(response, 'Failed to move inventory');
  } catch (error) {
    console.error('Error moving inventory:', error);
    throw error;
  }
};

export const removeInventory = async (productId, quantity) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/inventory/remove?productId=${productId}&quantity=${quantity}`,
      {
        method: 'POST'
      }
    );

    return await handleResponse(response, 'Failed to remove inventory');
  } catch (error) {
    console.error('Error removing inventory:', error);
    throw error;
  }
};

export const quarantineInventory = async (inventoryItemId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${inventoryItemId}/quarantine`, {
      method: 'POST'
    });

    return await handleResponse(response, 'Failed to quarantine inventory');
  } catch (error) {
    console.error('Error quarantining inventory:', error);
    throw error;
  }
};

export const cycleCount = async (locationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/location/${locationId}/count`, {
      method: 'POST'
    });

    return await handleResponse(response, 'Failed to perform cycle count');
  } catch (error) {
    console.error('Error performing cycle count:', error);
    throw error;
  }
};

export const getStockByCategory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/stock-by-category`);
    return await handleResponse(response, 'Failed to fetch stock by category');
  } catch (error) {
    console.error('Error fetching stock by category:', error);
    throw error;
  }
};
