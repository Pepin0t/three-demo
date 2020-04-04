import { useState } from 'react';

import throttle from '~/utils/throttle';

function useThrottledState(value, delay = 0) {
  const [state, setState] = useState(value);

  const setThrottledState = throttle((v) => {
    setState(v);
  }, delay);

  return [state, setThrottledState];
}

export default useThrottledState;
