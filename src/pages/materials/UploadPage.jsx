import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uid } from "../../lib/ids.js";
import { useSaveLectureMutation, useUploadFileMutation } from "../../app/features/materials/materialsApi.js";

export default function UploadPage() {
    const nav = useNavigate();
    const [saveLecture, { isLoading: savingLecture }] = useSaveLectureMutation();
    const [uploadFile, { isLoading: uploading }] = useUploadFileMutation();

    const [mode, setMode] = useState("lecture"); // "lecture" | "file"

    const [title, setTitle] = useState("");
    const [lectureText, setLectureText] = useState("");

    const [fileTitle, setFileTitle] = useState("");
    const [file, setFile] = useState(null);

    const onSaveLecture = async () => {
        const id = uid("mat");
        await saveLecture({
            id,
            title: title || "Лекция",
            lectureText,
        }).unwrap();

        nav("/archive/materials");
    };

    const onUploadFile = async () => {
        if (!file) {
            alert("Выбери файл.");
            return;
        }
        const id = uid("mat");
        await uploadFile({
            id,
            title: fileTitle || file.name || "Файл",
            file,
        }).unwrap();

        nav("/archive/materials");
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Загрузка материалов</h1>
                <p className="sub">Сохраняй лекции и файлы (PDF/PPTX/и т.д.) в архив. Это база для будущей AI-генерации квизов.</p>
            </header>

            <section className="card">
                <div className="hd">
                    <h2>Режим</h2>
                    <div className="row">
                        <button className={`btn ${mode === "lecture" ? "primary" : ""}`} onClick={() => setMode("lecture")}>
                            Лекция (текст)
                        </button>
                        <button className={`btn ${mode === "file" ? "primary" : ""}`} onClick={() => setMode("file")}>
                            Файл (PDF/PPTX)
                        </button>
                        <button className="btn" onClick={() => nav("/archive/materials")}>
                            Архив материалов
                        </button>
                    </div>
                </div>

                <div className="bd">
                    {mode === "lecture" ? (
                        <>
                            <div className="row mt" style={{ gap: 10 }}>
                                <input
                                    className="input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Название лекции (опционально)"
                                    style={{ flex: 1, minWidth: 240 }}
                                />
                            </div>

                            <textarea
                                className="textarea"
                                value={lectureText}
                                onChange={(e) => setLectureText(e.target.value)}
                                placeholder="Вставь текст лекции..."
                            />

                            <div className="row mt">
                                <button className="btn primary" disabled={savingLecture || !lectureText.trim()} onClick={onSaveLecture}>
                                    Сохранить лекцию
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="row mt" style={{ gap: 10 }}>
                                <input
                                    className="input"
                                    value={fileTitle}
                                    onChange={(e) => setFileTitle(e.target.value)}
                                    placeholder="Название файла в архиве (опционально)"
                                    style={{ flex: 1, minWidth: 240 }}
                                />
                            </div>

                            <div className="row mt" style={{ gap: 10 }}>
                                <input
                                    type="file"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                {file ? <span className="pill">{file.name}</span> : <span className="pill">Файл не выбран</span>}
                            </div>

                            <div className="row mt">
                                <button className="btn primary" disabled={uploading || !file} onClick={onUploadFile}>
                                    Загрузить файл
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
