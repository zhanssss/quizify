// src/lib/ai/groqGenerate.js

function validateParsedQuestions(parsedQuestions) {
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) return false;

    for (const q of parsedQuestions) {
        if (!q?.question) return false;
        if (!Array.isArray(q.options) || q.options.length !== 5) return false;
        if (!["A", "B", "C", "D", "E"].includes(q.correct)) return false;
    }
    return true;
}

function extractJsonFromText(s) {
    const str = String(s || "").trim();

    // 1) Если модель обернула в ```json ... ``` или ``` ... ```
    const fenced = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) return fenced[1].trim();

    // 2) Если есть текст вокруг — вытащим первый JSON объект
    const start = str.indexOf("{");
    const end = str.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) return str.slice(start, end + 1).trim();

    return str;
}


export async function generateQuestionsGroq({ mode, text, topic, count }) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    const model = import.meta.env.VITE_GROQ_MODEL;

    if (!apiKey) throw new Error("Missing VITE_GROQ_API_KEY");

    const n = Math.max(1, Math.min(300, Number(count) || 10));

    const source =
        mode === "topic"
            ? `TOPIC:\n${topic}`
            : `TEXT:\n${text}`;

    const prompt = `
Generate ${n} multiple-choice quiz questions in Russian.

Rules:
- 5 options (A, B, C, D, E)
- exactly ONE correct answer
- no explanations
- return ONLY valid JSON
- structure exactly as specified

Source:
${source}

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
`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model,
            temperature: 0.2,
            messages: [
                { role: "system", content: "You are a quiz generator." },
                { role: "user", content: prompt },
            ],
        }),
    });

    if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Groq ${res.status}: ${errText}`);
    }


    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;

    if (!content) throw new Error("Empty Groq response");

    const cleaned = extractJsonFromText(content);

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error("Groq returned non-JSON");
    }


    if (!validateParsedQuestions(parsed.parsedQuestions)) {
        throw new Error("Invalid parsedQuestions format");
    }

    return parsed;
}
