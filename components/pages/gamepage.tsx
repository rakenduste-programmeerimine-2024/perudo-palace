'use client';

import { useState } from 'react';
import { Avatar, Typography, TextField, IconButton, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

const GamePage: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', bgImage: "url('/image/smile.jpg')", position: 'bottom' },
    { id: 2, name: 'Player 2', bgImage: "url('/image/smile2.jpg')", position: 'right' },
    { id: 3, name: 'Player 3', bgImage: "url('/image/smile5.jpg')", position: 'top' },
    { id: 4, name: 'Player 4', bgImage: "url('/image/smile6.jpg')", position: 'left' },
  ]);

  // Positsioonide vahetamine enne mängu algust
  const handleAvatarClick = (clickedPlayerId: number) => {
    if (gameStarted) return; // Kui mäng on alanud, ei saa positsioone muuta

    setPlayers((prevPlayers) => {
      const clickedPlayer = prevPlayers.find((player) => player.id === clickedPlayerId);
      const player1 = prevPlayers.find((player) => player.position === 'bottom');

      if (clickedPlayer && player1) {
        return prevPlayers.map((player) => {
          if (player.id === clickedPlayerId) {
            return { ...player, position: 'bottom' };
          }
          if (player.id === player1.id) {
            return { ...player, position: clickedPlayer.position };
          }
          return player;
        });
      }
      return prevPlayers;
    });
  };

  const handleStartGame = () => {
    setGameStarted(true); // Mängu alustamine lukustab positsioonid
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-green-900 relative">
      {!gameStarted ? (
        // LOBBY VAATES
        <>
          {/* Mängulaud lobby's */}
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
                padding: '1rem 2rem',
                fontSize: '1.25rem',
                fontWeight: 'bold',
                backgroundColor: '#4CAF50',
                '&:hover': {
                  backgroundColor: '#45A049',
                },
              }}
            >
              START GAME
            </Button>
          </div>
        </>
      ) : (
        // MÄNGU VAATES
        <>
          {/* Mängulaud */}
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

            {/* Players */}
            {players.map((player) => (
              <div key={player.id} className={getPositionClasses(player.position)}>
                <Player name={player.name} bgImage={player.bgImage} hearts={3} />
              </div>
            ))}
          </div>

          {/* Sisendiväljad */}
          <div className="absolute bottom-[10rem] right-[5rem] space-x-2 flex">
            <TextField
              variant="outlined"
              type="number"
              label="number of dice"
              className="bg-white"
            />
            <TextField
              variant="outlined"
              type="number"
              label="number of dots"
              className="bg-white"
            />
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

// Positsiooni klassid
const getPositionClasses = (position: string) => {
  switch (position) {
    case 'left':
      return 'absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-32';
    case 'top':
      return 'absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-32';
    case 'right':
      return 'absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-32';
    case 'bottom':
      return 'absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-32';
    default:
      return '';
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
      className={`flex flex-col items-center space-y-2 ${clickable ? 'cursor-pointer' : ''}`}
    >
      {/* Südamed */}
      {hearts && (
        <div className="flex space-x-1">
          {Array.from({ length: hearts }).map((_, index) => (
            <FavoriteIcon key={index} className="text-red-800" />
          ))}
        </div>
      )}
      {/* Mängija avatar */}
      <div
        className="w-16 h-16 rounded-full"
        style={{
          backgroundImage: bgImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'transparent',
        }}
      />
      {/* Mängija nimi */}
      <Typography variant="body1" className="font-semibold text-gray-700">
        {name}
      </Typography>
    </div>
  );
};

export default GamePage;
