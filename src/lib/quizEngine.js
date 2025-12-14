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

/**
 * Парсит формат:
 * 1. Вопрос...
 * A) ...
 * ...
 * Правильный ответ: C
 */
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

export function buildSessionFromBank(bank) {
    // перемешиваем вопросы и внутри — варианты
    const shuffled = shuffle(
        bank.map((q) => ({
            ...q,
            options: shuffle(q.options.map((o) => ({ ...o }))),
        }))
    );

    const limited = shuffled.slice(0, Math.min(QUIZ_QUESTION_LIMIT, shuffled.length));

    return {
        createdAt: Date.now(),
        limit: QUIZ_QUESTION_LIMIT,
        questions: limited,
        selections: {}, // { [qid]: "A" }
        checked: false,
    };
}

export function calcScore(session) {
    const total = session.questions.length;
    let correctCount = 0;
    for (const q of session.questions) {
        const sel = session.selections[q.id];
        if (sel && sel === q.correct) correctCount++;
    }
    return { correctCount, total };
}
