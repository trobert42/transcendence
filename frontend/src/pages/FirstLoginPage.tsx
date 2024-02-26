import useAuth from '../hooks/useAuth';
import useProtectLogoutRedirect from '../hooks/useProtectLogoutRedirect';
import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GrUndo } from 'react-icons/gr';
import {
  getSetupDefaultProfile,
  postCheckFirstSignin,
  postEditAvatarPicture,
  postEditingUserFirstLogin,
} from '../utils/api';
import { showNotification } from '@mantine/notifications';
import { redirectToErrorPage } from '../components/redirectToErrorPage';

const FirstLoginPage = () => {
  const navigate = useNavigate();
  const { auth, setAuth }: any = useAuth();
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [validVerify, setValidVerify] = useState(false);
  const [file, setFile] = useState<File>();
  const [avatar, setAvatar] = useState(auth.avatarLink);

  useProtectLogoutRedirect();

  const initialValues = {
    username: '',
    firstname: auth.firstname,
    lastname: auth.lastname,
  };

  const [inputValues, setInputValues] = useState(initialValues);

  const verifyData = async (e: any) => {
    e.preventDefault();
    try {
      const response = await postCheckFirstSignin({
        username: inputValues.username,
        firstname: inputValues.firstname,
        lastname: inputValues.lastname,
        isDoneRegister: false,
      });
      if (response) {
        setAuthMsg('Username valid!');
        setValidVerify(true);
      }
    } catch (error) {
      setValidVerify(false);
      const err = error as any;
      if (err.response?.status === 500) {
        setAuthMsg('No Server Response');
      } else if (err.response?.status === 400) {
        setAuthMsg('Wrong inputs');
      } else if (err.response?.status === 409) {
        setAuthMsg('Username already taken');
      }
    }
  };

  const resetForm = () => {
    setInputValues(initialValues);
    setValidVerify(false);
    setAuthMsg('');
  };

  useEffect(() => {
    if (file) {
      uploadFile();
    }
    // eslint-disable-next-line
  }, [file]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      const maxSizeInMB = 3;
      const sizeInMB = selectedFile.size / 1024 / 1024;

      if (sizeInMB > maxSizeInMB) {
        showNotification({
          title: 'Error with file size',
          message: `Max size is ${maxSizeInMB} MB. 🙈`,
          color: 'red',
          autoClose: 4000,
        });
        return;
      }

      const validMimeTypes = ['image/jpeg', 'image/png'];
      if (!validMimeTypes.includes(selectedFile.type)) {
        showNotification({
          title: 'Error with file type',
          message: `Only JP(E)G and PNG are allowed. 🐏`,
          color: 'red',
          autoClose: 4000,
        });
        return;
      }

      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('picture', file);
    formData.append('pictureName', file.name);
    try {
      const response = await postEditAvatarPicture(formData);
      if (response.data) {
        setAuth(response.data);
      }
    } catch (err) {
      const error: any = err;
      showNotification({
        title: 'Error with file type',
        message: error.response.data.message,
        color: 'red',
        autoClose: 4000,
      });
    }
  };

  const setupDefaultProfile = async () => {
    try {
      const response = await getSetupDefaultProfile();
      if (response.data) {
        setAuth({
          username: response.data.username,
          email: response.data.email,
          id: response.data.id,
          firstname: response.data.firstname,
          lastname: response.data.lastname,
          accessToken: response.data.accessToken,
          access42Token: response.data.access42Token,
          refreshToken: response.data.refreshToken,
          isLogged: response.data.isLogged,
          is2FAEnabled: response.data.is2FAEnabled,
          is42User: response.data.is42User,
          avatarLink: response.data.avatarLink,
          isDoneRegister: response.data.isDoneRegister,
        });
        setAvatar(response.data.avatarLink);
        setTimeout(() => {
          navigate('/');
        });
      }
    } catch (err) {
      redirectToErrorPage(err, navigate);
    }
  };

  const submitEditUser = async () => {
    try {
      const response = await postEditingUserFirstLogin({
        username: inputValues.username,
        firstname: inputValues.firstname,
        lastname: inputValues.lastname,
        isDoneRegister: true,
      });
      if (response.data) {
        setAuth(() => {
          return {
            username: response.data.username,
            email: response.data.email,
            id: response.data.id,
            firstname: response.data.firstname,
            lastname: response.data.lastname,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            isLogged: response.data.isLogged,
            is2FAEnabled: response.data.is2FAEnabled,
            is42User: response.data.is42User,
            avatarLink: response.data.avatarLink,
            isDoneRegister: response.data.isDoneRegister,
          };
        });
        navigate('/');
      }
    } catch (err) {
      redirectToErrorPage(err, navigate);
    }
  };

  return (
    <div className="auth-section">
      <div className="strip-first-login">
        <div className="form-first-login">
          <div className="div-title-login flex-col-center">
            <p className="title-first-login"> Welcome {auth.firstname} !!</p>
            <p className="info-text">
              One more step to complete your registration!{<br />}
              Please setup your profile by choosing a username, you can also
              change your firstname or lastname.
            </p>
            {auth.is42User && (
              <>
                <p className="info-text">
                  If you want to set your profile as 42 default profile,{' '}
                  {<br />}
                  <button
                    className="button-default-profile"
                    onClick={setupDefaultProfile}
                  >
                    click here
                  </button>
                </p>
              </>
            )}
          </div>
          <div className="div-avatar-profile">
            <img
              src={avatar}
              className="avatar-profile ellipse"
              alt="haha tema la tete"
            />
          </div>
          <div className="flex-col-center">
            <div className="button-update-img">
              <input
                className="form-control"
                type="file"
                id="formFile"
                value=""
                accept=".jpg, .jpeg, .png"
                onChange={(e) => {
                  handleFileChange(e);
                }}
              />
              <label htmlFor="formFile">
                <span className="text-wrapper">Choose an avatar</span>
              </label>
            </div>
          </div>
          <div className="mb-4">
            <>
              <form onSubmit={verifyData}>
                <div>
                  <div>
                    <label
                      htmlFor="username"
                      className="form-label text text-wrapper"
                    >
                      Username:
                    </label>
                  </div>
                  <div className="div-verify">
                    <input
                      type="text"
                      className="form-control input-first-login-form padding-right-verify text-wrapper"
                      id="username"
                      pattern="^[a-zA-Z][a-zA-Z0-9_]{4,14}$"
                      placeholder="Enter your username here"
                      required
                      value={inputValues.username}
                      onChange={(e) => {
                        (e.target as HTMLInputElement).setCustomValidity('');
                        setInputValues({
                          ...inputValues,
                          username: e.target.value,
                        });
                        setValidVerify(false);
                      }}
                      onInvalid={(e) => {
                        (e.target as HTMLInputElement).setCustomValidity(
                          'Invalid input. Please follow the rules below:\n- The username must start with a letter.\n- It can contain letters, numbers, and underscores.\n- The length should be between 5 and 15 characters.',
                        );
                      }}
                    />
                    <button
                      className="button-verify text-wrapper-2"
                      type="submit"
                    >
                      Verify
                    </button>
                  </div>
                </div>
                {authMsg && (
                  <div
                    className={
                      authMsg === 'Username valid!'
                        ? 'valid-text'
                        : 'invalid-text'
                    }
                  >
                    <div>{authMsg}</div>
                  </div>
                )}
                <div>
                  <label
                    htmlFor="firstname"
                    className="form-label text text-wrapper"
                  >
                    First name:
                  </label>
                  <input
                    type="text"
                    className="form-control input-first-login-form text-wrapper"
                    id="firstname"
                    pattern="^[a-zA-Z\- ]{1,30}$"
                    value={inputValues.firstname}
                    required
                    onChange={(e) => {
                      (e.target as HTMLInputElement).setCustomValidity('');
                      setInputValues({
                        ...inputValues,
                        firstname: e.target.value,
                      });
                      setValidVerify(false);
                    }}
                    onInvalid={(e) => {
                      (e.target as HTMLInputElement).setCustomValidity(
                        'Invalid input. Please follow the rules below:\n- The first name should contain only letters, space and hyphen.\n- The length should be between 2 and 30 characters.',
                      );
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastname"
                    className="form-label text text-wrapper"
                  >
                    Last name:
                  </label>
                  <input
                    type="text"
                    className="form-control input-first-login-form text-wrapper"
                    id="lastname"
                    pattern="^[a-zA-Z\- ]{1,30}$"
                    value={inputValues.lastname}
                    required
                    onChange={(e) => {
                      (e.target as HTMLInputElement).setCustomValidity('');
                      setInputValues({
                        ...inputValues,
                        lastname: e.target.value,
                      });
                      setValidVerify(false);
                    }}
                    onInvalid={(e) => {
                      (e.target as HTMLInputElement).setCustomValidity(
                        'Invalid input. Please follow the rules below:\n- The last name should contain only letters, space and hyphen.\n- The length should be between 2 and 30 characters.',
                      );
                    }}
                  />
                </div>
              </form>
            </>
          </div>
          <div>
            <div className="div-button-undo">
              <button className="button-undo" type="button" onClick={resetForm}>
                <div className="text-wrapper">
                  <GrUndo /> Undo Changes
                </div>
              </button>
            </div>
            <div>
              <button
                className={`${
                  !validVerify
                    ? 'button-form-disabled mb-2'
                    : 'button-form button-red set-button-length mb-2'
                }`}
                type="button"
                onClick={submitEditUser}
                onMouseDown={(e) => {
                  if (!validVerify) {
                    alert('You must verify first');
                    e.preventDefault();
                  }
                }}
              >
                <div className="text-wrapper">I'm done!</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstLoginPage;
