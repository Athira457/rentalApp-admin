import { gql } from '@apollo/client';

// Define the update vehicle mutation
export const UPDATE_VEHICLE_MUTATION = gql`
  mutation UpdateVehicle(
    $id: ID!,
    $name: String!,
    $price: Float!,
    $quantity: Int!,
    $description: String,
    $primaryImage: String,
    $secondaryImages: [String]
  ) {
    updateVehicle(
      id: $id,
      name: $name,
      price: $price,
      quantity: $quantity,
      description: $description,
      primaryImage: $primaryImage,
      secondaryImages: $secondaryImages
    ) {
      id
      name
      price
      quantity
      description
      primaryimage {
        images
      }
      secondaryimages {
        images
      }
    }
  }
`;
