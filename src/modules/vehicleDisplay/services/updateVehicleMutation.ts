import { gql } from '@apollo/client';

// Define the update vehicle mutation
export const UPDATE_VEHICLE_MUTATION = gql`
   mutation UpdateVehicleNew($id: ID, $price: Float, $quantity: Int, $description: String) {
    updateVehicleNew( id: $id, price: $price, quantity: $quantity, description: $description ) {
      id
      price
      quantity
      description
    }
  }
`;

export const UPDATE_PRIMARY_IMAGE = gql`
  mutation UpdatePrimaryImage($vehicleId: ID!, $imageId: ID!) {
    updatePrimaryImage(vehicleId: $vehicleId, imageId: $imageId) {
      vehicleId
    }
  }
`;

