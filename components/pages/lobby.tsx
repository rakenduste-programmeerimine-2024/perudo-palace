'use client'; // Add this directive at the very top

import { useState } from 'react';
import { Typography, Button } from '@mui/material';
import Link from 'next/link';

const Lobby: React.FC = () => {
  // Define state for player positions
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', bgImage: "url('/image/smile.jpg')", position: 'bottom' },
    { id: 2, name: 'Player 2', bgImage: "url('/image/smile2.jpg')", position: 'right' },
    { id: 3, name: 'Player 3', bgImage: "url('/image/smile5.jpg')", position: 'top' },
    { id: 4, name: 'Player 4', bgImage: "url('/image/smile6.jpg')", position: 'left' },
  ]);

  // Handle click on an avatar
  const handleAvatarClick = (clickedPlayerId: number) => {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-green-900 relative">
      {/* Mängulaud */}
      <div className="relative w-[58rem] h-[28rem] bg-table2-bg bg-center bg-cover flex items-center justify-center">
        {players.map((player) => (
          <div
            key={player.id}
            className={getPositionClasses(player.position)}
            onClick={() => handleAvatarClick(player.id)}
          >
            <Player name={player.name} bgImage={player.bgImage} />
          </div>
        ))}
      </div>

      {/* Start Game nupp all paremas nurgas */}
      <div className="absolute bottom-[10rem] right-[5rem]">
        <Link href="/game" passHref>
          <Button
            variant="contained"
            color="success"
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
        </Link>
      </div>
    </div>
  );
};

// Get position classes based on the position
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
}

const Player: React.FC<PlayerProps> = ({ name, bgImage }) => {
  return (
    <div className="flex flex-col items-center space-y-2 cursor-pointer">
      {/* Mängija avatar */}
      <div
        className="w-20 h-20 rounded-full"
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

export default Lobby;
