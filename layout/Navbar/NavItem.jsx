import { forwardRef } from 'react';

export default forwardRef(({ onClick, href, isSelected, route }, ref) => {
  return (
    <li
      key={route.toLowerCase()}
      className='vz-nav-li'
      vz-selected={isSelected ? '' : undefined}
      vz-route={route}
    >
      <a className='vz-nav-a vz-link' href={href} onClick={onClick} ref={ref}>
        {route}
      </a>
      {isSelected &&
        <div
          className='vz-nav-li-active-indicator'
        />
      }
    </li>
  );
});
