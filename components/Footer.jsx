import React, { memo } from 'react';

export default memo(({ children }) => {
  return (
    <div className='vz-footer'>
      {children}
    </div>
  );
});
