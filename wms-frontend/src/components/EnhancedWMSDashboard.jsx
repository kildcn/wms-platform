import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, ShoppingBag, BarChart2, Layers, AlertCircle, Search, Edit, Trash2, Plus, ArrowRight, Eye, RefreshCw, Zap } from 'lucide-react';
import { getStockByCategory } from '../services/inventoryService';

// Enhanced Dashboard with actions
const EnhancedWMSDashboard = ({
  activeTab,
  setActiveTab,
  products,
  orders,
  inventory,
  locations,
  lowStockProducts,
  onCreateProduct,
  onEditProduct,
  onDeleteProduct,
  onCreateOrder,
  onEditOrder,
  onViewOrder,
  onUpdateOrderStatus,
  onAddInventory,
  onMoveInventory,
  onViewInventoryDetail,
  onViewInventoryHistory
}) => {
  // State for filters
  const [productFilter, setProductFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('');
  const [stockByCategoryData, setStockByCategoryData] = useState([]);

  // Chart data
  const orderStatusData = [
    { status: 'CREATED', count: orders.filter(o => o.status === 'CREATED').length },
    { status: 'PROCESSING', count: orders.filter(o => o.status === 'PROCESSING').length },
    { status: 'PICKING', count: orders.filter(o => o.status === 'PICKING').length },
    { status: 'PACKING', count: orders.filter(o => o.status === 'PACKING').length },
    { status: 'SHIPPED', count: orders.filter(o => o.status === 'SHIPPED').length },
    { status: 'DELIVERED', count: orders.filter(o => o.status === 'DELIVERED').length },
    { status: 'CANCELED', count: orders.filter(o => o.status === 'CANCELED').length }
  ];

  useEffect(() => {
    const fetchStockByCategory = async () => {
      try {
        const data = await getStockByCategory();
        setStockByCategoryData(
          Object.entries(data).map(([category, total]) => ({ category, total }))
        );
      } catch (error) {
        console.error('Error fetching stock by category:', error);
      }
    };

    fetchStockByCategory();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B', '#6B8E23'];

  // Filter products
  const filteredProducts = products.filter(product => {
    return (
      (productFilter === '' ||
        product.name.toLowerCase().includes(productFilter.toLowerCase()) ||
        product.sku.toLowerCase().includes(productFilter.toLowerCase())) &&
      (categoryFilter === '' || product.category === categoryFilter)
    );
  });

  // Filter orders
  const filteredOrders = orders.filter(order => {
    return (
      order && // Ensure order is not null or undefined
      (orderFilter === '' ||
        order.orderNumber?.toLowerCase().includes(orderFilter.toLowerCase()) ||
        order.customerId?.toString().includes(orderFilter)) &&
      (statusFilter === '' || order.status === statusFilter) &&
      (priorityFilter === '' || order.priorityLevel?.toString() === priorityFilter)
    );
  });

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    return (
      inventoryFilter === '' ||
      item.productName.toLowerCase().includes(inventoryFilter.toLowerCase()) ||
      item.productSku.toLowerCase().includes(inventoryFilter.toLowerCase()) ||
      item.locationName.toLowerCase().includes(inventoryFilter.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">WMS Platform Dashboard</h1>
          <p className="text-sm opacity-80">Warehouse Management System</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        <div className="flex flex-col">
          <div className="mb-4 flex space-x-1 bg-white p-1 rounded-lg shadow">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeTab === 'overview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <BarChart2 className="h-5 w-5 mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeTab === 'products'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Package className="h-5 w-5 mr-2" />
              Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeTab === 'orders'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeTab === 'inventory'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Layers className="h-5 w-5 mr-2" />
              Inventory
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold">Products</h3>
                  <div className="text-3xl font-bold mt-2">{products.length}</div>
                  <p className="text-gray-500 text-sm">Total products</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold">Orders</h3>
                  <div className="text-3xl font-bold mt-2">{orders.length}</div>
                  <p className="text-gray-500 text-sm">Active orders</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold">Low Stock</h3>
                  <div className="text-3xl font-bold mt-2">{lowStockProducts.length}</div>
                  <p className="text-gray-500 text-sm">Products low on stock</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold">Shipped</h3>
                  <div className="text-3xl font-bold mt-2">
                    {orders.filter(order => order.status === 'SHIPPED').length}
                  </div>
                  <p className="text-gray-500 text-sm">Orders shipped</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold">Order Status Distribution</h3>
                  <p className="text-gray-500 text-sm mb-4">Current order status breakdown</p>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={orderStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" angle={-45} textAnchor="end" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold">Stock by Category</h3>
                  <p className="text-gray-500 text-sm mb-4">Inventory distribution by category</p>
                  {stockByCategoryData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stockByCategoryData}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="total"
                            nameKey="category"
                            label={({ category, total }) => `${category}: ${total}`}
                          >
                            {stockByCategoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">No stock data available</p>
                  )}
                </div>
              </div>

              {/* Alerts Section */}
              <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
                <h3 className="flex items-center text-lg font-semibold text-orange-700 mb-2">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Alerts & Notifications
                </h3>
                <ul className="space-y-2">
                  {lowStockProducts.length > 0 && (
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-600 mt-0.5" />
                      <span>Low stock alert: {lowStockProducts.length} products below threshold</span>
                    </li>
                  )}
                  {orders.filter(o => o.priorityLevel >= 4).length > 0 && (
                    <li className="flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-600 mt-0.5" />
                      <span>{orders.filter(o => o.priorityLevel >= 4).length} high priority orders require attention</span>
                    </li>
                  )}
                  {lowStockProducts.length === 0 && orders.filter(o => o.priorityLevel >= 4).length === 0 && (
                    <li className="flex items-start">
                      <Zap className="h-5 w-5 mr-2 text-green-600 mt-0.5" />
                      <span>No critical alerts at this time.</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={onCreateProduct}
                    className="p-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex flex-col items-center"
                  >
                    <Package className="h-6 w-6 mb-1" />
                    <span className="text-sm">Add Product</span>
                  </button>

                  <button
                    onClick={onCreateOrder}
                    className="p-3 bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex flex-col items-center"
                  >
                    <ShoppingBag className="h-6 w-6 mb-1" />
                    <span className="text-sm">Create Order</span>
                  </button>

                  <button
                    onClick={onAddInventory}
                    className="p-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 flex flex-col items-center"
                  >
                    <Layers className="h-6 w-6 mb-1" />
                    <span className="text-sm">Add Inventory</span>
                  </button>

                  <button
                    onClick={onMoveInventory}
                    className="p-3 bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 flex flex-col items-center"
                  >
                    <ArrowRight className="h-6 w-6 mb-1" />
                    <span className="text-sm">Move Inventory</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h2 className="text-lg font-semibold">Product Catalog</h2>
                  <button
                    onClick={onCreateProduct}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Product
                  </button>
                </div>
                <p className="text-gray-500 mt-1">Manage your warehouse products</p>
              </div>
              <div className="p-4">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <div className="relative flex-grow">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Categories</option>
                    {[...new Set(products.map(p => p.category))].map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="p-3 border">ID</th>
                        <th className="p-3 border">SKU</th>
                        <th className="p-3 border">Name</th>
                        <th className="p-3 border">Category</th>
                        <th className="p-3 border">Stock</th>
                        <th className="p-3 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 border">{product.id}</td>
                            <td className="p-3 border">{product.sku}</td>
                            <td className="p-3 border">{product.name}</td>
                            <td className="p-3 border">{product.category}</td>
                            <td className="p-3 border">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                product.stockQuantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {product.stockQuantity}
                              </span>
                            </td>
                            <td className="p-3 border">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => onEditProduct(product)}
                                  className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  title="Edit Product"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => onDeleteProduct(product.id)}
                                  className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  title="Delete Product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => onViewInventoryHistory(product.id)}
                                  className="p-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                                  title="View History"
                                >
                                  <BarChart2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-gray-500">
                            No products found matching your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <h2 className="text-lg font-semibold">Order Management</h2>
                  <button
                    onClick={onCreateOrder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Order
                  </button>
                </div>
                <p className="text-gray-500 mt-1">Track and manage customer orders</p>
              </div>
              <div className="p-4">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <div className="relative flex-grow">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search order number, customer ID..."
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Statuses</option>
                    <option value="CREATED">Created</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="PICKING">Picking</option>
                    <option value="PACKING">Packing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELED">Canceled</option>
                  </select>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">All Priorities</option>
                    <option value="5">High (5)</option>
                    <option value="4">Medium-High (4)</option>
                    <option value="3">Medium (3)</option>
                    <option value="2">Medium-Low (2)</option>
                    <option value="1">Low (1)</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="p-3 border">ID</th>
                        <th className="p-3 border">Order #</th>
                        <th className="p-3 border">Customer ID</th>
                        <th className="p-3 border">Status</th>
                        <th className="p-3 border">Items</th>
                        <th className="p-3 border">Priority</th>
                        <th className="p-3 border">Created At</th>
                        <th className="p-3 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                          <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 border">{order.id}</td>
                            <td className="p-3 border">{order.orderNumber}</td>
                            <td className="p-3 border">{order.customerId}</td>
                            <td className="p-3 border">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                order.status === 'SHIPPED' ? 'bg-green-100 text-green-800' :
                                order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'PICKING' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'PACKING' ? 'bg-orange-100 text-orange-800' :
                                order.status === 'CANCELED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3 border">{order.items.length}</td>
                            <td className="p-3 border">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                order.priorityLevel >= 4 ? 'bg-red-100 text-red-800' :
                                order.priorityLevel === 3 ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {order.priorityLevel}
                              </span>
                            </td>
                            <td className="p-3 border">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="p-3 border">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => onViewOrder(order)}
                                  className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  title="View Order"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => onEditOrder(order)}
                                  className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                  title="Edit Order"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <div className="relative group">
                                  <button
                                    className="p-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                                    title="Update Status"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </button>
                                  <div className="absolute z-10 right-0 mt-2 w-48 bg-white shadow-lg rounded-md hidden group-hover:block">
                                    <div className="p-2 text-sm font-medium border-b">Update Status</div>
                                    <div className="p-1">
                                      {['CREATED', 'PROCESSING', 'PICKING', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELED']
                                        .filter(status => status !== order.status)
                                        .map(status => (
                                          <button
                                            key={status}
                                            onClick={() => onUpdateOrderStatus(order.id, status)}
                                            className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 rounded"
                                          >
                                            {status}
                                          </button>
                                        ))
                                      }
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="p-4 text-center text-gray-500">
                            No orders found matching your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">Inventory Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={onAddInventory}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Inventory
                    </button>
                    <button
                      onClick={onMoveInventory}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Move Inventory
                    </button>
                    <button
                      className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center justify-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Cycle Count
                    </button>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">Low Stock Products</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {lowStockProducts.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">No low stock products</p>
                    ) : (
                      lowStockProducts.map(product => (
                        <div key={product.id} className="flex justify-between items-center p-2 border-b">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.sku}</p>
                          </div>
                          <div className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            Stock: {product.stockQuantity}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Inventory Items</h3>
                  <div className="relative w-64">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={inventoryFilter}
                      onChange={(e) => setInventoryFilter(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="p-3 border">ID</th>
                        <th className="p-3 border">Product</th>
                        <th className="p-3 border">SKU</th>
                        <th className="p-3 border">Location</th>
                        <th className="p-3 border">Quantity</th>
                        <th className="p-3 border">Batch</th>
                        <th className="p-3 border">Status</th>
                        <th className="p-3 border">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.length > 0 ? (
                        filteredInventory.map(item => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 border">{item.id}</td>
                            <td className="p-3 border">{item.productName}</td>
                            <td className="p-3 border">{item.productSku}</td>
                            <td className="p-3 border">{item.locationName}</td>
                            <td className="p-3 border">{item.quantity}</td>
                            <td className="p-3 border">{item.batchNumber || '-'}</td>
                            <td className="p-3 border">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                item.isQuarantined ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {item.isQuarantined ? 'Quarantined' : 'Available'}
                              </span>
                            </td>
                            <td className="p-3 border">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => onViewInventoryDetail(item)}
                                  className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => onViewInventoryHistory(item.productId)}
                                  className="p-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                                  title="View History"
                                >
                                  <BarChart2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="p-4 text-center text-gray-500">
                            No inventory items found matching your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Warehouse Locations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {locations.map(location => (
                    <div key={location.id} className="border p-3 rounded">
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm text-gray-500">
                        Type: {location.type}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs">
                          {location.isOccupied ? 'Occupied' : 'Available'}
                        </p>
                        <p className="text-xs">
                          Weight: {location.currentWeight}/{location.maxWeight} kg
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            (location.currentWeight / location.maxWeight) > 0.8
                              ? 'bg-red-500'
                              : (location.currentWeight / location.maxWeight) > 0.5
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(100, (location.currentWeight / location.maxWeight) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p>WMS Platform &copy; 2025 | <a href="https://github.com/kildcn/wms-platform" className="underline hover:text-blue-300">GitHub</a></p>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedWMSDashboard;
