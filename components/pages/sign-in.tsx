import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BackButton from "@/components/buttons/back-button";

export default async function LoginPage(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="min-h-screen w-screen bg-gray-800 flex flex-col items-center justify-center">
      {/* Pealkiri */}
      <div className="flex flex-col items-center justify-start">
        <h1 className="text-8xl font-bold mt-0 text-orange-500 whitespace-nowrap">
          Perudo Palace
        </h1>
      </div>
      {/* Vorm */}
      <form className="flex flex-col items-center justify-start mt-20 w-full max-w-md space-y-4 bg-gray-900 p-6 rounded-md shadow-lg">
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email" className="text-orange-500">
            Email
          </Label>
          <Input name="email" placeholder="you@example.com" required />
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-orange-500">
              Password
            </Label>
          </div>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            required
          />
          <SubmitButton
            className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
            pendingText="Signing In..."
            formAction={signInAction}
          >
            Sign in
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
      {/* Tagasi nupp */}
        <BackButton href="/" />
    </div>
  );
}
