import axios from "axios";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { SetterOrUpdater, useSetRecoilState, useRecoilState } from "recoil";
import { ClientEvents } from "../shared/client/ClientEvents";
import { ServerEvents } from "../shared/server/ServerEvents";
import state, { Listener, SocketState } from "../utils/SocketTypes";
import { showNotification } from "@mantine/notifications";

type EmitOptions<T> = {
  event: ClientEvents;
  data?: T;
};

interface SocketFunctions {
  getSocketId: () => string | null;
  connect: () => void;
  disconnect: () => void;
  emit: <T>(options: EmitOptions<T>) => void;
  addToListen: <T>(event: ServerEvents, listener: Listener<T>) => void;
  removeToListen: <T>(event: ServerEvents, listener: Listener<T>) => void;
  onDisconnect: () => void;
  socket: Socket | null;
  setSocketState: SetterOrUpdater<SocketState>;
  connectionLost: boolean;
}

interface SocketProviderProps {
  children: React.ReactNode;
  endpointUrl: string;
}

export const ChatSocketContext = createContext<SocketFunctions | null>(null);

export function useChatSocket(): SocketFunctions | null {
  return useContext(ChatSocketContext);
}

export function ChatSocketProvider({
  children,
  endpointUrl,
}: SocketProviderProps): JSX.Element {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketState, setSocketState] = useRecoilState(state);
  //code pour la configuration de la connexion WebSocket
  //l'utilisation du useEffect avec un tableau de dépendances vide ([]) garantit que le code à l'intérieur de useEffect ne sera exécuté qu'une seule fois lors du montage initial.

  const socketFunctions: SocketFunctions = {
    connect: (): void => {
      if (socket) {
        socket.connect();
      }
    },
    disconnect: (): void => {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setSocketState((currVal: any) => ({ ...currVal, connected: false }));
      }
    },
    getSocketId: (): string | null => {
      if (socket && socket.connected) {
        console.log(`VOICI LE SOCKET ID ${socket.id}`);
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
            return { ...currVal, connected: false };
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
      try {
        const { data } = await axios.get(process.env.REACT_APP_SITE_URL + ":3333/auth/myToken", {
          withCredentials: true,
        });
        console.log("connecting socket to endpoint : ", endpointUrl);
        socketInstance = io(endpointUrl, {
          autoConnect: false,
          withCredentials: true,
          transports: ["websocket"],
        });

        socketInstance.on("connect", () => {
          setSocket(socketInstance);
          setSocketState({ connected: true });
          console.log("socket connected");
        });
      } catch (error) {
        console.error("Erreur socket ou reponse serveur (axios) : ", error);
      }

      return () => {};
    };

    handleSocket();
  }, []);

  return (
    <ChatSocketContext.Provider value={socketFunctions}>
      {children}
    </ChatSocketContext.Provider>
  );
}

export default ChatSocketContext;
