import { gql } from '@apollo/client';

export const UPDATE_VEHICLE = gql`
  mutation updateVehicle(
    $id: ID!,
    $input: VehicleInput
  ) {
    updateVehicle(
      id: $id,
      input: $input
    ) {
      id
      name
      description
      price
      quantity
    }
  }
`;

export const DELETE_VEHICLE = gql`
  mutation deleteVehicle($id: ID!) {
    deleteVehicle(id: $id) {
      id
    }
  }
`;