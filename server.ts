import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini Client Lazily/Safely
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("WARNING: GEMINI_API_KEY is not defined. Offline/Mock mode active.");
        return null;
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // --- API Routes ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Dynamic Cinematic Lore & Prompt Generation Route
  app.post("/api/cinematic/generate", async (req, res): Promise<any> => {
    try {
      const { genre, subject, lighting, weather, cameraStyle, customNotes } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured. Go to Secrets panel to set up.",
        });
      }

      // Compile the instruction
      const inputCriteria = `
        Genre: ${genre || "Classic Cinematic"}
        Subject: ${subject || "An enigmatic character"}
        Lighting: ${lighting || "Streetlight Spotlight"}
        Weather: ${weather || "Soft rain"}
        Camera Stylization: ${cameraStyle || "Vintage 35mm Film"}
        Custom Directives: ${customNotes || "none"}
      `;

      const prompt = `
        You are a stellar Director of Photography and cinematic storywriter.
        We are crafting a highly stylized, dark cinematic masterclass portrait based on these specific instructions:
        ${inputCriteria}

        Please generate:
        1. A breathtaking, artistic 'title' for this frame.
        2. A deep, mysterious, character-driven narrative/story ('backstory') of 3-4 sentences.
        3. Precise, professional photographic parameters to achieve this look ('cameraSettings').
        4. A customized synthesized raw audio configuration to match the exact visual pacing ('audioMood').
        5. dominant high-contrast 'colorPalette' of 5 hex colors (e.g., deep dark blue, neon amber/yellow, low-mid cyan).
        6. An 'expandedPrompt' that describes an ultra-realistic, highly detailed cinematic portrait matching the visual style. Keep it descriptive, moody, and aesthetic.
      `;

      // Call Gemini 3.5 Flash for the structured metadata
      const jsonResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Breathtaking title of the picture slot or scene." },
              backstory: { type: Type.STRING, description: "A highly cinematic, evocative 3-4 sentence backstory. Human, deep, moody, poetic feel." },
              cameraSettings: {
                type: Type.OBJECT,
                properties: {
                  camera: { type: Type.STRING, description: "The high-end camera model, e.g. Leica Mono, Hasselblad H6D, Arri Alexa." },
                  lens: { type: Type.STRING, description: "The specific lens choice, e.g., Cooke Anamorphic Primes 50mm f/1.2." },
                  iso: { type: Type.STRING, description: "ISO setting, such as ISO 800 or 1600." },
                  aperture: { type: Type.STRING, description: "F-stop, e.g., f/1.2 or f/1.4." },
                  shutterSpeed: { type: Type.STRING, description: "Shutter speed, e.g. 1/60s or 1/125s." },
                  filmStock: { type: Type.STRING, description: "Emulated film stock, e.g. Kodak Gold 200, CineStill 800T, Ilford HP5." }
                },
                required: ["camera", "lens", "iso", "aperture", "shutterSpeed", "filmStock"]
              },
              audioMood: {
                type: Type.OBJECT,
                properties: {
                  tempo: { type: Type.INTEGER, description: "Tempo for interactive audio pulse (BPM, e.g. 50-90)." },
                  instrument: { type: Type.STRING, description: "Choice of synthesizer tone, e.g., warm-pad, low-ambient-sub, dark-saw, classic-rhodes, vinyl-crackle" },
                  hasRain: { type: Type.BOOLEAN, description: "True if rain ambient should play." },
                  description: { type: Type.STRING, description: "Description of the soundscape, e.g., slow drill subbass with high-hats on vinyl noise." }
                },
                required: ["tempo", "instrument", "hasRain", "description"]
              },
              expandedPrompt: { type: Type.STRING, description: "The ultra-detailed prompt for image generation, describing the subject, lighting, pose and environment clearly." },
              colorPalette: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "5 dominant hex color strings perfectly matching the mood of this scene."
              }
            },
            required: ["title", "backstory", "cameraSettings", "audioMood", "expandedPrompt", "colorPalette"]
          }
        }
      });

      const parsedData = JSON.parse(jsonResponse.text || "{}");

      // Now, try to generate the image dynamically if the user's API key supports the image generation model (gemini-2.5-flash-image)
      let generatedImageBase64: string | null = null;
      try {
        const finalPrompt = parsedData.expandedPrompt || inputCriteria;
        console.log("Attempting image generation for prompt:", finalPrompt);
        
        const imageRes = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: {
            parts: [{ text: `A 3:4 portrait photo of: ${finalPrompt}. Dramatic cinema photography, high contrast.` }]
          },
          config: {
            imageConfig: {
              aspectRatio: "3:4"
            }
          }
        });

        if (imageRes.candidates?.[0]?.content?.parts) {
          for (const part of imageRes.candidates[0].content.parts) {
            if (part.inlineData) {
              generatedImageBase64 = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        }
      } catch (imgError) {
        console.warn("AI Image Generation failed or unsupported by the current API Key (using fine-tuned templates instead):", imgError);
      }

      res.json({
        success: true,
        data: parsedData,
        generatedImage: generatedImageBase64,
        keyType: generatedImageBase64 ? "paid_enabled" : "standard"
      });

    } catch (error: any) {
      console.error("Failed to generate cinematic studio data:", error);
      res.status(500).json({
        error: "Internal Server Error in generating portrait profile.",
        details: error?.message || "",
      });
    }
  });

  // Handle Vite Asset Serving & SPA Router fallback
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
    console.log(`[Cinematic Portrait Server] running on http://localhost:${PORT}`);
  });
}

startServer();
