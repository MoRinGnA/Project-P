import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

io.on("connection", (socket) => {
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("request_sync", socket.id);
  });

  socket.on("send_sync_data", (data) => {
    io.to(data.targetSocketId).emit("sync_data", data);
  });

  socket.on("cursor_move", (data) => {
    if (data.roomId) {
      socket.to(data.roomId).emit("cursor_update", { id: socket.id, ...data });
    }
  });

  socket.on("schedule_update", (data) => {
    if (data.roomId) {
      socket.to(data.roomId).emit("schedule_updated", data.newSchedule);
    }
  });

  socket.on("days_update", (data) => {
    if (data.roomId) {
      socket.to(data.roomId).emit("days_updated", data.newDays);
    }
  });

  socket.on("budget_update", (data) => {
    if (data.roomId) {
      socket.to(data.roomId).emit("budget_updated", data.newBudget);
    }
  });

  socket.on("disconnect", () => {
    io.emit("user_disconnected", socket.id);
  });
});

app.post("/api/gemini", async (req, res) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: req.body.prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      },
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.response?.data || error.message });
}
});

httpServer.listen(3000, () => {});