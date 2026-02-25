// src/config/socket.js
import { Server } from "socket.io";

let io = null;

// userId -> Set(socketId)
const userSockets = new Map();

// socketId -> userId
const socketUsers = new Map();

function requireIO() {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized. Call initSocket(httpServer) before using getIO()/emit helpers."
    );
  }
  return io;
}

function addSocketForUser(userId, socketId) {
  const key = String(userId);
  if (!userSockets.has(key)) userSockets.set(key, new Set());
  userSockets.get(key).add(socketId);
  socketUsers.set(socketId, key);
}

function removeSocket(socketId) {
  const userId = socketUsers.get(socketId);
  if (!userId) return;

  socketUsers.delete(socketId);

  const set = userSockets.get(userId);
  if (!set) return;

  set.delete(socketId);
  if (set.size === 0) userSockets.delete(userId);
}

function getSocketsByUser(userId) {
  const set = userSockets.get(String(userId));
  return set ? Array.from(set) : [];
}

export function initSocket(httpServer, options = {}) {
  if (io) return io; // idempotent

  const {
    corsOrigin = process.env.SOCKET_CORS_ORIGIN || process.env.CORS_ORIGIN || "*",
    path = process.env.SOCKET_PATH || "/socket.io",
    transports = ["websocket", "polling"],
    pingTimeout = 20000,
    pingInterval = 25000,
    onConnection, // optional 

  io = new Server(httpServer, {
    path,
    cors: {
      origin: corsOrigin === "*" ? true : corsOrigin,
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports,
    pingTimeout,
    pingInterval,
    allowEIO3: false,
  });

  io.on("connection", (socket) => {
    /**
     * Client must call after connect:
     * socket.emit("register", { userId })
     * Supports multi-tab per user.
     */
    socket.on("register", ({ userId } = {}) => {
      if (!userId) return;

      addSocketForUser(userId, socket.id);
      socket.join(`user:${String(userId)}`);
    });

    socket.on("ping", (cb) => {
      if (typeof cb === "function") cb({ ok: true, t: Date.now() });
    });

    socket.on("disconnect", () => {
      removeSocket(socket.id);
    });

    if (typeof onConnection === "function") onConnection(socket, io);
  });

  return io;
}

export function getIO() {
  return requireIO();
}

export function getOnlineUserSocketIds(userId) {
  return getSocketsByUser(userId);
}

export function isUserOnline(userId) {
  return getSocketsByUser(userId).length > 0;
}

export function emitToUser(userId, event, payload) {
  const instance = requireIO();
  const socketIds = getSocketsByUser(userId);
  if (socketIds.length === 0) return { ok: false, delivered: 0 };

  socketIds.forEach((sid) => instance.to(sid).emit(event, payload));
  return { ok: true, delivered: socketIds.length };
}

export function emitToSocket(socketId, event, payload) {
  const instance = requireIO();
  instance.to(socketId).emit(event, payload);
  return { ok: true };
}

export function emitToRoom(room, event, payload) {
  const instance = requireIO();
  instance.to(room).emit(event, payload);
  return { ok: true };
}

export function joinRoom(socketId, room) {
  const instance = requireIO();
  const s = instance.sockets.sockets.get(socketId);
  if (!s) return { ok: false, reason: "SOCKET_NOT_FOUND" };
  s.join(room);
  return { ok: true };
}

export function leaveRoom(socketId, room) {
  const instance = requireIO();
  const s = instance.sockets.sockets.get(socketId);
  if (!s) return { ok: false, reason: "SOCKET_NOT_FOUND" };
  s.leave(room);
  return { ok: true };
}
