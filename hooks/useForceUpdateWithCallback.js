import { useState, useRef, useLayoutEffect } from 'react';

/**
 * In rare cases you may need to do something right after component forceUpdate finishes.
 * In that case useForceUpdateWithCallback can be useful.
 * @copyright Copyright (c) 2019 Hovhannes Babayan
 * @license MIT
 * @see {@link https://github.com/bhovhannes/use-force-update-hook}
 * @param {*} callback Callback
 * @example
 * ```
 * function handleUpdate () {
 *   console.log('Just updated.')
 * }
 *
 * const forceUpdate = useForceUpdateWithCallback(handleUpdate)
 *
 * return (
 *   <div>
 *     <button onClick={forceUpdate}>
 *       Click to rerender MyAwesomeComponent
 *     </button>
 *   </div>
 * );
 * ```
 */
export default function useForceUpdateWithCallback (callback) {
  const [ value, setValue ] = useState(0);
  const isUpdating = useRef(0);
  useLayoutEffect(() => {
    if (isUpdating.current) {
      isUpdating.current = 0;
      return callback();
    }
  }, [ callback, value ]);
  return useRef(() => {
    isUpdating.current = 1;
    setValue(v => ~v);
  }).current;
}
