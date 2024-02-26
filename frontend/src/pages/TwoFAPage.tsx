import { useState } from 'react';
import { postSignin42with2FA } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useProtectLogoutRedirect from '../hooks/useProtectLogoutRedirect';
import { VerifyDigitCode } from '../components/VerifyDigitCode';
import { redirectToErrorPage } from '../components/redirectToErrorPage';

const TwoFAPage = () => {
  const { setAuth }: any = useAuth();

  const [msg, setMsg] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  useProtectLogoutRedirect();

  const handleCodeChange = (newCode: any) => {
    setCode(newCode);
  };

  const checkValidCode = async () => {
    try {
      const response = await postSignin42with2FA({ qrCode: code });
      if (response.data) {
        setAuth({ response });
        navigate('/');
      } else {
        setMsg('Wrong code');
      }
    } catch (err) {
      if ((err as any).response.status === 401) {
        setMsg('Wrong code');
      } else redirectToErrorPage(err, navigate);
    }
  };

  return (
    <div className="modal-content flex-col-center twofa">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          checkValidCode();
          setCode('');
        }}
      >
        <div className="modal-elements">
          <div className="modal-text-description" style={{ fontSize: '30px' }}>
            <strong>Enter the 2FA code</strong>
          </div>
          <p className="modal-text-description">
            Enter the 6-digit login code we sent to your Authenticator
            application to login.
          </p>
          <div className="flex-col-center no-wrap">
            <VerifyDigitCode onCodeChange={handleCodeChange} />
          </div>
          <div>
            <button type="submit" className="button-form color-button-login">
              <div className="text-wrapper">Verify</div>
            </button>
            {msg && (
              <div
                className={msg === 'Wrong code' ? 'invalid-text' : 'valid-text'}
              >
                <div>{msg}</div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default TwoFAPage;
