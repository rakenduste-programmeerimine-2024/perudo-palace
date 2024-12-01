import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { SmtpMessage } from "../smtp-message";
import BackButton from "@/components/buttons/back-button";
import { MuiThemeProvider } from "../../../components/MuiThemeProvider";
import { TextField } from "@mui/material";
import Link from "next/link";

export default async function Signup(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  // Kui esineb sõnum
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4 bg-gray-800">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <MuiThemeProvider>
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
          <TextField
            label="Email"
            name="email"
            placeholder="you@example.com"
            fullWidth
            required
            variant="outlined"
            InputLabelProps={{
              style: { color: "#FFA500" }, // Label värv
            }}
            InputProps={{
              style: {
                color: "#FFA500", // Sisestatud teksti värv
              },
            }}
            className="rounded-md text-orange-500"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            placeholder="Your password"
            fullWidth
            required
            variant="outlined"
            InputLabelProps={{
              style: { color: "#FFA500" }, // Label värv
            }}
            InputProps={{
              style: {
                color: "#FFA500", // Sisestatud teksti värv
              },
            }}
            className="rounded-md text-orange-500"
          />
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
    </MuiThemeProvider>
  );
}
