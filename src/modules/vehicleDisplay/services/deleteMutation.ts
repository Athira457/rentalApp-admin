import { gql } from '@apollo/client';

// This mutation deletes a vehicle by its ID
export const DELETE_VEHICLE = gql`
  mutation DeleteVehicleNew($id: ID!) {
    deleteVehicleNew(id: $id) {
      id  
    }
  }
`;
