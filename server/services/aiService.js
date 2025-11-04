/**
 * aiService: an abstraction so you can plug in a real AI provider later (Gemini, OpenAI, etc).
 * For now it returns a deterministic stubbed response unless AI_API_KEY is set.
 */

const API_KEY = process.env.AI_API_KEY || '';

export async function summarizeText(text) {
  if (!API_KEY) {
    // deterministic stub/mocked summarization suitable for demo
    const snippet = text.trim().slice(0, 300);
    return `Mock summary (first 300 chars): ${snippet}${text.length > 300 ? '...' : ''}`;
  }
  // PLACEHOLDER: If you add a real key, implement provider call here.
  // Keep the same function signature and return string.
  // Example: call provider, handle errors, extract text.
  throw new Error('AI provider integration not implemented. Add code in services/aiService.js.');
}
