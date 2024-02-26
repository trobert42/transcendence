import { useLocation, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import FirstLoginPage from "../pages/FirstLoginPage";

const RequireFirstLogin = () => {
  const { auth }: any = useAuth();
  const location = useLocation();
  const { pathname } = window.location;

  if (auth?.accessToken && !auth?.isDoneRegister) {
    return <FirstLoginPage />;
  } else if (auth?.accessToken && auth?.isDoneRegister) {
    return <Navigate to="/" replace />;
  } else if (pathname === "/auth/first-login" && auth) {
    window.location.reload();
    return <FirstLoginPage />;
  } else {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }
};

export default RequireFirstLogin;
