// src/components/OrderForm.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Plus, Trash2, Info } from 'lucide-react';

const OrderForm = ({ existingOrder, products, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerId: '',
    status: 'CREATED',
    shippingAddress: '',
    priorityLevel: '3',
    items: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});

  // Flag to determine if we're in edit mode
  const isEditMode = !!existingOrder;

  // Populate form when editing an existing order
  useEffect(() => {
    if (existingOrder) {
      setFormData({
        orderNumber: existingOrder.orderNumber || '',
        customerId: existingOrder.customerId?.toString() || '',
        status: existingOrder.status || 'CREATED',
        shippingAddress: existingOrder.shippingAddress || '',
        priorityLevel: existingOrder.priorityLevel?.toString() || '3',
        items: existingOrder.items?.map(item => ({
          ...item,
          productId: item.productId?.toString(),
          quantity: item.quantity?.toString(),
          price: item.price?.toString()
        })) || []
      });
    }
  }, [existingOrder]);

  // Handle form field changes
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

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle item-specific field changes
  const handleItemChange = (index, field, value) => {
    // If in edit mode, don't allow item changes
    if (isEditMode) return;

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));

    // Mark field as touched
    const fieldKey = `items[${index}].${field}`;
    setTouchedFields(prev => ({
      ...prev,
      [fieldKey]: true
    }));

    // Clear error for this item field when user updates it
    if (errors[fieldKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  // Add a new empty item to the order
  const handleAddItem = () => {
    // If in edit mode, don't allow adding items
    if (isEditMode) return;

    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          productSku: '',
          productName: '',
          quantity: '1',
          price: ''
        }
      ]
    }));
  };

  // Remove an item from the order
  const handleRemoveItem = (index) => {
    // If in edit mode, don't allow removing items
    if (isEditMode) return;

    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));

    // Remove any errors for this item
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`items[${index}]`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  // Handle product selection and populate related fields
  const handleProductSelection = (index, productId) => {
    // If in edit mode, don't allow product selection changes
    if (isEditMode) return;

    if (!productId) return;

    // Find the selected product
    const product = products.find(p => p.id.toString() === productId.toString());

    if (!product) {
      console.error('Product not found for ID:', productId);
      return;
    }

    // Create a new items array to ensure React detects the change
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      productId: productId,
      productSku: product.sku,
      productName: product.name,
      // Set default price based on weight
      price: (parseFloat(product.weight) * 10 + 5).toFixed(2)
    };

    // Update the entire formData state at once
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Validate individual field
  const validateField = (name, value) => {
    // For nested fields (items array)
    if (name.startsWith('items[')) {
      // If in edit mode, we're not validating item fields
      if (isEditMode) return null;

      const match = name.match(/items\[(\d+)\]\.(\w+)/);
      if (match) {
        const [, indexStr, field] = match;

        switch (field) {
          case 'productId':
            return value ? null : 'Product is required';
          case 'quantity':
            if (!value) return 'Quantity is required';
            if (isNaN(parseInt(value, 10)) || parseInt(value, 10) <= 0)
              return 'Quantity must be greater than 0';
            return null;
          case 'price':
            if (!value) return 'Price is required';
            if (isNaN(parseFloat(value)) || parseFloat(value) <= 0)
              return 'Price must be greater than 0';
            return null;
          default:
            return null;
        }
      }
      return null;
    }

    // For top-level fields
    switch (name) {
      case 'orderNumber':
        // Only validate orderNumber in create mode
        if (isEditMode) return null;

        if (!value.trim()) return 'Order number is required';
        if (!/^[A-Za-z0-9-]{3,}$/.test(value))
          return 'Order number must be at least 3 characters and contain only letters, numbers, and hyphens';
        return null;

      case 'customerId':
        // Only validate customerId in create mode
        if (isEditMode) return null;

        if (!value.trim()) return 'Customer ID is required';
        if (isNaN(parseInt(value, 10)))
          return 'Customer ID must be a number';
        return null;

      case 'shippingAddress':
        // Only validate shippingAddress in create mode
        if (isEditMode) return null;

        if (!value.trim()) return 'Shipping address is required';
        if (value.length < 10) return 'Please enter a complete shipping address';
        return null;

      default:
        return null;
    }
  };

  // Validate the entire form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (isEditMode) {
      // In edit mode, we only need to ensure a valid status is selected
      // No validation needed since the dropdown restricts to valid values
      return true;
    }

    // Create mode - validate all fields

    // Validate top-level fields
    ['orderNumber', 'customerId', 'shippingAddress'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // Check if any items exist
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
      isValid = false;
    } else {
      // Validate each item
      formData.items.forEach((item, index) => {
        ['productId', 'quantity', 'price'].forEach(field => {
          const fieldName = `items[${index}].${field}`;
          const error = validateField(fieldName, item[field]);
          if (error) {
            newErrors[fieldName] = error;
            isValid = false;
          }
        });
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  // Validate single field on blur
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

  // Handle item field blur
  const handleItemBlur = (index, field) => {
    // If in edit mode, skip validation
    if (isEditMode) return;

    const fieldName = `items[${index}].${field}`;
    const value = formData.items[index][field];
    const error = validateField(fieldName, value);

    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode) {
      // In edit mode, we're only updating the status
      setIsSubmitting(true);

      try {
        // For editing, only send status update to match backend API
        const statusData = { status: formData.status };
        await onSave(statusData);
      } catch (error) {
        console.error('Error updating order status:', error);
        setErrors(prev => ({
          ...prev,
          form: error.message || 'Failed to update order status'
        }));
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    // Create mode - validate all fields

    // Mark all fields as touched
    const allTouched = {};
    // For top-level fields
    ['orderNumber', 'customerId', 'shippingAddress'].forEach(field => {
      allTouched[field] = true;
    });
    // For items
    formData.items.forEach((item, index) => {
      ['productId', 'quantity', 'price'].forEach(field => {
        allTouched[`items[${index}].${field}`] = true;
      });
    });

    setTouchedFields(allTouched);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // For new order, prepare full order data
      const apiData = {
        ...formData,
        customerId: parseInt(formData.customerId, 10),
        priorityLevel: parseInt(formData.priorityLevel, 10),
        items: formData.items.map(item => ({
          productId: parseInt(item.productId, 10),
          productSku: item.productSku,
          productName: item.productName,
          quantity: parseInt(item.quantity, 10),
          price: parseFloat(item.price),
          isPicked: false,
          isPacked: false
        }))
      };

      await onSave(apiData);
    } catch (error) {
      console.error('Error creating order:', error);
      setErrors(prev => ({
        ...prev,
        form: error.message || 'Failed to create order'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available order statuses
  const orderStatuses = [
    'CREATED',
    'PROCESSING',
    'PICKING',
    'PACKING',
    'SHIPPED',
    'DELIVERED',
    'CANCELED'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {isEditMode ? 'Update Order Status' : 'Create New Order'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {isEditMode
              ? 'You can only update the status of an existing order'
              : 'Create a new customer order'}
          </p>
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

          {isEditMode && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                <span>Only the order status can be updated after an order is created</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Order Number */}
              <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium mb-1">
                  Order Number {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <input
                  id="orderNumber"
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isEditMode} // Disabled in edit mode
                  placeholder="e.g., ORD1001"
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.orderNumber && errors.orderNumber ? 'border-red-500' : 'border-gray-300'
                  } ${isEditMode ? 'bg-gray-100' : ''}`}
                />
                {touchedFields.orderNumber && errors.orderNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.orderNumber}
                  </p>
                )}
              </div>

              {/* Customer ID */}
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium mb-1">
                  Customer ID {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <input
                  id="customerId"
                  type="text"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isEditMode} // Disabled in edit mode
                  placeholder="e.g., 12345"
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.customerId && errors.customerId ? 'border-red-500' : 'border-gray-300'
                  } ${isEditMode ? 'bg-gray-100' : ''}`}
                />
                {touchedFields.customerId && errors.customerId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.customerId}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">
                  Status {isEditMode && <span className="text-red-500">*</span>}
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full p-2 border border-gray-300 rounded-md ${
                    isEditMode ? 'bg-white border-blue-300 ring-1 ring-blue-300' : ''
                  }`}
                >
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {isEditMode && (
                  <p className="text-blue-600 text-xs mt-1">
                    Select the new status for this order
                  </p>
                )}
              </div>

              {/* Priority Level */}
              <div>
                <label htmlFor="priorityLevel" className="block text-sm font-medium mb-1">
                  Priority Level
                </label>
                <select
                  id="priorityLevel"
                  name="priorityLevel"
                  value={formData.priorityLevel}
                  onChange={handleChange}
                  disabled={isEditMode} // Disabled in edit mode
                  className={`w-full p-2 border border-gray-300 rounded-md ${
                    isEditMode ? 'bg-gray-100' : ''
                  }`}
                >
                  <option value="1">1 - Low</option>
                  <option value="2">2</option>
                  <option value="3">3 - Normal</option>
                  <option value="4">4</option>
                  <option value="5">5 - High</option>
                </select>
              </div>

              {/* Shipping Address */}
              <div className="md:col-span-2">
                <label htmlFor="shippingAddress" className="block text-sm font-medium mb-1">
                  Shipping Address {!isEditMode && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isEditMode} // Disabled in edit mode
                  rows="3"
                  placeholder="Full shipping address"
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.shippingAddress && errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
                  } ${isEditMode ? 'bg-gray-100' : ''}`}
                />
                {touchedFields.shippingAddress && errors.shippingAddress && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.shippingAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Order Items</h3>
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </button>
                )}
                {isEditMode && formData.items.length > 0 && (
                  <span className="text-gray-500 text-sm">
                    <Info className="h-4 w-4 inline-block mr-1" />
                    Items cannot be modified after creation
                  </span>
                )}
              </div>

              {errors.items && typeof errors.items === 'string' && (
                <p className="text-red-500 text-xs mb-2 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.items}
                </p>
              )}

              <div className="bg-gray-50 p-4 rounded-md">
                {formData.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {isEditMode
                      ? 'No items in this order'
                      : 'No items added to this order yet'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded-md border">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Item #{index + 1}</h4>
                          {!isEditMode && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          {/* Product Selection */}
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium mb-1">
                              Product {!isEditMode && <span className="text-red-500">*</span>}
                            </label>
                            {isEditMode ? (
                              <p className="p-2 bg-gray-100 border border-gray-300 rounded-md text-sm">
                                {item.productName} ({item.productSku})
                              </p>
                            ) : (
                              <>
                                <select
                                  value={item.productId || ''}
                                  onChange={(e) => handleProductSelection(index, e.target.value)}
                                  onBlur={() => handleItemBlur(index, 'productId')}
                                  className={`w-full p-2 border rounded-md text-sm ${
                                    touchedFields[`items[${index}].productId`] &&
                                    errors[`items[${index}].productId`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="">Select a product</option>
                                  {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                      {product.name} ({product.sku})
                                    </option>
                                  ))}
                                </select>
                                {touchedFields[`items[${index}].productId`] &&
                                 errors[`items[${index}].productId`] && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors[`items[${index}].productId`]}
                                  </p>
                                )}
                              </>
                            )}
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Quantity {!isEditMode && <span className="text-red-500">*</span>}
                            </label>
                            {isEditMode ? (
                              <p className="p-2 bg-gray-100 border border-gray-300 rounded-md text-sm">
                                {item.quantity}
                              </p>
                            ) : (
                              <>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                  onBlur={() => handleItemBlur(index, 'quantity')}
                                  className={`w-full p-2 border rounded-md text-sm ${
                                    touchedFields[`items[${index}].quantity`] &&
                                    errors[`items[${index}].quantity`] ? 'border-red-500' : 'border-gray-300'
                                  }`}
                                />
                                {touchedFields[`items[${index}].quantity`] &&
                                 errors[`items[${index}].quantity`] && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors[`items[${index}].quantity`]}
                                  </p>
                                )}
                              </>
                            )}
                          </div>

                          {/* Price */}
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Price {!isEditMode && <span className="text-red-500">*</span>}
                            </label>
                            {isEditMode ? (
                              <p className="p-2 bg-gray-100 border border-gray-300 rounded-md text-sm">
                                ${parseFloat(item.price).toFixed(2)}
                              </p>
                            ) : (
                              <>
                                <div className="relative">
                                  <span className="absolute left-2 top-2 text-gray-500">$</span>
                                  <input
                                    type="text"
                                    value={item.price}
                                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                    onBlur={() => handleItemBlur(index, 'price')}
                                    className={`w-full p-2 pl-6 border rounded-md text-sm ${
                                      touchedFields[`items[${index}].price`] &&
                                      errors[`items[${index}].price`] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                  />
                                </div>
                                {touchedFields[`items[${index}].price`] &&
                                 errors[`items[${index}].price`] && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors[`items[${index}].price`]}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        {isEditMode && (
                          <div className="mt-2 text-xs">
                            <span className={`inline-block px-2 py-1 rounded-full mr-2 ${
                              item.isPicked ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.isPicked ? 'Picked' : 'Not Picked'}
                            </span>
                            <span className={`inline-block px-2 py-1 rounded-full ${
                              item.isPacked ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.isPacked ? 'Packed' : 'Not Packed'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                {isSubmitting
                  ? isEditMode ? 'Updating...' : 'Creating...'
                  : isEditMode ? 'Update Status' : 'Create Order'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
