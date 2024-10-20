import { gql } from '@apollo/client';

export const GET_VEHICLES = gql`
  query GetVehicles {
    getAllVehicles {
      id
      name
      description
      price
      quantity
      image
    }
  }
`;
