// src/pong/hooks/useKeyboardControls.ts
import { useState, useEffect } from 'react';
import { MovementDirection } from '../utils/types';

export const useKeyboardControls = (isOnePlayerMode: boolean) => {
  const [movementP1, setMovementP1] = useState<MovementDirection>(null);
  const [movementP2, setMovementP2] = useState<MovementDirection>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w': case 'arrowup': setMovementP1('up'); break;
        case 's': case 'arrowdown': setMovementP1('down'); break;
        case 'o': if (!isOnePlayerMode) setMovementP2('up'); break;
        case 'l': if (!isOnePlayerMode) setMovementP2('down'); break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case 'w': case 'arrowup': if (movementP1 === 'up') setMovementP1(null); break;
        case 's': case 'arrowdown': if (movementP1 === 'down') setMovementP1(null); break;
        case 'o': if (movementP2 === 'up') setMovementP2(null); break;
        case 'l': if (movementP2 === 'down') setMovementP2(null); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isOnePlayerMode, movementP1, movementP2]);

  return { movementP1, movementP2, setMovementP1, setMovementP2 };
};
