import { API_BASE_URL } from '../config/api';

export const getAllProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch product with ID: ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

export const getProductBySku = async (sku) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/sku/${sku}`);
    if (!response.ok) throw new Error(`Failed to fetch product with SKU: ${sku}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product with SKU ${sku}:`, error);
    throw error;
  }
};

export const getProductsByCategory = async (category) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/category/${category}`);
    if (!response.ok) throw new Error(`Failed to fetch products in category: ${category}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    throw error;
  }
};

export const getLowStockProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/low-stock`);
    if (!response.ok) throw new Error('Failed to fetch low stock products');
    return await response.json();
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
    if (!response.ok) throw new Error('Failed to create product');
    return await response.json();
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
    if (!response.ok) throw new Error(`Failed to update product with ID: ${id}`);
    return await response.json();
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
    if (!response.ok) throw new Error(`Failed to update stock for product with ID: ${id}`);
    return await response.json();
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
    if (!response.ok) throw new Error(`Failed to delete product with ID: ${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
};
