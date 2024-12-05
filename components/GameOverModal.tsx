"use client";

import React from "react";
import { Button } from "@mui/material";

// Props-tüübid
interface GameOverModalProps {
  onPlayAgain: () => void; // Funktsioon, mida kutsutakse, kui vajutatakse "PLAY AGAIN"
  onLeaveRoom: () => void; // Funktsioon, mida kutsutakse, kui vajutatakse "LEAVE"
  winnerName: string; // Mängu võitja nimi
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  onPlayAgain,
  onLeaveRoom,
  winnerName,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      {/* Modaalikast */}
      <div className="bg-gray-800 bg-opacity-90 text-white rounded-lg p-8 w-[90%] max-w-lg shadow-lg">
        <h1 className="text-4xl font-bold text-center">Game Over</h1>
        <h1 className="text-2xl font-bold text-center mt-4">
          The winner of the game is: <span className="font-bold">{winnerName}</span>
        </h1>
        <p className="text-lg text-center mt-4">
          What would you like to do next?
        </p>
        <div className="flex flex-col space-y-4 mt-6">
          <Button
            variant="contained"
            color="success"
            onClick={onPlayAgain}
            sx={{
              padding: "1rem 2rem",
              fontSize: "1.25rem",
              fontWeight: "bold",
              backgroundColor: "#4CAF50",
              "&:hover": {
                backgroundColor: "#45A049",
              },
            }}
          >
            PLAY AGAIN
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onLeaveRoom}
            sx={{
              padding: "1rem 2rem",
              fontSize: "1.25rem",
              fontWeight: "bold",
              backgroundColor: "#af4c4c",
              "&:hover": {
                backgroundColor: "#a04545",
              },
            }}
          >
            LEAVE
          </Button>
        </div>
      </div>
    </div>
  );
};


export default GameOverModal;
