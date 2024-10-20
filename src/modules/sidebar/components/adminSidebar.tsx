"use client";
import React from 'react';
import Image from 'next/image';
import styles from './sidebar.module.css';
import frame from '../../../themes/images/Frame.svg';
import payment from '../../../themes/images/Payment.svg';
import bookings from '../../../themes/images/Booking.svg';
import car from '../../../themes/images/Car.svg';
import settings from '../../../themes/images/settings.svg';
import Link from 'next/link';

interface SidebarProps {
  onNavItemClick: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavItemClick }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <Image src={frame} alt="logo" width={25} height={25} />
        <h2 className={styles.sidebarTitle}>Car Rental</h2>
      </div>
      
        <ul className={styles.navList}>
        <Link href=''>
        <li className={styles.navItem} >
          <Image src={car} width={25} height={25} alt="car" />
          Car Reports
        </li></Link>
        <li className={styles.navItem} onClick={() => onNavItemClick('bookings')}>
          <Image src={bookings} width={25} height={25} alt="bookings" />
          Bookings
        </li>
        <li className={styles.navItem} onClick={() => onNavItemClick('transactions')}>
          <Image src={payment} width={25} height={25} alt="transactions" />
          Transactions
        </li>
        <li className={styles.navItem} onClick={() => onNavItemClick('settings')}>
          <Image src={settings} width={25} height={25} alt="settings" />
          Settings
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
