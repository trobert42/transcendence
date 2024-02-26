import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-solid-svg-icons";
import { ClientEvents } from "../shared/client/ClientEvents";
import { useSocket } from "../context/SocketProvider";
import { axiosPrivate } from "../utils/api";

type GameStarterProps = {
  settings: {
    gameMode: "normal" | "small_paddles";
    roundNumber: number;
    options: "none" | "increasing_speed";
    friendInvite: boolean;
  };
};

type GameOptionsProps = {
  setLobbyCreated?: React.Dispatch<React.SetStateAction<boolean>>;
  componentUseForInvite?: boolean;
  setIdNewGameProp?: (id: string) => void;
};

const GameOptions: React.FC<GameOptionsProps> = ({
  setLobbyCreated,
  componentUseForInvite,
  setIdNewGameProp,
}) => {
  const socket = useSocket();
  const [settings, setSettings] = useState<GameStarterProps["settings"]>({
    gameMode: "normal",
    roundNumber: 10,
    options: "none",
    friendInvite: false,
  });

  const handleGameInvitation = async () => {
    settings.friendInvite = true;
    const response = await axiosPrivate?.post("game/initGameFriend/", {
      gameSettings: settings,
    });
    const idLobby = response.data;
    if (setIdNewGameProp) {
      setIdNewGameProp(idLobby);
    }
  };

  const handlePaddleStyleClick = () => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      gameMode: prevSettings.gameMode === "normal" ? "small_paddles" : "normal",
    }));
  };

  const handleOptionalModeClick = () => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      options: prevSettings.options === "none" ? "increasing_speed" : "none",
    }));
  };

  const handleRoundNumberChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      roundNumber: parseInt(event.target.value),
    }));
  };

  const handleStartGameClick = () => {
    socket?.emit({
      event: ClientEvents.CreateLobby,
      data: {
        gameMode: settings.gameMode,
        roundNumber: settings.roundNumber,
        options: settings.options,
        friendInvite: false,
      },
    });
  };

  return (
    <div className="gamesettings-div" style={{ paddingLeft: "15px" }}>
      <div
        style={{
          fontSize: "27px",
          color: "black",
          paddingBottom: "15px",
        }}
      >
        Game Options
      </div>
      <div style={{ paddingBottom: "0px" }}>
        <div
          style={{
            fontSize: "20px",
            color: "black",
            paddingLeft: "5px",
            paddingBottom: "5px",
          }}
        >
          Paddle Styles :
        </div>
        <div
          onClick={handlePaddleStyleClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "auto",
            borderRadius: "8px",
            backgroundColor: "rgb(250, 250, 250, 0.5)",
            cursor: "pointer",
            fontWeight: "bold",
            height: "45px",
            border: "4px solid rgb(95, 95, 95, 0.5)",
            padding: "16px",
          }}
        >
          <div>
            {settings.gameMode === "normal" ? "Normal" : "Small Paddles"}
          </div>
          <div>
            {settings.gameMode === "normal" ? (
              <FontAwesomeIcon
                icon={faArrowRight}
                beatFade
                style={{ color: "#000000" }}
              />
            ) : (
              <FontAwesomeIcon
                icon={faArrowLeft}
                beatFade
                style={{ color: "#000000" }}
              />
            )}
          </div>
        </div>
      </div>

      <div style={{ paddingBottom: "15px" }}>
        <div
          style={{
            fontSize: "20px",
            color: "black",
            paddingLeft: "5px",
            paddingBottom: "5px",
          }}
        >
          Optional Mode :
        </div>
        <div
          onClick={handleOptionalModeClick}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor:
              settings.options === "increasing_speed"
                ? "rgb(39, 199, 0, 0.5)"
                : "rgb(250, 250, 250, 0.5)",
            width: "auto",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            border:
              settings.options === "increasing_speed"
                ? "4px solid rgb(48, 244, 0, 1)"
                : "4px solid rgb(95, 95, 95, 0.5)",
            color:
              settings.options === "increasing_speed"
                ? "rgb(255, 255, 255, 1)"
                : "rgb(0, 0, 0, 1)",
            height: "45px",
            padding: "16px",
          }}
        >
          <div>Increasing Speed</div>
          <div>
            <FontAwesomeIcon
              icon={faCircle}
              bounce
              style={{
                color: "#F8B45E",
                border: "1px solid #000000",
                borderRadius: "50%",
              }}
            />
          </div>
        </div>
      </div>
      <div style={{ paddingBottom: "15px" }}>
        <div
          style={{
            fontSize: "20px",
            color: "black",
            paddingLeft: "5px",
            paddingBottom: "5px",
          }}
        >
          Number of Rounds :
        </div>
        <select
          value={settings.roundNumber}
          onChange={handleRoundNumberChange}
          style={{
            width: "100%",
            paddingLeft: "12px",
            paddingRight: "12px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "4px solid rgb(95, 95, 95, 0.5)",
            backgroundColor: "rgb(250, 250, 250, 0.5)",
            height: "45px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: "700",
          }}
        >
          {[...Array(10)].map((_, i) => (
            <option key={i} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingBottom: "15px",
        }}
      >
        <div
          className="startgame-button"
          onClick={() => {
            if (!componentUseForInvite) {
              handleStartGameClick();
              setLobbyCreated && setLobbyCreated(true);
            } else {
              handleGameInvitation();
            }
          }}
        >
          Start the Game
        </div>
      </div>
    </div>
  );
};

export default GameOptions;
