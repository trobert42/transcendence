import React, { useState, useEffect } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import useAuth from '../hooks/useAuth';
import { AiOutlineEnter } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

interface UserHistoryProps {
  userId?: number;
}

export const UserHistory: React.FC<UserHistoryProps> = ({ userId }) => {
  const [myHistory, setMyHistory] = useState<any[] | null>(null);
  const axiosPrivate = useAxiosPrivate();
  const { auth }: any = useAuth();
  const userTargetId = userId ? userId : auth.id;
  const navigate = useNavigate();

  useEffect(() => {
    const getMyHistory = async () => {
      try {
        const response = await axiosPrivate?.post('/games/myHistory', {
          userId: userTargetId,
        });

        setMyHistory(response?.data);
      } catch (err) {
        if ((err as any).name === 'CanceledError') {
          return;
        }
      }
    };
    getMyHistory();
    return () => {};
    // eslint-disable-next-line
  }, [userTargetId]);

  const changeDateFormatToHours = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  const changeDateFormatToDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  return (
    <div className="myHistory-main-div">
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
            Match History
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
          }}
        ></div>
      </div>
      {myHistory && myHistory.length > 0 && (
        <>
          <ul className="ListMyHistory-ul">
            {myHistory.map((game, id) => (
              <li
                key={id}
                className={`ListMyHistory-li ${
                  userTargetId === game.winner ? 'winner' : 'loser'
                }`}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginLeft: '5px',
                    width: '120px',
                  }}
                >
                  <div className="div-avatar-profile" style={{ width: '95px' }}>
                    <img
                      src={
                        game.player1 === game.winnerUser.id
                          ? game.winnerUser.avatarLink
                          : game.otherUser.avatarLink
                      }
                      className="avatar-profile ellipse"
                      style={{ height: '55px', width: '55px' }}
                      alt="haha tema la tete"
                    />
                    <div
                      className="hover-text"
                      onClick={() => {
                        navigate(
                          `/users/profile/:${
                            game.player1 === game.winnerUser.id
                              ? game.winner
                              : game.looser
                          }`,
                        );
                      }}
                    >
                      <AiOutlineEnter />
                    </div>
                    <span
                      style={{
                        marginLeft: '0px',
                        width: '90px',
                        height: '25px',
                        fontSize: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={
                        game.player1 === game.winner
                          ? game.winnerUser.username
                          : game.otherUser.username
                      }
                    >
                      {game.player1 === game.winner
                        ? game.winnerUser.username
                        : game.otherUser.username}
                    </span>
                  </div>
                  <span
                    style={{
                      color: 'green',
                      display: 'inline-block',
                      width: '45px',
                      fontSize: '25px',
                      textShadow:
                        '1px 1px 0 rgba(0, 0, 0, 0.6), -1px -1px 0 rgba(0, 0, 0, 0.6), 1px -1px 0 rgba(0, 0, 0, 0.6), -1px 1px 0 rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    {game.scorePlayer1}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    width: '100%',
                  }}
                >
                  <span
                    style={{
                      color: userTargetId === game.winner ? 'blue' : 'red',
                      position: 'relative',
                      fontSize: '24px',
                      textShadow:
                        '1px 1px 0 rgba(0, 0, 0, 0.6), -1px -1px 0 rgba(0, 0, 0, 0.6), 1px -1px 0 rgba(0, 0, 0, 0.6), -1px 1px 0 rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    {userTargetId === game.winner ? 'Victory' : 'Defeat'}
                  </span>
                  <span
                    style={{
                      color: 'black',
                      fontSize: '12px',
                    }}
                  >
                    {changeDateFormatToHours(new Date(game.gameDate))}
                  </span>
                  <span
                    style={{
                      color: 'black',
                      fontSize: '12px',
                    }}
                  >
                    {changeDateFormatToDate(new Date(game.gameDate))}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginRight: '5px',
                    width: '120px',
                    height: '100%',
                  }}
                >
                  <span
                    style={{
                      color: 'green',
                      display: 'inline-block',
                      width: '45px',
                      textAlign: 'right',
                      fontSize: '25px',
                      textShadow:
                        '1px 1px 0 rgba(0, 0, 0, 0.6), -1px -1px 0 rgba(0, 0, 0, 0.6), 1px -1px 0 rgba(0, 0, 0, 0.6), -1px 1px 0 rgba(0, 0, 0, 0.6)',
                    }}
                  >
                    {game.scorePlayer2}
                  </span>
                  <div className="div-avatar-profile">
                    <img
                      src={
                        game.player2 === game.winner
                          ? game.winnerUser.avatarLink
                          : game.otherUser.avatarLink
                      }
                      className="avatar-profile ellipse"
                      style={{ height: '55px', width: '55px' }}
                      alt="haha tema la tete"
                    />
                    <div
                      className="hover-text"
                      onClick={() => {
                        navigate(
                          `/users/profile/:${
                            game.player2 === game.winner
                              ? game.winner
                              : game.looser
                          }`,
                        );
                      }}
                    >
                      <AiOutlineEnter />
                    </div>
                    <span
                      style={{
                        width: '95px',
                        height: '25px',
                        fontSize: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={
                        game.player2 === game.winnerUser.id
                          ? game.winnerUser.username
                          : game.otherUser.username
                      }
                    >
                      {game.player2 === game.winnerUser.id
                        ? game.winnerUser.username
                        : game.otherUser.username}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {myHistory && myHistory.length === 0 && (
        <>
          <div style={{ marginTop: '20px' }}>Nothing to display ...</div>
        </>
      )}
    </div>
  );
};
