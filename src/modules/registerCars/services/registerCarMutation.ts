import { gql } from '@apollo/client';

export const REGISTER_VEHICLE = gql`
  mutation RegisterVehicle(
    $manufacturer: String!,
    $model: String!,
    $name: String!,
    $description: String!,
    $price: Float!,
    $quantity: Int!,
    $seats: String!,
    $fuel: String!,
    $gear: String!,
  ) {
    registerVehicle(
      manufacturer: $manufacturer,
      model: $model,
      name: $name,
      description: $description,
      price: $price,
      quantity: $quantity,
      seats: $seats,
      fuel: $fuel,
      gear: $gear,
    ) {
      id
    }
  }
`;

