import React, { useState, useEffect } from 'react';
import { AlertCircle, X, ArrowRight, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Add Inventory Form Component
export const AddInventoryForm = ({ products, locations, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    locationId: '',
    batchNumber: '',
    expiryDate: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productId) newErrors.productId = 'Product is required';
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(parseInt(formData.quantity, 10)) || parseInt(formData.quantity, 10) <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    if (!formData.locationId) newErrors.locationId = 'Location is required';

    // Optional date validation
    if (formData.expiryDate) {
      const date = new Date(formData.expiryDate);
      if (isNaN(date.getTime())) {
        newErrors.expiryDate = 'Invalid date format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const apiData = {
        ...formData,
        productId: parseInt(formData.productId, 10),
        quantity: parseInt(formData.quantity, 10),
        locationId: parseInt(formData.locationId, 10)
      };

      onSave(apiData);
    } catch (error) {
      console.error('Error adding inventory:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Add Inventory</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Add new inventory to your warehouse</p>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.productId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
              {errors.productId && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.productId}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.quantity}
                </p>
              )}
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Warehouse Location <span className="text-red-500">*</span>
              </label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.locationId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.aisle}-{location.rack}-{location.shelf}-{location.bin} ({location.type})
                  </option>
                ))}
              </select>
              {errors.locationId && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.locationId}
                </p>
              )}
            </div>

            {/* Batch Number */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Batch Number
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.expiryDate}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSubmitting ? 'Adding...' : 'Add Inventory'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Move Inventory Form Component
export const MoveInventoryForm = ({ inventoryItems, locations, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    inventoryItemId: '',
    newLocationId: '',
    quantity: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Update max quantity when inventory item changes
    if (name === 'inventoryItemId') {
      const item = inventoryItems.find(i => i.id.toString() === value);
      setSelectedItem(item || null);

      // Reset quantity if item changes
      if (item) {
        setFormData(prev => ({
          ...prev,
          quantity: '1'
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.inventoryItemId) newErrors.inventoryItemId = 'Inventory item is required';
    if (!formData.newLocationId) newErrors.newLocationId = 'New location is required';

    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else {
      const qty = parseInt(formData.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        newErrors.quantity = 'Quantity must be a positive number';
      } else if (selectedItem && qty > selectedItem.quantity) {
        newErrors.quantity = `Cannot move more than available quantity (${selectedItem.quantity})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      onSave(formData);
    } catch (error) {
      console.error('Error moving inventory:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Move Inventory</h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Transfer inventory between warehouse locations</p>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Inventory Item Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Inventory Item <span className="text-red-500">*</span>
              </label>
              <select
                name="inventoryItemId"
                value={formData.inventoryItemId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  errors.inventoryItemId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select inventory item</option>
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.productName} ({item.batchNumber || 'No Batch'}) - Qty: {item.quantity}
                  </option>
                ))}
              </select>
              {errors.inventoryItemId && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.inventoryItemId}
                </p>
              )}
            </div>

            {selectedItem && (
              <div className="bg-blue-50 p-3 rounded-md text-sm">
                <p><strong>Current Location:</strong> {selectedItem.locationName}</p>
                <p><strong>Available Quantity:</strong> {selectedItem.quantity}</p>
                {selectedItem.batchNumber && <p><strong>Batch:</strong> {selectedItem.batchNumber}</p>}
                {selectedItem.expiryDate && (
                  <p><strong>Expires:</strong> {new Date(selectedItem.expiryDate).toLocaleDateString()}</p>
                )}
              </div>
            )}

            {/* Movement details */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Quantity to Move <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  max={selectedItem?.quantity || 1}
                  value={formData.quantity}
                  onChange={handleChange}
                  disabled={!selectedItem}
                  className={`w-full p-2 border rounded-md ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.quantity}
                  </p>
                )}
              </div>

              {/* New Location Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Location <span className="text-red-500">*</span>
                </label>
                <select
                  name="newLocationId"
                  value={formData.newLocationId}
                  onChange={handleChange}
                  disabled={!selectedItem}
                  className={`w-full p-2 border rounded-md ${
                    errors.newLocationId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select new location</option>
                  {locations
                    .filter(loc => !selectedItem || loc.id !== selectedItem.locationId)
                    .map(location => (
                      <option key={location.id} value={location.id}>
                        {location.aisle}-{location.rack}-{location.shelf}-{location.bin} ({location.type})
                      </option>
                    ))}
                </select>
                {errors.newLocationId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.newLocationId}
                  </p>
                )}
              </div>
            </div>

            {/* Movement visualization */}
            {selectedItem && formData.newLocationId && (
              <div className="flex items-center justify-center py-2">
                <div className="text-center text-sm text-gray-500">
                  <p className="font-medium">{selectedItem.locationName}</p>
                  <p>Current Location</p>
                </div>
                <ArrowRight className="mx-4 text-blue-500" />
                <div className="text-center text-sm text-gray-500">
                  <p className="font-medium">
                    {locations.find(l => l.id.toString() === formData.newLocationId)?.name || 'New Location'}
                  </p>
                  <p>New Location</p>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isSubmitting ? 'Moving...' : 'Move Inventory'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Inventory Detail Component (for viewing details of inventory item)
export const InventoryDetail = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Inventory Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Detailed information about inventory item</p>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-semibold text-lg">{item.productName}</h3>
              <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Quantity</p>
                <p className="font-semibold">{item.quantity}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="font-semibold">{item.locationName}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Batch Number</p>
                <p className="font-semibold">{item.batchNumber || "—"}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Last Counted</p>
                <p className="font-semibold">
                  {item.lastCountedAt
                    ? new Date(item.lastCountedAt).toLocaleDateString()
                    : "Never"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                <p className={`font-semibold ${
                  item.expiryDate && new Date(item.expiryDate) < new Date()
                    ? 'text-red-600'
                    : ''
                }`}>
                  {item.expiryDate
                    ? new Date(item.expiryDate).toLocaleDateString()
                    : "Not applicable"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className={`font-semibold ${
                  item.isQuarantined ? 'text-red-600' : 'text-green-600'
                }`}>
                  {item.isQuarantined ? "Quarantined" : "Available"}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium text-gray-500">Created At</p>
              <p className="text-sm">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Inventory History Component with Stacked Bar Chart
export const InventoryHistory = ({ productId, productName, history, onClose }) => {
  // Mock data for the chart
  const chartData = [
    { month: 'Jan', additions: 35, removals: 20 },
    { month: 'Feb', additions: 25, removals: 15 },
    { month: 'Mar', additions: 40, removals: 30 },
    { month: 'Apr', additions: 30, removals: 25 },
    { month: 'May', additions: 45, removals: 35 },
    { month: 'Jun', additions: 20, removals: 15 },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" />
                Inventory History
              </h2>
              <p className="text-sm text-gray-500">{productName}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-6">
            {/* Chart */}
            <div className="bg-white p-4 rounded-md border h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="additions" stackId="a" fill="#4ade80" name="Additions" />
                  <Bar dataKey="removals" stackId="a" fill="#f87171" name="Removals" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* History Table */}
            <div>
              <h3 className="font-semibold mb-2">Recent Activity</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Action</th>
                      <th className="p-2 border">Quantity</th>
                      <th className="p-2 border">Location</th>
                      <th className="p-2 border">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* In a real app, this would be populated with actual history data */}
                    <tr className="border-b">
                      <td className="p-2 border">2025-04-07</td>
                      <td className="p-2 border">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Added</span>
                      </td>
                      <td className="p-2 border">10</td>
                      <td className="p-2 border">A-01-02-03</td>
                      <td className="p-2 border">John Doe</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 border">2025-04-05</td>
                      <td className="p-2 border">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Moved</span>
                      </td>
                      <td className="p-2 border">5</td>
                      <td className="p-2 border">A-01-02-03 → B-02-01-04</td>
                      <td className="p-2 border">Jane Smith</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 border">2025-04-03</td>
                      <td className="p-2 border">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Removed</span>
                      </td>
                      <td className="p-2 border">8</td>
                      <td className="p-2 border">B-02-01-04</td>
                      <td className="p-2 border">Alice Johnson</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 border">2025-04-01</td>
                      <td className="p-2 border">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Counted</span>
                      </td>
                      <td className="p-2 border">15</td>
                      <td className="p-2 border">B-02-01-04</td>
                      <td className="p-2 border">Bob Martin</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
