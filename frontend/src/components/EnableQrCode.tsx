import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { getQrCode, postUpdate2FA, postVerifyCode } from '../utils/api';
import Modal from 'react-modal';
import { VerifyDigitCode } from './VerifyDigitCode';

export const EnableQrCode = () => {
  const { auth }: any = useAuth();
  const [code, setCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [is2FAEnable, setIs2FAEnable] = useState(auth.is2FAEnabled);

  const handleCodeChange = (newCode: any) => {
    setCode(newCode);
  };

  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {}, [is2FAEnable, setMsg]);

  const checkValidCode = async () => {
    try {
      const response = await postVerifyCode({ qrCode: code });
      if (response.data) {
        await postUpdate2FA({ status2FA: true });
        setIs2FAEnable(true);
        setMsg('Valid code, closing...');
        setTimeout(() => {
          setIsModalOpen(false);
          setMsg('');
        }, 2000);
      } else {
        setMsg('Wrong code, closing...');
        setTimeout(() => {
          setIsModalOpen(false);
          setMsg('');
        }, 2000);
      }
    } catch (err) {
      throw err;
    }
  };

  const enable2FA = async (e: any) => {
    e.preventDefault();
    setIsModalOpen(true);
    try {
      const response = await getQrCode();
      if (response?.data) {
        setQrCodeUrl(response.data);
      }
    } catch (err) {
      setQrCodeUrl(null);
      setIsModalOpen(false);
      setMsg('');
    }
  };

  const disable2FA = async (e: any) => {
    try {
      await postUpdate2FA({ status2FA: false });
      setIs2FAEnable(false);
    } catch (err) {
      throw err;
    }
  };

  return (
    <>
      <div className="test">
        {!is2FAEnable && (
          <button
            className="button-form button-green"
            type="button"
            onClick={enable2FA}
          >
            <div className="text-wrapper">Enable</div>
          </button>
        )}
        {is2FAEnable && (
          <button
            className="button-form button-red"
            type="button"
            onClick={disable2FA}
          >
            <div className="text-wrapper">Disable</div>
          </button>
        )}
      </div>
      <Modal
        className="modal-content flex-col-center"
        isOpen={isModalOpen}
        style={{
          overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#d9d6d688',
          },
          content: {
            position: 'fixed',
            zIndex: 3,
          },
        }}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <button
          type="button"
          className="button-close-modal"
          data-dismiss="modal"
          aria-label="Close"
          onClick={() => {
            setIsModalOpen(false);
            setMsg('');
          }}
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="modal-elements">
          <div>
            <p className="modal-text-description">
              <span style={{ textDecoration: 'underline' }}>
                Steps to enable authentication with 2 factors :
              </span>
              {<br />}- 1: Download Google Authentificator App{<br />}- 2: Scan
              QR code
              {<br />} - 3: Enter the 6-digit login code{<br />}- 4: Verify code
              and 2FA is enable !
            </p>
          </div>
          {qrCodeUrl && (
            <>
              <div>
                <img
                  className="mb-4"
                  src={qrCodeUrl}
                  alt="scan this code"
                  width="250"
                  height="250"
                />
              </div>
              <div className="flex-col-center no-wrap">
                <VerifyDigitCode onCodeChange={handleCodeChange} />
              </div>
              <div>
                <button
                  type="submit"
                  className="button-form color-button-login"
                  onClick={(e) => {
                    e.preventDefault();
                    checkValidCode();
                    setCode('');
                  }}
                >
                  <div className="text-wrapper">Verify</div>
                </button>
                {msg && (
                  <div
                    className={
                      msg === 'Wrong code, closing...' ? 'invalid-text' : 'valid-text'
                    }
                  >
                    <div>{msg}</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
