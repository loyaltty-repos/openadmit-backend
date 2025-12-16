import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Initialize OpenAI client with key from .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
