import Link from 'next/link';
import React from 'react';

interface MenuButtonProps {
    title: string;
    href: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ title, href }) => {
    return (
        <Link href={href} className="
            bg-gray-500 
            hover:bg-gray-600 
            text-white 
            shadow-lg
            w-64 h-32 
            items-center 
            justify-center
            py-2 px-4 
            rounded flex">
            <button >
                {title}
            </button>
        </Link>
    );
};

export default MenuButton;