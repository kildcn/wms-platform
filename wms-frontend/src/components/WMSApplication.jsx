import React, { useState, useEffect } from 'react';
import EnhancedWMSDashboard from './EnhancedWMSDashboard';
import ProductForm from './ProductForm';
import OrderForm from './OrderForm';
import { AddInventoryForm, MoveInventoryForm, InventoryDetail } from './InventoryComponents';
import InventoryHistory from './InventoryHistory';

// Import services
import * as productService from '../services/productService';
import * as orderService from '../services/orderService';
import * as inventoryService from '../services/inventoryService';
import * as locationService from '../services/locationService';

// Main application component that integrates all others
const WMSApplication = () => {
  // State for products, orders, and inventory
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [locations, setLocations] = useState([]);

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

  // Error and loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Use the actual API calls
        const fetchProducts = productService.getAllProducts();
        const fetchOrders = orderService.getAllOrders();
        const fetchLocations = locationService.getLocations();

        // Wait for all API calls to complete
        const [productsData, ordersData, locationsData] = await Promise.all([
          fetchProducts,
          fetchOrders,
          fetchLocations
        ]);

        // Once we have products, fetch inventory for the first product if any exist
        let inventoryData = [];
        if (productsData.length > 0) {
          try {
            inventoryData = await inventoryService.getInventoryByProduct(productsData[0].id);
          } catch (err) {
            console.error("Failed to load inventory data:", err);
            // Don't fail the whole app if just inventory fails
          }
        }

        setProducts(productsData);
        setOrders(ordersData);
        setInventory(inventoryData);
        setLocations(locationsData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load application data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler functions for various actions

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
        // Update existing product via API
        const updatedProduct = await productService.updateProduct(editingProduct.id, productData);

        // Update local state
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.id === editingProduct.id ? updatedProduct : p
          )
        );
      } else {
        // Create new product via API
        const newProduct = await productService.createProduct(productData);

        // Add to local state
        setProducts(prevProducts => [...prevProducts, newProduct]);
      }
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Error saving product:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Delete via API
        await productService.deleteProduct(productId);

        // Update local state
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      } catch (err) {
        console.error("Error deleting product:", err);
        alert(`Error: ${err.message}`);
      }
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
      // Get complete order details from API
      const orderDetails = await orderService.getOrderById(order.id);
      setEditingOrder(orderDetails);
      setShowOrderForm(true);
    } catch (err) {
      console.error("Error fetching order details:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleSaveOrder = async (orderData) => {
    try {
      if (editingOrder) {
        // For updating an existing order
        console.log("Updating order status:", orderData.status);

        // Update status
        const updatedOrder = await orderService.updateOrderStatus(
          editingOrder.id,
          orderData.status
        );

        // Update local state
        setOrders(prevOrders =>
          prevOrders.map(o =>
            o.id === editingOrder.id ? { ...o, ...updatedOrder } : o
          )
        );
      } else {
        // Create new order via API
        const newOrder = await orderService.createOrder(orderData);

        // Add to local state
        setOrders(prevOrders => [...prevOrders, newOrder]);
      }
      setShowOrderForm(false);
      setEditingOrder(null);
    } catch (err) {
      console.error("Error saving order:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      // Update status via API
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);

      // Update local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? updatedOrder : order
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(`Error updating order status: ${err.message}`);
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
      // Add inventory via API
      const newItem = await inventoryService.addInventory(inventoryData);

      // Update local state
      setInventory(prevInventory => [...prevInventory, newItem]);

      // Refresh the product to update its stock quantity
      const updatedProduct = await productService.getProductById(inventoryData.productId);
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === inventoryData.productId ? updatedProduct : p
        )
      );

      setShowAddInventoryForm(false);
    } catch (err) {
      console.error("Error adding inventory:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleSaveMoveInventory = async (moveData) => {
    try {
      // Move inventory via API
      const updatedItem = await inventoryService.moveInventory(
        moveData.inventoryItemId,
        moveData.newLocationId,
        moveData.quantity
      );

      // Update local state - this is simplified and would need to handle split cases in real app
      setInventory(prevInventory => {
        return prevInventory.map(item =>
          item.id === parseInt(moveData.inventoryItemId) ? updatedItem : item
        );
      });

      setShowMoveInventoryForm(false);
    } catch (err) {
      console.error("Error moving inventory:", err);
      alert(`Error: ${err.message}`);
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

      // Here you would typically fetch inventory history as well
      // const inventoryHistory = await inventoryService.getProductInventoryHistory(productId);

      setSelectedProductForHistory(product);
      setShowInventoryHistory(true);
    } catch (err) {
      console.error("Error fetching inventory history:", err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleCloseInventoryHistory = () => {
    setShowInventoryHistory(false);
    setSelectedProductForHistory(null);
  };

  // If loading, show loading screen
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

  // If error, show error screen
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
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
        lowStockProducts={products.filter(p => p.stockQuantity < 10)}
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
          history={[]} // In a real app, fetch history data
          onClose={handleCloseInventoryHistory}
        />
      )}
    </div>
  );
};

export default WMSApplication;
