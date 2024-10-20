"use client";
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_VEHICLES } from '../services/cardQueries';
import {UPDATE_VEHICLE, DELETE_VEHICLE} from '../services/cardMutations';
import styles from './carCards.module.css'; 
import CustomAction from '@/utils/customAction';
import { useRouter } from 'next/navigation';

interface Vehicle {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string; 
}

const VehicleShow: React.FC = () => {
  const { data, loading, error } = useQuery<{ getAllVehicles: Vehicle[] }>(GET_VEHICLES);
  const [updateVehicle] = useMutation(UPDATE_VEHICLE);
  const [deleteVehicle] = useMutation(DELETE_VEHICLE);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null); 
  const [editedVehicleData, setEditedVehicleData] = useState<Vehicle | null>(null);
  const router = useRouter();

  // Handle opening the edit form with the selected vehicle's data
  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle); 
    setEditedVehicleData(vehicle); 
    setIsModalOpen(true); 
    console.log(selectedVehicle)
  };

  const handleAdd = ()=>{
    router.push('/vehicles')
  }

  const handleDelete = async (vehicleId: string) => {
    try {
      await deleteVehicle({
        variables: { id: vehicleId },
      });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  // Handle input change in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
  
    // Check if the field is price or quantity and convert the value to a number
    const updatedValue = name === 'price' || name === 'quantity' ? Number(value) : value;
  
    if (editedVehicleData) {
      setEditedVehicleData({
        ...editedVehicleData,
        [name]: updatedValue,
      });
    }
  };

  // Handle saving the updated vehicle to the database
  const handleSave = async () => {
    if (editedVehicleData) {
      try {
        const response = await updateVehicle({
          variables: {
            id: editedVehicleData.id,
            input: {
              name: editedVehicleData.name,
              description: editedVehicleData.description,
              price: editedVehicleData.price,
              quantity: editedVehicleData.quantity,
              // image: editedVehicleData.image,
            },
          },
        });
        console.log('Updated vehicle new:', response.data.updateVehicle);
        // Close the modal after saving
        setIsModalOpen(false); 
      } catch (error) {
        console.error("Error updating vehicle:", error);
      }
    }
  };

  // Handle canceling the edit operation
  const handleCancel = () => {
    setIsModalOpen(false); 
    setSelectedVehicle(null); 
  };

  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p>Error loading vehicles: {error.message}</p>;

  return (
    <div>
      <div className={`${styles.vehicleContainer} ${isModalOpen ? styles.blur : ''}`}>
        {data?.getAllVehicles.map((vehicle: Vehicle) => (
          <div key={vehicle.id} className={styles.vehicleCard}>
            <img
              src={vehicle.image}
              alt={vehicle.name}
              className={styles.vehicleImage}
              width={200}
              height={200}
            />
            <h2 className={styles.vehicleName}>{vehicle.name}</h2>
            <p className={styles.vehicleDescription}>{vehicle.description}</p>
            <p className={styles.vehicleQuantity}>Price: {vehicle.price}</p>
            <p className={styles.vehicleQuantity}>Quantity: {vehicle.quantity}</p>
            <div className={styles.actions}>
              <CustomAction onAdd={() => handleAdd()} onEdit={() => handleEdit(vehicle)} onDelete={() => handleDelete(vehicle.id)} />
            </div>
          </div>
        ))}
      </div>

      {/* Modal for editing vehicle */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Edit Vehicle</h2>
            <input
              type="text"
              name="name"
              value={editedVehicleData?.name || ''}
              onChange={handleInputChange}
              className={styles.inputField}
              placeholder="Name"
            />
            <textarea
              name="description"
              value={editedVehicleData?.description || ''}
              onChange={handleInputChange}
              className={styles.textareaField}
              placeholder="Description"
            />
            <input
              type="number"
              name="price"
              value={editedVehicleData?.price || 0}
              onChange={handleInputChange}
              className={styles.inputField}
              placeholder="Price"
            />
            <input
              type="number"
              name="quantity"
              value={editedVehicleData?.quantity || 0}
              onChange={handleInputChange}
              className={styles.inputField}
              placeholder="Quantity"
            />
            <div className={styles.modalActions}>
              <button onClick={handleSave} className={styles.saveButton}>Save</button>
              <button onClick={handleCancel} className={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleShow;
