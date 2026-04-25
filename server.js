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
  console.log(`접속 성공 (ID: ${socket.id})`);

  socket.on("cursor_move", (data) => {
    socket.broadcast.emit("cursor_update", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    console.log(`접속 종료 (ID: ${socket.id})`);
    socket.broadcast.emit("user_disconnected", socket.id);
  });
});

app.post("/api/gemini", async (req, res) => {
  try {
    console.log(
      "사용 중인 API 키:",
      process.env.GEMINI_API_KEY ? "로드 성공" : "로드 실패",
    );

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: req.body.prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      },
    );
    res.json(response.data);
  } catch (error) {
    console.error("에러:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

httpServer.listen(3000, () => {
  console.log("서버가 실행 중입니다.");
});
