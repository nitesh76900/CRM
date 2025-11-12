import React, { useState, useEffect } from 'react';

const HolidayForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: ''
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (initialData) {
      // Format the date to YYYY-MM-DD for the input field
      const formattedDate = initialData.date ? 
        new Date(initialData.date).toISOString().split('T')[0] : 
        '';
      
      setFormData({
        name: initialData.name || '',
        date: formattedDate
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Holiday name is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      // Ensure date is in future
      const selectedDate = new Date(formData.date);
      selectedDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today && !initialData) {
        newErrors.date = 'Please select a future date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {initialData ? 'Edit Holiday' : 'Add New Holiday'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
              Holiday Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. New Year's Day"
              className={`bg-white border text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="date" className="block mb-2 text-sm font-medium text-gray-700">
              Date (YYYY-MM-DD)
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={!initialData ? new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] : undefined}
              className={`bg-white border text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:outline-none focus:ring-2 ${
                errors.date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {initialData ? 'Update Holiday' : 'Add Holiday'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HolidayForm;