import Link from 'next/link';
import React from 'react';

interface MenuButtonProps {
    title: string;
    href: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ title, href }) => {
    return (
        <Link
            href={href}
            className="
                flex
                bg-gray-900
                text-orange-500 
                text-3xl
                w-64 h-20 
                items-center 
                justify-center
                rounded
                border-2 
                border-transparent 
                hover:border-orange-500
            "
        >
            <button>
                {title}
            </button>
        </Link>
    );
    
};

export default MenuButton;