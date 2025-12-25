import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useGetActiveBankQuery } from "../../app/features/banks/banksApi.js";
import { useGetQuizzesQuery } from "../../app/features/quizzes/quizzesApi.js";

export default function QuizzesHomePage() {
    const nav = useNavigate();

    const { data: bank, isLoading: bankLoading } = useGetActiveBankQuery();
    const { data: quizzes = [], isLoading: quizzesLoading } = useGetQuizzesQuery();

    const bankCount = useMemo(() => bank?.parsed?.length || 0, [bank]);
    const canCreate = bankCount > 0;

    const lastQuizzes = useMemo(() => quizzes.slice(0, 5), [quizzes]);

    if (bankLoading || quizzesLoading) return <div className="container">Загрузка...</div>;

    return (
        <div className="container">
            <header className="header">
                <h1>Квизы</h1>
                <p className="sub">Управление квизами: импорт банка, создание и архив.</p>
            </header>

            <section className="card">
                <div className="hd">
                    <h2>Действия</h2>
                    <span className="pill">
            {canCreate ? `Активный банк: ${bankCount} вопросов` : "Нет активного банка"}
          </span>
                </div>

                <div className="bd">
                    <div className="row mt">
                        <button className="btn" onClick={() => nav("/import")}>
                            Импорт банка
                        </button>

                        <button className="btn primary" onClick={() => nav("/quizzes/create")} disabled={!canCreate}>
                            Создать квиз
                        </button>

                        <button className="btn" onClick={() => nav("/archive/quizzes")}>
                            Архив квизов
                        </button>
                    </div>

                    {!canCreate && (
                        <div className="hint" style={{ marginTop: 10 }}>
                            Чтобы создать квиз — сначала импортируй банк вопросов.
                        </div>
                    )}

                    <div className="hr" />

                    <div>
                        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 650 }}>Последние квизы</h2>

                        {lastQuizzes.length === 0 ? (
                            <div className="hint" style={{ marginTop: 10 }}>
                                Пока нет квизов. Создай первый.
                            </div>
                        ) : (
                            <div className="mt" style={{ display: "grid", gap: 12 }}>
                                {lastQuizzes.map((q) => (
                                    <div key={q.id} className="q">
                                        <div className="qHead">
                                            <div>
                                                <div className="qNum">{new Date(q.createdAt).toLocaleString()}</div>
                                                <div className="qText" style={{ marginTop: 4 }}>{q.title}</div>
                                            </div>
                                            <div className="qMeta">
                                                <span className="badge">{q.questionCount} вопросов</span>
                                                <span className="badge">
                          {q.score ? `${q.score.correct}/${q.score.total}` : "не проверен"}
                        </span>
                                            </div>
                                        </div>

                                        <div className="row mt">
                                            <button className="btn primary" onClick={() => nav(`/quizzes/${q.id}`)}>
                                                Открыть
                                            </button>
                                            <button className="btn" onClick={() => nav("/archive/quizzes")}>
                                                В архив
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
