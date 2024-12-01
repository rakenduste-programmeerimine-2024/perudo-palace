import Image from "next/image";
import MenuButton from "@/components/buttons/menu-button";

export default async function HomePage() {
  return (
    <>
      <div className="flex flex-col items-center justify-start min-h-screen bg-gray-800">
        {/* Logo */}
        <div className="mt-5">
          <Image
            src="/image/Logo.png" // Määrake kaust ja failinimi
            alt="Perudo Palace Logo"
            width={300} // Kohanda vastavalt vajadusele
            height={100} // Kohanda vastavalt vajadusele
            priority
          />
        </div>

        {/* Menüünupud */}
        <div className="flex flex-col items-center gap-6 mt-9">
          {/* Esimene rida */}
          <div className="flex gap-6">
            <MenuButton title="Sign In" href="/sign-in" />
            <MenuButton title="Sign Up" href="/sign-up" />
            <MenuButton title="Rules" href="/rules" />
          </div>
          {/* Teine rida */}
          <div className="flex gap-6">
            <MenuButton title="Join Game" href="/join" />
            <MenuButton title="Create Game" href="/create" />
          </div>
        </div>
      </div>
    </>
  );
}
