import { useState, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useRecoilState } from "recoil";
import { CurrentLobbyState } from "../utils/LobbyState";
import { Listener } from "../utils/SocketTypes";
import { ServerPayload } from "../shared/server/ServerPayload";
import { ServerEvents } from "../shared/server/ServerEvents";
import { ClientEvents } from "../shared/client/ClientEvents";
import { showNotification, notifications } from "@mantine/notifications";
import { Button } from "@mantine/core";
import GameStarter from "../components/GameStarter";
import {
  CanvasParams,
  gameCountDown,
  gameWinner,
} from "../lib/gameFrontMaterial";
import { LeaderBoard } from "../components/LeaderBoard";
import GameStarted from "../components/GameStarted";
import { useParams } from "react-router-dom";

const Pong = () => {
  const [scale, setScale] = useState(window.innerWidth / window.screen.width);
  const [canvasParams, setCanvasParams] = useState<CanvasParams>({
    width: 1200 * scale,
    height: 1200 * scale * (2 / 3),
  });
  const [lobbyState, setLobbyState] = useRecoilState(CurrentLobbyState);
  const [countdown, setCountDown] = useState<gameCountDown | null>(null);
  const [winner, setWinner] = useState<gameWinner | null>(null);
  const [ongoing, setOngoing] = useState<boolean>(false);
  const socket = useSocket();
  const debug = false;
  const maxScreen = window.screen.width;
  const defaultCanvasWidth = 1200;
  const { lobby } = useParams();
  const [lobbyStatus, setLobbyStatus] = useState<boolean>(false);

  useEffect(() => {
    const handlePopstate = () => {
      if (socket && socket.socket && !socket.socket.connected) {
        if (socket?.socket) {
          socket.socket.data = { playerId: 0 };
        }
        socket?.onDisconnect();
        socket?.addToListen(
          ServerEvents.LobbyGameCountdown,
          onLobbyGameCountdown,
        );
        socket?.addToListen(ServerEvents.LobbyGameWinner, onLobbyGameWinner);
        socket?.addToListen(ServerEvents.LobbyState, onLobbyState);
        socket?.addToListen(ServerEvents.LobbyGameMessage, onGameMessage);
        socket?.addToListen(ServerEvents.Pong, pong);
      }
    };

    const onLobbyGameWinner:
      | Listener<ServerPayload[ServerEvents.LobbyGameWinner]>
      | any = async (serverWinner: gameWinner | null) => {
      setWinner(serverWinner);
    };

    const onLobbyGameCountdown:
      | Listener<ServerPayload[ServerEvents.LobbyState]>
      | any = async (serverCountdown: gameCountDown | null) => {
      setCountDown(serverCountdown);
    };

    const onLobbyState: Listener<
      ServerPayload[ServerEvents.LobbyState] | any
    > = async (data) => {

      if (
        "playerId" in data ||
        "lobbyState" in data ||
        "lobbyStatus" in data ||
        "alreadyInLobby" in data
      ) {
        if (socket && socket?.socket && "playerId" in data) {
          socket.socket.data = { playerId: data.playerId };
          setOngoing(true);
        }
        if ("lobbyState" in data) {
          setLobbyState(data.lobbyState);
          setOngoing(false);
        }
        if ("lobbyState" in data && lobbyState === null) setLobbyStatus(false);
        if ("alreadyInLobby" in data && data.alreadyInLobby === false) {
          window.location.reload();
        }
        if ("lobbyStatus" in data && data.lobbyStatus === true) {
          setLobbyStatus(true);
        }
      } else {
        setLobbyState((prevData: any) => {
          return {
            ...prevData,
            ...data,
          };
        });
      }
    };

    const onGameMessage: Listener<
      ServerPayload[ServerEvents.LobbyGameMessage]
    > = ({ color, message }) => {
      showNotification({
        message: message,
        color: color,
        autoClose: 4000,
      });
    };

    const pong: Listener<ServerPayload[ServerEvents.LobbyGameMessage]> = ({
      color,
      message,
    }) => {
      showNotification({
        message: message,
        color: color,
        autoClose: 4000,
        style: {
          maxHeight: "100px",
          overflow: "hidden",
          textOverflow: "ellipsis",
        },
      });
    };

    handlePopstate();

    return () => {
      socket?.removeToListen(
        ServerEvents.LobbyGameCountdown,
        onLobbyGameCountdown,
      );
      socket?.removeToListen(ServerEvents.LobbyGameWinner, onLobbyGameWinner);
      socket?.removeToListen(ServerEvents.LobbyState, onLobbyState);
      socket?.removeToListen(ServerEvents.LobbyGameMessage, onGameMessage);
      socket?.removeToListen(ServerEvents.Pong, pong);
      socket?.disconnect();
    };
    // eslint-disable-next-line
  }, [socket?.socket]);

  useEffect(() => {
    if (lobby) {
      socket?.emit({
        event: ClientEvents.JoinLobby,
        data: {
          lobbyId: lobby,
        },
      });
    }

    return () => {};
    // eslint-disable-next-line
  }, [socket?.socket, lobby]);

  const ping = (mode: "solo" | "duo") => {
    console.log("ping client server detected");
    socket?.emit({
      event: ClientEvents.Ping,
      data: {
        mode: mode,
      },
    });
  };

  useEffect(() => {
    const handleGameInfos = () => {
      if (socket && socket.socket) {
        socket.socket.on("gameInfos", (gameInfos: any) => {
          console.log("websocket with gameInfos.");
          console.log(gameInfos);
        });
      }
    };
    handleGameInfos();
    return () => {
      if (socket && socket.socket) socket.socket.off("gameInfos");
    };
    // eslint-disable-next-line
  }, []);

  // eslint-disable-next-line
  const getActiveSockets = () => {
    socket?.connect();
    if (socket && socket.socket) {
      socket.socket.emit("getActiveSockets", null, (response: string[]) => {
        console.log("getActiveSockets, Active Sockets:", response);
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const newScale = window.innerWidth / maxScreen;
      setScale(newScale);
      const newCanvasParams = {
        width: defaultCanvasWidth * newScale,
        height: defaultCanvasWidth * newScale * (2 / 3),
      };
      setCanvasParams(newCanvasParams);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const keysPressed: { [key: string]: boolean } = {};

    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed[event.key] = true;
      if (
        socket?.socket &&
        socket.socket.data &&
        socket.socket.data.playerId !== 0 &&
        socket.socket.data.playerId !== null &&
        lobbyState
      ) {
        if (keysPressed["ArrowUp"] || keysPressed["w"]) {
          socket?.emit({
            event: ClientEvents.MoovePaddle,
            data: {
              type: "Up",
              userId: socket.socket.data.playerId,
            },
          });
        } else if (keysPressed["ArrowDown"] || keysPressed["s"]) {
          socket?.emit({
            event: ClientEvents.MoovePaddle,
            data: {
              type: "Down",
              userId: socket.socket.data.playerId,
            },
          });
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed[event.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line
  }, [socket?.socket, lobbyState]);

  return (
    <div className="profile-element">
      {debug && (
        <>
          <button
            onClick={() => {
              socket?.getSocketId();
            }}
          >
            test1
          </button>
          <button
            onClick={() => {
              ping("solo");
            }}
          >
            test2
          </button>
          <Button
            variant="outline"
            onClick={() =>
              notifications.show({
                withCloseButton: false,
                color: "red",
                title: "Default notification",
                message: "Hey there, your code is awesome! 🤥",
              })
            }
          >
            test2
          </Button>
        </>
      )}

      {!lobbyState ? (
        <>
          <div className="profile-elements">
            <div className="last-div-on-pong-page">
              <GameStarter
                canvasParams={canvasParams}
                scale={scale}
                countdown={countdown}
                ongoing={ongoing}
                lobbyStatus={lobbyStatus}
              />
            </div>
          </div>
          <div className="profile-elements">
            <div className="div-leaderboard-pong">
              <LeaderBoard />
            </div>
          </div>
        </>
      ) : (
        <div className="canvas-pong-started">
          <GameStarted
            canvasParams={canvasParams}
            gameParams={lobbyState}
            scale={scale}
            winner={winner}
          />
        </div>
      )}
    </div>
  );
};

export default Pong;
