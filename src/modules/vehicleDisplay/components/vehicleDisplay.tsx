import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_VEHICLES } from '../services/getVehicleQueries';
import { GET_VEHICLE_BY_ID } from '../services/getSingleVehicle';
import { DELETE_VEHICLE } from '../services/deleteMutation';
import { UPDATE_VEHICLE_MUTATION, DELETE_IMAGES_MUTATION, UPLOAD_IMAGES_MUTATION } from '../services/updateVehicleMutation';
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
  const [imagesDeleted, setImagesDeleted] = useState(false);

  const { data: vehicleData } = useQuery(GET_VEHICLE_BY_ID, {
    variables: { id: selectedVehicle?.id },
  });
  console.log(imageFiles)
  const [updateVehicleNew] = useMutation(UPDATE_VEHICLE_MUTATION);
  const [deleteImages] = useMutation(DELETE_IMAGES_MUTATION);
  const [updateImagesByVehicleId] = useMutation(UPLOAD_IMAGES_MUTATION);
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

  // Custom edit and delete button working
  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };
 
  const handleDelete = async (id: string) => {
    try {
      const { data } = await deleteVehicleNew({ variables: { id } });
      console.log(data);
      window.location.reload();
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

  //update function while tap save button
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedVehicle) return;
    const parsedPrice = parseFloat(selectedVehicle.price as unknown as string);
    const parsedQuantity = parseInt(selectedVehicle.quantity as unknown as string, 10);
    try {
      const { data } = await updateVehicleNew({
        variables: {
          id: selectedVehicle.id,
          price: parsedPrice,
          quantity: parsedQuantity,
          description: selectedVehicle.description,
        },
      });


      const formData = new FormData();
      imageFiles.forEach((file) => formData.append("images", file));

      const imgData = await updateImagesByVehicleId({
        variables: {
          images:  imageFiles,
          isprimary: primaryImageIndex,
          vehicleid: selectedVehicle.id,
        }
      });
      closeModal();
      window.location.reload();     
      console.log('Vehicle updated successfully:', data,imgData);
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

    // Function to delete all images
    const handleDeleteImages = async () => {
      if (!selectedVehicle) return;
      try {
          const { data } = await deleteImages({ variables: { vehicleid: selectedVehicle.id } });
          console.log("id:",data)
          if (data) {
              console.log('Images deleted successfully:', data.deleteImages);
              setImagesDeleted(true);
          }
      } catch (error) {
          console.error('Error deleting images:', error);
      }
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
            <input
              type="number"
              className={styles.input}
              value={selectedVehicle.price}
              onChange={(e) => setSelectedVehicle({ ...selectedVehicle, price: parseFloat(e.target.value) || 0 })}
              required
            />
            
            <label>Quantity:</label>
            <input
              type="text"
              className={styles.input}
              value={String(selectedVehicle.quantity)} 
              onChange={(e) => setSelectedVehicle({ ...selectedVehicle, quantity: parseInt(e.target.value) || 0 })}
              required
            />
            
            <label>Description:</label>
            <textarea
              name="description"
              value={selectedVehicle.description}
              onChange={(e) => setSelectedVehicle({ ...selectedVehicle, description: e.target.value })}
              className={styles.textareaField}
              placeholder="Description"
            />
               {/* Primary Image Preview */}
               <div className={styles.allImageContainer}>
               <div className={styles.primaryImageSection}>
                  <h3>Images:</h3>
                  {imagesDeleted ? (
                      <p>Images deleted.</p> // Single message for both primary and secondary images
                    ) :selectedVehicle.primaryimage?.images ? (
                    <div className={styles.imageContainer}>
                      <Image
                        src={selectedVehicle.primaryimage.images}
                        alt="Primary Image"
                        className={styles.primaryImage}
                        width={120}
                        height={120}
                      />
                      
                    </div>
                  ) : (
                    <p>No primary image available.</p>
                  )}
                </div>

              {/* Secondary Images */}
              <div className={styles.secondaryImgContainer}>
                  <div className={styles.secondaryImageSection}>
                    {imagesDeleted ? null : Svehicle?.secondaryimages?.map((imageObj: { images: string }, index: number) => (
                      <div key={index} className={styles.imageContainer}>
                        {/* Secondary Image Display */}
                        <Image
                          src={imageObj.images[0]}
                          alt={`Vehicle Image ${index + 1}`}
                          width={100}
                          height={100}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <button type="button" className={styles.cancelImage} onClick={handleDeleteImages}>remove all images</button>
                </div>

              {/* Image upload section */}
              <label>Upload new Images:</label>
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
