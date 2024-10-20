import { gql } from '@apollo/client';

export const CREATE_VEHICLE = gql`
  mutation($name: String!, $model: String!, $description: String!, $price: Float!, $quantity: Int!, $image: Upload, $images: [Upload]) {
    createVehicle(name: $name, model: $model, description: $description, price: $price, quantity: $quantity, image: $image, images: $images) {
      name
      model
      description
      price
      quantity
      image
      images
    }
  }
`;
