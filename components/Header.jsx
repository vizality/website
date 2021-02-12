import React, { memo } from 'react';

export default memo(({ heading, subtext, note, children }) => {
  return (
    <>
      <div className='vz-body-header'>
        <h1 className='vz-heading'>
          {heading}
        </h1>
        <div className='vz-subtext'>
          {subtext}
          {note && <div className='vz-heading-note'>
            <em>NOTE:</em>{note}
          </div>}
        </div>
        {children}
      </div>
    </>
  );
});
