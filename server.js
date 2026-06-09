const express = require("express");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const PLAYERS_FILE = path.join(DATA_DIR, "players.json");
const KEEP_ALIVE_TIMEOUT = 6000;

let players = {};
let connectedUsers = new Map();
let waitingPlayer = null;
let nextRoomId = 1;
const rooms = new Map();

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PLAYERS_FILE)) {
    fs.writeFileSync(PLAYERS_FILE, "{}\n", "utf8");
  }
}

function loadPlayers() {
  ensureDataFile();
  try {
    players = JSON.parse(fs.readFileSync(PLAYERS_FILE, "utf8") || "{}");
  } catch (error) {
    console.error("Error leyendo players.json:", error);
    players = {};
  }
}

function savePlayers() {
  ensureDataFile();
  fs.writeFileSync(PLAYERS_FILE, JSON.stringify(players, null, 2), "utf8");
}

function getSessionId(req) {
  return req.body.sessionId || req.body.nickname || req.query.sessionId || req.query.nickname || req.ip;
}

function touchConnection(id) {
  connectedUsers.set(id, Date.now());
}

loadPlayers();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/api/status", (req, res) => {
  res.json({ server: "online", message: "Servidor funcionando correctamente" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/connected", (req, res) => {
  const sessionId = getSessionId(req);
  touchConnection(sessionId);
  res.json({ connected: connectedUsers.size });
});

app.post("/api/connected", (req, res) => {
  const sessionId = getSessionId(req);
  touchConnection(sessionId);
  res.json({ connected: connectedUsers.size });
});

app.post("/api/login", (req, res) => {
  const nickname = String(req.body.nickname || "").trim();
  const color = req.body.color || "blue";

  if (!nickname) {
    return res.status(400).json({ error: "El nickname es obligatorio" });
  }

  if (!players[nickname]) {
    players[nickname] = {
      nickname,
      color,
      highScore: 0,
      gamesPlayed: 0,
      createdAt: new Date().toISOString(),
      lastConnection: new Date().toISOString()
    };
  } else {
    players[nickname].color = color;
    players[nickname].lastConnection = new Date().toISOString();
  }

  touchConnection(nickname);
  savePlayers();
  console.log(`Jugador conectado/login: ${nickname}`);

  res.status(201).json({ message: "Login correcto", player: players[nickname] });
});

app.get("/api/users", (req, res) => {
  res.json(Object.values(players));
});

app.get("/api/users/:nickname", (req, res) => {
  const player = players[req.params.nickname];
  if (!player) return res.status(404).json({ error: "Jugador no encontrado" });
  res.json(player);
});

app.post("/api/users", (req, res) => {
  const nickname = String(req.body.nickname || req.body.name || "").trim();
  const color = req.body.color || "blue";

  if (!nickname) return res.status(400).json({ error: "El nickname es obligatorio" });
  if (players[nickname]) return res.status(409).json({ error: "Ese nickname ya existe" });

  players[nickname] = {
    nickname,
    color,
    highScore: Number(req.body.highScore || 0),
    gamesPlayed: Number(req.body.gamesPlayed || 0),
    createdAt: new Date().toISOString(),
    lastConnection: new Date().toISOString()
  };
  savePlayers();
  res.status(201).json(players[nickname]);
});

app.put("/api/users/:nickname", (req, res) => {
  const nickname = req.params.nickname;
  const player = players[nickname];

  if (!player) return res.status(404).json({ error: "Jugador no encontrado" });

  if (req.body.color !== undefined) player.color = req.body.color;
  if (req.body.gamesPlayed !== undefined) player.gamesPlayed = Number(req.body.gamesPlayed);
  if (req.body.highScore !== undefined) {
    const newScore = Number(req.body.highScore);
    if (!Number.isNaN(newScore) && newScore > Number(player.highScore || 0)) {
      player.highScore = newScore;
    }
  }

  player.lastConnection = new Date().toISOString();
  savePlayers();
  res.json({ message: "Jugador actualizado", player });
});

