// src/components/InventoryComponents.jsx - Improved with better validation and error handling
import React, { useState, useEffect } from 'react';
import { AlertCircle, X, ArrowRight } from 'lucide-react';

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
  const [touchedFields, setTouchedFields] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Set selected product when productId changes
    if (name === 'productId' && value) {
      const product = products.find(p => p.id.toString() === value);
      setSelectedProduct(product || null);
    }
  };

  // Validate a single field
  const validateField = (name, value) => {
    switch (name) {
      case 'productId':
        return value ? null : 'Product is required';

      case 'quantity':
        if (!value.trim()) return 'Quantity is required';
        if (isNaN(parseInt(value, 10)) || parseInt(value, 10) <= 0)
          return 'Quantity must be a positive number';
        return null;

      case 'locationId':
        return value ? null : 'Location is required';

      case 'expiryDate':
        if (!value) return null; // Optional
        const date = new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date format';
        return null;

      default:
        return null;
    }
  };

  // Validate form on submit
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Check required fields
    ['productId', 'quantity', 'locationId'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Check optional fields with values
    if (formData.expiryDate) {
      const error = validateField('expiryDate', formData.expiryDate);
      if (error) {
        newErrors.expiryDate = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle field blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all required fields as touched
    const requiredTouched = {
      productId: true,
      quantity: true,
      locationId: true
    };
    setTouchedFields(prev => ({
      ...prev,
      ...requiredTouched
    }));

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Format data for API
      const apiData = {
        productId: parseInt(formData.productId, 10),
        quantity: parseInt(formData.quantity, 10),
        locationId: parseInt(formData.locationId, 10),
        batchNumber: formData.batchNumber || null,
        expiryDate: formData.expiryDate || null
      };

      await onSave(apiData);
    } catch (error) {
      console.error('Error adding inventory:', error);
      // Show error at the form level
      setErrors(prev => ({
        ...prev,
        form: error.message || 'Failed to add inventory'
      }));
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
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Add new inventory to your warehouse</p>
        </div>
        <div className="p-4">
          {errors.form && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{errors.form}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Selection */}
            <div>
              <label htmlFor="product-select" className="block text-sm font-medium mb-1">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                id="product-select"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-2 border rounded-md ${
                  touchedFields.productId && errors.productId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.sku})
                  </option>
                ))}
              </select>
              {touchedFields.productId && errors.productId && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.productId}
                </p>
              )}
            </div>

            {/* Product Details (if selected) */}
            {selectedProduct && (
              <div className="bg-blue-50 p-3 rounded-md text-sm">
                <p><strong>SKU:</strong> {selectedProduct.sku}</p>
                <p><strong>Category:</strong> {selectedProduct.category}</p>
                <p><strong>Current Stock:</strong> {selectedProduct.stockQuantity}</p>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-2 border rounded-md ${
                  touchedFields.quantity && errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {touchedFields.quantity && errors.quantity && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.quantity}
                </p>
              )}
            </div>

            {/* Location Selection */}
            <div>
              <label htmlFor="location-select" className="block text-sm font-medium mb-1">
                Warehouse Location <span className="text-red-500">*</span>
              </label>
              <select
                id="location-select"
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-2 border rounded-md ${
                  touchedFields.locationId && errors.locationId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.aisle}-{location.rack}-{location.shelf}-{location.bin} ({location.type})
                  </option>
                ))}
              </select>
              {touchedFields.locationId && errors.locationId && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.locationId}
                </p>
              )}
            </div>

            {/* Batch Number */}
            <div>
              <label htmlFor="batch-number" className="block text-sm font-medium mb-1">
                Batch Number
              </label>
              <input
                id="batch-number"
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Optional batch number"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label htmlFor="expiry-date" className="block text-sm font-medium mb-1">
                Expiry Date
              </label>
              <input
                id="expiry-date"
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-2 border rounded-md ${
                  touchedFields.expiryDate && errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {touchedFields.expiryDate && errors.expiryDate && (
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
  const [touchedFields, setTouchedFields] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Update selected item or location
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
    } else if (name === 'newLocationId') {
      setSelectedLocation(locations.find(l => l.id.toString() === value) || null);
    }
  };

  // Validate a single field
  const validateField = (name, value) => {
    switch (name) {
      case 'inventoryItemId':
        return value ? null : 'Inventory item is required';

      case 'newLocationId':
        return value ? null : 'New location is required';

      case 'quantity':
        if (!value.trim()) return 'Quantity is required';
        const qty = parseInt(value, 10);
        if (isNaN(qty) || qty <= 0) return 'Quantity must be a positive number';
        if (selectedItem && qty > selectedItem.quantity)
          return `Cannot move more than available quantity (${selectedItem.quantity})`;
        return null;

      default:
        return null;
    }
  };

  // Validate form on submit
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Check all fields
    ['inventoryItemId', 'newLocationId', 'quantity'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle field blur for validation
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouchedFields({
      inventoryItemId: true,
      newLocationId: true,
      quantity: true
    });

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Format data for API
      const apiData = {
        inventoryItemId: parseInt(formData.inventoryItemId, 10),
        newLocationId: parseInt(formData.newLocationId, 10),
        quantity: parseInt(formData.quantity, 10)
      };

      await onSave(apiData);
    } catch (error) {
      console.error('Error moving inventory:', error);
      setErrors(prev => ({
        ...prev,
        form: error.message || 'Failed to move inventory'
      }));
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
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">Transfer inventory between warehouse locations</p>
        </div>
        <div className="p-4">
          {errors.form && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{errors.form}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Inventory Item Selection */}
            <div>
              <label htmlFor="inventory-select" className="block text-sm font-medium mb-1">
                Inventory Item <span className="text-red-500">*</span>
              </label>
              <select
                id="inventory-select"
                name="inventoryItemId"
                value={formData.inventoryItemId}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-2 border rounded-md ${
                  touchedFields.inventoryItemId && errors.inventoryItemId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select inventory item</option>
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.productName || 'Product'}
                    {item.batchNumber ? ` (${item.batchNumber})` : ''} - Qty: {item.quantity}
                  </option>
                ))}
              </select>
              {touchedFields.inventoryItemId && errors.inventoryItemId && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.inventoryItemId}
                </p>
              )}
            </div>

            {/* Selected Item Details */}
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
                <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                  Quantity to Move <span className="text-red-500">*</span>
                </label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  min="1"
                  max={selectedItem?.quantity || 1}
                  value={formData.quantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!selectedItem}
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.quantity && errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {touchedFields.quantity && errors.quantity && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.quantity}
                  </p>
                )}
              </div>

              {/* New Location Selection */}
              <div>
                <label htmlFor="location-select" className="block text-sm font-medium mb-1">
                  New Location <span className="text-red-500">*</span>
                </label>
                <select
                  id="location-select"
                  name="newLocationId"
                  value={formData.newLocationId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!selectedItem}
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.newLocationId && errors.newLocationId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select new location</option>
                  {locations
                    .filter(loc => !selectedItem || loc.id !== (selectedItem.locationId || 0))
                    .map(location => (
                      <option key={location.id} value={location.id}>
                        {location.aisle}-{location.rack}-{location.shelf}-{location.bin} ({location.type})
                      </option>
                    ))}
                </select>
                {touchedFields.newLocationId && errors.newLocationId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.newLocationId}
                  </p>
                )}
              </div>
            </div>

            {/* Movement visualization */}
            {selectedItem && formData.newLocationId && selectedLocation && (
              <div className="flex items-center justify-center py-2">
                <div className="text-center text-sm text-gray-500">
                  <p className="font-medium">{selectedItem.locationName}</p>
                  <p>Current Location</p>
                </div>
                <ArrowRight className="mx-4 text-blue-500" />
                <div className="text-center text-sm text-gray-500">
                  <p className="font-medium">
                    {`${selectedLocation.aisle}-${selectedLocation.rack}-${selectedLocation.shelf}-${selectedLocation.bin}`}
                  </p>
                  <p>{selectedLocation.type}</p>
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

// Inventory Detail Component
export const InventoryDetail = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Inventory Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
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
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Unknown"}
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
