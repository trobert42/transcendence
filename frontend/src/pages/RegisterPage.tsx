import useAuth from '../hooks/useAuth';
import SignupForm from '../components/forms/SignupForm';
import getActualUserAuth from '../components/getActualUserAuth';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getRemoveCookie } from '../utils/api';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { auth, setAuth }: any = useAuth();

  const logoutAndRedirect = async () => {
    try {
      await getRemoveCookie(setAuth);
      navigate('/auth/signup');
    } catch (err) {}
  };

  useEffect(() => {
    getActualUserAuth(setAuth);
    if (auth?.isLogged) {
      navigate('/');
    } else if (auth?.isLogged === false) {
      logoutAndRedirect();
    }
    // eslint-disable-next-line
  }, [auth]);

  return (
    <div className="auth-section">
      <div className="div">
        <div className="auth-strip">
          <div className="auth-form">
            <div className="title-login mb-2">Register</div>
            <SignupForm></SignupForm>
            <p className="text">
              <span className="text-wrapper">
                Already have an account?{<br />}
              </span>
              <span
                className="span"
                style={{ color: 'black', textDecoration: 'none' }}
              >
                <Link to="/auth/signin">Click here to login</Link>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
