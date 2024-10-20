
"use client";
import RegisterIndex from '../../../modules/registerCars/views/index';
import styles from './wrapper.module.css';
import Sidebar from '@/modules/sidebar/components/adminSidebar';


export default function Home() {
  const handleNavItemClick = (item: string) => {
    console.log('Clicked item:', item);
    // Add any logic you want when a nav item is clicked
  };
  return (
    <div className={styles.dashboard}>
    <Sidebar onNavItemClick={handleNavItemClick}/>
    <RegisterIndex/>
    </div> 
    
  );
}
