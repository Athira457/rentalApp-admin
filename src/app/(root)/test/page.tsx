"use client";
import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const IMPORT_VEHICLE_DATA = gql`
  mutation ImportVehicleData($excelFile: Upload!, $imageFile: Upload!) {
    importVehicleData(excelFile: $excelFile, imageFile: $imageFile) {
      success
      message
    }
  }
`;

const VehicleUpload: React.FC = () => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [importVehicleData, { data, loading, error }] = useMutation(IMPORT_VEHICLE_DATA);

  const handleExcelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setExcelFile(file);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setImageFile(file);
  };

  const handleImport = async () => {
    if (!excelFile || !imageFile) {
      alert('Please select both an Excel file and an image file.');
      return;
    }

    try {
      await importVehicleData({ variables: { excelFile, imageFile } });
      alert('Data and image imported successfully');
    } catch (err) {
      console.error('Error importing data:', err);
      alert('Import failed');
    }
  };

  return (
    <div>
      <h2>Import Vehicle Data</h2>
      <input type="file" accept=".xlsx" onChange={handleExcelChange} />
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleImport} disabled={loading}>
        {loading ? 'Importing...' : 'Import Vehicle'}
      </button>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      {data && <p style={{ color: 'green' }}>{data.importVehicleData.message}</p>}
    </div>
  );
};

export default VehicleUpload;
