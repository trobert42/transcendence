import {
  faA,
  faArrowDown,
  faArrowUp,
  faD,
  faS,
  faW,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type ControlsPongProps = {
  width: number;
  height: number;
};

export const ControlsPong = ({ width, height }: ControlsPongProps) => {
  return (
    <div className="div-rules-pong" style={{ width: width, height: height }}>
      <p
        className="text-rules-pong"
        style={{ color: 'rgba(255, 255, 255, 0.808)' }}
      >
        You can move your paddles with
      </p>
      <div className="box-commands">
        <div style={{ width: '8vw', height: '6vw', display: 'flex' }}>
          <div
            className="box-letter"
            style={{
              position: 'absolute',
              top: '0vw',
              left: '2.7vw',
              border: '0.5px solid rgb(255 255 255 / 17%)',
            }}
          >
            <FontAwesomeIcon
              icon={faW}
              beatFade
              className="text-rules-pong"
              style={{ fontSize: '0.9vw' }}
            />
          </div>
          <div
            className="box-letter"
            style={{
              position: 'absolute',
              top: '2.7vw',
              left: '2.7vw',
              border: '0.5px solid rgb(255 255 255 / 17%)',
            }}
          >
            <FontAwesomeIcon
              icon={faS}
              beatFade
              className="text-rules-pong"
              style={{ fontSize: '0.9vw' }}
            />
          </div>
          <div
            className="box-letter"
            style={{ position: 'absolute', top: '2.7vw', left: '0vw' }}
          >
            <FontAwesomeIcon
              icon={faA}
              className="text-rules-pong"
              style={{ fontSize: '0.9vw' }}
            />
          </div>
          <div
            className="box-letter"
            style={{ position: 'absolute', top: '2.7vw', left: '5.4vw' }}
          >
            <FontAwesomeIcon
              icon={faD}
              className="text-rules-pong"
              style={{ fontSize: '0.9vw' }}
            />
          </div>
        </div>
        <div style={{ width: '8vw', height: '6vw', display: 'flex' }}>
          <div
            className="box-letter"
            style={{
              position: 'absolute',
              top: '0vw',
              left: '12vw',
              border: '0.5px solid rgb(255 255 255 / 17%)',
            }}
          >
            <FontAwesomeIcon
              icon={faArrowUp}
              beatFade
              className="text-rules-pong"
              style={{ fontSize: '0.9vw' }}
            />
          </div>
          <div
            className="box-letter"
            style={{
              position: 'absolute',
              top: '2.7vw',
              left: '12vw',
              border: '0.5px solid rgb(255 255 255 / 17%)',
            }}
          >
            <FontAwesomeIcon
              icon={faArrowDown}
              beatFade
              className="text-rules-pong"
              style={{ fontSize: '0.9vw' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
