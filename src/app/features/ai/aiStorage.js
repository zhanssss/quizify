import localforage from "localforage";

const db = localforage.createInstance({ name: "quiz-app", storeName: "ai" });

const THREAD_PREFIX = "thread:";
const THREAD_INDEX_KEY = "ai:index";

/**
 * Thread:
 * {
 *   id: string,
 *   title: string,
 *   createdAt: number,
 *   updatedAt: number,
 *   source: { type: "lecture" | "material", lectureText?: string, materialId?: string },
 *   settings: { count: number },
 *   notes?: string,
 *   lastQuizId?: string | null
 * }
 */

export async function listThreads() {
    const ids = (await db.getItem(THREAD_INDEX_KEY)) || [];
    const items = [];
    for (const id of ids) {
        const t = await db.getItem(THREAD_PREFIX + id);
        if (t) items.push(t);
    }
    items.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
    return items;
}

export async function getThread(id) {
    return db.getItem(THREAD_PREFIX + id);
}

export async function saveThread(thread) {
    const ids = (await db.getItem(THREAD_INDEX_KEY)) || [];
    if (!ids.includes(thread.id)) {
        ids.push(thread.id);
        await db.setItem(THREAD_INDEX_KEY, ids);
    }
    await db.setItem(THREAD_PREFIX + thread.id, thread);
    return thread;
}

export async function deleteThread(id) {
    const ids = (await db.getItem(THREAD_INDEX_KEY)) || [];
    await db.setItem(THREAD_INDEX_KEY, ids.filter((x) => x !== id));
    await db.removeItem(THREAD_PREFIX + id);
    return { ok: true };
}
