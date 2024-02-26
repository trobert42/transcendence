import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import { AiOutlineEnter } from 'react-icons/ai';

export const LeaderBoard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  useEffect(() => {
    const getLeaderboard = async () => {
      try {
        const response = await axiosPrivate?.get('/games/GamesStats');

        setLeaderboard(response?.data);
      } catch (err) {
        if ((err as any).name === 'CanceledError') {
          return;
        }
      }
    };
    getLeaderboard();
  // eslint-disable-next-line
  }, []);

  return (
    <div className="leaderboard-main-div">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: '27px',
              color: 'black',
            }}
          >
            Leaderboard
          </div>
          <div
            className="line-title"
            style={{
              position: 'relative',
            }}
          ></div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'right',
            fontSize: '20px',
            textShadow:
              '1px 1px 0 rgba(0, 0, 0, 0.4), -1px -1px 0 rgba(0, 0, 0, 0.4), 1px -1px 0 rgba(0, 0, 0, 0.4), -1px 1px 0 rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ color: 'blue', width: '55px' }}>Games</div>
          <div style={{ color: 'green', width: '45px' }}>Win</div>
          <div style={{ color: 'red', width: '45px' }}>Lost</div>
        </div>
      </div>
      {leaderboard && leaderboard.length > 0 && (
        <>
          <ul className="ListLeaderboard">
            {leaderboard.map((game, id) => (
              <li
                key={id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '2px',
                  paddingLeft: '0px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div className="div-players-title">
                    <div className="div-avatar-profile">
                      <img
                        src={game.user.avatarLink}
                        className="avatar-profile ellipse"
                        style={{ height: '55px', width: '55px' }}
                        alt="haha tema la tete"
                      />
                      <div
                        className="hover-text"
                        onClick={() => {
                          navigate(`/users/profile/:${game.playerId}`);
                        }}
                      >
                        <AiOutlineEnter />
                      </div>
                    </div>
                    <span
                      className="text-username-leaderboard"
                      title={game.user.username}
                    >
                      {game.user.username}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    fontSize: '25px',
                    textShadow:
                      '1px 1px 0 rgba(0, 0, 0, 0.6), -1px -1px 0 rgba(0, 0, 0, 0.6), 1px -1px 0 rgba(0, 0, 0, 0.6), -1px 1px 0 rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <span
                    style={{
                      color: 'blue',
                      display: 'inline-block',
                      width: '55px',
                    }}
                  >
                    {game.totalGames}
                  </span>
                  <span
                    style={{
                      color: 'green',
                      display: 'inline-block',
                      width: '45px',
                    }}
                  >
                    {game.gamesWon}
                  </span>
                  <span
                    style={{
                      color: 'red',
                      display: 'inline-block',
                      width: '45px',
                    }}
                  >
                    {game.gamesLost}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {leaderboard && leaderboard.length === 0 && (
        <>
          <div style={{ marginTop: '20px' }}>Nothing to display ...</div>
        </>
      )}
    </div>
  );
};
