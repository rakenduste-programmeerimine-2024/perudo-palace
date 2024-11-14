import Link from 'next/link';
import React from 'react';

interface BackButtonProps {
    href: string;
}

const BackButton: React.FC<BackButtonProps> = ({ href }) => {
    return (
        <Link href={href} className="
            bg-gray-500 
            hover:bg-gray-600 
            text-white 
            shadow-lg
            w-48 h-8 
            items-center 
            justify-center
            py-2 px-4 
            rounded flex">
            <button>Back</button>
        </Link>
    );
};

export default BackButton;