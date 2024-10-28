import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_PAYMENTS } from '../services/getpaymentQuery'; 
import styles from './viewPayment.module.css';

interface Payment {
  id: string;
  bookingId: number;
  amount: number;
  status: boolean;
}

const ViewPayments = () => {
  const { loading, error, data } = useQuery(GET_ALL_PAYMENTS); 

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2 className={styles.title}>All Payments</h2>
      <table className={styles.paymentTable}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.bid}>Booking ID</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.getAllPayments.map((payment: Payment) => (
            <tr key={payment.id}>
              <td>{payment.bookingId}</td>
              <td>{payment.amount}</td>
              <td>{payment.status ? 'Paid' : 'Pending'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewPayments;
