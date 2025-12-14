import localforage from "localforage";

/**
 * Храним метаданные материалов отдельно от бинарных файлов.
 * materials_meta: MaterialItem (lecture/file) + индекс
 * materials_files: Blob + meta по fileId
 */

const metaDb = localforage.createInstance({
    name: "quiz-app",
    storeName: "materials_meta",
});

const filesDb = localforage.createInstance({
    name: "quiz-app",
    storeName: "materials_files",
});

const MATERIAL_PREFIX = "material:";
const MATERIAL_INDEX_KEY = "materials:index";

const FILE_PREFIX = "file:";

/** MaterialItem:
 * {
 *  id: string,
 *  type: "lecture" | "file",
 *  title: string,
 *  createdAt: number,
 *  updatedAt: number,
 *  lectureText?: string,
 *  file?: { fileId, filename, mime, size }
 * }
 */

export async function listMaterials() {
    const ids = (await metaDb.getItem(MATERIAL_INDEX_KEY)) || [];
    const items = [];
    for (const id of ids) {
        const m = await metaDb.getItem(MATERIAL_PREFIX + id);
        if (m) items.push(m);
    }
    items.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
    return items;
}

export async function getMaterial(id) {
    return metaDb.getItem(MATERIAL_PREFIX + id);
}

export async function saveMaterial(item) {
    const ids = (await metaDb.getItem(MATERIAL_INDEX_KEY)) || [];
    if (!ids.includes(item.id)) {
        ids.push(item.id);
        await metaDb.setItem(MATERIAL_INDEX_KEY, ids);
    }
    await metaDb.setItem(MATERIAL_PREFIX + item.id, item);
    return item;
}

export async function deleteMaterial(id) {
    const current = await getMaterial(id);
    const ids = (await metaDb.getItem(MATERIAL_INDEX_KEY)) || [];
    await metaDb.setItem(MATERIAL_INDEX_KEY, ids.filter((x) => x !== id));
    await metaDb.removeItem(MATERIAL_PREFIX + id);

    // Если это файл — удаляем и blob
    if (current?.type === "file" && current?.file?.fileId) {
        await filesDb.removeItem(FILE_PREFIX + current.file.fileId);
    }

    return { ok: true };
}

export async function saveLecture({ id, title, lectureText }) {
    const now = Date.now();
    const item = {
        id,
        type: "lecture",
        title: title?.trim() || "Лекция",
        lectureText: String(lectureText || ""),
        createdAt: now,
        updatedAt: now,
    };
    return saveMaterial(item);
}

/**
 * Сохраняем файл как Blob в IndexedDB и создаём MaterialItem типа "file"
 */
export async function uploadFileAsMaterial({ id, title, file }) {
    if (!file) throw new Error("No file provided");

    const now = Date.now();
    const fileId = `${id}_blob`;

    // Сохраняем blob + мета
    await filesDb.setItem(FILE_PREFIX + fileId, {
        blob: file, // file это уже Blob (File наследуется от Blob)
        meta: {
            filename: file.name || "file",
            mime: file.type || "application/octet-stream",
            size: file.size || 0,
        },
        createdAt: now,
    });

    const item = {
        id,
        type: "file",
        title: title?.trim() || file.name || "Файл",
        createdAt: now,
        updatedAt: now,
        file: {
            fileId,
            filename: file.name || "file",
            mime: file.type || "application/octet-stream",
            size: file.size || 0,
        },
    };

    return saveMaterial(item);
}

export async function getFileById(fileId) {
    const entry = await filesDb.getItem(FILE_PREFIX + fileId);
    if (!entry) return null;
    return entry; // { blob, meta, createdAt }
}
