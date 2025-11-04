// routes/aiRoutes.js
import express from "express";
import {
  handleEnhance,
  handleSummarize,
  handleSuggest,
} from "../controllers/aiController.js";

const router = express.Router();

// POST /api/ai/enhance
router.post("/enhance", handleEnhance);

// POST /api/ai/summarize
router.post("/summarize", handleSummarize);

// POST /api/ai/suggest
router.post("/suggest", handleSuggest);

export default router;
