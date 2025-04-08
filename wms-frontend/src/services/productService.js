import { API_BASE_URL } from '../config/api';

// Helper to handle API responses consistently
const handleResponse = async (response, errorMessage) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (${response.status}): ${errorText}`);
    throw new Error(errorMessage || `API Error: ${response.status}`);
  }

  try {
    return await response.json();
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    return null; // Return null for empty responses
  }
};

export const getAllProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    return await handleResponse(response, 'Failed to fetch products');
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return await handleResponse(response, `Failed to fetch product with ID: ${id}`);
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

export const getProductBySku = async (sku) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/sku/${sku}`);
    return await handleResponse(response, `Failed to fetch product with SKU: ${sku}`);
  } catch (error) {
    console.error(`Error fetching product with SKU ${sku}:`, error);
    throw error;
  }
};

export const getProductsByCategory = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/category/${category}`);
    return await handleResponse(response, `Failed to fetch products in category: ${category}`);
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;
  }
};

export const getLowStockProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/low-stock`);
    return await handleResponse(response, 'Failed to fetch low stock products');
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    throw error;
  }
};

export const createProduct = async (product) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    return await handleResponse(response, 'Failed to create product');
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id, product) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });

    return await handleResponse(response, `Failed to update product with ID: ${id}`);
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error;
  }
};

export const updateStock = async (id, quantity) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}/stock?quantity=${quantity}`, {
      method: 'PATCH'
    });

    return await handleResponse(response, `Failed to update stock for product with ID: ${id}`);
  } catch (error) {
    console.error(`Error updating stock for product with ID ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}): ${errorText}`);
      throw new Error(`Failed to delete product with ID: ${id}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
};
