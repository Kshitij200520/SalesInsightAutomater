const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function generateSummary(metricsString) {
  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // Prefer Groq if key is set (very generous free tier)
  if (groqKey && groqKey !== 'your_groq_api_key_here') {
    return await generateWithGroq(groqKey, metricsString);
  }

  // Fallback to Gemini
  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    return await generateWithGemini(geminiKey, metricsString);
  }

  // Mock fallback
  return `[MOCK AI SUMMARY] Based on the extracted data:\n${metricsString}\n\nThe overall revenue is strong. Key regions performed well. Configure GROQ_API_KEY or GEMINI_API_KEY to see actual AI output.`;
}

async function generateWithGroq(apiKey, metricsString) {
  const groq = new Groq({ apiKey });
  const prompt = `You are a Senior Data Analyst. Analyze the following quarterly sales dataset metrics and generate a professional executive summary. Cover: total revenue, regional performance, top product categories, cancelled orders, and 2-3 actionable recommendations for leadership. Be concise and professional.\n\nMetrics Data:\n${metricsString}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 800,
  });

  return completion.choices[0]?.message?.content || "Summary could not be generated.";
}

async function generateWithGemini(apiKey, metricsString) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `You are a Senior Data Analyst. Analyze the following sales dataset metrics and generate a professional executive sales summary covering revenue trends, regional performance, product insights, cancelled orders, and actionable recommendations.\n\nMetrics Data:\n${metricsString}`;

  const MAX_RETRIES = 3;
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      console.error(`Gemini Attempt ${attempt} failed (status: ${error.status}):`, error.message);
      if (error.status === 429 && attempt < MAX_RETRIES) {
        const waitMs = Math.pow(2, attempt) * 5000;
        console.log(`Rate limited. Retrying in ${Math.round(waitMs / 1000)}s...`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
        continue;
      }
      break;
    }
  }
  throw new Error('Failed to generate AI summary: ' + lastError.message);
}

module.exports = { generateSummary };
