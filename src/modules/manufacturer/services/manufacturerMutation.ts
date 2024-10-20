
import { gql } from '@apollo/client';

export const REGISTER_MANUFACTURE = gql`
  mutation RegisterManufacture($name: String!) {
    registerManufacture(name: $name) {
      id
      name
    }
  }
`;
