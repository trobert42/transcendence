import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postEditAvatarPicture } from '../utils/api';
import { postEditingUser } from '../utils/api';
import { getSetupDefaultProfile } from '../utils/api';
import { EnableQrCode } from '../components/EnableQrCode';
import useAuth from '../hooks/useAuth';
import { LineTitle } from './LineTitle';
import { GrUndo } from 'react-icons/gr';
import { showNotification } from '@mantine/notifications';
import { UserHistory } from './UserHistory';
import { FaArrowRight } from 'react-icons/fa6';
import { redirectToErrorPage } from './redirectToErrorPage';

const Profile = () => {
  const { auth, setAuth }: any = useAuth();
  const [usernameMsg, setUsernameMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [file, setFile] = useState<File>();
  const navigate = useNavigate();

  const initialValues = {
    username: auth.username,
    firstname: auth.firstname,
    lastname: auth.lastname,
  };
  const [inputValues, setInputValues] = useState(initialValues);


  const handleSaveChanges = async (e: any) => {
    e.preventDefault();
    try {
      const response = await postEditingUser({
        username: inputValues.username,
        firstname: inputValues.firstname,
        lastname: inputValues.lastname,
        isDoneRegister: true,
      });
      if (response.data) {
        setAuth(response.data);
      }
    } catch (error) {
      const err = error as any;
      if (err.response.status === 409) {
        setUsernameMsg('Username already taken');
      } else {
        redirectToErrorPage(err, navigate);
      }
    }
  };

  const resetForm = () => {
    setInputValues(initialValues);
    setUsernameMsg('');
    setIsEditing(false);
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
        setAuth(response.data.updatedUser);
      }
      if (response.data.isUsernameAvailable === false) {
        setUsernameMsg('Username already taken');
      }
    } catch (err) {
      setUsernameMsg(`Can't access to 42 API`);
    }
  };

  return (
    <div className="main-container">
      <div className="div-transparent"></div>
      <div className="main-container-element">
        <div>
          <p className="text-title-h1">My account</p>
        </div>
        <div className="profile-element">
          <div className="profile-elements">
            <div className="text-title-h2">Informations</div>
            <LineTitle />
            {isEditing ? (
              <>
                <form onSubmit={handleSaveChanges}>
                  <div className="edit-form">
                    <label
                      htmlFor="username"
                      className="form-label text text-wrapper"
                    >
                      Username:
                    </label>
                    <input
                      type="text"
                      className="form-control input-edit-user-form text-place-holder behind"
                      id="username"
                      pattern="^[a-zA-Z][a-zA-Z0-9_]{4,14}$"
                      value={inputValues.username}
                      required
                      onChange={(e) => {
                        (e.target as HTMLInputElement).setCustomValidity('');
                        setInputValues({
                          ...inputValues,
                          username: e.target.value,
                        });
                      }}
                      onInvalid={(e) => {
                        (e.target as HTMLInputElement).setCustomValidity(
                          'Invalid input. Please follow the rules below:\n- The username must start with a letter.\n- It can contain letters, numbers, and underscores.\n- The length should be between 5 and 15 characters.',
                        );
                      }}
                    />
                    {usernameMsg && (
                      <div className="invalid-text">
                        <div>{usernameMsg}</div>
                      </div>
                    )}
                  </div>
                  <div className="edit-form">
                    <label
                      htmlFor="firstname"
                      className="form-label text text-wrapper"
                    >
                      First name:
                    </label>
                    <input
                      type="text"
                      className="form-control input-edit-user-form text-place-holder"
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
                      }}
                      onInvalid={(e) => {
                        (e.target as HTMLInputElement).setCustomValidity(
                          'Invalid input. Please follow the rules below:\n- The first name should contain only letters, space and hyphen.\n- The length should be between 2 and 30 characters.',
                        );
                      }}
                    />
                  </div>
                  <div className="edit-form">
                    <label
                      htmlFor="lastname"
                      className="form-label text text-wrapper"
                    >
                      Last name:
                    </label>
                    <input
                      type="text"
                      className="form-control input-edit-user-form text-place-holder"
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
                      }}
                      onInvalid={(e) => {
                        (e.target as HTMLInputElement).setCustomValidity(
                          'Invalid input. Please follow the rules below:\n- The last name should contain only letters, space and hyphen.\n- The length should be between 2 and 30 characters.',
                        );
                      }}
                    />
                  </div>
                  <div className="div-button-undo-edit">
                    <button
                      className="button-undo-edit"
                      type="button"
                      onClick={resetForm}
                    >
                      <div className="text-wrapper">
                        <GrUndo /> Undo Changes
                      </div>
                    </button>
                  </div>
                  <div>
                    <button className="button-form button-green" type="submit">
                      <div className="text-wrapper">Save Changes</div>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="div-text-user-profile">
                <p className="text-user-profile">Username: {auth.username}</p>
                <p className="text-user-profile">
                  First name: {auth.firstname}
                </p>
                <p className="text-user-profile">Last name: {auth.lastname}</p>
                <p className="text-user-profile">Email: {auth.email}</p>
              </div>
            )}
            {!isEditing && (
              <div>
                <button
                  className="button-form button-blue"
                  onClick={() => setIsEditing(true)}
                >
                  <div className="text-wrapper">Edit</div>
                </button>
              </div>
            )}
            {<br></br>}
            {<br></br>}
            <div className="text-title-h2"> Settings </div>
            <LineTitle />
            {auth.is42User && (
              <p
                className="text-user-profile-settings"
                onClick={setupDefaultProfile}
              >
                <FaArrowRight style={{ paddingRight: '5px' }} />
                Set your profile as 42 default profile
              </p>
            )}
            <div className="button-update-img-profile">
              <input
                className="form-control"
                type="file"
                id="formFile"
                style={{ display: 'none' }}
                value=""
                onChange={(e) => {
                  handleFileChange(e);
                }}
              />
              <label htmlFor="formFile">
                <span className="text-user-profile-settings">
                  <FaArrowRight style={{ paddingRight: '5px' }} />
                  Change the avatar profile
                </span>
              </label>
            </div>
            <div className="flex-row space-bet g-40">
              <p className="text-user-profile">
                <FaArrowRight style={{ paddingRight: '5px' }} />
                2FA enabled: {auth.is2FAEnabled ? 'enabled' : 'disabled'}
              </p>
              <EnableQrCode></EnableQrCode>
            </div>
          </div>
          <div className="profile-elements">
            <div className="text-title-h2"> Player overview </div>
            <LineTitle />
            <UserHistory />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
