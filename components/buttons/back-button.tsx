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
      bg-gray-900 
      text-orange-500  
      px-4 py-2 
      rounded-lg 
      border-2 
      border-transparent 
      hover:border-orange-500
      transition"
    >
      <ArrowBackIcon className="text-orange-500" /> {/* Tagasi nool */}
      <span>Back</span> {/* Tekst */}
    </Link>
  );
};

export default BackButton;