import useAuth from "./useAuth";
import { getRemoveCookie } from "../utils/api";
import { useNavigate } from "react-router-dom";

const useProtectLogoutRedirect = async () => {
  const { auth, setAuth }: any = useAuth();
  const navigate = useNavigate();
  if (auth === null) {
    try {
      await getRemoveCookie(setAuth);
      navigate("/auth/signin");
    } catch (err) {
      if ((err as any).name === "CanceledError") {
        return;
      }
    }
  }
};

export default useProtectLogoutRedirect;
