import React, { useState, useEffect } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

interface UserGameStatsProps {
  userId: number;
}

export const UserGameStats: React.FC<UserGameStatsProps> = ({ userId }) => {
  const [userGameStats, setUserGameStats] = useState<any | null>(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const getUserGameStats = async () => {
      try {
        const userTargetId = userId;
        const response = await axiosPrivate?.post("/games/UserGamesStats", {
          userId: userTargetId,
        });

        setUserGameStats(response?.data);
      } catch (err) {
        if ((err as any).name === "CanceledError") {
          // Ignore canceled errors
          return;
        }
      }
    };
    getUserGameStats();
  }, []);

  return (
    <div className="leaderboard-main-div">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: "27px",
              color: "black",
            }}
          >
            Game Stats
          </div>
          <div
            className="line-title"
            style={{
              position: "relative",
            }}
          ></div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            textAlign: "right",
            fontSize: "20px",
            textShadow:
              "1px 1px 0 rgba(0, 0, 0, 0.4), -1px -1px 0 rgba(0, 0, 0, 0.4), 1px -1px 0 rgba(0, 0, 0, 0.4), -1px 1px 0 rgba(0, 0, 0, 0.4)",
          }}
        >
          <div style={{ color: "blue", width: "55px" }}>Games</div>
          <div style={{ color: "green", width: "45px" }}>Win</div>
          <div style={{ color: "red", width: "45px" }}>Lost</div>
        </div>
      </div>
      <ul className="ListLeaderboard">
        <li
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "2px",
            paddingLeft: "0px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="div-avatar-profile">
              <img
                src={userGameStats?.avatarLink}
                className="avatar-profile ellipse"
                style={{ height: "55px", width: "55px" }}
                alt="haha tema la tete"
              />
            </div>
            <span
              className="text-username-leaderboard"
              title={userGameStats?.username}
            >
              {userGameStats?.username}
            </span>
          </div>
          <div
            style={{
              textAlign: "right",
              fontSize: "25px",
              textShadow:
                "1px 1px 0 rgba(0, 0, 0, 0.6), -1px -1px 0 rgba(0, 0, 0, 0.6), 1px -1px 0 rgba(0, 0, 0, 0.6), -1px 1px 0 rgba(0, 0, 0, 0.6)",
            }}
          >
            <span
              style={{
                color: "blue",
                display: "inline-block",
                width: "55px",
              }}
            >
              {userGameStats?.totalGames}
            </span>
            <span
              style={{
                color: "green",
                display: "inline-block",
                width: "45px",
              }}
            >
              {userGameStats?.gamesWon}
            </span>
            <span
              style={{
                color: "red",
                display: "inline-block",
                width: "45px",
              }}
            >
              {userGameStats?.gamesLost}
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
};
