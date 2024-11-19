"use client";

import { useState } from "react";
import { Typography, IconButton, Button } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

const GamePage: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const [players, setPlayers] = useState([
    { id: 1, name: "Player 1", bgImage: "url('/image/smile.jpg')", position: "bottom" },
    { id: 2, name: "Player 2", bgImage: "url('/image/smile2.jpg')", position: "right" },
    { id: 3, name: "Player 3", bgImage: "url('/image/smile5.jpg')", position: "top" },
    { id: 4, name: "Player 4", bgImage: "url('/image/smile6.jpg')", position: "left" },
  ]);

  const [bidNumber, setBidNumber] = useState(1); // Number 1-16
  const [diceValue, setDiceValue] = useState(1); // Dice face 1-6

  const increaseBid = () => {
    if (bidNumber < 16) setBidNumber(bidNumber + 1);
  };
  const decreaseBid = () => {
    if (bidNumber > 1) setBidNumber(bidNumber - 1);
  };
  const increaseDice = () => {
    if (diceValue < 6) setDiceValue(diceValue + 1);
  };
  const decreaseDice = () => {
    if (diceValue > 1) setDiceValue(diceValue - 1);
  };

  const handleAvatarClick = (clickedPlayerId: number) => {
    if (gameStarted) return;

    setPlayers((prevPlayers) => {
      const clickedIndex = prevPlayers.findIndex((player) => player.id === clickedPlayerId);
      const orderedPlayers = [...prevPlayers.slice(clickedIndex), ...prevPlayers.slice(0, clickedIndex)];
      const positions = ["bottom", "right", "top", "left"];

      return orderedPlayers.map((player, index) => ({
        ...player,
        position: positions[index],
      }));
    });
  };

  const handleStartGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-green-900 relative">
      {!gameStarted ? (
        <>
          {/* Lobby vaade */}
          <div className="relative w-[58rem] h-[28rem] bg-table2-bg bg-center bg-cover flex items-center justify-center">
            {players.map((player) => (
              <div
                key={player.id}
                className={getPositionClasses(player.position)}
                onClick={() => handleAvatarClick(player.id)}
              >
                <Player name={player.name} bgImage={player.bgImage} clickable={!gameStarted} />
              </div>
            ))}
          </div>

          {/* Start Game nupp */}
          <div className="absolute bottom-[10rem] right-[5rem]">
            <Button
              variant="contained"
              color="success"
              onClick={handleStartGame}
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
              START GAME
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Mängu vaade */}
          <div className="relative w-[58rem] h-[28rem] bg-table2-bg bg-center bg-cover flex items-center justify-center">
            {/* Cups */}
            <div
              className="absolute"
              style={{
                top: '45%',
                left: '10%',
                width: '3rem',
                height: '3rem',
                backgroundImage: "url('/image/cup1.png')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>
            <div
              className="absolute"
              style={{
                top: '20%',
                right: '47%',
                width: '3rem',
                height: '3rem',
                backgroundImage: "url('/image/cup1.png')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>
            <div
              className="absolute"
              style={{
                bottom: '20%',
                left: '47%',
                width: '3rem',
                height: '3rem',
                backgroundImage: "url('/image/cup1.png')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>
            <div
              className="absolute"
              style={{
                bottom: '45%',
                right: '10%',
                width: '3rem',
                height: '3rem',
                backgroundImage: "url('/image/cup1.png')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
              }}
            ></div>

            {players.map((player) => (
              <div key={player.id} className={getPositionClasses(player.position)}>
                <Player name={player.name} bgImage={player.bgImage} hearts={3} />
              </div>
            ))}
          </div>

          {/* Bid Number ja Dice Face Selector */}
          <div className="absolute top-[5rem] right-[5rem] flex flex-col items-center space-y-4 bg-gray-800 text-white p-6 rounded-lg">
            <h1 className="text-2xl font-bold">Your Bid</h1>
            <div className="flex items-center space-x-8">
              {/* Bid Number Selector */}
              <div className="flex flex-col items-center">
                <button
                  className="text-lg font-bold bg-gray-700 p-2 rounded hover:bg-gray-600"
                  onClick={increaseBid}
                >
                  ↑
                </button>
                <div className="text-4xl font-bold">{bidNumber}</div>
                <button
                  className="text-lg font-bold bg-gray-700 p-2 rounded hover:bg-gray-600"
                  onClick={decreaseBid}
                >
                  ↓
                </button>
              </div>
              {/* Dice Face Selector */}
              <div className="flex flex-col items-center">
                <button
                  className="text-lg font-bold bg-gray-700 p-2 rounded hover:bg-gray-600"
                  onClick={increaseDice}
                >
                  ↑
                </button>
                <div className="text-4xl font-bold">🎲 {diceValue}</div>
                <button
                  className="text-lg font-bold bg-gray-700 p-2 rounded hover:bg-gray-600"
                  onClick={decreaseDice}
                >
                  ↓
                </button>
              </div>
            </div>
            {/* Dice Image Section */}
            <div className="mt-4 flex items-center space-x-4">
            <div className="text-4xl font-bold text-white">{bidNumber}</div>
            <div className="text-4xl font-bold text-white">X</div>
            <div
                className="w-16 h-16 bg-cover bg-center"
                style={{
                backgroundImage: `url('/image/dice${diceValue}.png')`,
                }}
            ></div>
            </div>
            <button className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 font-bold">
              Place Bid
            </button>
          </div>

          {/* Like ja Dislike nupud */}
          <div className="absolute bottom-[10rem] left-[15rem] space-x-6 flex">
            <IconButton color="primary" sx={{ fontSize: 40 }}>
              <ThumbUpIcon sx={{ fontSize: 40 }} />
            </IconButton>
            <IconButton color="secondary" sx={{ fontSize: 40 }}>
              <ThumbDownIcon sx={{ fontSize: 40 }} />
            </IconButton>
          </div>
        </>
      )}
    </div>
  );
};

const getPositionClasses = (position: string) => {
  switch (position) {
    case "left":
      return "absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-32";
    case "top":
      return "absolute top-[-1rem] left-1/2 transform -translate-x-1/2 -translate-y-32";
    case "right":
      return "absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-32";
    case "bottom":
      return "absolute bottom-[-2rem] left-1/2 transform -translate-x-1/2 translate-y-32";
    default:
      return "";
  }
};

interface PlayerProps {
  name: string;
  bgImage: string;
  hearts?: number;
  clickable?: boolean;
}

const Player: React.FC<PlayerProps> = ({ name, bgImage, hearts, clickable }) => {
  return (
    <div
      className={`flex flex-col items-center space-y-2 ${clickable ? "cursor-pointer" : ""}`}
    >
      {hearts && (
        <div className="flex space-x-1">
          {Array.from({ length: hearts }).map((_, index) => (
            <FavoriteIcon key={index} className="text-red-800" />
          ))}
        </div>
      )}
      <div
        className="w-16 h-16 rounded-full"
        style={{
          backgroundImage: bgImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "transparent",
        }}
      />
      <Typography variant="body1" className="font-semibold text-white">
        {name}
      </Typography>
    </div>
  );
};

export default GamePage;
