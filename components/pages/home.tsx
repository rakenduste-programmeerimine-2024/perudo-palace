import Image from "next/image";
import MenuButton from "@/components/buttons/menu-button";

export default async function HomePage() {
  return (
    <>
      <div className="flex flex-col items-center justify-start min-h-screen bg-gray-800">
        {/* Logo */}
        <div className="mt-20">
        <Image
        src="/image/Logo.png" // Määrake kaust ja failinimi
        alt="Perudo Palace Logo"
        width={300} // Kohanda vastavalt vajadusele
        height={100} // Kohanda vastavalt vajadusele
        priority
        />
        </div>

        {/* Menüünupud */}
        <div className="grid grid-cols-2 gap-6 mt-12">
          <MenuButton title="Sign In" href="/sign-in" />
          <MenuButton title="Sign Up" href="/sign-up" />
          <MenuButton title="Join Game" href="/join" />
          <MenuButton title="Rules" href="/rules" />
        </div>
      </div>
    </>
  );
}
