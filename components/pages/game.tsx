// components/pages/game.tsx
import { Avatar, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Game: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* Mängulaud [mida väiksem seda suurem laud]*/}
      <div className="relative w-[36rem] h-[24rem] bg-green-500 rounded-full flex items-center justify-center">
        <Typography variant="h4" className="text-white font-bold">
          Mängulaud
        </Typography>

        {/* Player */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-32">
          <Player name="Player 4" />
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-32">
          <Player name="Player 3" />
        </div>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-32">
          <Player name="Player 2" />
        </div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-32">
          <Player name="Player 1" />
        </div>

      </div>
    </div>
  );
};

interface PlayerProps {
  name: string;
}

const Player: React.FC<PlayerProps> = ({ name }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
        {/* Südamed */}
      <div className="flex space-x-1">
        <FavoriteIcon className="text-red-500" />
        <FavoriteIcon className="text-red-500" />
        <FavoriteIcon className="text-red-500" />
      </div>
      {/* Mängija avatar */}
      <Avatar className="bg-blue-500 w-16 h-16">{name.charAt(0)}</Avatar>

      {/* Mängija nimi */}
      <Typography variant="body1" className="font-semibold text-gray-700">
        {name}
      </Typography>
    </div>
  );
};

export default Game;
