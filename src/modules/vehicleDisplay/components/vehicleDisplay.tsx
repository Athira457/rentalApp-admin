import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_VEHICLES } from '../services/getVehicleQueries';
import { GET_VEHICLE_BY_ID } from '../services/getSingleVehicle';
import { DELETE_VEHICLE } from '../services/deleteMutation';
// import { UPDATE_VEHICLE_MUTATION, UPDATE_PRIMARY_IMAGE} from '../services/updateVehicleMutation';
import CustomAction from '@/utils/customAction'; 
import styles from './vehicleDisplay.module.css';
import Image from 'next/image';
import { useState } from 'react';

interface Vehicle {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description:string;
  seats: number;
  fuel: string;
  gear: string;
  primaryimage?: {
    images: string;
  };
  images?: string[]; 
  secondaryimages?: {
    images: string[];
  };
}

// predefined price ranges
const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under 4,000', min: 0, max: 4000 },
  { label: '4,000 - 5,000', min: 4000, max: 5000 },
  { label: '5,000 - 6,000', min: 5000, max: 6000 },
  { label: 'Above 6,000', min: 6000, max: Infinity },
];

const VehicleList = () => {
  const { data, loading, error } = useQuery<{ getAllVehiclesNew: Vehicle[] }>(GET_ALL_VEHICLES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [isRemoved, setIsRemoved] = useState(false);

  const { data: vehicleData } = useQuery(GET_VEHICLE_BY_ID, {
    variables: { id: selectedVehicle?.id },
  });

  const Svehicle = vehicleData ?.getVehicleImageById;
  const [deleteVehicleNew] = useMutation(DELETE_VEHICLE);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading vehicles</p>;

  // Filter vehicles based on search query and price range
  const filteredVehicles = data?.getAllVehiclesNew?.filter(vehicle => {
    const matchesSearchQuery =
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const price = vehicle.price;
    const matchesPriceRange =
      price >= selectedPriceRange.min && price <= selectedPriceRange.max;

    return matchesSearchQuery && matchesPriceRange;
  }) || []; 

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };
 
  const handleDelete = async (id: string) => {
    try {
      const { data } = await deleteVehicleNew({ variables: { id } });
      console.log(data);
    } catch (error) {
      console.error(`Error deleting vehicle: ${error}`);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
    setImageFiles([]);
    setImagePreviews([]);
    setPrimaryImageIndex(null);
  };
  
  const editClose = () => {
    setIsModalOpen(false); 
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImageFiles(newFiles);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(newPreviews);
    }
  };

  const handlePrimaryImageChange = (index: number) => {
    setPrimaryImageIndex(index);
  };
  
  // Handler for cancel image button click
  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(null);
    }
  };

    // Handler for primary image change button click
  const handleButtonClick = () => {
    setIsRemoved(prev => !prev);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Vehicle updated:', {
      ...selectedVehicle,
      primaryImage: primaryImageIndex !== null ? imageFiles[primaryImageIndex] : null,
      images: imageFiles
    });
    closeModal();
  };

  return (
    <>
      {/* Search and filter fields */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <select
          className={styles.priceDropdown}
          value={selectedPriceRange.label}
          onChange={(e) => {
            const selectedRange = priceRanges.find(range => range.label === e.target.value);
            setSelectedPriceRange(selectedRange || priceRanges[0]);
          }}
        >
          {priceRanges.map((range) => (
            <option key={range.label} value={range.label}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Vehicle card display */}
      <div className={`${styles.vehicleContainer} ${isModalOpen ? styles.blurBackground : ''}`}>
        {filteredVehicles.map((vehicle: Vehicle) => (
          <div key={vehicle.id} className={styles.vehicleCard}>
            {vehicle.primaryimage?.images && (
              <Image
                src={vehicle.primaryimage.images}
                alt={vehicle.name}
                className={styles.vehicleImage}
                width={200}
                height={200}
              />
            )}
            <h2 className={styles.vehicleName}>{vehicle.name}</h2>
            <p className={styles.vehiclePrice}>Price: {vehicle.price}</p>
            <p className={styles.vehicleQuantity}>Quantity: {vehicle.quantity}</p>
            <p className={styles.vehicleSeatCapacity}>Seats: {vehicle.seats}</p>
            <p className={styles.vehicleFuelType}>Fuel: {vehicle.fuel}</p>
            <p className={styles.vehicleGearType}>Gear: {vehicle.gear}</p>
            <div className={styles.actions}>
              <CustomAction onEdit={() => handleEdit(vehicle)} onDelete={() => handleDelete(vehicle.id)} />
            </div>
          </div>
        ))}
      </div>

      {/* Edit modal display */}
      {isModalOpen && selectedVehicle && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.topLog}>              
              <button onClick={editClose} className={styles.clsbtn}>X</button>
            </div>
            <h2>Edit {selectedVehicle.name}</h2>
            <form onSubmit={handleSubmit} className={styles.formWithScroll}>
              <label>Price:</label>
              <input type="number" className={styles.input} value={selectedVehicle.price} required />
              <label>Quantity:</label>
              <input type="number" className={styles.input} value={selectedVehicle.quantity} required />
              <label>Description:</label>
              <textarea  
                name="description"
                value={selectedVehicle.description}
                className={styles.textareaField}
                placeholder="Description"
              />

               {/* Primary Image Preview */}
               <div className={styles.primaryImageSection}>
                  <h3>Primary Image:</h3>
                  {selectedVehicle.primaryimage?.images ? (
                    <div className={styles.imageContainer}>
                      {/* Primary Image Display */}
                      <Image
                        src={selectedVehicle.primaryimage.images}
                        alt="Primary Image"
                        className={styles.primaryImage}
                        width={120}
                        height={120}
                      />

                      <label className={styles.checkboxLabel}>
                      <button
                        type="button"
                        className={`${styles.removeImageBtn} ${isRemoved ? styles.red : styles.green}`}
                        onClick={handleButtonClick}
                      >
                        &times;
                      </button>
                      Change primary image
                      </label>
                    </div>
                  ) : (
                    <p>No primary image available.</p>
                  )}
                </div>

               {/* Secondary Images */}
                <div className={styles.secondaryImgContainer}>
                  <h3>Secondary Images:</h3>
                  <div className={styles.secondaryImageSection}>
                    {Svehicle?.secondaryimages?.map((imageObj: { images: string }, index: number) => (
                      <div key={index} className={styles.imageContainer}>
                        <label className={styles.checkboxLabel}>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className={styles.cancelImage}                          
                        >
                          &times; 
                        </button>
                        </label>

                        {/* Secondary Image Display */}
                        <Image
                          src={imageObj.images[0]}
                          alt={`Vehicle Image ${index + 1}`}
                          width={100}
                          height={100}
                        />

                        {/* Checkbox for Secondary Image */}
                        <div className={styles.checkboxContainer}>
                          <label className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              checked={primaryImageIndex === index}
                              onChange={() => handlePrimaryImageChange(index)}
                            />
                            Set as Primary
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>


              {/* Image upload section */}
              <label>Upload Images:</label>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} />
              <div className={styles.imagePreviews}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className={styles.imagePreview}>
                    <Image src={preview} alt={`Preview ${index}`} width={60} height={60} />
                    <button type="button" onClick={() => handleRemoveImage(index)} className={styles.removeImage}>X</button>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={primaryImageIndex === index}
                          onChange={() => handlePrimaryImageChange(index)}
                        />
                        Set as Primary
                      </label>
                    </div>
                ))}
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closeModal} className={styles.modalBtn}>Cancel</button>
                <button type="submit" className={styles.modalBtn}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default VehicleList;
