import Link from 'next/link';
import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // MUI ikoon

interface BackButtonProps {
  href: string;
}

const BackButton: React.FC<BackButtonProps> = ({ href }) => {
  return (
    <Link
      href={href}
      className="
      fixed bottom-8 left-8 
      flex items-center 
      space-x-2 
      bg-orange-500 
      text-white 
      px-4 py-2 
      rounded-lg 
      shadow-lg 
      hover:bg-orange-600 transition"
    >
      <ArrowBackIcon className="text-white" /> {/* Tagasi nool */}
      <span>Back</span> {/* Tekst */}
    </Link>
  );
};

export default BackButton;