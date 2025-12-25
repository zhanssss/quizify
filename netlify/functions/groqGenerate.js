// netlify/functions/groqGenerate.js
export async function handler(event) {
    try {
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: "Method Not Allowed" };
        }

        const apiKey = process.env.GROQ_API_KEY;
        const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: { message: "Missing GROQ_API_KEY" } }) };
        }

        const body = JSON.parse(event.body || "{}");
        const { mode = "text", text = "", topic = "", count = 10 } = body;

        const n = Math.max(1, Math.min(60, Number(count) || 10));
        const source =
            mode === "topic"
                ? `TOPIC:\n${String(topic || "").trim()}`
                : `TEXT:\n${String(text || "").trim()}`;

        const prompt = `
Generate ${n} multiple-choice quiz questions in Russian.

Rules:
- 5 options (A, B, C, D, E)
- exactly ONE correct answer
- no explanations
- DO NOT wrap in \`\`\`
- return ONLY valid JSON

Return format:
{
  "parsedQuestions": [
    {
      "id": "q1",
      "originalNumber": 1,
      "question": "...",
      "options": [
        { "letter": "A", "text": "..." },
        { "letter": "B", "text": "..." },
        { "letter": "C", "text": "..." },
        { "letter": "D", "text": "..." },
        { "letter": "E", "text": "..." }
      ],
      "correct": "C"
    }
  ]
}

Source:
${source}
`.trim();

        const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                temperature: 0.2,
                max_tokens: 3500,
                messages: [
                    { role: "system", content: "You are a quiz generator." },
                    { role: "user", content: prompt },
                ],
            }),
        });

        const raw = await resp.text();
        if (!resp.ok) {
            return { statusCode: resp.status, body: raw };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: raw, // вернём как есть; фронт распарсит
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: { message: e?.message || "Server error" } }),
        };
    }
}
