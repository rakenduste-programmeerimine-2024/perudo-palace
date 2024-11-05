
import MenuButton from "@/components/buttons/menu-button";

export default async function Index() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Perudo Palace</h1>
        
        <div>
          <MenuButton title="Sign In" href="/sign-in" />
          <MenuButton title="Sign Up" href="/sign-up" />
          <MenuButton title="Join Game" href="/join-game" />
          <MenuButton title="Rules" href="/rules" />
        </div>
      </div>
    </>
  );
}
