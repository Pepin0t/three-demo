import { useState, useEffect } from 'react';

export default function useKeyboard() {
  const [keys, setKeys] = useState([]);

  useEffect(() => {
    function handleKeyDown(e) {
      const uniqueKeys = new Set([...keys]);

      uniqueKeys.add(e.keyCode);

      setKeys([...uniqueKeys]);
    }

    function handleKeyUp(e) {
      const uniqueKeys = new Set([...keys]);

      uniqueKeys.delete(e.keyCode);

      setKeys([...uniqueKeys]);
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys]);

  return keys;
}
