import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import BackButton from "@/components/buttons/back-button";

export default async function Signup(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4 bg-gray-800">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
      {/* Pealkiri */}
      <div className="flex flex-col items-center justify-center mt-0">
        <h1 className="text-4xl font-bold mb-6 text-center text-orange-500">
          Perudo Palace
        </h1>
        <h2 className="text-2xl mb-8 text-center text-orange-400">
          Sign Up
        </h2>
      </div>

      {/* Vorm */}
      <form className="flex flex-col items-center justify-center w-full max-w-md space-y-4 bg-gray-900 p-8 rounded-md shadow-lg">
        <div className="flex flex-col gap-4 w-full">
          <Label htmlFor="email" className="text-orange-400">
            Email
          </Label>
          <Input
            name="email"
            placeholder="you@example.com"
            required
            className="rounded-md text-orange-500 border-2 border-orange-500"
            style={{
              color: "#FFA500", // Teksti värv
            }}
          />
          <Label htmlFor="password" className="text-orange-400">
            Password
          </Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
            className="rounded-md text-orange-500 border-2 border-orange-500"
            style={{
              color: "#FFA500", // Teksti värv
            }}
          />
        </div>
        <SubmitButton
          formAction={signUpAction}
          pendingText="Signing up..."
          className="mt-4 bg-orange-500 text-white hover:bg-orange-600"
        >
          Sign Up
        </SubmitButton>
        <p className="text-sm text-orange-400 mt-4">
          Already have an account?{" "}
          <Link
            className="text-orange-500 font-medium underline"
            href="/sign-in"
          >
            Sign in
          </Link>
        </p>
        <FormMessage message={searchParams} />
      </form>
      <SmtpMessage />
            {/* Tagasi nupp */}
        <BackButton href="/" />
    </div>
  );
}
