import { v4 } from "uuid";
import { Lobby } from "./lobby";
import { ServerPayload } from "../../shared/server/ServerPayload";
import { ServerEvents } from "../../shared/server/ServerEvents";
import { GameState, InitialGameState } from "../lib/backMaterial";

export class Room {
  public readonly LastId: string = v4();

  public roomState: GameState = structuredClone(InitialGameState);

  constructor(private readonly lobby: Lobby) {
    this.roomState.roomId = this.LastId;
    this.roomState.lobbyId = this.lobby.id;
  }

  public startRoom(): void {
    if (this.roomState.gameStarted) {
      return;
    }

    let i: number = 0;
    if (this.lobby?.players.size >= 2) {
      for (const [id, socket] of this.lobby?.players) {
        if (i >= 2) break;
        if (socket && socket.data) {
          socket.data.playerId = i + 1;
          socket.emit(ServerEvents.LobbyState, {
            playerId: i + 1,
          });
          if (i === 0) {
            this.roomState.player1_id = socket.data.userId;
            this.roomState.player1_name = socket.data.userName;
          } else if (i === 1) {
            this.roomState.player2_id = socket.data.userId;
            this.roomState.player2_name = socket.data.userName;
          }
        }
        i++;
      }
    }
    this.roomState.gameStarted = true;

    this.lobby.emitToLobby<ServerPayload[ServerEvents.LobbyGameMessage]>(
      ServerEvents.LobbyGameMessage,
      {
        color: "blue",
        message: "Game started ! 🙂",
      },
    );
    this.roomInProgress();
  }

  public finishRoom(): void {
    if (this.roomState.gameFinish || !this.roomState.gameStarted) {
      return;
    }

    this.roomState.gameFinish = true;

    this.lobby.emitToLobby<ServerPayload[ServerEvents.LobbyGameMessage]>(
      ServerEvents.LobbyGameMessage,
      {
        color: "blue",
        message: "Game is finish ! 🤗",
      },
    );
  }

  public suspendRoom(): void {
    if (this.roomState.gameSuspended) {
      return;
    }

    this.roomState.gameSuspended = true;

    this.lobby.emitToLobby<ServerPayload[ServerEvents.LobbyGameMessage]>(
      ServerEvents.LobbyGameMessage,
      {
        color: "blue",
        message: "Game suspended !",
      },
    );
  }

  public resumeRoom(): void {
    if (!this.roomState.gameSuspended) {
      return;
    }

    this.roomState.gameSuspended = false;

    this.lobby.emitToLobby<ServerPayload[ServerEvents.LobbyGameMessage]>(
      ServerEvents.LobbyGameMessage,
      {
        color: "blue",
        message: "Game resumed !",
      },
    );
  }

  public emitData() {
    if (this.lobby?.players.size >= 2) {
      for (const [id, socket] of this.lobby?.players) {
        if (socket && socket.data) {
          if (socket.data.playerId === 1)
            socket.emit(ServerEvents.LobbyState, this.roomState);
          else if (socket.data.playerId === 2) {
            let tmp = structuredClone(this.roomState);
            const y_tmp = tmp.player1.y;
            tmp.player1.y = tmp.player2.y;
            tmp.player2.y = y_tmp;

            const scores_tmp = this.roomState.stats.player1_goals;
            tmp.stats.player1_goals = this.roomState.stats.player2_goals;
            tmp.stats.player2_goals = scores_tmp;

            [tmp.player1_name, tmp.player2_name] = [
              this.roomState.player2_name,
              this.roomState.player1_name,
            ];

            const new_ball_x = tmp.canvas.width - tmp.ball.x;
            tmp.ball.x = new_ball_x;
            socket.emit(ServerEvents.LobbyState, tmp);
          }
        }
      }
    }
  }

  public randomInRange(min: number, max: number): number {
    const randomValue = Math.random();
    const scaledValue = randomValue * (max - min);
    const finalValue = scaledValue + min;
    return finalValue;
  }

