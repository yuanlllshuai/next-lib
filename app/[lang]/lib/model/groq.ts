import { ChatGroq } from "@langchain/groq";

const model = new ChatGroq({
  model: "llama-3.1-8b-instant",   // ← 推荐这个！免费额度大、速度极快
  // model: "llama-3.3-70b-versatile",  // 暂时注释掉
  temperature: 0.7,
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

export default model