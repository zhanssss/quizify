import localforage from "localforage";

const db = localforage.createInstance({ name: "quiz-app", storeName: "quizzes" });

const QUIZ_PREFIX = "quiz:";
const QUIZ_INDEX_KEY = "quiz:index";

export async function listQuizzes() {
    const ids = (await db.getItem(QUIZ_INDEX_KEY)) || [];
    const items = [];
    for (const id of ids) {
        const quiz = await db.getItem(QUIZ_PREFIX + id);
        if (quiz) items.push(quiz);
    }
    items.sort((a, b) => b.createdAt - a.createdAt);
    return items;
}

export async function getQuiz(id) {
    return db.getItem(QUIZ_PREFIX + id);
}

export async function saveQuiz(session) {
    const ids = (await db.getItem(QUIZ_INDEX_KEY)) || [];
    if (!ids.includes(session.id)) {
        ids.push(session.id);
        await db.setItem(QUIZ_INDEX_KEY, ids);
    }
    await db.setItem(QUIZ_PREFIX + session.id, session);
    return session;
}

export async function deleteQuiz(id) {
    const ids = (await db.getItem(QUIZ_INDEX_KEY)) || [];
    const next = ids.filter((x) => x !== id);
    await db.setItem(QUIZ_INDEX_KEY, next);
    await db.removeItem(QUIZ_PREFIX + id);
    return { ok: true };
}
