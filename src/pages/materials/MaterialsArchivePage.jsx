import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useDeleteMaterialMutation,
    useLazyGetFileByIdQuery,
    useListMaterialsQuery,
} from "../../app/features/materials/materialsApi.js";

function formatBytes(bytes = 0) {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
    return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

export default function MaterialsArchivePage() {
    const nav = useNavigate();
    const { data: items = [], isLoading } = useListMaterialsQuery();
    const [del] = useDeleteMaterialMutation();
    const [getFile, { isFetching: opening }] = useLazyGetFileByIdQuery();

    const [openLectureId, setOpenLectureId] = useState(null);

    const openFile = async (fileId) => {
        const res = await getFile(fileId).unwrap();
        if (!res?.blob) {
            alert("Файл не найден.");
            return;
        }

        const url = URL.createObjectURL(res.blob);
        window.open(url, "_blank", "noopener,noreferrer");

        // Можно ревокнуть чуть позже — чтобы вкладка успела прочитать
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
    };

    if (isLoading) return <div className="container">Загрузка...</div>;

    return (
        <div className="container">
            <header className="header">
                <h1>Архив материалов</h1>
                <p className="sub">Тут хранятся лекции и загруженные файлы. Позже AI будет использовать их для генерации квизов.</p>
            </header>

            <section className="card">
                <div className="hd">
                    <h2>Материалы</h2>
                    <div className="row">
                        <button className="btn primary" onClick={() => nav("/upload")}>Добавить</button>
                        <button className="btn" onClick={() => nav("/ai")}>AI Lab</button>
                    </div>
                </div>

                <div className="bd">
                    {items.length === 0 ? (
                        <div className="hint">
                            Пока пусто. Нажми “Добавить” и загрузи лекцию или файл.
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                            {items.map((m) => (
                                <div key={m.id} className="q">
                                    <div className="qHead">
                                        <div>
                                            <div className="qNum">
                                                {new Date(m.createdAt).toLocaleString()} • <b>{m.type === "file" ? "Файл" : "Лекция"}</b>
                                            </div>
                                            <div className="qText" style={{ marginTop: 4 }}>{m.title}</div>

                                            {m.type === "file" && m.file && (
                                                <div className="hint" style={{ marginTop: 6 }}>
                                                    {m.file.filename} • {m.file.mime} • {formatBytes(m.file.size)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="qMeta">
                                            <span className="badge">{m.type}</span>
                                        </div>
                                    </div>

                                    <div className="row mt">
                                        {m.type === "file" && m.file?.fileId ? (
                                            <button className="btn primary" disabled={opening} onClick={() => openFile(m.file.fileId)}>
                                                Открыть файл
                                            </button>
                                        ) : (
                                            <button
                                                className="btn primary"
                                                onClick={() => setOpenLectureId(openLectureId === m.id ? null : m.id)}
                                            >
                                                {openLectureId === m.id ? "Скрыть текст" : "Показать текст"}
                                            </button>
                                        )}

                                        <button className="btn danger" onClick={() => del(m.id)}>
                                            Удалить
                                        </button>
                                    </div>

                                    {m.type === "lecture" && openLectureId === m.id && (
                                        <div className="explain" style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>
                                            {m.lectureText || ""}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
