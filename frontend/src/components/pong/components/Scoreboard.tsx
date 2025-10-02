// src/pong/components/Scoreboard.tsx
import React from 'react';
import { Score, GameMode } from '../utils/types';

interface ScoreboardProps {
    player1Name: string;
    player2Name: string;
    score: Score;
    gameMode: GameMode;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ player1Name, player2Name, score, gameMode }) => {
    return (
        <h2 className={`font-extrabold my-4 ${gameMode === 'TOURNAMENT' ? 'text-2xl' : 'text-3xl'}`}>
            {player1Name}: {score.player1} - {player2Name}: {score.player2}
        </h2>
    );
};

export default Scoreboard;
