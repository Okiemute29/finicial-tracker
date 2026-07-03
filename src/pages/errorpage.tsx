import { Link } from "react-router-dom";
import Button from "../component/buttons/button";
import Text from "../component/typography/typography";
import routes from "../constants/routes";

export default function ErrorPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <Text size="3xl" className="font-bold text-slate-950">Page not found</Text>
        <Text className="mt-2 text-slate-500">This route is not part of the Wealth System yet.</Text>
        <Link to={routes.dashboard} className="mt-6 inline-block"><Button>Go to Dashboard</Button></Link>
      </div>
    </div>
  );
}
