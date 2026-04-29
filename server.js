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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

io.on("connection", (socket) => {
  socket.on("cursor_move", (data) => {
    socket.broadcast.emit("cursor_update", { id: socket.id, ...data });
  });

  socket.on("schedule_update", (newSchedule) => {
    socket.broadcast.emit("schedule_updated", newSchedule);
  });

  socket.on("days_update", (newDays) => {
    socket.broadcast.emit("days_updated", newDays);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user_disconnected", socket.id);
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
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

httpServer.listen(3000, () => {});
