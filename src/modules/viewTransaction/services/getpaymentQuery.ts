import { gql } from '@apollo/client';

// Define the GraphQL query to fetch all payments
export const GET_ALL_PAYMENTS = gql`
  query GetAllPayments {
    getAllPayments {
        id
        bookingId
        amount
        status
    }
  }
`;

export const GET_ALL_BOOKINGS = gql`
  query GetAllBookings {
    getAllBookings {
      bookBy
      vehicleName
    }
  }
`;