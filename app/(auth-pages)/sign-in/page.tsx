
import { FormMessage, Message } from "@/components/form-message";
import LoginPage from "@/components/pages/sign-in";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <>
      <LoginPage searchParams={props.searchParams}/>
    </>
  );
}
