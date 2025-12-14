import React from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteQuizMutation, useGetQuizzesQuery } from "../../app/features/quizzes/quizzesApi.js";

export default function QuizArchivePage() {
    const nav = useNavigate();
    const { data: quizzes = [], isLoading } = useGetQuizzesQuery();
    const [del] = useDeleteQuizMutation();

    if (isLoading) return <div className="container">Загрузка...</div>;

    return (
        <div className="container">
            <header className="header">
                <h1>Архив квизов</h1>
                <p className="sub">История созданных квизов. Можно открыть и пройти заново, либо удалить.</p>
            </header>

            <section className="card">
                <div className="hd">
                    <h2>Квизы</h2>
                    <div className="row">
                        <button className="btn primary" onClick={() => nav("/quizzes/create")}>Новый квиз</button>
                        <button className="btn" onClick={() => nav("/")}>Главная</button>
                    </div>
                </div>

                <div className="bd">
                    {quizzes.length === 0 ? (
                        <div className="hint">Пока нет квизов. Создай первый.</div>
                    ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                            {quizzes.map((q) => (
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
                                        <button className="btn primary" onClick={() => nav(`/quizzes/${q.id}`)}>Открыть</button>
                                        <button className="btn danger" onClick={() => del(q.id)}>Удалить</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
