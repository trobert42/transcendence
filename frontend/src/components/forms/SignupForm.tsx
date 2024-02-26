import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { postCheckEmail, postRegisterUser } from '../../utils/api';
import { CreateUserParams } from '../../utils/types';
import { GoAlertFill } from 'react-icons/go';

function SignupForm() {
  const { register } = useForm<CreateUserParams>();

  const initialValues = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const [authEmailMsg, setAuthEmailMsg] = useState<string | null>(null);

  const [authMsg, setAuthMsg] = useState('');
  const [authErrMsg, setAuthErrMsg] = useState('');
  const [validVerify, setValidVerify] = useState(false);
  const [inputValues, setInputValues] = useState(initialValues);

  const errRef = useRef<HTMLParagraphElement>(null);

  const navigate = useNavigate();

  useEffect(() => {}, [setAuthMsg]);

  const submitNewRegistration = async () => {
    if (inputValues.password === inputValues.confirmPassword) {
      try {
        await postRegisterUser(inputValues);
        setAuthMsg('Success: creating account, redirecting...');
        setTimeout(() => {
          navigate('/auth/signin');
        }, 3000);
      } catch (error) {
        const err = error as any;
        if (err.response?.status === 400) {
          setAuthErrMsg('Wrong inputs');
        } else if (err.response?.status === 500) {
          setAuthErrMsg('No Server Response');
        } else if (err.response?.status === 409) {
          setAuthErrMsg('Credentials already taken');
        } else {
          setAuthErrMsg('Error');
        }
      }
    }
  };

  const verifyData = async (e: any) => {
    e.preventDefault();
    setAuthErrMsg('');
    setAuthMsg('');
    try {
      const response = await postCheckEmail({
        email: inputValues.email,
      });
      if (response.data.emailAvailable) {
        setAuthEmailMsg('Email valid!');
        setValidVerify(true);
      } else {
        setAuthEmailMsg('Email already taken');
      }
    } catch (error) {
      const err = error as any;
      if (err.response?.status === 400) {
        setAuthEmailMsg('Wrong inputs');
      } else if (err.response?.status === 500) {
        setAuthEmailMsg('No Server Response');
      } else {
        setAuthEmailMsg(`Error: ${err.response?.data.message}`);
      }
      if (errRef.current) {
        errRef.current.focus();
      }
    }
  };

  return (
    <>
      <form onSubmit={verifyData}>
        <div className="flex-col-center g-20">
          <div>
            <input
              type="text"
              id="firstName"
              className="form-control input-auth-form text-wrapper"
              placeholder="First name"
              required
              autoFocus
              {...register('firstname')}
              pattern="^[a-zA-Z\- ]{1,30}$"
              onInvalid={(e) => {
                (e.target as HTMLInputElement).setCustomValidity(
                  'Invalid input. Please follow the rules below:\n- The first name should contain only letters, space and hyphen.\n- The length should be between 2 and 30 characters.',
                );
              }}
              onChange={(e) => {
                (e.target as HTMLInputElement).setCustomValidity('');
                setInputValues({
                  ...inputValues,
                  firstname: e.target.value,
                });
                setValidVerify(false);
              }}
            />
          </div>
          <div>
            <input
              type="text"
              id="lastName"
              className="form-control input-auth-form text-wrapper"
              placeholder="Last name"
              required
              {...register('lastname')}
              pattern="^[a-zA-Z\- ]{1,30}$"
              onInvalid={(e) => {
                (e.target as HTMLInputElement).setCustomValidity(
                  'Invalid input. Please follow the rules below:\n- The last name should contain only letters, space and hyphen.\n- The length should be between 2 and 30 characters.',
                );
              }}
              onChange={(e) => {
                (e.target as HTMLInputElement).setCustomValidity('');
                setInputValues({
                  ...inputValues,
                  lastname: e.target.value,
                });
                setValidVerify(false);
              }}
            />
          </div>
          <div>
            <div className="div-verify">
              <input
                type="email"
                id="email"
                style={{ paddingRight: '70px' }}
                className="form-control input-auth-form text-wrapper"
                placeholder="name@example.com"
                required
                {...register('email')}
                onChange={(e) => {
                  (e.target as HTMLInputElement).setCustomValidity('');
                  setInputValues({
                    ...inputValues,
                    email: e.target.value,
                  });
                  setValidVerify(false);
                }}
              />
              <button className="button-verify text-wrapper-2" type="submit">
                Verify
              </button>
            </div>
            {authEmailMsg && (
              <div
                className={
                  authEmailMsg === 'Email valid!'
                    ? 'valid-text'
                    : 'invalid-text'
                }
              >
                <div>{authEmailMsg}</div>
              </div>
            )}
          </div>

          <div>
            <input
              type="password"
              id="password"
              className="form-control input-auth-form text-wrapper"
              placeholder="Password"
              required
              {...register('password')}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).{5,25}"
              onInvalid={(e) => {
                (e.target as HTMLInputElement).setCustomValidity(
                  'Invalid input. Please follow the rules below:\n- It must contain at least one uppercase letter.\n- It must contain at least one lowercase letter.\n- It must contain at least one digit.\n- It must contain at least one special character\n- Its length should be between 5 and 25 characters.',
                );
              }}
              onChange={(e) => {
                (e.target as HTMLInputElement).setCustomValidity('');
                setInputValues({
                  ...inputValues,
                  password: e.target.value,
                });
                setValidVerify(false);
              }}
            />
          </div>
          <div>
            <input
              type="password"
              id="confirmPassword"
              className={`className="form-control input-auth-form text-wrapper"
		  ${inputValues.password !== inputValues.confirmPassword ? 'is-invalid' : ''}`}
              placeholder="Password"
              required
              {...register('confirmPassword')}
              onChange={(e) => {
                (e.target as HTMLInputElement).setCustomValidity('');
                setInputValues({
                  ...inputValues,
                  confirmPassword: e.target.value,
                });
                setValidVerify(false);
              }}
            />
            {inputValues.password !== inputValues.confirmPassword && (
              <div className="invalid-text">Passwords do not match.</div>
            )}
          </div>
        </div>

        {authMsg && (
          <div className="valid-register-text">
            <p ref={errRef} aria-live="assertive">
              {authMsg}
            </p>
          </div>
        )}
        {authErrMsg && (
          <div className="invalid-register-text">
            <p ref={errRef} className="flex-row-center" aria-live="assertive">
              <GoAlertFill className="mr-1" />
              {authErrMsg}
            </p>
          </div>
        )}
      </form>
      <button
        className={`${
          !validVerify
            ? 'button-form-disabled mt-5 mb-2'
            : 'button-form color-button-login mt-5 mb-2'
        }`}
        type="button"
        onClick={submitNewRegistration}
        onMouseDown={(e) => {
          if (!validVerify) {
            alert('You must verify first');
            e.preventDefault();
          }
        }}
      >
        <div className="text-wrapper">Continue to checkout</div>
      </button>
    </>
  );
}

export default SignupForm;
