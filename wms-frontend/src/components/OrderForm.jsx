import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Plus, Trash2 } from 'lucide-react';

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

  // If editing an existing order, populate the form
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));

    // Clear error for this item when user updates it
    if (errors[`items[${index}].${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].${field}`];
        return newErrors;
      });
    }
  };

  const handleAddItem = () => {
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

  const handleRemoveItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleProductSelection = (index, productId) => {
    if (!productId) return;

    const selectedProduct = products.find(p => p.id.toString() === productId);
    if (!selectedProduct) return;

    handleItemChange(index, 'productId', productId);
    handleItemChange(index, 'productSku', selectedProduct.sku);
    handleItemChange(index, 'productName', selectedProduct.name);
    // You might also set a default price if available in your product data
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.orderNumber) newErrors.orderNumber = 'Order number is required';
    if (!formData.customerId) newErrors.customerId = 'Customer ID is required';
    if (!formData.shippingAddress) newErrors.shippingAddress = 'Shipping address is required';

    // Numeric validations
    if (formData.customerId && isNaN(parseInt(formData.customerId, 10)))
      newErrors.customerId = 'Customer ID must be a number';

    // Items validation
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    } else {
      formData.items.forEach((item, index) => {
        if (!item.productId)
          newErrors[`items[${index}].productId`] = 'Product is required';
        if (!item.quantity || parseInt(item.quantity, 10) <= 0)
          newErrors[`items[${index}].quantity`] = 'Quantity must be greater than 0';
        if (!item.price || parseFloat(item.price) <= 0)
          newErrors[`items[${index}].price`] = 'Price must be greater than 0';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Transform string values to appropriate types for API
      const apiData = {
        ...formData,
        customerId: parseInt(formData.customerId, 10),
        priorityLevel: parseInt(formData.priorityLevel, 10),
        items: formData.items.map(item => ({
          ...item,
          productId: parseInt(item.productId, 10),
          quantity: parseInt(item.quantity, 10),
          price: parseFloat(item.price)
        }))
      };

      onSave(apiData);
    } catch (error) {
      console.error('Error saving order:', error);
      // Handle error (show message, etc.)
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
              {existingOrder ? 'Edit Order' : 'Create New Order'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {existingOrder
              ? 'Update order details'
              : 'Create a new customer order'}
          </p>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Order Number */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Order Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  disabled={!!existingOrder} // Can't change order number if editing
                  placeholder="e.g., ORD1001"
                  className={`w-full p-2 border rounded-md ${
                    errors.orderNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.orderNumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.orderNumber}
                  </p>
                )}
              </div>

              {/* Customer ID */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleChange}
                  placeholder="e.g., 12345"
                  className={`w-full p-2 border rounded-md ${
                    errors.customerId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.customerId && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.customerId}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Level */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Priority Level
                </label>
                <select
                  name="priorityLevel"
                  value={formData.priorityLevel}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
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
                <label className="block text-sm font-medium mb-1">
                  Shipping Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Full shipping address"
                  className={`w-full p-2 border rounded-md ${
                    errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.shippingAddress && (
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
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>

              {errors.items && typeof errors.items === 'string' && (
                <p className="text-red-500 text-xs mb-2 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.items}
                </p>
              )}

              <div className="bg-gray-50 p-4 rounded-md">
                {formData.items.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No items added to this order yet</p>
                ) : (
                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="bg-white p-3 rounded-md border">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">Item #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          {/* Product Selection */}
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium mb-1">
                              Product <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={item.productId}
                              onChange={(e) => handleProductSelection(index, e.target.value)}
                              className={`w-full p-2 border rounded-md text-sm ${
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
                            {errors[`items[${index}].productId`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`items[${index}].productId`]}
                              </p>
                            )}
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className={`w-full p-2 border rounded-md text-sm ${
                                errors[`items[${index}].quantity`] ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            {errors[`items[${index}].quantity`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`items[${index}].quantity`]}
                              </p>
                            )}
                          </div>

                          {/* Price */}
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-2 top-2 text-gray-500">$</span>
                              <input
                                type="text"
                                value={item.price}
                                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                className={`w-full p-2 pl-6 border rounded-md text-sm ${
                                  errors[`items[${index}].price`] ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                            </div>
                            {errors[`items[${index}].price`] && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors[`items[${index}].price`]}
                              </p>
                            )}
                          </div>
                        </div>
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
                {isSubmitting ? 'Saving...' : existingOrder ? 'Update Order' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
