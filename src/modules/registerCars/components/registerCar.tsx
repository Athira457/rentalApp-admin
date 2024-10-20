"use client";
import React, { useState } from 'react';
import styles from './registerCar.module.css';
import CustomButton from '../../../utils/customButton'; 
import { useMutation, useQuery } from '@apollo/client';
import { REGISTER_VEHICLE } from '../services/registerCarMutation';
import { REGISTER_IMAGES } from '../services/registerImageMutation';
import { GET_MANUFACTURERS, GET_MODELS } from '../services/getModelsQueries'; 
import Image from 'next/image';
interface VehicleFormData {
  manufacturer: string;
  model: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  seats:string;
  fuel: string;
  gear: string;
  images: File[];
  isprimary: number | null;
}

interface Manufacturer {
  id: string;
  name: string;
}

interface Model {
  id: string;
  model_name: string;
}


const VehicleRegistrationForm: React.FC = () => {
  const [message, setMessage] = useState('');
  const [registerVehicle] = useMutation(REGISTER_VEHICLE);
  const [registerImages] = useMutation(REGISTER_IMAGES);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  const [formData, setFormData] = useState<VehicleFormData>({
    manufacturer: '',
    model:'',
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    seats: '',
    fuel: '',
    gear:'',
    images: [], 
    isprimary: null,
  });

  // Initial form data
const initialFormData: VehicleFormData = {
  manufacturer: '',
  model: '',
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  seats: '',
  fuel: '',
  gear: '',
  images: [],
  isprimary: null,
};

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // const files = e.target.files;
    const { files } = e.target;
    if (files) {
      setFormData((prevData) => ({       
        ...prevData,
        images: [...prevData.images, ...Array.from(files)]
      }));
    }
  };

  // Remove image from preview
  const handleRemoveImage = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index)
    }));
  };

  // Handle primary image selection
  const handlePrimaryImageChange = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      isprimary: prevData.isprimary === index ? null : index, 
    }));
  };
 
  // Handle price and quantity increase/decrease
  const handleQuantityChange = (value: number) => {
    setFormData((prevData) => ({ ...prevData, quantity: Math.max(0, prevData.quantity + value) }));
  };

  const handlePriceChange = (value: number) => {
    setFormData((prevData) => ({ ...prevData, price: Math.max(0, prevData.price + value) }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     
    try {
      // Step 1: Register the vehicle
      const {data} = await registerVehicle({
        variables: {
          manufacturer: formData.manufacturer,
          model: formData.model,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          quantity: formData.quantity,
          seats: formData.seats,
          fuel: formData.fuel,
          gear: formData.gear,
        }        
      });
      const vehicleId = data.registerVehicle.id;
      console.log("vehicle data",{data});

      // Register images for the vehicle   
      const imgData = await registerImages({
        variables: {
          images:  formData.images,
          isprimary: formData.isprimary,
          vehicleid: vehicleId,
        }
      });
      console.log(imgData);
      
      setMessage('Vehicle created successfully!');
      console.log('Vehicle and images registered successfully');
      setFormData(initialFormData);
    } catch (error) {
      setMessage('Error registering vehicle !');
      console.error('Error registering vehicle and images', error);
    }
  };

  const { data: manufacturersData } = useQuery(GET_MANUFACTURERS);

  // Fetch models based on the selected manufacturer
  const { loading: modelsLoading, data: modelsData } = useQuery(GET_MODELS, {
    variables: { manufacturer_id: selectedManufacturer },
    skip: !selectedManufacturer, 
  });

 // Handle manufacturer selection change
const handleManufacturerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  const manufacturerId = event.target.value;
  setSelectedManufacturer(manufacturerId);

  const selectedManufacturer = manufacturersData?.GetManufacturers.find(
    (manufacturer: Manufacturer) => manufacturer.id === manufacturerId
  );

  // Set manufacturer name in form data
  const manufacturerName = selectedManufacturer?.name || '';

  setFormData({
    ...formData,
    manufacturer: manufacturerName,  // Store name instead of ID
    model: '',  
    name: manufacturerName 
  });
};

// Handle model selection change
const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  const modelId = event.target.value;
  setSelectedModel(modelId);

  const selectedModel = modelsData?.GetModels.find(
    (model: Model) => model.id === modelId
  );

  const modelName = selectedModel?.model_name || '';

  // Combine manufacturer and model name in vehicle name
  const combinedName = `${formData.manufacturer} ${modelName}`.trim();

  setFormData({
    ...formData,
    model: modelName,  // Store model name instead of ID
    name: combinedName 
  });
};


  return (
    <div className={styles.formContainer}>
      <h1 className={styles.title}>Vehicle Registration Form</h1>
      <form onSubmit={handleSubmit} className={styles.form}>

       {/* Manufacturer Select Dropdown */}
       <div className={styles.formGroup}>
          <select
              name="manufacturer"
              value={selectedManufacturer}
              onChange={handleManufacturerChange}
              className={styles.input}
            >
              <option value="">Select Manufacturer</option>
              {manufacturersData?.GetManufacturers.map((manufacturer: Manufacturer) => (
                <option key={manufacturer.id} value={manufacturer.id}>
                  {manufacturer.name}
                </option>
              ))}
            </select>
        </div>

        {/* Model Select Dropdown */}
        <div className={styles.formGroup}>
          <select
            name="model"
            value={selectedModel}
            onChange={handleModelChange}
            className={styles.input}
            disabled={!selectedManufacturer || modelsLoading}
          >
            <option value="">Select Model</option>
            {modelsData?.GetModels.map((model: Model) => (
              <option key={model.id} value={model.id}>
                {model.model_name}
              </option>
            ))}
          </select>
        </div>

        {/* Combined Name Field */}
        <div className={styles.formGroup}>
          <label htmlFor="vehicle name">Vehicle Name :</label>
          <input
            type="text"
            value={formData.name}
            name="name"
            className={styles.input}
          />
        </div>


        {/* Description */}
        <div className={styles.formGroup}>
          <label htmlFor="description">Description :</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={styles.textarea}
            required
          />
        </div>

        <div className={styles.numberContainer}>
        {/* Price with +/- controls */}
        <div className={styles.formGroup}>
          <label htmlFor="price">Price (per day) :</label>
          <div className={styles.numberControl}>
            <button type="button" onClick={() => handlePriceChange(-500)} className={styles.controlButton}>-</button>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={styles.smallInput}
              required
            />
            <button type="button" onClick={() => handlePriceChange(500)} className={styles.controlButton}>+</button>
          </div>
        </div>

        {/* Quantity with +/- controls */}
        <div className={styles.formGroup}>
          <label htmlFor="quantity">Quantity :</label>
          <div className={styles.numberControl}>
            <button type="button" onClick={() => handleQuantityChange(-1)} className={styles.controlButton}>-</button>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className={styles.smallInput}
              required
            />
            <button type="button" onClick={() => handleQuantityChange(1)} className={styles.controlButton}>+</button>
          </div>
        </div>
        </div>
        <div className={styles.typeContainer}>
        <div className={styles.formGroup}>
            <input
                type="text"
                id="seats"
                name="seats"
                value={formData.seats}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Seat Capacity"
            />
        </div>

        <div className={styles.formGroup}>
          <select
            id="fuel"
            name="fuel"
            value={formData.fuel}
            onChange={handleInputChange}
            required
            className={styles.input}
          >
            <option value="" disabled>Select fuel type</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <select
            id="gear"
            name="gear"
            value={formData.gear} 
            onChange={handleInputChange}
            required
            className={styles.input}
          >
            <option value="" disabled>Select gear type</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
            <option value="Semi-Automatic">Semi-Automatic</option>
          </select>
        </div>
        </div>

        {/* Image Upload with Preview */}
        <div className={styles.formGroup}>
          <label htmlFor="images"> Vehicle Images :</label>
          <input type="file" 
            id="images"           
            multiple accept="image/*" 
            onChange={handleImageUpload} 
            className={styles.inputFile}
          />

          <div className={styles.imagePreviewContainer}>
            {formData.images.map((image, index) => (
              <div key={index} className={styles.imagePreview}>
                <Image
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index}`}
                  className={styles.previewImage}
                  width={60}
                  height={60}
                />
                <button type="button" className={styles.removeImageButton} onClick={() => handleRemoveImage(index)}>×</button>

                  {/* Checkbox to set as primary image */}
                <div className={styles.primaryImageContainer}>
                  <label htmlFor={`primaryImage${index}`}>Primary Image:</label>
                  <input
                    type="checkbox"
                    id={`primaryImage${index}`}
                    checked={formData.isprimary === index}
                    onChange={() => handlePrimaryImageChange(index)}
                    className={styles.primaryImageCheckbox}
                  />
                </div>

              </div>
            ))}
          </div>
        </div>
        <CustomButton type="submit" className={styles.submitButton}>
          Register Vehicle
        </CustomButton>
      </form>
      {message && <p className={styles.paragraph}>{message}</p>}
    </div>
  );
};

export default VehicleRegistrationForm;
