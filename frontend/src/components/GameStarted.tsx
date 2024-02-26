import { useEffect, useState } from "react";
import { CanvasParams, GameParams } from "../lib/gameFrontMaterial";
import CanvasCp from "./Canvas";
import { ControlsPong } from "./ControlsPong";
import { gameWinner } from "../lib/gameFrontMaterial";

interface GameStartedProps {
  canvasParams: CanvasParams;
  gameParams: GameParams;
  scale: number;
  winner: gameWinner | null;
}

function GameStarted({
  canvasParams,
  gameParams,
  scale,
  winner,
}: GameStartedProps) {
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShowControls(false);
    }, 7000);
  }, []);

  return (
    <>
      <div className="mt-4">
        <CanvasCp
          canvasParams={canvasParams}
          gp={gameParams}
          scale={scale}
          winner={winner}
        />
        {showControls && (
          <ControlsPong
            width={canvasParams.width}
            height={canvasParams.width}
          />
        )}
      </div>
    </>
  );
}

export default GameStarted;
