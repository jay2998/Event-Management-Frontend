import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define the schema to match your backend expectations
const serviceSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  category: z.enum(['hall', 'vehicle', 'catering']),
  basePrice: z.number().positive("Price must be positive"),
  description: z.string().optional(),
});

const ServiceForm = ({ onSubmit, initialData }) => {
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData // Support for "Edit Mode"
  });

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      // Ensure we re-enable even if onSubmit parent doesn't refresh the page
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label>Service Name</label>
        <input {...register("name")} className="form-input" />
        {errors.name && <p className="error">{errors.name.message}</p>}
      </div>

      <div>
        <label>Category</label>
        <select {...register("category")}>
          <option value="hall">Hall</option>
          <option value="vehicle">Vehicle</option>
          <option value="catering">Catering</option>
        </select>
      </div>

      <div>
        <label>Service Image</label>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        {preview && (
          <div className="mt-2">
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded" />
          </div>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className={`btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'Saving...' : initialData ? 'Update Service' : 'Create Service'}
      </button>
    </form>
  );
};

export default ServiceForm;