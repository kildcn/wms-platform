import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

const ProductForm = ({ existingProduct, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    weight: '',
    width: '',
    height: '',
    depth: '',
    category: '',
    stockQuantity: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If editing an existing product, populate the form
  useEffect(() => {
    if (existingProduct) {
      setFormData({
        sku: existingProduct.sku || '',
        name: existingProduct.name || '',
        description: existingProduct.description || '',
        weight: existingProduct.weight?.toString() || '',
        width: existingProduct.width?.toString() || '',
        height: existingProduct.height?.toString() || '',
        depth: existingProduct.depth?.toString() || '',
        category: existingProduct.category || '',
        stockQuantity: existingProduct.stockQuantity?.toString() || ''
      });
    }
  }, [existingProduct]);

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

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.sku) newErrors.sku = 'SKU is required';
    if (!formData.name) newErrors.name = 'Name is required';

    // Numeric validations
    if (formData.weight && isNaN(parseFloat(formData.weight)))
      newErrors.weight = 'Weight must be a number';
    if (formData.width && isNaN(parseFloat(formData.width)))
      newErrors.width = 'Width must be a number';
    if (formData.height && isNaN(parseFloat(formData.height)))
      newErrors.height = 'Height must be a number';
    if (formData.depth && isNaN(parseFloat(formData.depth)))
      newErrors.depth = 'Depth must be a number';
    if (formData.stockQuantity && isNaN(parseInt(formData.stockQuantity, 10)))
      newErrors.stockQuantity = 'Stock quantity must be a number';

    // SKU format validation (example)
    if (formData.sku && !/^[A-Z0-9]{3,}$/.test(formData.sku))
      newErrors.sku = 'SKU must be at least 3 characters and contain only uppercase letters and numbers';

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
        weight: parseFloat(formData.weight),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        depth: parseFloat(formData.depth),
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0
      };

      onSave(apiData);
    } catch (error) {
      console.error('Error saving product:', error);
      // Handle error (show message, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md max-h-screen overflow-y-auto bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {existingProduct ? 'Edit Product' : 'Create New Product'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {existingProduct
              ? 'Update product details in your inventory'
              : 'Add a new product to your inventory'}
          </p>
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* SKU Field */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  disabled={!!existingProduct} // SKU cannot be changed if editing
                  className={`w-full p-2 border rounded-md ${
                    errors.sku ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.sku && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.sku}
                  </p>
                )}
              </div>

              {/* Name Field */}
              <div className="col-span-1">
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Dimensions Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.weight ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.weight && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.weight}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Width (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.width ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.width && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.width}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.height ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.height && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.height}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Depth (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="depth"
                  value={formData.depth}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.depth ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.depth && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.depth}
                  </p>
                )}
              </div>
            </div>

            {/* Category and Stock Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.stockQuantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.stockQuantity && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.stockQuantity}
                  </p>
                )}
              </div>
            </div>

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
                {isSubmitting ? 'Saving...' : existingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
