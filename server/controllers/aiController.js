import {
  enhanceText,
  summarizeText,
  suggestText,
} from "../services/geminiService.js";

export const handleEnhance = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    console.log("📝 Enhance request received, text length:", text.length);
    const result = await enhanceText(text);
    console.log("✅ Enhance completed successfully");
    
    res.json({ result });
  } catch (err) {
    console.error("❌ Enhance error:", err.message);
    console.error("Full error:", err);
    
    res.status(500).json({ 
      message: "AI enhancement failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const handleSummarize = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    console.log("📝 Summarize request received, text length:", text.length);
    const result = await summarizeText(text);
    console.log("✅ Summarize completed successfully");
    
    res.json({ result });
  } catch (err) {
    console.error("❌ Summarize error:", err.message);
    console.error("Full error:", err);
    
    res.status(500).json({ 
      message: "AI summarization failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const handleSuggest = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    console.log("📝 Suggest request received, text length:", text.length);
    const result = await suggestText(text);
    console.log("✅ Suggest completed successfully");
    
    res.json({ result });
  } catch (err) {
    console.error("❌ Suggest error:", err.message);
    console.error("Full error:", err);
    
    res.status(500).json({ 
      message: "AI suggestion failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};