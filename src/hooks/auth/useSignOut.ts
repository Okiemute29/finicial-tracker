import { useNavigate } from "react-router-dom";
import { Error as ErrorToast } from "../../component/toastify/toastify";
import routes from "../../constants/routes";
import { authService } from "../../services/auth/auth.service";

export function useSignOut() {
  const navigate = useNavigate();

  return async function signOut() {
    try {
      await authService.signOut();
      navigate(routes.signin, { replace: true });
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Sign out failed.");
    }
  };
}
