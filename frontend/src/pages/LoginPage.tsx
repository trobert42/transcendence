import useAuth from '../hooks/useAuth';
import getActualUserAuth from '../components/getActualUserAuth';
import SigninForm from '../components/forms/SigninForm';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRemoveCookie } from '../utils/api';
import '../utils/styles/style.css';


const LoginPage = () => {
  const navigate = useNavigate();
  const { auth, setAuth }: any = useAuth();

  const logoutAndRedirect = async () => {
    try {
      await getRemoveCookie(setAuth);
      navigate('/auth/signin');
    } catch (err) {
      if ((err as any).name === 'CanceledError') {
        return;
      }
    }
  };

  useEffect(() => {
    if (auth && Object.keys(auth).length === 0) {
      getActualUserAuth(setAuth);
    } else if (auth) {
      if (auth?.isLogged) {
        navigate('/');
      } else if (auth?.isLogged === false) {
        logoutAndRedirect();
      }
    }
    // eslint-disable-next-line
  }, [auth]);

  return (
    <div className="auth-section">
      <div className="div">
        <div className="auth-strip">
          <div className="auth-form">
            <div className="title-login">Login</div>
            <div className="description-text">enjoy your journey</div>
            <SigninForm></SigninForm>
            <div className="button-form button-matrix">
              <a
                href={process.env.REACT_APP_SITE_URL + ":3333/auth/redirect/"}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <div className="text-wrapper">
                  <p>Log as 42 student</p>
                </div>
              </a>
            </div>
            <p className="text">
              <span className="text-wrapper">
                Don’t have an account yet ?{<br />}
              </span>
              <span
                className="span"
                style={{ color: 'black', textDecoration: 'none' }}
              >
                <Link to="/auth/signup">Click here to create an account</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
