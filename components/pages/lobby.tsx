// components/pages/lobby.tsx
import LobbyPage from '@/app/lobby/page';
import { Avatar, Typography, Button } from '@mui/material';
import Link from 'next/link'; // Import Link

const Lobby: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-green-900 relative">
      {/* Mängulaud */}
      <div className="relative w-[58rem] h-[28rem] bg-table2-bg bg-center bg-cover flex items-center justify-center">
        
        {/* Players */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-32">
          <Player name="Player 4" bgImage="url('/image/smile6.jpg')" />
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-32">
          <Player name="Player 3" bgImage="url('/image/smile5.jpg')" />
        </div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-32">
          <Player name="Player 2" bgImage="url('/image/smile2.jpg')" />
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-32">
          <Player name="Player 1" bgImage="url('/image/smile.jpg')" />
        </div>
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
              backgroundColor: '#4CAF50', // Roheline värv
              '&:hover': {
                backgroundColor: '#45A049', // Tumedam roheline hover-efekt
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

interface PlayerProps {
  name: string;
  bgImage: string;
}

const Player: React.FC<PlayerProps> = ({ name, bgImage }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Mängija avatar */}
      <div
        className="w-20 h-20 rounded-full"
        style={{
          backgroundImage: bgImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "transparent",
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
