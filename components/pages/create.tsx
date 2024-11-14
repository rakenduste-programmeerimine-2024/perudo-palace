// components/pages/create.tsx
import Link from 'next/link';
import { TextField, Button } from '@mui/material';

const Create: React.FC = () => {
  return (
    <div 
    className="flex flex-col items-center justify-center min-h-screen w-screen bg-back-bg bg-cover bg-center"
    >
      <h1 className="text-3xl font-bold mb-6">Perudo Palace Create Game</h1>
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
        <Link href="/game" passHref>
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            className="mt-4"
          >
            Create Game
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default Create;
