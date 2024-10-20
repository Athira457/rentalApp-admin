import { gql } from '@apollo/client';

export const REGISTER_MODEL = gql`
  mutation RegisterModel($model_name: String!, $manufacturer_id: ID!) {
    registerModels(model_name: $model_name, manufacturer_id: $manufacturer_id) {
      id
      model_name
      manufacturer_id
    }
  }
`;
