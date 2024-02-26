import { useState, useEffect } from "react";
import WaitingCanvas from "./WaitingCanvas";
import {
  CanvasParams,
  gameCountDown,
} from "../lib/gameFrontMaterial";
import GameOptions from "./GameOptions";
import CountdownCanvas from "./CountdownCanvas";

type Props = {
  canvasParams: CanvasParams;
  scale: number;
  countdown: gameCountDown | null;
  ongoing: boolean;
  lobbyStatus?: boolean;
};

export default function GameStarter({
  canvasParams,
  scale,
  countdown,
  ongoing,
  lobbyStatus,
}: Props) {
  const [lobbyCreated, setLobbyCreated] = useState<boolean>(
    lobbyStatus || false,
  );

  useEffect(() => {
    setLobbyCreated(lobbyStatus || false);
  }, [lobbyStatus]);

  return (
    <>
      {!lobbyCreated && <GameOptions setLobbyCreated={setLobbyCreated} />}
      {lobbyCreated && !ongoing && (
        <WaitingCanvas canvasParams={canvasParams} scale={scale} />
      )}
      {lobbyCreated && countdown && ongoing && (
        <CountdownCanvas
          canvasParams={canvasParams}
          countdown={countdown}
          scale={scale}
        />
      )}
    </>
  );
}
