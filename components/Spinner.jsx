import React, { memo } from 'react';

export default memo(() => {
  return (
    <div className='vz-spinner'>
      <div className='vz-spinner-square vz-spinner-square-1' />
      <div className='vz-spinner-square vz-spinner-square-2' />
      <div className='vz-spinner-square vz-spinner-square-3' />
      <div className='vz-spinner-square vz-spinner-square-4' />
    </div>
  );
});
