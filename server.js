const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(cors());
app.use(express.json());

// --- WebSocket setup (push channel) ---
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// clientId -> ws
const clients = new Map();

// optional: if client offline, store commands here
const pendingByClient = new Map(); // clientId -> [command, command...]

wss.on("connection", (ws) => {
  let clientId = null;

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    // client registers itself
    if (msg.type === "register" && msg.clientId) {
      clientId = msg.clientId;
      clients.set(clientId, ws);

      ws.send(JSON.stringify({ type: "registered", clientId }));

      // flush any queued commands for this client
      const pending = pendingByClient.get(clientId) || [];
      for (const command of pending) {
        ws.send(JSON.stringify({ type: "command", command }));
      }
      pendingByClient.delete(clientId);
    }
  });

  ws.on("close", () => {
    if (clientId) clients.delete(clientId);
  });
});

// --- HTTP endpoint that triggers PUSH ---
app.post("/sendCommand", (req, res) => {
  const { command, clientId } = req.body;
  if (!command) return res.status(400).send("Missing command");

  const payload = JSON.stringify({ type: "command", command });

  // Push to one client
  if (clientId) {
    const ws = clients.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    } else {
      // client offline -> queue it
      const arr = pendingByClient.get(clientId) || [];
      arr.push(command);
      pendingByClient.set(clientId, arr);
    }
    return res.send("OK");
  }

  // Or broadcast if no clientId provided
  for (const ws of clients.values()) {
    if (ws.readyState === WebSocket.OPEN) ws.send(payload);
  }
  res.send("OK");
});

// Render uses process.env.PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`HTTP+WS running on ${PORT}`));
