import { memo, useState, useEffect } from 'react';

export default memo(({ children, time }) => {
  const [ show, setShow ] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, time);
  }, [ show ]);

  if (!show) return null;

  return children;
});
