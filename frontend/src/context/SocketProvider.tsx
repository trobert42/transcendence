import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRecoilState } from "recoil";
import { ServerEvents } from "../shared/server/ServerEvents";
import state, {
  Listener,
  ClientSocket,
  SocketFunctions,
  SocketProviderProps,
  EmitOptions,
} from "../utils/SocketTypes";
import { showNotification } from "@mantine/notifications";
import { getRemoveCookie } from "../utils/api";
import useAuth from "../hooks/useAuth";

export const SocketContext = createContext<SocketFunctions | null>(null);

export function useSocket(): SocketFunctions | null {
  return useContext(SocketContext);
}

export function SocketProvider({
  children,
  endpointUrl,
}: SocketProviderProps): JSX.Element {
  const [socket, setSocket] = useState<ClientSocket | null>(null);
  // eslint-disable-next-line
  const [socketState, setSocketState] = useRecoilState(state);
  // eslint-disable-next-line
  const { auth, setAuth }: any = useAuth();

  //code pour la configuration de la connexion WebSocket
  //l'utilisation du useEffect avec un tableau de dépendances vide ([]) garantit que le code à l'intérieur de useEffect ne sera exécuté qu'une seule fois lors du montage initial.

  const socketFunctions: SocketFunctions = {
    connect: (): void => {
      if (socket) {
        socket.connect();
        if (socket) {
          socket.data = { playerId: 0 };
        }
      }
    },
    disconnect: (): void => {
      if (socket) {
        socket.disconnect();
        setSocket((currVal: any) => {
          if (currVal) {
            return null;
          }
          return currVal;
        });
        setSocketState((currVal: any) => {
          if (!currVal.connected) {
            return { ...currVal, connected: false };
          }
          return currVal;
        });
      }
    },
    getSocketId: (): string | null => {
      if (socket && socket.connected) {
        return socket.id || null;
      }
      return null;
    },
    emit<T>(options: EmitOptions<T>): any {
      this?.socket?.emit(options.event, options.data);

      return this;
    },
    addToListen<T>(event: ServerEvents, listener: Listener<T>): any {
      this?.socket?.on(event, listener);

      return this;
    },
    removeToListen<T>(event: ServerEvents, listener: Listener<T>): any {
      this?.socket?.off(event, listener);

      return this;
    },
    onDisconnect(): void {
      this?.socket?.on(
        "disconnect",
        async (reason: Socket.DisconnectReason) => {
          if (reason === "io client disconnect") {
            showNotification({
              message: "Disconnected successfully! 😌",
              color: "green",
              autoClose: 4000,
            });
          }

          if (reason === "io server disconnect") {
            showNotification({
              message: "You got disconnect by server 😶‍🌫️",
              color: "orange",
              autoClose: 5000,
            });
          }

          if (
            reason === "ping timeout" ||
            reason === "transport close" ||
            reason === "transport error"
          ) {
            showNotification({
              message: "Connection lost to the server 🫣",
              color: "orange",
              autoClose: 5000,
            });
            this.connectionLost = true;
          }

          setSocketState((currVal: any) => {
            if (!currVal.connected) {
              return { ...currVal, connected: false };
            }
            return currVal;
          });
        },
      );
    },
    socket: socket,
    setSocketState: setSocketState,
    connectionLost: false,
  };

  useEffect(() => {
    let socketInstance: Socket | null = null;
    const handleSocket = async () => {
      await axios
        .get(process.env.REACT_APP_SITE_URL +`:3333/users/me`, { withCredentials: true })
        .then((response: any) => {
          const username = response.data.username;
          const userId: number = response.data.id;

          socketInstance = io(endpointUrl, {
            withCredentials: true,
            transports: ["websocket"],
            query: {
              username: username,
              userId: userId,
            },
          });
          if (socketInstance) {
            setSocket(socketInstance as ClientSocket);
            setSocketState({ connected: true });
          }
        })
        .catch((error: any) => {
          getRemoveCookie(setAuth);
          console.error("Erreur socket ou reponse serveur (axios) : ", error);
          if (error.name === "CanceledError") {
            return;
          }
        });
    };
    handleSocket();
    return () => {};
    // eslint-disable-next-line
  }, []);

  return (
    <SocketContext.Provider value={{ ...socketFunctions }}>
      {children}
    </SocketContext.Provider>
  );
}

export default SocketContext;
