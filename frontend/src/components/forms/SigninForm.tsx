import { useForm } from 'react-hook-form';
import { Login2FAParams, LoginParams } from '../../utils/types';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import {
  postCheckUserCredentials,
  postLogin2FAUser,
  postLoginUser,
} from '../../utils/api';
import { VerifyDigitCode } from '../VerifyDigitCode';

function SigninForm() {
  const { register, handleSubmit } = useForm<LoginParams>();

  const [errMsg, setErrMsg] = useState('');
  const [errMsgQrModal, setErrMsgQrModal] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const errRef = useRef<HTMLParagraphElement>(null);
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    setErrMsg('');
  }, []);

  useEffect(() => {
    setErrMsgQrModal('');
  }, []);

  const onSubmit = async (data: LoginParams) => {
    try {
      const credentials: LoginParams = {
        email: email,
        password: password,
      };
      const response = await postCheckUserCredentials(credentials);
      const is2FAEnabled = response.data;
      if (is2FAEnabled === true) {
        setIsModalOpen(true);
      } else {
        const response = await postLoginUser(credentials);
        if (response.data.isDoneRegister) {
          navigate('/');
        } else {
          navigate('/auth/first-login');
        }
      }
    } catch (error) {
      const err = error as any;
      if (err.response?.status === 500) {
        setErrMsg('No Server Response');
      } else if (err.response?.status === 400) {
        setErrMsg('Missing Email or Password');
      } else if (err.response?.status === 401) {
        setErrMsg('Sorry, we could not find your account');
      } else if (err.response?.status === 403) {
        const parts = data.email.split('@');
        if (parts[1] === 'student.42.fr') {
          setErrMsg('If you have a 42 account, please connect with OAuth 42');
        } else {
          setErrMsg('Forbidden');
        }
      } else {
        setErrMsg('No Server Response');
      }
      if (errRef.current) {
        errRef.current.focus();
      }
    }
  };

  const submitCode = async (data: Login2FAParams) => {
    try {
      await postLogin2FAUser(data);
      setIsModalOpen(false);
      navigate(from);
    } catch (err) {
      setErrMsgQrModal('Wrong code');
    }
  };

  const handleCodeChange = (newCode: any) => {
    setCode(newCode);
  };

  return (
    <>
      <form className="flex-col g-20" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input
            type="email"
            id="email"
            className="form-control input-auth-form text-wrapper"
            placeholder="email"
            autoFocus
            required
            {...register('email')}
            onChange={(e) => {
              setEmail((prevemail) => {
                return e.target.value;
              });
            }}
          />
        </div>
        <div>
          <input
            type="password"
            id="password"
            className="form-control input-auth-form text-wrapper"
            placeholder="password"
            autoComplete="current-password"
            required
            {...register('password')}
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).{5,25}"
            onInvalid={(e) => {
              (e.target as HTMLInputElement).setCustomValidity(
                'Invalid input. Please follow the rules below:\n- It must contain at least one uppercase letter.\n- It must contain at least one lowercase letter.\n- It must contain at least one digit.\n- It must contain at least one special character\n- Its length should be between 5 and 25 characters.',
              );
            }}
            onChange={(e) => {
              setPassword((prevpassword) => {
                return e.target.value;
              });
              (e.target as HTMLInputElement).setCustomValidity('');
            }}
          />
          {errMsg && (
            <div className="invalid-text">
              <span
                ref={errRef}
                className={errMsg ? 'errmsg' : 'offscreen'}
                aria-live="assertive"
              >
                {errMsg}
              </span>
            </div>
          )}
          <Modal
            className="modal-content flex-col-center"
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            style={{
              content: {
                width: '500px',
                height: '400px',
                margin: 'auto',
                position: 'fixed',
                zIndex: 4,
              },
              overlay: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#d9d6d688',
              },
            }}
          >
            <button
              type="button"
              className="button-close-modal"
              data-dismiss="modal"
              aria-label="Close"
              onClick={() => {
                setIsModalOpen(false);
                setErrMsgQrModal('');
                setCode('');
                setPassword('');
                setEmail('');
                navigate('/');
              }}
            >
              <span aria-hidden="true">&times;</span>
            </button>

            <div className="modal-text-description" style={{ fontSize: '30px' }}>
              <strong>Enter the 2FA code</strong>
            </div>
            <p className="modal-text-description">
              Enter the 6-digit login code we sent to your Authenticator
              application to login
            </p>
          <div className="flex-col-center no-wrap">
            <VerifyDigitCode onCodeChange={handleCodeChange} />
          </div>
          <div>
            <button type="submit"
              className="button-form color-button-login mt-2"
              onClick={(e) => {
                  e.preventDefault();
                  submitCode({
                    email: email,
                    password: password,
                    code: code,
                  });
                }}>
              <div className="text-wrapper">Verify</div>
            </button>
            {errMsgQrModal && (
              <div
                className={errMsgQrModal === 'Wrong code' ? 'invalid-text' : 'valid-text'}
              >
                <div>{errMsgQrModal}</div>
              </div>
            )}
          </div>


          </Modal>
        </div>
        <button className="button-form color-button-login mt-2" type="submit">
          <div className="text-wrapper">Log in</div>
        </button>
      </form>
    </>
  );
}

export default SigninForm;
