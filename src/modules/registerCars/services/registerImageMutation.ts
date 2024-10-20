import { gql } from '@apollo/client';

export const REGISTER_IMAGES = gql`
  mutation RegisterImages(
    $images: [Upload],
    $isprimary: Int!,
    $vehicleid: ID
  ) {
    registerImages(
      images: $images,
      isprimary: $isprimary,
      vehicleid: $vehicleid
    ) {
      id
    }
  }
`;