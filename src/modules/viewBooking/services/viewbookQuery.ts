import { gql } from '@apollo/client';

export const GET_ALL_BOOKINGS = gql`
  query GetAllBookings {
    getAllBookings {
      id
      userId
      pickupCity
      pickupLocation
      dropoffLocation
      pickupTime
      dropoffTime
      bookBy
      vehicleName
      vId
      totalRent
    }
  }
`;
