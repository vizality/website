import React, { useState, memo } from 'react';

import Button from './Button';
import Icon from './Icon';

export default memo(({ choice, onClick }) => {
  const [ icon, setIcon ] = useState(null);

  if (!icon) {
    switch (choice) {
      case 'install': return setIcon('Install');
      case 'repair': return setIcon('Repair');
      case 'uninstall': return setIcon('Uninstall');
    }
  }

  return (
    <Button className='vz-choice-item' onClick={onClick}>
      <div className='vz-choice-item-header'>
        {choice}
      </div>
      <Icon className='vz-choice-item-icon-wrapper' name={icon} size='100%' />
    </Button>
  );
});
