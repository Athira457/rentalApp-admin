import { gql } from '@apollo/client';

// Define the update vehicle mutation
export const UPDATE_VEHICLE_MUTATION = gql`
   mutation UpdateVehicleNew($id: ID!,$price: Float, $quantity: Int, $description: String) {
    updateVehicleNew(id: $id,price: $price, quantity: $quantity, description: $description ) {
      price
      quantity
      description
    }
  }
`;

export const DELETE_IMAGES_MUTATION = gql`
mutation DeleteImages($vehicleid: ID) {
    deleteImages(vehicleid: $vehicleid) {
      vehicleid
    }
}
`;

export const UPLOAD_IMAGES_MUTATION = gql`
mutation UpdateImagesByVehicleId($images: [Upload], $isprimary: Int, $vehicleid: ID) {
  updateImagesByVehicleId(images: $images, isprimary: $isprimary, vehicleid: $vehicleid) {
    id
  }
}
`;

