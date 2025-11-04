import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket = null;

export function connectSocket(token) {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token },
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = null;
}
