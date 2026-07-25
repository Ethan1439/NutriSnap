import express from 'express';
import path from 'path';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON requests
  app.use(express.json());

  // API Routes
  app.post('/api/analyze-meal', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is missing' });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const base64Data = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            inlineData: { data: base64Data, mimeType },
          },
          'Analyze this image of a meal. Estimate the calories, protein (g), carbs (g), and fat (g). Also provide a short descriptive name for the meal. Return ONLY a valid JSON object matching the exact keys: {"name": string, "calories": number, "protein": number, "carbs": number, "fat": number}. No markdown formatting.'
        ],
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text;
      if (!text) {
         return res.status(500).json({ error: 'Failed to generate content' });
      }

      const data = JSON.parse(text);
      res.json(data);
    } catch (error) {
      console.error('Error analyzing meal:', error);
      res.status(500).json({ error: 'Failed to analyze meal image' });
    }
  });

  app.post('/api/send-verification-email', async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ error: 'Email and code are required' });
      }

      const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
      if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
        return res.status(500).json({ error: 'Gmail credentials not configured on the server' });
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"NutriSnap" <${GMAIL_USER}>`,
        to: email,
        subject: 'NutriSnap - Verify your email',
        text: `Your verification code is: ${code}`,
        html: `<p>Your verification code is: <strong>${code}</strong></p>`,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
