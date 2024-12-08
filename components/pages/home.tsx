import Image from "next/image";
import MenuButton from "@/components/buttons/menu-button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
      {/* Logo */}
      <div className="mt-5">
        <Image
          src="/image/Logo.png" // Kaust ja failinimi
          alt="Perudo Palace Logo"
          width={300} // Fikseeritud laius
          height={100} // Fikseeritud kõrgus
          className="object-contain" // Säilitab algsed proportsioonid
          priority
        />
      </div>

      {/* Menüünupud */}
      <div className="flex flex-col items-center gap-6 mt-9">
        {/* Esimene rida */}
        <div className="flex flex-wrap gap-6 justify-center">
          <MenuButton 
            title="Join Game" 
            href="/join" 
            className="px-4 py-2 text-sm sm:text-base lg:text-lg"
          />
          <MenuButton 
            title="Create Game" 
            href="/create" 
            className="px-4 py-2 text-sm sm:text-base lg:text-lg"
          />
        </div>
        {/* Teine rida */}
        <div className="flex flex-wrap gap-6 justify-center">
          <MenuButton 
            title="Rules" 
            href="/rules" 
            className="px-4 py-2 text-sm sm:text-base lg:text-lg"
          />
        </div>
      </div>
    </div>
  );
}
