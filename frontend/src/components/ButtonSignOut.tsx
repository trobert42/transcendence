import { useNavigate } from 'react-router-dom';
import useLogout from '../hooks/useLogout';

const ButtonSignOut = () => {
  const navigate = useNavigate();
  const logout = useLogout();

  const signout = async () => {
    await logout();
    navigate('/auth/signin');
  };

  return (
    <div>
      <button className="div-button-signout" onClick={signout}>
        <div className="text-wrapper">SIGN OUT</div>
      </button>
    </div>
  );
};

export default ButtonSignOut;
