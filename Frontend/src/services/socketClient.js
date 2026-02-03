// src/services/socketClient.js
import { io } from "socket.io-client";
import API_BASE_URL from "../config/api";

let socket = null;

export function connectSocket() {
  if (socket) return socket;

  socket = io(API_BASE_URL, {
    transports: ["websocket"],
    withCredentials: true, // vì bạn bật cors credentials ở BE
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
