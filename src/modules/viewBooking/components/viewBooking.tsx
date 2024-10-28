import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_BOOKINGS } from '../services/viewbookQuery';
import styles from './viewBook.module.css';

interface Booking {
  id: number;
  userId: number;
  pickupCity: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupTime: string | number;
  dropoffTime: string | number;
  bookBy: string;
  vehicleName: string;
  vId: number;
  totalRent: number;
}

const formatDate = (timestamp: string | number) => {
  const date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toISOString().split('T')[0];
};

const ViewBookings = () => {
  const { loading, error, data } = useQuery(GET_ALL_BOOKINGS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2 className={styles.title}>All Bookings</h2>
      <table className={styles.bookingTable}>
        <thead className={styles.thead}>
          <tr className={styles.tablerow}>
            <th>ID</th>
            <th>Vehicle Name</th>
            <th>Pickup Location</th>
            <th>Dropoff Location</th>
            <th>Pickup Time</th>
            <th>Dropoff Time</th>
            <th>Booked By</th>
            <th>Total Rent</th>
          </tr>
        </thead>
        <tbody>
          {data.getAllBookings.map((booking: Booking) => (
            <tr key={booking.id}>
              <td>{booking.id}</td>
              <td>{booking.vehicleName}</td>
              <td className={styles.td}>{booking.pickupLocation}</td>
              <td className={styles.td}>{booking.dropoffLocation}</td>
              <td>{formatDate(booking.pickupTime)}</td>
              <td>{formatDate(booking.dropoffTime)}</td>
              <td>{booking.bookBy}</td>
              <td>{booking.totalRent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewBookings;
