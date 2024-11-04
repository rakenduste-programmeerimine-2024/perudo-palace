//components/pages/lobby.tsx
import { TextField, Button } from '@mui/material';

const Lobby: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Perudo Palace Lobby</h1>
      <div className="space-y-4 w-1/3">
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          className="mt-4"
        >
          Create Game
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          className="mt-4"
        >
          Join Game
        </Button>
      </div>
    </div>
  );
}

export default Lobby;
