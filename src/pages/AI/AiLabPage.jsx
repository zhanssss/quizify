import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { uid } from "../../lib/ids.js";
import { buildQuizSession } from "../../lib/quizEngine.js";

import { useListMaterialsQuery } from "../../app/features/materials/materialsApi.js";
import { useCreateQuizMutation } from "../../app/features/quizzes/quizzesApi.js";
import { generateQuestionsGroq } from "../../app/features/ai/groqJenerate.js";

import {
    useDeleteThreadMutation,
    useListThreadsQuery,
    useSaveThreadMutation,
} from "../../app/features/ai/aiApi.js";

export default function AiLabPage() {
    const nav = useNavigate();
    const settings = useSelector((s) => s.profile.settings);

    const { data: materials = [] } = useListMaterialsQuery();
    const { data: threads = [] } = useListThreadsQuery();

    const [saveThread] = useSaveThreadMutation();
    const [delThread] = useDeleteThreadMutation();
    const [generating, setGenerating] = useState(false);

    const [createQuiz, { isLoading: creatingQuiz }] = useCreateQuizMutation();

    const [mode, setMode] = useState("lecture"); // lecture | material
    const [title, setTitle] = useState("AI Quiz");
    const [count, setCount] = useState(settings.defaultQuestionCount);

    const [lectureText, setLectureText] = useState("");

    const selectableMaterials = useMemo(
        () => materials.filter((m) => m.type === "lecture"),
        [materials]
    );
    const [materialId, setMaterialId] = useState("");

    const selectedMaterial = useMemo(
        () => selectableMaterials.find((m) => m.id === materialId) || null,
        [selectableMaterials, materialId]
    );

    const sourceText = mode === "lecture" ? lectureText : (selectedMaterial?.lectureText || "");

    const onGenerateQuiz = async () => {
        const text = String(sourceText || "").trim();
        if (!text) {
            alert("Нет текста для генерации. Вставь лекцию или выбери сохранённую лекцию из материалов.");
            return;
        }

        setGenerating(true);
        try {
            const { parsedQuestions } = await generateQuestionsGroq({ mode: "text", text, count });

            const quizId = uid("quiz");
            const session = buildQuizSession({
                id: quizId,
                bankId: "ai",
                title: `${title} (${Math.min(Number(count) || 1, parsedQuestions.length)} вопросов)`,
                parsedQuestions,
                count: Math.min(Number(count) || 1, parsedQuestions.length),
                shuffleQuestions: settings.shuffleQuestions,
                shuffleAnswers: settings.shuffleAnswers,
            });

            const saved = await createQuiz(session).unwrap();

            const thread = {
                id: uid("ai"),
                title: `${title}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                source:
                    mode === "lecture"
                        ? { type: "lecture", lectureText: text }
                        : { type: "material", materialId },
                settings: { count: Number(count) || settings.defaultQuestionCount },
                lastQuizId: saved.id,
            };

            await saveThread(thread).unwrap();

            nav(`/quizzes/${saved.id}`);
        } catch (e) {
            alert(e?.message || "Ошибка генерации");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h1>AI Lab (Mock)</h1>
                <p className="sub">
                    Сейчас генерация работает в режиме mock (без бэкенда): из текста строится набор вопросов и сохраняется как квиз в архив.
                    Файлы (PDF/PPTX) — на следующем этапе, когда будет backend для извлечения текста.
                </p>
            </header>

            <section className="card">
                <div className="hd">
                    <h2>Генерация квиза</h2>
                    <span className="pill">{mode === "lecture" ? "Лекция" : "Материал (лекция)"}</span>
                </div>

                <div className="bd">
                    <div className="row mt" style={{ gap: 10, flexWrap: "wrap" }}>
                        <button className={`btn ${mode === "lecture" ? "primary" : ""}`} onClick={() => setMode("lecture")}>
                            Вставить лекцию
                        </button>
                        <button className={`btn ${mode === "material" ? "primary" : ""}`} onClick={() => setMode("material")}>
                            Выбрать лекцию из архива
                        </button>
                        <button className="btn" onClick={() => nav("/upload")}>
                            Добавить материал
                        </button>
                    </div>

                    <div className="row mt" style={{ gap: 10 }}>
                        <input
                            className="input"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Название квиза"
                            style={{ flex: 1, minWidth: 240 }}
                        />
                        <input
                            className="input input--sm"
                            type="number"
                            min={1}
                            max={300}
                            value={count}
                            onChange={(e) => setCount(e.target.value)}
                            style={{ width: 140 }}
                        />
                    </div>

                    {mode === "lecture" ? (
                        <textarea
                            className="textarea"
                            value={lectureText}
                            onChange={(e) => setLectureText(e.target.value)}
                            placeholder="Вставь текст лекции..."
                        />
                    ) : (
                        <div className="row mt" style={{ gap: 10, alignItems: "center" }}>
                            <select
                                className="select"
                                value={materialId}
                                onChange={(e) => setMaterialId(e.target.value)}
                                style={{ flex: 1, minWidth: 260 }}
                            >
                                <option value="">— выбери лекцию —</option>
                                {selectableMaterials.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.title}
                                    </option>
                                ))}
                            </select>
                            <span className="pill">
                {selectedMaterial ? "OK" : "Не выбрано"}
              </span>
                        </div>
                    )}

                    <div className="row mt">
                        <button
                            className="btn primary"
                            onClick={onGenerateQuiz}
                            disabled={generating || creatingQuiz}
                        >
                            {generating ? "Генерируем…" : "Сгенерировать квиз и открыть"}
                        </button>


                        <button className="btn" onClick={() => nav("/archive/quizzes")}>
                            Архив квизов
                        </button>
                    </div>
                </div>
            </section>

            <section className="card">
                <div className="hd">
                    <h2>Архив AI-запросов</h2>
                    <span className="pill">{threads.length}</span>
                </div>

                <div className="bd">
                    {threads.length === 0 ? (
                        <div className="hint">Пока пусто.</div>
                    ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                            {threads.map((t) => (
                                <div key={t.id} className="q">
                                    <div className="qHead">
                                        <div>
                                            <div className="qNum">{new Date(t.createdAt).toLocaleString()}</div>
                                            <div className="qText" style={{ marginTop: 4 }}>{t.title}</div>
                                            <div className="hint" style={{ marginTop: 6 }}>
                                                Источник: {t.source?.type} • Вопросов: {t.settings?.count}
                                            </div>
                                        </div>
                                        <div className="qMeta">
                                            {t.lastQuizId ? <span className="badge ok">квиз сохранён</span> : <span className="badge wait">без квиза</span>}
                                        </div>
                                    </div>

                                    <div className="row mt">
                                        {t.lastQuizId && (
                                            <button className="btn primary" onClick={() => nav(`/quizzes/${t.lastQuizId}`)}>
                                                Открыть квиз
                                            </button>
                                        )}
                                        <button className="btn danger" onClick={() => delThread(t.id)}>
                                            Удалить запись
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            {generating && (
                <div className="aiOverlay">
                    <div className="aiOverlayCard">
                        <div className="spinner" />
                        <div>
                            <div className="aiOverlayTitle">Генерируем вопросы…</div>
                            <div className="aiOverlaySub">Это может занять 5–20 секунд.</div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
