import { NavigateFunction } from 'react-router-dom';

export function redirectToErrorPage(error: any, navigate: NavigateFunction) {
  const err = error as any;
  navigate('/errorpage', {
    state: {
      err_msg_detailed: err.message,
      err_status: err.response.status,
    },
  });
}
