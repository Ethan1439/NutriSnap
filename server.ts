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

  app.post('/api/analyze-text', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'No text provided' });
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

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          `Analyze this meal description: "${text}". Estimate the calories, protein (g), carbs (g), and fat (g). Also provide a short descriptive name for the meal. Return ONLY a valid JSON object matching the exact keys: {"name": string, "calories": number, "protein": number, "carbs": number, "fat": number}. No markdown formatting.`
        ],
        config: {
          responseMimeType: 'application/json',
        }
      });

      const responseText = response.text;
      if (!responseText) {
         return res.status(500).json({ error: 'Failed to generate content' });
      }

      const data = JSON.parse(responseText);
      res.json(data);
    } catch (error) {
      console.error('Error analyzing text:', error);
      res.status(500).json({ error: 'Failed to analyze meal text' });
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
        subject: 'Welcome to NutriSnap! Verify your email',
        text: `Your verification code is: ${code}`,
        html: `
          <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f5f5f4; border: 2px solid #e5e7eb; border-radius: 24px; overflow: hidden; color: #1c1917;">
            <div style="background-color: #10b981; padding: 40px 20px; text-align: center; border-bottom: 4px solid #047857;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px;">NutriSnap</h1>
              <p style="color: #ecfdf5; margin: 10px 0 0 0; font-size: 16px; font-weight: bold;">Your AI Diet & Nutrition Assistant</p>
            </div>
            <div style="padding: 40px 30px; background-color: white;">
              <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 900;">Verify Your Email Address</h2>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #57534e; font-weight: 500;">
                Welcome aboard! To start tracking your meals, earning badges, and reaching your health goals, please verify your email by entering the code below:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; background-color: #f3f4f6; padding: 15px 30px; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #111827; border-radius: 16px; border: 2px solid #d1d5db; box-shadow: 0 4px 0 0 #d1d5db;">
                  ${code}
                </span>
              </div>
              <p style="margin: 0; font-size: 14px; color: #78716c; text-align: center; font-weight: 500;">
                If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
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
