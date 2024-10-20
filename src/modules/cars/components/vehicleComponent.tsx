"use client";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useQuery } from '@apollo/client';
import CustomInput from '../../../utils/customInput'; 
import CustomButton from '../../../utils/customButton'; 
import styles from './vehicle.module.css'; 
import { CREATE_VEHICLE } from '../services/mutations.js';
import { GET_MANUFACTURERS, GET_MODELS } from '../services/queries.js'; 

interface FormData {
  manufacturer: string;
  model: string;
  name: string;
  description: string;
  price: string;
  quantity: string;
  image: File | null;
  images: File[];
}

interface Manufacturer {
  id: string;
  name: string;
}

interface Model {
  id: string;
  model_name: string;
}

const Vehicle: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    manufacturer: '',
    model: '',
    name: '',
    description: '',
    price: '',
    quantity: '',
    image: null,
    images: []
  });
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  const [createVehicle] = useMutation(CREATE_VEHICLE);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = event.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files ? files[0] : null });
    } else if (name === 'images') {
      setFormData({ ...formData, images: files ? Array.from(files) : [] });
    }
  };

  const handleRedirect = () => {
    router.push('/manufacturer'); 
  };

  const { data: manufacturersData } = useQuery(GET_MANUFACTURERS);

  // Fetch models based on the selected manufacturer
  const { loading: modelsLoading, error: modelsError, data: modelsData } = useQuery(GET_MODELS, {
    variables: { manufacturer_id: selectedManufacturer },
    skip: !selectedManufacturer, 
  });

  // Handle manufacturer selection change
  const handleManufacturerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const manufacturerId = event.target.value;
    setSelectedManufacturer(manufacturerId);
    setSelectedModel('');
    
    const manufacturerName = manufacturersData?.GetManufacturers.find(
      (manufacturer: Manufacturer) => manufacturer.id === manufacturerId
    )?.name;

    // Set combined name to the manufacturer's name
    setFormData({
      ...formData,
      name: manufacturerName ? manufacturerName : ''
    });
  };

  // Handle model selection change
  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const modelId = event.target.value;
    setSelectedModel(modelId);

    const modelName = modelsData?.GetModels.find(
      (model: Model) => model.id === modelId
    )?.model_name;

    // Combine manufacturer and model name
    const combinedName = modelName ? `${formData.name} ${modelName}` : formData.name;
    
    setFormData({
      ...formData,
      name: combinedName.trim()
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'quantity' ? parseFloat(value) : value
    });
  };

  //register vehicles into database
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await createVehicle({
        variables: {
          name: formData.name,
          model: formData.model,
          description: formData.description,
          price: parseFloat(formData.price.toString()),
          quantity: parseInt(formData.quantity.toString(), 10),
          image: formData.image,
          images: formData.images
        }
      });

      if (response.data) {
        setMessage('Vehicle created successfully!');
      } else {
        setMessage('Creation failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during vehicle creation:', err);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="vehicle-form-container">
      {/* Button to add manufacturers */}
      <div className={styles.manuDiv}>
        <CustomButton type="button" className={styles.manuButton} onClick={handleRedirect}>
          <span className={styles.defaultLabel}>+</span>
          <span className={styles.hoverLabel}>Add Manufacturer</span>
        </CustomButton>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={styles.h1}>Create Vehicle</h1>

        {/* Manufacturer Select Dropdown */}
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

        {/* Model Select Dropdown */}
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

        {/* Loading and error handling for models */}
        {modelsLoading && <p>Loading models...</p>}
        {modelsError && <p>Error loading models: {modelsError.message}</p>}

        {/* Combined Name Field */}
        <CustomInput
          type="text"
          placeholder="Name"
          value={formData.name}
          name="name"
          className={styles.input}
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          name="description"
          onChange={handleChange}
          rows={5}
          cols={60}
          className={styles.textarea}
        />

        <CustomInput
          type="text"
          placeholder="Price"
          value={formData.price}
          name="price"
          onChange={handleChange}
          className={styles.input}
        />
        <CustomInput
          type="text"
          placeholder="Quantity"
          value={formData.quantity}
          name="quantity"
          onChange={handleChange}
          className={styles.input}
        />
        <div className={styles.fileContainer}> 
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            className={styles.fileInput}
          />
          <input
            type="file"
            name="images"
            multiple
            onChange={handleFileChange}
            className={styles.fileInput}
          />
        </div>
        <CustomButton type="submit" className={styles.button}>
          Create Vehicle
        </CustomButton>
      </form>
      {message && <p className={styles.paragraph}>{message}</p>}
    </div>
  );
};

export default Vehicle;
