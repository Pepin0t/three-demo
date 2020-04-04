import { useState, useEffect } from 'react';

export default function useGamepad({ use, connected, disconnected } = {}) {
  const [gpIndex, setGpIndex] = useState(null);

  useEffect(() => {
    if (typeof use !== 'function') return;

    function frame() {
      const gp = navigator.getGamepads && navigator.getGamepads()[gpIndex];

      if (!gp) return;

      // const { buttons, axes } = gp;

      // const [
      //   X,
      //   CIRCLE,
      //   SQUARE,
      //   TRIANGLE,
      //   L1,
      //   R1,
      //   L2,
      //   R2,
      //   SHARE,
      //   OPTIONS,
      //   L_TRIGGER,
      //   R_TRIGGER,
      //   UP,
      //   DOWN,
      //   LEFT,
      //   RIGHT,
      //   START,
      //   PAD,
      // ] = buttons;

      use(gp);

      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }, [gpIndex, use]);

  useEffect(() => {
    function handleGpConnected(e) {
      const { index } = e.gamepad;

      setGpIndex(index);

      if (typeof connected === 'function') connected();
    }

    function handleGpDisconnected() {
      setGpIndex(null);

      if (typeof disconnected === 'function') disconnected();
    }

    window.addEventListener('gamepadconnected', handleGpConnected);
    window.addEventListener('gamepaddisconnected', handleGpDisconnected);

    return () => {
      window.removeEventListener('gamepadconnected', handleGpConnected);
      window.removeEventListener('gamepaddisconnected', handleGpDisconnected);
    };
  },
  [gpIndex, connected, disconnected]);

  return gpIndex;
}
