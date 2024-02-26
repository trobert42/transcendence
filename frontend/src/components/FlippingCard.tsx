import { useEffect, useState } from 'react';
import YouTube from 'react-youtube';

type FlippingCardProps = {
  name: string;
  citation: string;
};

export const FlippingCard = ({ name, citation }: FlippingCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [player, setPlayer] = useState<any>(null);

  const opts = {
    height: '300',
    width: '270',
    playerVars: {
      autoplay: 0,
    },
  };

  const onReady = (event: any) => {
    setPlayer(event.target);
  };

  useEffect(() => {
    if (isFlipped && player) {
      player.playVideo();
    } else if (!isFlipped && player && player.getPlayerState() === 1) {
      player.stopVideo();
    }
  }, [isFlipped, player]);

  return (
    <div className="profile-element">
      <div
        className={`member-project-elements ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="frontcard">
          <div className="div-avatar-profile">
            <img
              src={`./images/pictures/whos${name}.png`}
              className="avatar-profile ellipse"
              width="150"
              height="150"
              alt="Who_is_pic"
            />
            <h2 className="text-wrapper"> Who's that member ? </h2>
          </div>
        </div>
        {name !== 'secretmember' && (
          <div className="backcard">
            <div className="div-avatar-profile">
              <img
                src={`./images/pictures/${name}.jpg`}
                className="avatar-profile ellipse"
                width="150"
                height="150"
                alt="Who_is_secret_pic"
              />
              <h2 className="text-wrapper"> It's {name} ! </h2>
              <p className="text-wrapper">{citation}</p>
            </div>
          </div>
        )}
        {name === 'secretmember' && (
          <div className="backcard">
            <YouTube videoId="dQw4w9WgXcQ" opts={opts} onReady={onReady} />
          </div>
        )}
      </div>
    </div>
  );
};
