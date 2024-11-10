// components/pages/lobby.tsx
import Link from 'next/link';
import { Button } from '@mui/material';

const Lobby: React.FC = () => {
  return (
    <div 
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
    >
      <h1 className="text-3xl font-bold mb-6">Perudo Palace Lobby</h1>
      <div className="space-y-4 w-1/3">
        <Link href="/create" passHref>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            className="mt-4"
          >
            Create Game
          </Button>
        </Link>
        <Link href="/join" passHref>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            className="mt-4"
          >
            Join Game
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Lobby;