  public launchGame() {
    this.roomState.ball.diry = this.randomInRange(-0.25, 0.25);
    const squareDirX = 1 - this.roomState.ball.diry * this.roomState.ball.diry;
    this.roomState.ball.dirx = Math.sqrt(squareDirX);
    if (this.roomState.lastWinner === 1) this.roomState.ball.dirx *= -1;
    this.roomState.launched = true;
  }

  public reinitializePositions() {
    this.roomState.ball.x = this.roomState.canvas.width / 2;
    this.roomState.ball.y = this.roomState.canvas.height / 2;
    this.roomState.launched = false;
    this.roomState.ball.speed = 10;
  }

  public map(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number,
  ): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  public checkFailedReception() {
    if (
      this.roomState.ball.x - this.roomState.ball.radius <= 0 ||
      this.roomState.ball.x + this.roomState.ball.radius >=
        this.roomState.canvas.width
    ) {
      if (this.roomState.ball.x - this.roomState.ball.radius <= 0) {
        this.roomState.stats.player2_goals += 1;
        this.roomState.lastWinner = 1;
      } else if (
        this.roomState.ball.x + this.roomState.ball.radius >=
        this.roomState.canvas.width
      ) {
        this.roomState.stats.player1_goals += 1;
        this.roomState.lastWinner = 2;
      }
      this.reinitializePositions();
    }
  }

  public checkWallCollision() {
    if (
      this.roomState.ball.y + this.roomState.ball.radius >=
        this.roomState.canvas.height ||
      this.roomState.ball.y - this.roomState.ball.radius <= 0
    ) {
      this.roomState.ball.diry = -1 * this.roomState.ball.diry;
    }
  }

  public moveBall() {
    this.roomState.ball.x =
      this.roomState.ball.x +
      this.roomState.ball.dirx * this.roomState.ball.speed;
    this.roomState.ball.y =
      this.roomState.ball.y +
      this.roomState.ball.diry * this.roomState.ball.speed;
  }

  public checkLeftPaddleCollision() {
    if (
      this.roomState.ball.x - this.roomState.ball.radius <=
      0 + this.roomState.paddle.width
    ) {
      const paddleTop =
        this.roomState.player1.y -
        this.roomState.paddle.length / 2 -
        this.roomState.ball.radius;
      const paddleBottom =
        this.roomState.player1.y +
        this.roomState.paddle.length / 2 +
        this.roomState.ball.radius;
      if (
        this.roomState.ball.y <= paddleBottom &&
        this.roomState.ball.y >= paddleTop
      ) {
        let diff = this.roomState.ball.y - paddleTop;
        let radRange = 45 * (Math.PI / 180);
        let angle = this.map(
          diff,
          0,
          this.roomState.paddle.length + 2 * this.roomState.ball.radius,
          -radRange,
          radRange,
        );
        this.roomState.ball.x =
          this.roomState.player1.x +
          this.roomState.paddle.width +
          this.roomState.ball.radius;
        this.roomState.ball.dirx = Math.cos(angle);
        this.roomState.ball.diry = Math.sin(angle);

        if (this.lobby?.gameSettings?.options === "increasing_speed") {
          this.roomState.ball.speed += 1;
        }
      }
    }
  }

  public checkRightPaddleCollision() {
    if (
      this.roomState.ball.x + this.roomState.ball.radius >=
      this.roomState.canvas.width - this.roomState.paddle.width
    ) {
      const paddleTop =
        this.roomState.player2.y -
        this.roomState.paddle.length / 2 -
        this.roomState.ball.radius;
      const paddleBottom =
        this.roomState.player2.y +
        this.roomState.paddle.length / 2 +
        this.roomState.ball.radius;
      if (
        this.roomState.ball.y <= paddleBottom &&
        this.roomState.ball.y >= paddleTop
      ) {
        let diff = this.roomState.ball.y - paddleTop;
        let radRange = 45 * (Math.PI / 180);
        let angle = this.map(
          diff,
          0,
          this.roomState.paddle.length + 2 * this.roomState.ball.radius,
          -radRange,
          radRange,
        );
        this.roomState.ball.x =
          this.roomState.player2.x -
          this.roomState.paddle.width -
          this.roomState.ball.radius;
        this.roomState.ball.dirx = Math.cos(angle);
        this.roomState.ball.diry = Math.sin(angle);
        this.roomState.ball.dirx *= -1;

        if (this.lobby?.gameSettings?.options === "increasing_speed") {
          this.roomState.ball.speed += 1;
        }
      }
    }
  }

