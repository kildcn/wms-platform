import React, { useState, useEffect, useCallback } from 'react';
import EnhancedWMSDashboard from './EnhancedWMSDashboard';
import ProductForm from './ProductForm';
import OrderForm from './OrderForm';
import { AddInventoryForm, MoveInventoryForm, InventoryDetail } from './InventoryComponents';
import InventoryHistory from './InventoryHistory';
import { AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

// Import services
import * as productService from '../services/productService';
import * as orderService from '../services/orderService';
import * as inventoryService from '../services/inventoryService';
import * as locationService from '../services/locationService';

// Toast notification component for feedback
const Toast = ({ message, type = 'success', onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-100 border-green-400 text-green-700' :
                 'bg-red-100 border-red-400 text-red-700';

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md border ${bgColor} shadow-md max-w-md z-50 flex justify-between items-center`}>
      {type === 'error' && <AlertTriangle className="h-5 w-5 mr-2" />}
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">×</button>
    </div>
  );
};

// Main application component
const WMSApplication = () => {
  // State for data
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [locations, setLocations] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // UI state for modals and forms
  const [activeTab, setActiveTab] = useState('overview');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showAddInventoryForm, setShowAddInventoryForm] = useState(false);
  const [showMoveInventoryForm, setShowMoveInventoryForm] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [showInventoryHistory, setShowInventoryHistory] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Show a toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
  };

  // Close the toast notification
  const closeToast = () => {
    setToast({ show: false, message: '', type: 'success' });
  };

  // Fetch products with error handling
  const fetchProducts = useCallback(async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);

      // Separately fetch low stock products
      const lowStock = await productService.getLowStockProducts();
      setLowStockProducts(lowStock);

      return data;
    } catch (err) {
      console.error("Error fetching products:", err);
      throw err;
    }
  }, []);

  // Fetch all orders with error handling
  const fetchOrders = useCallback(async () => {
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
      return data;
    } catch (err) {
      console.error("Error fetching orders:", err);
      throw err;
    }
  }, []);

  // Fetch inventory for a product with error handling
  const fetchInventory = useCallback(async (productId) => {
    if (!productId) return [];

    try {
      const data = await inventoryService.getInventoryByProduct(productId);
      setInventory(data);
      return data;
    } catch (err) {
      console.error(`Error fetching inventory for product ${productId}:`, err);
      throw err;
    }
  }, []);

  // Fetch all locations with error handling
  const fetchLocations = useCallback(async () => {
    try {
      const data = await locationService.getAllLocations();
      setLocations(data);
      return data;
    } catch (err) {
      console.error("Error fetching locations:", err);
      throw err;
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all required data in parallel
        const [productsData, ordersData, locationsData] = await Promise.all([
          fetchProducts(),
          fetchOrders(),
          fetchLocations()
        ]);

        // Once we have products, fetch inventory for the first product
        if (productsData.length > 0) {
          await fetchInventory(productsData[0].id);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load initial data:", err);
        setError("Failed to load application data. Please try refreshing the page.");
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchProducts, fetchOrders, fetchInventory, fetchLocations]);

  // Product handlers
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        // Update existing product
        const updatedProduct = await productService.updateProduct(editingProduct.id, productData);

        // Update products list with the updated product
        setProducts(prevProducts =>
          prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
        );

        showToast(`Product "${updatedProduct.name}" updated successfully`);
      } else {
        // Create new product
        const newProduct = await productService.createProduct(productData);

        // Add new product to the list
        setProducts(prevProducts => [...prevProducts, newProduct]);

        showToast(`Product "${newProduct.name}" created successfully`);
      }

      setShowProductForm(false);
      setEditingProduct(null);

      // Update low stock products if necessary
      if (productData.stockQuantity < 10) {
        fetchProducts(); // Refetch to update low stock list
      }
    } catch (err) {
      console.error("Error saving product:", err);
      showToast(`Error: ${err.message || "Failed to save product"}`, 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await productService.deleteProduct(productId);

      // Remove product from list
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));

      // Also remove from low stock if it was there
      setLowStockProducts(prev => prev.filter(p => p.id !== productId));

      showToast('Product deleted successfully');
    } catch (err) {
      console.error("Error deleting product:", err);
      showToast(`Error: ${err.message || "Failed to delete product"}`, 'error');
    }
  };

  // Order handlers
  const handleCreateOrder = () => {
    setEditingOrder(null);
    setShowOrderForm(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  const handleViewOrder = async (order) => {
    try {
      // Get complete order details
      const orderDetails = await orderService.getOrderById(order.id);
      setEditingOrder(orderDetails);
      setShowOrderForm(true);
    } catch (err) {
      console.error("Error fetching order details:", err);
      showToast(`Error: ${err.message || "Failed to fetch order details"}`, 'error');
    }
  };

  const handleSaveOrder = async (orderData) => {
    try {
      if (editingOrder) {
        // Update existing order status
        const updatedOrder = await orderService.updateOrderStatus(
          editingOrder.id,
          orderData.status
        );

        // Update orders list
        setOrders(prevOrders =>
          prevOrders.map(o => o.id === editingOrder.id ? { ...o, status: updatedOrder.status } : o)
        );

        showToast(`Order ${editingOrder.orderNumber} updated to status: ${updatedOrder.status}`);
      } else {
        // Create new order
        const newOrder = await orderService.createOrder(orderData);

        // Add to orders list
        setOrders(prevOrders => [...prevOrders, newOrder]);

        showToast(`New order ${newOrder.orderNumber} created successfully`);
      }

      setShowOrderForm(false);
      setEditingOrder(null);
    } catch (err) {
      console.error("Error saving order:", err);
      showToast(`Error: ${err.message || "Failed to save order"}`, 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setIsUpdatingStatus(true);

      console.log(`Directly updating order ${orderId} to status ${newStatus}`);

      // Try direct API call with different format
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      console.log(`Status update response: ${response.status}`);

      // Even if there's an error response, we'll update the UI
      // This is a workaround for backend issues

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order)
      );

      if (response.ok) {
        showToast(`Order status updated to: ${newStatus}`);
      } else {
        // Update UI anyway but show a warning
        console.warn(`Backend reported error ${response.status} but UI was updated anyway`);
        showToast(`Status updated to ${newStatus} (but backend reported an error)`, 'warning');
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast(`Error: ${err.message || "Failed to update order status"}`, 'error');

      // Optional: Update UI anyway as a fallback
      setOrders(prevOrders =>
        prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order)
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Inventory handlers
  const handleAddInventory = () => {
    setShowAddInventoryForm(true);
  };

  const handleMoveInventory = () => {
    setShowMoveInventoryForm(true);
  };

  const handleSaveNewInventory = async (inventoryData) => {
    try {
      // Add inventory
      const newItem = await inventoryService.addInventory(inventoryData);

      // Update inventory list
      setInventory(prevInventory => [...prevInventory, newItem]);

      // Refresh the product to update its stock quantity
      const updatedProduct = await productService.getProductById(inventoryData.productId);

      // Update products list
      setProducts(prevProducts =>
        prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
      );

      // Update low stock products if necessary
      if (updatedProduct.stockQuantity < 10) {
        // Add to low stock list if not already there
        setLowStockProducts(prev =>
          prev.some(p => p.id === updatedProduct.id)
            ? prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
            : [...prev, updatedProduct]
        );
      } else {
        // Remove from low stock list if it was there
        setLowStockProducts(prev => prev.filter(p => p.id !== updatedProduct.id));
      }

      showToast('Inventory added successfully');
      setShowAddInventoryForm(false);
    } catch (err) {
      console.error("Error adding inventory:", err);
      showToast(`Error: ${err.message || "Failed to add inventory"}`, 'error');
    }
  };

  const handleSaveMoveInventory = async (moveData) => {
    try {
      // Format data properly
      const formattedData = {
        inventoryItemId: parseInt(moveData.inventoryItemId, 10),
        newLocationId: parseInt(moveData.newLocationId, 10),
        quantity: parseInt(moveData.quantity, 10)
      };

      // Move inventory
      const updatedItem = await inventoryService.moveInventory(
        formattedData.inventoryItemId,
        formattedData.newLocationId,
        formattedData.quantity
      );

      // Update inventory list - handle both full moves and splits
      setInventory(prevInventory => {
        // Find the source item
        const sourceItem = prevInventory.find(item => item.id === formattedData.inventoryItemId);

        if (sourceItem.quantity === formattedData.quantity) {
          // Full move - replace the item
          return prevInventory.map(item =>
            item.id === formattedData.inventoryItemId ? updatedItem : item
          );
        } else {
          // Split - update source item quantity and add the new item
          return [
            ...prevInventory.map(item =>
              item.id === formattedData.inventoryItemId
                ? { ...item, quantity: item.quantity - formattedData.quantity }
                : item
            ),
            updatedItem
          ];
        }
      });

      showToast('Inventory moved successfully');
      setShowMoveInventoryForm(false);
    } catch (err) {
      console.error("Error moving inventory:", err);
      showToast(`Error: ${err.message || "Failed to move inventory"}`, 'error');
    }
  };

  const handleViewInventoryDetail = (item) => {
    setSelectedInventoryItem(item);
  };

  const handleCloseInventoryDetail = () => {
    setSelectedInventoryItem(null);
  };

  const handleViewInventoryHistory = async (productId) => {
    try {
      // Get product details
      const product = await productService.getProductById(productId);
      setSelectedProductForHistory(product);
      setShowInventoryHistory(true);
    } catch (err) {
      console.error("Error fetching inventory history:", err);
      showToast(`Error: ${err.message || "Failed to fetch inventory history"}`, 'error');
    }
  };

  const handleCloseInventoryHistory = () => {
    setShowInventoryHistory(false);
    setSelectedProductForHistory(null);
  };

  // Show loading screen while initial data is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading WMS Platform...</h2>
          <p className="text-gray-500">Please wait while we load your warehouse data</p>
        </div>
      </div>
    );
  }

  // Show error screen if initial data loading failed
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error Loading Data</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Main Dashboard */}
      <EnhancedWMSDashboard
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        products={products}
        orders={orders}
        inventory={inventory}
        locations={locations}
        lowStockProducts={lowStockProducts}
        onCreateProduct={handleCreateProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onCreateOrder={handleCreateOrder}
        onEditOrder={handleEditOrder}
        onViewOrder={handleViewOrder}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onAddInventory={handleAddInventory}
        onMoveInventory={handleMoveInventory}
        onViewInventoryDetail={handleViewInventoryDetail}
        onViewInventoryHistory={handleViewInventoryHistory}
      />

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm
          existingProduct={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => setShowProductForm(false)}
        />
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <OrderForm
          existingOrder={editingOrder}
          products={products}
          onSave={handleSaveOrder}
          onCancel={() => setShowOrderForm(false)}
        />
      )}

      {/* Add Inventory Form Modal */}
      {showAddInventoryForm && (
        <AddInventoryForm
          products={products}
          locations={locations}
          onSave={handleSaveNewInventory}
          onCancel={() => setShowAddInventoryForm(false)}
        />
      )}

      {/* Move Inventory Form Modal */}
      {showMoveInventoryForm && (
        <MoveInventoryForm
          inventoryItems={inventory}
          locations={locations}
          onSave={handleSaveMoveInventory}
          onCancel={() => setShowMoveInventoryForm(false)}
        />
      )}

      {/* Inventory Detail Modal */}
      {selectedInventoryItem && (
        <InventoryDetail
          item={selectedInventoryItem}
          onClose={handleCloseInventoryDetail}
        />
      )}

      {/* Inventory History Modal */}
      {showInventoryHistory && selectedProductForHistory && (
        <InventoryHistory
          productId={selectedProductForHistory.id}
          productName={selectedProductForHistory.name}
          onClose={handleCloseInventoryHistory}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default WMSApplication;
