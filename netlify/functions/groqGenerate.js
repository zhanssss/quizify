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
    const fenced = str.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced?.[1]) return fenced[1].trim();

    const start = str.indexOf("{");
    const end = str.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) return str.slice(start, end + 1).trim();

    return str;
}

export async function generateQuestionsGroq({ mode, text, topic, count }) {
    const res = await fetch("/.netlify/functions/groqGenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, text, topic, count }),
    });

    const raw = await res.text();
    if (!res.ok) throw new Error(`Groq ${res.status}: ${raw}`);

    const json = JSON.parse(raw);
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
