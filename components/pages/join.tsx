// components/pages/join.tsx
import Link from 'next/link';
import { TextField, Button } from '@mui/material';

//(sinisest roheliseni taust) bg-gradient-to-r from-cyan-700 to-green-700
const Join: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-green-900">
      <h1 className="text-3xl font-bold mb-6">Perudo Palace Join Game</h1>
      <div className="space-y-4 w-1/3">
        <TextField 
          label="Nimi" 
          variant="outlined" 
          fullWidth 
          className="bg-white rounded-md shadow"
        />
        <TextField 
          label="Mängu ID" 
          variant="outlined" 
          fullWidth 
          className="bg-white rounded-md shadow"
        />
        <Link href="/lobby" passHref>
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

export default Join;
