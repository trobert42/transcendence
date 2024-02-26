import { useLocation, useNavigate } from 'react-router-dom';
import useProtectLogoutRedirect from '../hooks/useProtectLogoutRedirect';

const errorMessages: { [key: number]: string } = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  408: 'Request Timeout',
  409: 'Conflict',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  505: 'HTTP Version Not Supported',
};

const ErrorPage = () => {
  const navigate = useNavigate();
  const goBack = () => navigate(-1);
  const location = useLocation();
  useProtectLogoutRedirect();

  let err_msg_detailed, err_status;
  if (!location.state) {
    err_status = 404;
    err_msg_detailed = `Couldn't find the requested page`;
  } else {
    err_msg_detailed = location.state.err_msg_detailed;
    err_status = location.state.err_status;
  }

  const errorMessage: string = err_status
    ? errorMessages[err_status]
    : 'Not Found';

  return (
    <>
      <div className="flex-col-center strip-not-found">
        <h1 className="not-found-title">Error {err_status}</h1>
        <p className="text-description">
          {errorMessage} {<br />} {err_msg_detailed}
        </p>
        <button className="button-form button-red" onClick={goBack}>
          <div className="text-wrapper">Go back</div>
        </button>
      </div>
    </>
  );
};

export default ErrorPage;
