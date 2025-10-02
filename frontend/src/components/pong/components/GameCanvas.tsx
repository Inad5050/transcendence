// src/pong/components/GameCanvas.tsx
import React from 'react';

interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  winner: string | null;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ canvasRef, winner }) => {
  return (
    <div className="relative shadow-2xl shadow-cyan-400/50 border-4 border-cyan-400 mt-4">
      <canvas ref={canvasRef} width={800} height={600} />
      {winner && (
        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black text-cyan-400 bg-gray-900/80 p-4 rounded-lg border-4 border-cyan-400 animate-pulse">
          ¡{winner} ha ganado!
        </h1>
      )}
    </div>
  );
};

export default GameCanvas;
