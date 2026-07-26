import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;
  app.use(express.json());

  // Initialize Gemini AI client
  function getAiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    return new GoogleGenAI({ apiKey });
  }

  // Initialize Local AI client
  const localAI = new OpenAI({
    baseURL: process.env.OLLAMA_URL || "http://127.0.0.1:11434/v1",
    apiKey: "ollama-local-bypass",
  });

  const useLocalLLM = process.env.USE_LOCAL_LLM === "true";

  // API to analyze meal from image and text
  app.post("/api/analyze-meal", upload.single("image"), async (req, res) => {
    try {
      const spokenText = req.body.spokenText || "";
      const file = req.file;

      if (!file && !spokenText) {
        return res.status(400).json({ error: "No image or spoken text provided." });
      }

      if (useLocalLLM) {
        // Local Ollama flow (gemma2 doesn't have vision natively, so this might just use the spoken text)
        // For a full local vision pipeline, a model like llava would be needed.
        const model = process.env.LOCAL_MODEL || "gemma2";
        const prompt = `Analyze this meal accurately based on its size and components. Spoken description: ${spokenText}. Provide the following in JSON format: { "name": "Meal name", "calories": number, "protein": number, "carbs": number, "fat": number }`;
        const response = await localAI.chat.completions.create({
          model: model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });

        const text = response.choices[0].message.content || "{}";
        let parsed = null;
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse JSON", e);
        }
        if (!parsed) {
          parsed = { name: "Unknown Meal", calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        return res.json(parsed);
      }

      // Gemini flow
      const ai = getAiClient();
      const contents: any[] = [];
      
      if (file) {
        contents.push({
          inlineData: {
            data: file.buffer.toString("base64"),
            mimeType: file.mimetype
          }
        });
      }
      
      if (spokenText) {
        contents.push(spokenText);
      }
      
      contents.push("Analyze this meal accurately based on its size and components. Provide the following in JSON format: { \"name\": \"Meal name\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number }");

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      let parsed = null;
      try {
        if (response.text) {
           parsed = JSON.parse(response.text);
        }
      } catch (e) {
        console.error("Failed to parse JSON", e);
      }
      
      if (!parsed) {
         parsed = { name: "Unknown Meal", calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      res.json(parsed);
    } catch (error: any) {
      console.error("Error analyzing meal:", error);
      res.status(500).json({ error: error.message || "Failed to analyze meal." });
    }
  });

  // API for multi-turn chat (fitness advice etc)
  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      if (useLocalLLM) {
        const model = process.env.LOCAL_MODEL || "gemma2";
        const messages = history.map((msg: any) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content
        }));
        
        messages.unshift({
          role: "system",
          content: "You are an expert fitness and nutrition coach. Answer questions about what exercise to do, fitness advice, and nutrition tips."
        });
        
        messages.push({ role: "user", content: message });

        const response = await localAI.chat.completions.create({
          model: model,
          messages: messages,
          temperature: 0.7,
        });

        return res.json({ text: response.choices[0].message.content });
      }

      // Gemini flow
      const ai = getAiClient();
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));
      
      formattedHistory.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedHistory,
        config: {
          systemInstruction: "You are an expert fitness and nutrition coach. Answer questions about what exercise to do, fitness advice, and nutrition tips.",
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: error.message || "Chat request failed." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
