// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function readAuthTokenFromStorage(): string | undefined {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) return undefined;
    const user = JSON.parse(userStr);
    // Common token fields: token, accessToken, jwt
    return user?.token || user?.accessToken || user?.jwt || undefined;
  } catch (e) {
    console.error("Failed to read auth token from localStorage:", e);
    return undefined;
  }
}

export const getSocket = (): Socket => {
  if (!socket) {
    const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    console.log("Connecting Socket.IO to:", url);

    const token = readAuthTokenFromStorage();

    socket = io(url, {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: true,
      withCredentials: true,
      auth: {
        token: token || "", // backend should pull handshake.auth.token
      },
    });

    socket.on("connect", () => {
      console.log("Socket.IO CONNECTED → ID:", socket!.id);

      // Join Tenant Room using tenantId from logged-in user
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user?.tenantId) {
            console.log(`Joining room for tenant: ${user.tenantId}`);
            // support both payload shapes: string or object
            socket!.emit("joinRoom", { tenantId: user.tenantId });
          } else {
            console.warn("User object has no tenantId:", user);
          }
        } catch (e) {
          console.error("Error parsing user from localStorage:", e);
        }
      } else {
        console.warn("No user found in localStorage for socket room join");
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket.IO DISCONNECTED", reason);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err?.message ?? err);
    });

    // Debug: listen for all event names to discover mismatches
    socket.onAny((event, ...args) => {
      console.debug("[SOCKET] onAny event:", event, args);
    });

    // Keep only relevant WhatsApp events, but log payloads to help debugging
    socket.on("qr", (payload: any) => {
      console.log("QR EVENT RECEIVED → New QR Code:", payload);
    });

    socket.on("whatsapp_connected", (payload: any) => {
      console.log("whatsapp_connected RECEIVED → WhatsApp is now connected!", payload);
    });

    socket.on("status_change", (data: any) => {
      console.log("status_change EVENT →", data);
    });
  }

  return socket as Socket;
};

let guestSocket: Socket | null = null;

export const getGuestSocket = (token: string): Socket => {
  if (!guestSocket) {
    const url = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    console.log("Connecting Guest Socket.IO to:", url);

    guestSocket = io(url, {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: true,
      withCredentials: true,
      auth: {
        token: token,
      },
    });

    guestSocket.on("connect", () => {
      console.log("Guest Socket CONNECTED → ID:", guestSocket!.id);
      guestSocket!.emit("join");
    });

    guestSocket.on("disconnect", (reason) => {
      console.log("Guest Socket DISCONNECTED", reason);
    });

    guestSocket.on("connect_error", (err) => {
      console.error("Guest Socket connect error:", err?.message ?? err);
    });
  }
  return guestSocket as Socket;
};