  public checkPaddlesCollision() {
    this.checkLeftPaddleCollision();
    this.checkRightPaddleCollision();
  }

  public gameLoop() {
    if (this.roomState.launched === true) {
      this.checkPaddlesCollision();
      this.moveBall();
      this.checkWallCollision();
      this.checkPaddlesCollision();
      this.checkFailedReception();
    } else {
      this.launchGame();
    }

    if (
      this.roomState.stats.player1_goals ===
        this.lobby?.gameSettings?.roundNumber ||
      this.roomState.stats.player2_goals ===
        this.lobby?.gameSettings?.roundNumber
    )
      this.lobby.gameFinishByStats();
  }

  public async roomInProgress() {
    this.lobby.emitToLobby<ServerPayload[ServerEvents.LobbyGameMessage]>(
      ServerEvents.LobbyGameMessage,
      {
        color: "blue",
        message: "Room is in progress ! 😀",
      },
    );
    let sec = 3;
    this.lobby.emitToLobby<ServerPayload[ServerEvents.LobbyGameCountdown]>(
      ServerEvents.LobbyGameCountdown,
      {
        count: sec,
      },
    );
    const countdownTnterval = async () => {
      return new Promise<void>((resolve) => {
        const intervalId = setInterval(async () => {
          if (sec >= 2) {
            sec--;
            this.lobby.emitToLobby<
              ServerPayload[ServerEvents.LobbyGameCountdown]
            >(ServerEvents.LobbyGameCountdown, {
              count: sec,
            });
          } else {
            this.lobby.emitToLobby<
              ServerPayload[ServerEvents.LobbyGameCountdown]
            >(ServerEvents.LobbyGameCountdown, null);
            clearInterval(intervalId);
            resolve();
          }
        }, 1000);
      });
    };

    await countdownTnterval();
    if (this.lobby.gameSettings?.gameMode === "small_paddles") {
      this.roomState.paddle.length = 40;
    }
    const intervalId = setInterval(async () => {
      if (this.roomState.gameStarted && !this.roomState.gameFinish) {
        this.gameLoop();
        this.emitData();
      } else {
        clearInterval(intervalId);
      }
    }, 30);
  }

  public movePaddleUp(userId: number) {
    if (userId === 1) {
      const newY = this.roomState.player1.y - this.roomState.paddle.speed;
      if (newY - this.roomState.paddle.length / 2 >= 0)
        this.roomState.player1.y = newY;
    } else if (userId == 2) {
      const newY = this.roomState.player2.y - this.roomState.paddle.speed;
      if (newY - this.roomState.paddle.length / 2 >= 0)
        this.roomState.player2.y = newY;
    }
  }

  public movePaddleDown(userId: number) {
    if (userId === 1) {
      const newY = this.roomState.player1.y + this.roomState.paddle.speed;
      if (
        newY + this.roomState.paddle.length / 2 <=
        this.roomState.canvas.height
      )
        this.roomState.player1.y = newY;
    } else if (userId === 2) {
      const newY = this.roomState.player2.y + this.roomState.paddle.speed;
      if (
        newY + this.roomState.paddle.length / 2 <=
        this.roomState.canvas.height
      )
        this.roomState.player2.y = newY;
    }
  }

  public gamePaddleEvent(userId: number, eventType: string) {
    if (this.roomState.gameStarted && !this.roomState.gameFinish) {
      if (eventType === "Up") this.movePaddleUp(userId);
      else if (eventType === "Down") this.movePaddleDown(userId);
    }
  }
}
