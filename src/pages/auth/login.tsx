import { Link } from "react-router-dom";
import Button from "../../component/buttons/button";
import AuthGeneralInput from "../../component/input/authinput";
import Text from "../../component/typography/typography";
import routes from "../../constants/routes";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <Text size="2xl" className="font-bold text-slate-950">Sign in</Text>
        <Text size="sm" className="mt-1 text-slate-500">Supabase Auth will connect here after environment setup.</Text>
        <div className="mt-6 space-y-4">
          <AuthGeneralInput label="Email" name="email" type="email" placeholder="you@example.com" />
          <AuthGeneralInput label="Password" name="password" type="password" placeholder="Password" />
          <Link to={routes.dashboard} className="block"><Button fullWidth>Continue to app</Button></Link>
        </div>
      </form>
    </div>
  );
}
