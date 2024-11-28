import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { TextField } from "@mui/material";
import BackButton from "@/components/buttons/back-button";
import { MuiThemeProvider } from "../MuiThemeProvider";

export default async function LoginPage(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <MuiThemeProvider>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
        {/* Pealkirjad */}
        <div className="flex flex-col items-center justify-center mt-0">
          <h1 className="text-4xl font-bold mb-6 text-center text-orange-500">
            Perudo Palace
          </h1>
          <h2 className="text-2xl mb-8 text-center text-orange-400">Sign In</h2>
        </div>

        {/* Vorm */}
        <form className="flex flex-col items-center justify-center w-full max-w-md space-y-4 bg-gray-900 p-8 rounded-md shadow-lg">
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            className="rounded-md text-orange-500 border-2 border-orange-500"
            InputLabelProps={{
              style: { color: "#FFA500" }, // Label värv
            }}
            InputProps={{
              classes: {
                notchedOutline: "border-orange-500 focus:border-orange-600",
              },
              style: {
                color: "#FFA500", // Sisestatud teksti värv
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            className="rounded-md text-orange-500 border-2 border-orange-500"
            InputLabelProps={{
              style: { color: "#FFA500" }, // Label värv
            }}
            InputProps={{
              classes: {
                notchedOutline: "border-orange-500 focus:border-orange-600",
              },
              style: {
                color: "#FFA500", // Sisestatud teksti värv
              },
            }}
          />
          <SubmitButton
            className="mt-4 bg-orange-500 text-white hover:bg-orange-600"
            pendingText="Signing In..."
            formAction={signInAction}
          >
            Sign In
          </SubmitButton>
          <div className="text-red-500">
          <FormMessage message={searchParams} />
        </div>
        </form>

        {/* Tagasi nupp */}
        <BackButton href="/" />
      </div>
    </MuiThemeProvider>
  );
}
