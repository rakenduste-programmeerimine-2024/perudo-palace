import Link from 'next/link';
import React from 'react';

interface MenuButtonProps {
    title: string;
    href: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ title, href }) => {
    return (
        <Link href={href} className="
            flex
            bg-orange-500 
            hover:bg-orange-600 
            text-white
            w-64 h-20 
            items-center 
            justify-center
            rounded">
            <button >
                {title}
            </button>
        </Link>
    );
};

export default MenuButton;