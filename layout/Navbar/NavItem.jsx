import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const spring = {
  type: 'spring',
  stiffness: 500,
  damping: 30
};

export default forwardRef(({ onClick, href, isSelected, route }, ref) => {
  return (
    <li key={route.toLowerCase()} className='vz-nav-li' vz-selected={isSelected ? '' : undefined}>
      <a className='vz-nav-a vz-link' href={href} onClick={onClick} ref={ref}>
        {route}
      </a>
      {isSelected &&
        <motion.div
          layoutId='nav-indicator'
          className='vz-nav-li-active-indicator'
          initial={false}
          transition={spring}
        />
      }
    </li>
  );
});
