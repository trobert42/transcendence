import { useRef, useEffect } from "react";
import { CanvasParams, GameParams } from "../lib/gameFrontMaterial";
import { gameWinner } from "../lib/gameFrontMaterial";

const background_color = "#3B4968";
const elements_color = "#F8B45E";

interface CanvasCpProps {
  canvasParams: CanvasParams;
  gp: GameParams;
  scale: number;
  winner: gameWinner | null;
}

function CanvasCp({ canvasParams, gp, scale, winner}: CanvasCpProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const text = gp.stats.player1_goals;
  const text2 = gp.stats.player2_goals;

  //We must wait the component did mount properly before get the real canvas
  useEffect(() => {
    const drawPlayerLeft = (ctx: any) => {
      ctx.fillRect(
        gp.player1.x * scale,
        gp.player1.y * scale - (gp.paddle.length / 2) * scale,
        gp.paddle.width * scale, 
        gp.paddle.length * scale,
      );
    };
    const drawPlayerRight = (ctx: any) => {
      ctx.fillRect(
        gp.player2.x * scale - gp.paddle.width * scale,
        gp.player2.y * scale - (gp.paddle.length / 2) * scale,
        gp.paddle.width * scale,
        gp.paddle.length * scale,
      );
    };
    const drawNet = (ctx: any) => {
      ctx.strokeStyle = elements_color;
      ctx.beginPath();
      ctx.setLineDash([ctx.canvas.height / 40, ctx.canvas.height / 70]); //fill/vide
      ctx.moveTo(ctx.canvas.width / 2, (1 / 20) * ctx.canvas.height); //debut de la ligne
      ctx.lineTo(
        ctx.canvas.width / 2,
        ctx.canvas.height - (1 / 20) * ctx.canvas.height,
      ); //fin de la ligne
      ctx.lineWidth = ctx.canvas.width / 230;
      ctx.stroke();
      ctx.closePath();
    };
    const drawBall = (ctx: any) => {
      ctx.fillStyle = elements_color;
      ctx.beginPath();
      ctx.arc(
        gp.ball.x * scale,
        gp.ball.y * scale,
        gp.ball.radius * scale,
        0,
        2 * Math.PI,
      );
      ctx.fill();
      ctx.closePath();
    };
    const drawBackground = (ctx: any) => {
      ctx.fillStyle = background_color;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };
    const drawScores = (ctx: any) => {
      ctx.font = `${ctx.canvas.width / 20}px Saira Condensed`;
      ctx.fillStyle = elements_color;

      ctx.fillText(
        gp.player1_name,
        ctx.canvas.width * (1 / 4) - ctx.measureText(gp.player1_name).width / 2,
        ctx.measureText(gp.player1_name).actualBoundingBoxAscent * 1.2,
      );

      ctx.fillText(
        text,
        ctx.canvas.width * (1 / 4) - ctx.measureText(text).width / 2,
        ctx.measureText(text).actualBoundingBoxAscent * 3,
      );

      ctx.fillText(
        gp.player2_name,
        ctx.canvas.width * (3 / 4) - ctx.measureText(gp.player2_name).width / 2,
        ctx.measureText(gp.player2_name).actualBoundingBoxAscent * 1.2,
      );

      ctx.fillText(
        text2,
        ctx.canvas.width * (3 / 4) - ctx.measureText(text2).width / 2,
        ctx.measureText(text2).actualBoundingBoxAscent * 3,
      );
    };
    
    const drawWinner = (ctx: any) => {
      if (winner) {
        ctx.font = `${ctx.canvas.width / 20}px Saira Condensed`;
        ctx.fillStyle = elements_color;
        const winText = winner.winner + " won the game !"
        ctx.fillText(
          winText,
          (ctx.canvas.width - ctx.measureText(winText).width) / 2,
          ctx.canvas.height / 2,
        );
      }
    }

    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        if (!winner) {
          drawBackground(ctx);
          drawScores(ctx);
          drawNet(ctx);
          drawBall(ctx);
          drawPlayerLeft(ctx);
          drawPlayerRight(ctx);
        } else {
          drawBackground(ctx);
          drawWinner(ctx);
        }
      }
    };
    render();
  // eslint-disable-next-line
  }, [canvasParams, gp, scale, winner]);

  return (
    <div
      className="div-before-canvas-pong-game"
      style={{ ["--border-color" as any]: background_color }}
    >
      <canvas
        className="canvas-pong-game"
        ref={canvasRef}
        width={canvasParams.width}
        height={canvasParams.height}
        // style={{ border: `1px solid ${background_color}` }}
      ></canvas>
    </div>
  );
}

export default CanvasCp;
