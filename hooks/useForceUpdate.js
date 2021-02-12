import { useState, useRef } from 'react';
/**
 * Simple hook to force a component to rerender.
 * @copyright Copyright (c) 2019 Hovhannes Babayan
 * @license MIT
 * @see {@link https://github.com/bhovhannes/use-force-update-hook}
 * @example
 * ```
 * const forceUpdate = useForceUpdate();
 * ...
 * forceUpdate();
 * ```
 */
export default function useForceUpdate () {
  const setValue = useState(0)[1];
  return useRef(() => setValue(v => ~v)).current;
}
