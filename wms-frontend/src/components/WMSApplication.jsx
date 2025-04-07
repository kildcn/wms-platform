import React, { useState, useEffect } from 'react';
import EnhancedWMSDashboard from './EnhancedWMSDashboard';
import ProductForm from './ProductForm';
import OrderForm from './OrderForm';
import { AddInventoryForm, MoveInventoryForm, InventoryDetail, InventoryHistory } from './InventoryComponents';

// Import services
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getLowStockProducts } from '../services/productService';
import { getAllOrders, getOrdersByStatus, getOrderById, createOrder, updateOrderStatus, cancelOrder, getHighPriorityOrders } from '../services/orderService';
import { getInventoryItemById, getInventoryByProduct, getInventoryByLocation, addInventory, moveInventory, removeInventory } from '../services/inventoryService';

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

        // Replace this mock data section:
        // setTimeout(() => { setProducts([...]) }, 1000);

        // With actual API calls:
        const productsData = await productService.getAllProducts();
        const ordersData = await orderService.getAllOrders();
        const inventoryData = await inventoryService.getInventoryByProduct(/* pass suitable param */);
        // You might need to add additional service methods to fetch locations

        setProducts(productsData);
        setOrders(ordersData);
        setInventory(inventoryData);
        // You'll need to fetch locations too

        setLoading(false);
      } catch (err) {
        setError(err.message);
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
        // In a real app: await productService.updateProduct(editingProduct.id, productData);

        // Update existing product
        setProducts(prevProducts =>
          prevProducts.map(p =>
            p.id === editingProduct.id ? { ...p, ...productData } : p
          )
        );
      } else {
        // In a real app: const newProduct = await productService.createProduct(productData);

        // Create new product with generated ID
        const newId = Math.max(0, ...products.map(p => p.id)) + 1;
        setProducts(prevProducts => [
          ...prevProducts,
          { id: newId, ...productData }
        ]);
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
        // In a real app: await productService.deleteProduct(productId);
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

  const handleViewOrder = (order) => {
    // In a real app, fetch complete order details
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  const handleSaveOrder = async (orderData) => {
    try {
      if (editingOrder) {
        // In a real app, call API to update
        setOrders(prevOrders =>
          prevOrders.map(o =>
            o.id === editingOrder.id ? { ...o, ...orderData } : o
          )
        );
      } else {
        // In a real app: const newOrder = await orderService.createOrder(orderData);

        // Create new order with generated ID
        const newId = Math.max(0, ...orders.map(o => o.id)) + 1;
        setOrders(prevOrders => [
          ...prevOrders,
          { id: newId, ...orderData }
        ]);
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
      // In a real app: await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(`Error: ${err.message}`);
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
      // In a real app: const newItem = await inventoryService.addInventory(inventoryData);

      // Add new inventory item with generated ID
      const newId = Math.max(0, ...inventory.map(i => i.id)) + 1;

      // Get product and location details
      const product = products.find(p => p.id === inventoryData.productId);
      const location = locations.find(l => l.id === inventoryData.locationId);

      if (!product || !location) {
        alert('Invalid product or location');
        return;
      }

      const newItem = {
        id: newId,
        productId: inventoryData.productId,
        productName: product.name,
        productSku: product.sku,
        quantity: inventoryData.quantity,
        locationId: inventoryData.locationId,
        locationName: `${location.aisle}-${location.rack}-${location.shelf}-${location.bin}`,
        batchNumber: inventoryData.batchNumber || null,
        expiryDate: inventoryData.expiryDate || null,
        lastCountedAt: new Date().toISOString(),
        isQuarantined: false,
        createdAt: new Date().toISOString()
      };

      setInventory(prevInventory => [...prevInventory, newItem]);

      // Update product stock
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === inventoryData.productId
            ? { ...p, stockQuantity: p.stockQuantity + inventoryData.quantity }
            : p
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
      // In a real app: await inventoryService.moveInventory(moveData.inventoryItemId, moveData.newLocationId, moveData.quantity);

      const sourceItem = inventory.find(i => i.id === parseInt(moveData.inventoryItemId));
      if (!sourceItem) {
        alert('Invalid inventory item');
        return;
      }

      const targetLocation = locations.find(l => l.id === parseInt(moveData.newLocationId));
      if (!targetLocation) {
        alert('Invalid target location');
        return;
      }

      if (moveData.quantity > sourceItem.quantity) {
        alert('Cannot move more than available quantity');
        return;
      }

      if (parseInt(moveData.quantity) === sourceItem.quantity) {
        // Move entire inventory item
        setInventory(prevInventory =>
          prevInventory.map(item =>
            item.id === parseInt(moveData.inventoryItemId)
              ? {
                  ...item,
                  locationId: parseInt(moveData.newLocationId),
                  locationName: `${targetLocation.aisle}-${targetLocation.rack}-${targetLocation.shelf}-${targetLocation.bin}`,
                  lastCountedAt: new Date().toISOString()
                }
              : item
          )
        );
      } else {
        // Split inventory - reduce source and create new destination
        setInventory(prevInventory => {
          const updatedSource = {
            ...sourceItem,
            quantity: sourceItem.quantity - parseInt(moveData.quantity),
            lastCountedAt: new Date().toISOString()
          };

          const newId = Math.max(0, ...prevInventory.map(i => i.id)) + 1;
          const newDestination = {
            ...sourceItem,
            id: newId,
            quantity: parseInt(moveData.quantity),
            locationId: parseInt(moveData.newLocationId),
            locationName: `${targetLocation.aisle}-${targetLocation.rack}-${targetLocation.shelf}-${targetLocation.bin}`,
            lastCountedAt: new Date().toISOString(),
            createdAt: new Date().toISOString()
          };

          return [
            ...prevInventory.filter(i => i.id !== sourceItem.id),
            updatedSource,
            newDestination
          ];
        });
      }

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

  const handleViewInventoryHistory = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProductForHistory(product);
      setShowInventoryHistory(true);
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
