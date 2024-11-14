import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/buttons/back-button";

export default async function LoginPage(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <>
    <div className="flex flex-col items-center justify-start">
      <h1 className="text-8xl font-bold mt-40 whitespace-nowrap">Perudo Palace</h1>
    </div>
    <form className="flex flex-col items-center justify-start mt-20">
      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />
        <SubmitButton 
          className="bg-gray-500 hover:bg-gray-600 text-white shadow-lg" 
          pendingText="Signing In..." 
          formAction={signInAction}>
          Sign in
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
    <div className="absolute bottom-0 left-0 mb-4 ml-4 py-2 px-4 rounded">
      <BackButton href="/"/>
    </div>
    </>
  );
}
