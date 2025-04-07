import { API_BASE_URL } from '../config/api';

export const getInventoryItemById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch inventory item with ID: ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching inventory item with ID ${id}:`, error);
    throw error;
  }
};

export const getInventoryByProduct = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/product/${productId}`);
    if (!response.ok) throw new Error(`Failed to fetch inventory for product ID: ${productId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching inventory for product ID ${productId}:`, error);
    throw error;
  }
};

export const getInventoryByLocation = async (locationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/location/${locationId}`);
    if (!response.ok) throw new Error(`Failed to fetch inventory for location ID: ${locationId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching inventory for location ID ${locationId}:`, error);
    throw error;
  }
};

export const addInventory = async (inventory) => {
  try {
    const { productId, quantity, locationId, batchNumber, expiryDate } = inventory;

    let url = `${API_BASE_URL}/inventory/add?productId=${productId}&quantity=${quantity}`;
    if (locationId) url += `&locationId=${locationId}`;
    if (batchNumber) url += `&batchNumber=${batchNumber}`;
    if (expiryDate) url += `&expiryDate=${expiryDate}`;

    const response = await fetch(url, {
      method: 'POST'
    });

    if (!response.ok) throw new Error('Failed to add inventory');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to move inventory');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to remove inventory');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to quarantine inventory');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to perform cycle count');
    return await response.json();
  } catch (error) {
    console.error('Error performing cycle count:', error);
    throw error;
  }
};
