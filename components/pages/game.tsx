// components/pages/game.tsx
import { Avatar, Typography, TextField, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

const Game: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-green-900 relative">
      {/* Mängulaud */}
      <div className="relative w-[36rem] h-[24rem] bg-back-bg bg-cover bg-center rounded-full flex items-center justify-center">
        <Typography variant="h4" className="text-white font-bold">
          Mängulaud
        </Typography>

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

      {/* Sisendiväljad all paremas nurgas */}
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

      {/* Like ja Dislike nupud all vasakus nurgas */}
      <div className="absolute bottom-[10rem] left-[15rem] space-x-6 flex">
       <IconButton color="primary" sx={{ fontSize: 40 }}>
       <ThumbUpIcon sx={{ fontSize: 40 }} /> {/* Määrab ikoonile suurema suuruse */}
       </IconButton>
       <IconButton color="secondary" sx={{ fontSize: 40 }}>
       <ThumbDownIcon sx={{ fontSize: 40 }} /> {/* Määrab ikoonile suurema suuruse */}
       </IconButton>
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
      {/* Südamed */}
      <div className="flex space-x-1">
        <FavoriteIcon className="text-red-500" />
        <FavoriteIcon className="text-red-500" />
        <FavoriteIcon className="text-red-500" />
      </div>
      {/* Mängija avatar */}
      <Avatar
        className="w-16 h-16"
        sx={{
          backgroundImage: bgImage,
          backgroundSize: "cover",
          backgroundPosition: "center",
          //backgroundColor: "transparent" // Eemaldab vaikimisi tausta ja ikooni kuid ei tööta sedasi
        }}//{name.charAt(0)} P kuvab nime esimese tähe
        >
          {name.charAt(0)}
        </Avatar>

      {/* Mängija nimi */}
      <Typography variant="body1" className="font-semibold text-gray-700">
        {name}
      </Typography>
    </div>
  );
};

export default Game;
