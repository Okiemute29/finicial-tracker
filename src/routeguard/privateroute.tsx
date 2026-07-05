import { Navigate, Outlet } from "react-router-dom";
import Skeleton from "../component/skeletons/skeleton";
import routes from "../constants/routes";
import { useAuthStore } from "../stores/authStore";

export default function PrivateRoute() {
  const session = useAuthStore((state) => state.session);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 p-6 dark:bg-slate-950">
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to={routes.signin} replace />;
  }

  return <Outlet />;
}
