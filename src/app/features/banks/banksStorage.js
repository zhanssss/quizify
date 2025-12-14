import localforage from "localforage";

const db = localforage.createInstance({ name: "quiz-app", storeName: "banks" });

const ACTIVE_BANK_KEY = "bank:active";
const BANK_PREFIX = "bank:";
const BANK_INDEX_KEY = "bank:index";

export async function listBanks() {
    const ids = (await db.getItem(BANK_INDEX_KEY)) || [];
    const items = [];
    for (const id of ids) {
        const bank = await db.getItem(BANK_PREFIX + id);
        if (bank) items.push(bank);
    }
    items.sort((a, b) => b.updatedAt - a.updatedAt);
    return items;
}

export async function getActiveBank() {
    const activeId = await db.getItem(ACTIVE_BANK_KEY);
    if (!activeId) return null;
    return db.getItem(BANK_PREFIX + activeId);
}

export async function setActiveBank(id) {
    await db.setItem(ACTIVE_BANK_KEY, id);
    return getActiveBank();
}

export async function saveBank(bank) {
    // bank: { id, title, rawText, parsedCount, parsed, createdAt, updatedAt }
    const ids = (await db.getItem(BANK_INDEX_KEY)) || [];
    if (!ids.includes(bank.id)) {
        ids.push(bank.id);
        await db.setItem(BANK_INDEX_KEY, ids);
    }
    await db.setItem(BANK_PREFIX + bank.id, bank);
    await db.setItem(ACTIVE_BANK_KEY, bank.id);
    return bank;
}