app.delete("/api/users/:nickname", (req, res) => {
  const nickname = req.params.nickname;
  connectedUsers.delete(nickname);
  console.log(`Jugador desconectado por API: ${nickname}`);
  res.json({ message: "Jugador desconectado", nickname });
});

setInterval(() => {
  const now = Date.now();
  for (const [id, lastSeen] of connectedUsers.entries()) {
    if (now - lastSeen > KEEP_ALIVE_TIMEOUT) {
      connectedUsers.delete(id);
      console.log(`Cliente desconectado por timeout: ${id}`);
    }
  }
}, 30000);

app.use(express.static(path.join(__dirname, "dist")));

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Endpoint no encontrado" });
  }
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

function safeSend(ws, data) {
  if (ws && ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function createRoom(player1, player2) {
  const roomId = `room_${nextRoomId++}`;
  const room = {
    id: roomId,
    active: true,
    player1,
    player2
  };
  rooms.set(roomId, room);
  player1.roomId = roomId;
  player2.roomId = roomId;
  player1.role = "player1";
  player2.role = "player2";

  safeSend(player1, { type: "gameStart", role: "player1", roomId });
  safeSend(player2, { type: "gameStart", role: "player2", roomId });
}

function getOpponent(ws) {
  if (!ws.roomId) return null;
  const room = rooms.get(ws.roomId);
  if (!room || !room.active) return null;
  return room.player1 === ws ? room.player2 : room.player1;
}

function closeRoom(ws) {
  if (!ws.roomId) return;
  const room = rooms.get(ws.roomId);
  if (!room) return;

  const opponent = getOpponent(ws);
  safeSend(opponent, { type: "opponentDisconnected" });
  room.active = false;
  rooms.delete(ws.roomId);
}

wss.on("connection", (ws) => {
  console.log("Cliente WebSocket conectado");

  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (error) {
      console.error("Mensaje WebSocket inválido:", error);
      return;
    }

    switch (data.type) {
      case "joinQueue":
        if (waitingPlayer && waitingPlayer.readyState === ws.OPEN && waitingPlayer !== ws) {
          const opponent = waitingPlayer;
          waitingPlayer = null;
          createRoom(opponent, ws);
        } else {
          waitingPlayer = ws;
          safeSend(ws, { type: "queueStatus", status: "waiting" });
        }
        break;

      case "playerMove":
        safeSend(getOpponent(ws), {
          type: "playerUpdate",
          x: data.x,
          y: data.y,
          angle: data.angle,
          speed: data.speed
        });
        break;

      case "playerHit":
        safeSend(getOpponent(ws), {
          type: "playerHit",
          velocityX: data.velocityX,
          velocityY: data.velocityY
        });
        break;

      case "raceFinish":
        if (ws.roomId && rooms.has(ws.roomId)) {
          const room = rooms.get(ws.roomId);
          const winner = ws.role || "player1";
          safeSend(room.player1, { type: "gameOver", winner });
          safeSend(room.player2, { type: "gameOver", winner });
          room.active = false;
          rooms.delete(ws.roomId);
        }
        break;

      default:
        console.log("Mensaje WebSocket desconocido:", data.type);
    }
  });

  ws.on("close", () => {
    console.log("Cliente WebSocket desconectado");
    if (waitingPlayer === ws) waitingPlayer = null;
    closeRoom(ws);
  });

  ws.on("error", (error) => {
    console.error("Error WebSocket:", error);
  });
});

server.listen(PORT, () => {
  console.log("========================================");
  console.log("  SERVIDOR RACING DUEL");
  console.log("========================================");
  console.log(`  Juego: http://localhost:${PORT}`);
  console.log(`  API REST: http://localhost:${PORT}/api/status`);
  console.log(`  WebSocket: ws://localhost:${PORT}`);
  console.log("========================================");
});
