// services/geminiService.js
// import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
let model = null;

/**
 * Initialize Gemini client lazily (only when first needed)
 */
function initializeGemini() {
  if (genAI) return; // Already initialized

  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log("🔑 Initializing Gemini with API key:", apiKey ? `✅ Found (${apiKey.substring(0, 15)}...)` : "❌ NOT FOUND");

  if (!apiKey) {
    throw new Error("❌ GEMINI_API_KEY is not set in environment variables!");
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    // model = genAI.getGenerativeModel({ model: "gemini-pro" });
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    console.log("✅ Gemini client initialized successfully");
  } catch (err) {
    console.error("❌ Gemini initialization failed:", err.message);
    throw err;
  }
}

/**
 * Call Gemini API with proper error handling
 */
async function callGemini(prompt, label) {
  try {
    // Initialize on first use (lazy initialization)
    initializeGemini();

    if (!model) {
      throw new Error("Gemini model not initialized");
    }

    console.log(`🧠 Sending request to Gemini: ${label}`);
    const result = await model.generateContent(prompt);

    const text = result?.response?.text?.();
    if (!text) {
      throw new Error("No text in Gemini response");
    }

    console.log(`✅ Gemini ${label} completed successfully`);
    return text;
  } catch (err) {
    console.error(`💥 Gemini ${label} error:`, err);
    throw new Error(`Gemini ${label} failed: ${err.message}`);
  }
}

/**
 * Enhance text for clarity, tone, and grammar
 */
export const enhanceText = (text) =>
  callGemini(
    `Enhance this text for clarity, tone, and grammar. Make it more professional and polished:\n\n${text}`,
    "enhanceText"
  );

/**
 * Summarize text concisely
 */
export const summarizeText = (text) =>
  callGemini(
    `Summarize this text in 3–5 clear and concise sentences:\n\n${text}`,
    "summarizeText"
  );

/**
 * Provide writing suggestions
 */
export const suggestText = (text) =>
  callGemini(
    `Provide 3 short, actionable writing suggestions or improvements for this text:\n\n${text}`,
    "suggestText"
  );