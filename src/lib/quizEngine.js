export const QUIZ_QUESTION_LIMIT = 40;

const normalizeLetter = (ch) =>
    String(ch || "")
        .toUpperCase()
        .replace("А", "A")
        .replace("В", "B")
        .replace("С", "C")
        .replace("Е", "E");

export function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function parseQuestions(rawText) {
    const text = String(rawText || "").replace(/\r/g, "").trim();
    if (!text) return [];

    const blocks = text.split(/\n(?=\s*\d+\.\s)/g);
    const out = [];

    for (const b of blocks) {
        const block = b.trim();
        if (!block) continue;

        const qMatch = block.match(/^\s*(\d+)\.\s*([\s\S]*?)(?=\n\s*[A-EА-Е]\)\s)/);
        if (!qMatch) continue;

        const num = parseInt(qMatch[1], 10);
        const qText = qMatch[2].trim();

        const optMatches = [...block.matchAll(/^\s*([A-EА-Е])\)\s*(.+)\s*$/gm)];
        const options = optMatches.map((m) => ({
            letter: normalizeLetter(m[1]),
            text: String(m[2] || "").trim(),
        }));

        const ansMatch = block.match(/Правильный ответ:\s*([A-EА-Е])/i);
        if (!ansMatch) continue;
        const correct = normalizeLetter(ansMatch[1]);

        if (options.length < 2) continue;

        out.push({
            id: `q_${num}`,
            originalNumber: num,
            question: qText,
            options,
            correct,
        });
    }

    out.sort((a, b) => a.originalNumber - b.originalNumber);
    return out;
}

/**
 * Новый генератор сессии: id, title, count, shuffle toggles
 */
export function buildQuizSession({
                                     id,
                                     bankId,
                                     title,
                                     parsedQuestions,
                                     count,
                                     shuffleQuestions = true,
                                     shuffleAnswers = true,
                                 }) {
    const total = parsedQuestions.length;

    const base = parsedQuestions.map((q) => ({
        ...q,
        options: shuffleAnswers ? shuffle(q.options.map((o) => ({ ...o }))) : q.options.map((o) => ({ ...o })),
    }));

    const qs = shuffleQuestions ? shuffle(base) : base;

    const limit = Math.max(1, Math.min(Number(count) || 1, total));

    return {
        id,
        bankId,
        title,
        questionCount: limit,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        checked: false,
        selections: {}, // { [qid]: "A" }
        questions: qs.slice(0, limit),
        score: null, // { correct, total }
    };
}

export function calcScore(session) {
    const total = session.questions.length;
    let correct = 0;

    for (const q of session.questions) {
        const sel = session.selections[q.id];
        if (sel && sel === q.correct) correct++;
    }

    return { correct, total };
}
