import { useRef, useEffect } from "react";
import { CanvasParams, gameCountDown } from "../lib/gameFrontMaterial";

const background_color = "#3B4968";
const elements_color = "#F8B45E";

interface CountdownCanvasProps {
	canvasParams: CanvasParams;
	countdown: gameCountDown;
	scale: number;
}

function CountdownCanvas({ canvasParams, countdown, scale }: CountdownCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const drawBackground = (ctx: any) => {
      ctx.fillStyle = background_color;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };
    const drawWaitingText = (ctx: any) => {
      ctx.font = `${ctx.canvas.width / 20}px Saira Condensed`;
      ctx.fillStyle = elements_color;
      ctx.fillText(
        countdown.count,
        (ctx.canvas.width - ctx.measureText(countdown.count).width) / 2,
        ctx.canvas.height / 2,
      );
    };
    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx) {
        drawBackground(ctx);
        drawWaitingText(ctx);
      }
    };
    render();
  }, [countdown, scale]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasParams.width}
      height={canvasParams.height}
      style={{ border: `1px solid ${background_color}`}}
    ></canvas>
  );
}

export default CountdownCanvas;
