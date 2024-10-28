"use client";
import React, { useState } from 'react';
import styles from './registerCar.module.css';
import CustomButton from '../../../utils/customButton'; 
import { useMutation, useQuery } from '@apollo/client';
import { REGISTER_VEHICLE } from '../services/registerCarMutation';
import { REGISTER_IMAGES } from '../services/registerImageMutation';
import { GET_MANUFACTURERS, GET_MODELS } from '../services/getModelsQueries'; 
import Image from 'next/image';
import * as XLSX from 'xlsx';

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

interface ExcelRow {
  [key: string]: React.ReactNode;
}

const VehicleRegistrationForm: React.FC = () => {
  const [message, setMessage] = useState('');
  const [registerVehicle] = useMutation(REGISTER_VEHICLE);
  const [registerImages] = useMutation(REGISTER_IMAGES);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);

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
    manufacturer: manufacturerName, 
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
    model: modelName,
    name: combinedName 
  });
};

  // Handle Excel file upload and parse content
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const binaryStr = event.target?.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];
        setExcelData(data);     
      };
      reader.readAsBinaryString(file);
    }
  };
  
  const toggleModal = () => setShowModal(!showModal);

    // Upload Excel data to the server
    const handleUpload = async () => {
      if (excelData.length === 0) {
        alert("Please upload an Excel file with vehicle data.");
        return;
      }

      const vehicleData = excelData[0];
  
      try {
        // Register Vehicle
        const { data: vehicleResponse } = await registerVehicle({
          variables: {
            manufacturer: vehicleData.manufacturer as string,
            model: vehicleData.model as string,
            name: vehicleData.name as string,
            description: vehicleData.description as string,
            price: parseFloat(vehicleData.price as string),
            quantity: parseInt(vehicleData.quantity as string),
            seats: String(vehicleData.seats),
            fuel: vehicleData.fuel as string,
            gear: vehicleData.gear as string,
          },
        });
  
        const vehicleId = vehicleResponse?.registerVehicle.id;
  
        // Register Images if images are uploaded
        if (vehicleId && formData.images.length > 0) {
          await registerImages({
            variables: {
              images: formData.images,
              isprimary: formData.isprimary,
              vehicleid: vehicleId,
            },
          });
        } 
        setMessage("Vehicle details uploaded successfully.");
        setShowModal(!showModal)
        setExcelData([]); 
        toggleModal();
      } catch (error) {
        console.error("Error uploading data:", error);
      }
    };
  
  return (
    <div className={styles.formContainer}>
      <h1 className={styles.title}>Vehicle Registration Form</h1>
       {/* Upload Vehicle Button at the top right */}
       <div className={styles.uploadButtonContainer}>
        <button onClick={toggleModal} className={styles.uploadButton}>
          Upload Vehicle
        </button>
      </div>

      {/* Modal for uploading Excel and displaying content */}
      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Upload Excel File</h2>
            <input type="file" 
              accept=".xlsx, .xls" 
              onChange={handleExcelUpload} 
              className={styles.fileInput}
            />
            
            <h3>File Content:</h3>
            <div className={styles.excelContent}>
              {excelData.length ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {Object.keys(excelData[0]).map((header) => (
                        <th className={styles.th} key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {excelData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((cell, cellIndex) => (
                          <td className={styles.td} key={cellIndex}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No data to display</p>
              )}
            </div>

            {/* Image Upload Section */}
            <h3>Upload Images</h3>
            <div className={styles.formGroup}>
              <label htmlFor="images">Vehicle Images:</label>
              <input 
                type="file" 
                id="images" 
                multiple 
                accept="image/*" 
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
                  <button onClick={toggleModal} className={styles.closeButton}>Close</button>
                  <button onClick={handleUpload} className={styles.uploadBtn}>Upload</button>
                  {message && <p className={styles.paragraph}>{message}</p>}
                </div>
              </div>
            )}
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
            <button 
              type="button" 
              onClick={() => handlePriceChange(-500)} 
              className={styles.controlButton}>-
            </button>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={styles.smallInput}
              required
            />
            <button type="button"
              onClick={() => handlePriceChange(500)} 
              className={styles.controlButton}>+
            </button>
          </div>
        </div>

        {/* Quantity with +/- controls */}
        <div className={styles.formGroup}>
          <label htmlFor="quantity">Quantity :</label>
          <div className={styles.numberControl}>
            <button type="button" 
              onClick={() => handleQuantityChange(-1)} 
              className={styles.controlButton}>-
            </button>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className={styles.smallInput}
              required
            />
            <button type="button" 
              onClick={() => handleQuantityChange(1)} 
              className={styles.controlButton}>+
            </button>
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
