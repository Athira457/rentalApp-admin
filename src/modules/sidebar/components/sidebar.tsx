"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './sidebarNew.module.css';
import frame from '../../../themes/images/Frame.svg';
import payment from '../../../themes/images/Payment.svg';
import bookings from '../../../themes/images/Booking.svg';
import settings from '../../../themes/images/settings.svg';
import car from '../../../themes/images/Car.svg';
import DisplayIndex from '@/modules/vehicleDisplay/views';
import ManufactureIndex from '@/modules/manufacturer/views';
import RegisterIndex from '@/modules/registerCars/views';

const SidebarNew: React.FC = () => {
  const [activePage, setActivePage] = useState('car-reports');
  const [showSettingsSubNav, setShowSettingsSubNav] = useState(false);

  // Function to handle navigation
  const handleNavItemClick = (page: string) => {
    setActivePage(page);
    setShowSettingsSubNav(false); // Close subcategories when switching to other main categories
  };

  // Function to toggle the settings dropdown
  const toggleSettingsDropdown = () => {
    setShowSettingsSubNav(!showSettingsSubNav);
  };

  // Function to render content based on the active page
  const renderContent = () => {
    if (activePage === 'car-reports') {
      return <DisplayIndex />;
    } else if (activePage === 'bookings') {
      return (
        <div>
          <h1>Bookings Content</h1>
          <p>This is the bookings page.</p>
        </div>
      );
    } else if (activePage === 'transactions') {
      return (
        <div>
          <h1>Transactions Content</h1>
          <p>This is the transactions page.</p>
        </div>
      );
    } else if (activePage === 'add-manufacturer') {
      return <ManufactureIndex/>;
    } else if (activePage === 'add-vehicle') {
      return <RegisterIndex/>;
    } else {
      return null;
    }
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <Image src={frame} alt="logo" width={25} height={25} />
          <h2 className={styles.sidebarTitle}>Car Rental</h2>
        </div>
        <ul className={styles.navList}>
          <li className={styles.navItem} onClick={() => handleNavItemClick('car-reports')}>
            <Image src={car} width={25} height={25} alt="car" />
            Car Reports
          </li>
          <li className={styles.navItem} onClick={() => handleNavItemClick('bookings')}>
            <Image src={bookings} width={25} height={25} alt="bookings" />
            Bookings
          </li>
          <li className={styles.navItem} onClick={() => handleNavItemClick('transactions')}>
            <Image src={payment} width={25} height={25} alt="transactions" />
            Transactions
          </li>
          <li className={styles.navItem} onClick={toggleSettingsDropdown}>
            <Image src={settings} width={25} height={25} alt="settings" />
            Settings
          </li>

          {/* Subcategories under Settings */}
          {showSettingsSubNav && (
            <ul className={styles.subNavList}>
              <li className={styles.subNavItem} onClick={() => handleNavItemClick('add-manufacturer')}>
                Add Manufacturer   & Model
              </li>
              <li className={styles.subNavItem} onClick={() => handleNavItemClick('add-vehicle')}>
                Add Vehicle
              </li>
            </ul>
          )}
        </ul>
      </div>

      {/* Main content */}
      <div className={styles.mainContent}>
        {renderContent()}
      </div>
    </div>
  );
};

export default SidebarNew;
