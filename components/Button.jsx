import * as joinClassNames from 'classnames';
import React, { memo } from 'react';

export default memo(({ children, type, className, onClick }) => {
  return (
    <button className={joinClassNames('vz-button', type, className)} onClick={onClick}>
      <div className='vz-button-contents'>
        {children}
      </div>
    </button>
  );
});
