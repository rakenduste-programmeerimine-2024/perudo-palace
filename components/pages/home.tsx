
import MenuButton from "@/components/buttons/menu-button";

export default async function HomePage() {
  return (
    <>
      <div className="flex flex-col items-center justify-start min-h-screen">
        <h1 className="text-8xl font-bold mt-40 whitespace-nowrap">Perudo Palace</h1>
        <div className="grid grid-cols-2 gap-6 mt-32">
          <MenuButton title="Sign In" href="/sign-in" />
          <MenuButton title="Sign Up" href="/sign-up" />
          <MenuButton title="Join Game" href="/join-game" />
          <MenuButton title="Rules" href="/rules" />
        </div>
      </div>
    </>
  );
}
