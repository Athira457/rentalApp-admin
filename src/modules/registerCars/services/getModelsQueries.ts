import { gql } from '@apollo/client';

// Query to fetch all manufacturers
export const GET_MANUFACTURERS = gql`
  query GetManufacturers {
    GetManufacturers {
      id
      name
    }
  }
`;

// Query to fetch models based on manufacturer ID
export const GET_MODELS = gql`
  query GetModels($manufacturer_id: ID!) {
    GetModels(manufacturer_id: $manufacturer_id) {
      id
      model_name
    }
  }
`;
