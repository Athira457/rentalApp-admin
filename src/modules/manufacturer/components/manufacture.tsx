"use client";
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { REGISTER_MANUFACTURE } from '../services/manufacturerMutation';
import { REGISTER_MODEL } from '../services/modelMutation';
import styles from './manufacture.module.css';
import CustomButton from '../../../utils/customButton';

const RegisterManufacture: React.FC = () => {
  const [name, setName] = useState('');
  const [models, setModels] = useState<string[]>(['']);
  const [isManufacturerRegistered, setIsManufacturerRegistered] = useState(false);
  const [manufacturerId, setManufacturerId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [registerManufacture, { data: manufacturerData, loading: loadingManufacturer, error: manufacturerError }] = useMutation(REGISTER_MANUFACTURE);
  const [registerModels] = useMutation(REGISTER_MODEL);

  // Manufacturer registration workings 
  const handleManufacturerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await registerManufacture({ variables: { name } });
      setManufacturerId(data.registerManufacture.id);
      setName('');
      setIsManufacturerRegistered(true); 
    } catch (err) {
      console.error(err);
    }
  };

  //model form registration working
  const handleModelsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manufacturerId) return;

    try {
      for (const model of models) {
        if (model) {
          await registerModels({ variables: { model_name: model, manufacturer_id: manufacturerId } });
        }
      }
      setModels(['']);
      setSuccessMessage('Models registered successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleModelChange = (index: number, value: string) => {
    const newModels = [...models];
    newModels[index] = value;
    setModels(newModels);
  };

  const addModelField = () => {
    setModels([...models, '']);
  };

  // Function redirect back to manufacturer add form
  const handleBackToManufacturerForm = () => {
    setIsManufacturerRegistered(false); 
  };

  return (
    <div className={styles.manuContainer}>
      <h2>Register a New Manufacturer</h2>
      {!isManufacturerRegistered ? (
        // Manufacturer registration form
        <form onSubmit={handleManufacturerSubmit} className={styles.form}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter manufacturer name"
            required
            className={styles.input}
          />
          <button type="submit" disabled={loadingManufacturer} className={styles.button}>
            {loadingManufacturer ? 'Registering...' : 'Register Manufacturer'}
          </button>
          {manufacturerError && <p>Error registering manufacturer: {manufacturerError.message}</p>}
          {manufacturerData && <p>Manufacturer registered successfully: {manufacturerData.registerManufacture.name}</p>}
        </form>
      ) : (
        // Models registration form
        <form onSubmit={handleModelsSubmit} className={styles.form}>
          <h3>Models</h3>
          {models.map((model, index) => (
            <input
              key={index}
              type="text"
              value={model}
              onChange={(e) => handleModelChange(index, e.target.value)}
              placeholder={`Enter model name ${index + 1}`}
              required
              className={styles.input}
            />
          ))}
          <CustomButton type="button" className={styles.backBtn} onClick={addModelField}>
            Add Another Model
          </CustomButton>

          <button type="submit" className={styles.button}>
            Register Models
          </button>
          <p>{successMessage}</p>

          {/* Back to manufacturer form button */}
          <CustomButton type="button" className={styles.manuBtn} onClick={handleBackToManufacturerForm}>
            Back to Manufacturer
          </CustomButton>
        </form>
      )}
    </div>
  );
};

export default RegisterManufacture;
