import React from 'react';
import Image from 'next/image';
import editIcon from '@/themes/images/edit.svg';
import deleteIcon from '@/themes/images/delete.svg';

interface CustomActionProps {
  onEdit: () => void;
  onDelete: () => void;
}

const CustomAction: React.FC<CustomActionProps> = ({ onEdit, onDelete }) => {
  const styles = {
    actions: {
      display: 'flex',
      gap: '10px',
    },
    actionButton: {
      backgroundColor: 'transparent',
      border: '2px solid blue',
      borderRadius: '10px',
      padding: '10px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    },
    actionButtonHover: {
      transform: 'scale(1.1)',
    },
  };

  return (
    <div style={styles.actions}>
      <button
        style={styles.actionButton}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        onClick={onEdit}
      >
        <Image src={editIcon} alt="Edit" width={20} height={20} />
      </button>
      <button
        style={styles.actionButton}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        onClick={onDelete}
      >
        <Image src={deleteIcon} alt="Delete" width={20} height={20} />
      </button>
    </div>
  );
};

export default CustomAction;
