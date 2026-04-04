import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.post("/api/gemini", async (req, res) => {
  try {
    // 키가 제대로 로드되었는지 터미널에 출력
    console.log(
      "사용 중인 API 키:",
      process.env.GEMINI_API_KEY ? "정상 로드" : "로드 실패",
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
    // 구글 API가 보낸 실제 에러 내용을 터미널에 출력
    console.error("에러 상세 정보:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(3000);
