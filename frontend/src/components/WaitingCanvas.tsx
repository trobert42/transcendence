import { useRef, useState, useEffect } from 'react';
import { CanvasParams } from '../lib/gameFrontMaterial';

const background_color = "#3B4968";
const elements_color = "#F8B45E";
const text = "Waiting for an opponent";

interface WaitingCanvasProps {
  canvasParams: CanvasParams;
  scale: number;
}

function WaitingCanvas({ canvasParams, scale }: WaitingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dotText, setDotText] = useState<string>(".");

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (dotText === ".") setDotText("..");
      else if (dotText === "..") setDotText("...");
      else if (dotText === "...") setDotText(".");
    }, 1000);

    return () => clearInterval(intervalId);
  }, [dotText]);

  useEffect(() => {
    const drawBackground = (ctx: any) => {
      ctx.fillStyle = background_color;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };
    const drawWaitingText = (ctx: any) => {
      ctx.font = `${ctx.canvas.width / 20}px Saira Condensed`;
      ctx.fillStyle = elements_color;
      ctx.fillText(
        text,
        (ctx.canvas.width - ctx.measureText(text).width) / 2,
        ctx.canvas.height / 2,
      );
      ctx.fillText(
        dotText,
        (ctx.canvas.width - ctx.measureText(dotText).width) / 2,
        ctx.canvas.height / 2 + ctx.measureText(text).actualBoundingBoxAscent,
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
  }, [canvasParams, scale, dotText]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasParams.width}
      height={canvasParams.height}
      style={{ border: `1px solid ${background_color}` }}
    ></canvas>
  );
}

export default WaitingCanvas;
