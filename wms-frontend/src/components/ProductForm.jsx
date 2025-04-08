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
    stockQuantity: '0'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});

  // Populate form when editing an existing product
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
        stockQuantity: existingProduct.stockQuantity?.toString() || '0'
      });
    }
  }, [existingProduct]);

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

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validate a single field
  const validateField = (name, value) => {
    switch (name) {
      case 'sku':
        if (!value.trim()) return 'SKU is required';
        if (!/^[A-Za-z0-9]{3,}$/.test(value))
          return 'SKU must be at least 3 characters and contain only letters and numbers';
        return null;

      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return null;

      case 'weight':
      case 'width':
      case 'height':
      case 'depth':
        if (!value.trim()) return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
        if (isNaN(parseFloat(value)) || parseFloat(value) <= 0)
          return `${name.charAt(0).toUpperCase() + name.slice(1)} must be a positive number`;
        return null;

      case 'category':
        if (!value.trim()) return 'Category is required';
        return null;

      case 'stockQuantity':
        if (value.trim() === '') return null; // Optional
        if (isNaN(parseInt(value, 10)) || parseInt(value, 10) < 0)
          return 'Stock quantity must be a non-negative number';
        return null;

      default:
        return null;
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Check each field
    Object.entries(formData).forEach(([name, value]) => {
      const error = validateField(name, value);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedFields(allTouched);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Format data for API
      const apiData = {
        ...formData,
        weight: parseFloat(formData.weight),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        depth: parseFloat(formData.depth),
        stockQuantity: parseInt(formData.stockQuantity, 10) || 0
      };

      await onSave(apiData);
    } catch (error) {
      console.error('Error saving product:', error);
      // Add an error message to the form
      setErrors(prev => ({
        ...prev,
        form: error.message || 'Failed to save product'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get the categories from existing products to suggest in a datalist
  const suggestedCategories = [
    'Electronics',
    'Clothing',
    'Food',
    'Books',
    'Furniture',
    'Sports',
    'Toys',
    'Tools',
    'Appliances'
  ];

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
              aria-label="Close"
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
          {errors.form && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{errors.form}</span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* SKU Field */}
              <div className="col-span-1">
                <label htmlFor="sku" className="block text-sm font-medium mb-1">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  id="sku"
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!!existingProduct} // Can't change SKU when editing
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.sku && errors.sku ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., ELEC001"
                />
                {touchedFields.sku && errors.sku && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.sku}
                  </p>
                )}
              </div>

              {/* Name Field */}
              <div className="col-span-1">
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.name && errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Smartphone X12"
                />
                {touchedFields.name && errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Product description"
              />
            </div>

            {/* Dimensions Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="weight" className="block text-sm font-medium mb-1">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  id="weight"
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.weight && errors.weight ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 0.5"
                />
                {touchedFields.weight && errors.weight && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.weight}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="width" className="block text-sm font-medium mb-1">
                  Width (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  id="width"
                  type="text"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.width && errors.width ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 10"
                />
                {touchedFields.width && errors.width && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.width}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="height" className="block text-sm font-medium mb-1">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  id="height"
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.height && errors.height ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 15"
                />
                {touchedFields.height && errors.height && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.height}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="depth" className="block text-sm font-medium mb-1">
                  Depth (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  id="depth"
                  type="text"
                  name="depth"
                  value={formData.depth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.depth && errors.depth ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 5"
                />
                {touchedFields.depth && errors.depth && (
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
                <label htmlFor="category" className="block text-sm font-medium mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  id="category"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  list="category-suggestions"
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.category && errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Electronics"
                />
                <datalist id="category-suggestions">
                  {suggestedCategories.map(category => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                {touchedFields.category && errors.category && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="stockQuantity" className="block text-sm font-medium mb-1">
                  Stock Quantity
                </label>
                <input
                  id="stockQuantity"
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min="0"
                  className={`w-full p-2 border rounded-md ${
                    touchedFields.stockQuantity && errors.stockQuantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {touchedFields.stockQuantity && errors.stockQuantity && (
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
