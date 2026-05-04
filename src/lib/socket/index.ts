// client/src/lib/socket/index.ts
import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/cookies";

let socketInstance: Socket | null = null;

export function getSocket(userId?: string) {
  if (typeof window === "undefined") return null;

  const token = getAccessToken();
  if (!token) return null;

  const url = (process.env.NEXT_PUBLIC_WS_URL || window.location.origin).trim();
  const path = (process.env.NEXT_PUBLIC_WS_PATH || "/socket.io").trim();

  if (!socketInstance) {
    socketInstance = io(url, {
      path,
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: false,
      query: userId ? { userId } : undefined,
      timeout: 10000,
    });

    socketInstance.on("connect_error", (e) =>
      console.error("connect_error:", e?.message ?? e)
    );
  }

  socketInstance.auth = { token };
  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
}
