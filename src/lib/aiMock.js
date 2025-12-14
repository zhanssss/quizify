import { shuffle } from "./quizEngine.js";

function tokenize(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 5);
}

function uniq(arr) {
    return Array.from(new Set(arr));
}

export function generateQuestionsFromTextMock({ text, count }) {
    const words = uniq(tokenize(text));
    const n = Math.max(1, Math.min(Number(count) || 10, 300));

    // если текста мало — fallback на простые вопросы
    if (words.length < 8) {
        const base = [
            { q: "Что такое C#?", a: "Язык программирования", b: "ОС", c: "Браузер", d: "СУБД", e: "Вирус", correct: "A" },
            { q: "Что делает оператор if?", a: "Проверяет условие", b: "Сортирует", c: "Удаляет файл", d: "Создаёт поток", e: "Компилирует", correct: "A" },
        ];

        return Array.from({ length: n }).map((_, i) => {
            const t = base[i % base.length];
            return {
                id: `ai_q_${i + 1}`,
                originalNumber: i + 1,
                question: t.q,
                options: [
                    { letter: "A", text: t.a },
                    { letter: "B", text: t.b },
                    { letter: "C", text: t.c },
                    { letter: "D", text: t.d },
                    { letter: "E", text: t.e },
                ],
                correct: t.correct,
            };
        });
    }

    const pool = shuffle(words);
    const pick = pool.slice(0, n);

    // делаем вопросы "выбери слово, которое встречается в тексте"
    return pick.map((correctWord, i) => {
        const distractors = shuffle(words.filter((w) => w !== correctWord)).slice(0, 4);
        const opts = shuffle([correctWord, ...distractors]).slice(0, 5);

        const letters = ["A", "B", "C", "D", "E"];
        const options = opts.map((w, idx) => ({ letter: letters[idx], text: w }));

        const correctLetter = options.find((o) => o.text === correctWord)?.letter || "A";

        return {
            id: `ai_q_${i + 1}`,
            originalNumber: i + 1,
            question: `Выбери слово, которое встречается в тексте:`,
            options,
            correct: correctLetter,
        };
    });
}
