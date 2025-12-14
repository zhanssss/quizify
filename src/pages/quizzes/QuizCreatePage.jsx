import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useGetActiveBankQuery } from "../../app/features/banks/banksApi.js";
import { useCreateQuizMutation } from "../../app/features/quizzes/quizzesApi.js";
import { buildQuizSession } from "../../lib/quizEngine.js";
import { uid } from "../../lib/ids.js";

export default function QuizCreatePage() {
    const nav = useNavigate();
    const { data: bank, isLoading } = useGetActiveBankQuery();
    const [createQuiz, { isLoading: creating }] = useCreateQuizMutation();

    const settings = useSelector((s) => s.profile.settings);

    const total = useMemo(() => bank?.parsed?.length || 0, [bank]);
    const [count, setCount] = useState(settings.defaultQuestionCount);

    const canCreate = total > 0;

    const onCreate = async () => {
        if (!canCreate) return;

        const session = buildQuizSession({
            id: uid("quiz"),
            bankId: bank.id,
            title: `Квиз (${Math.min(Number(count) || 1, total)} вопросов)`,
            parsedQuestions: bank.parsed,
            count: Math.min(Number(count) || 1, total),
            shuffleQuestions: settings.shuffleQuestions,
            shuffleAnswers: settings.shuffleAnswers,
        });

        const saved = await createQuiz(session).unwrap();
        nav(`/quizzes/${saved.id}`);
    };

    if (isLoading) return <div className="container">Загрузка...</div>;

    return (
        <div className="container">
            <header className="header">
                <h1>Создание квиза</h1>
                <p className="sub">Выбери количество вопросов. Вопросы/ответы могут быть перемешаны настройками профиля.</p>
            </header>

            <section className="card">
                <div className="hd">
                    <h2>Параметры</h2>
                    <span className="pill">{canCreate ? `В банке: ${total}` : "Нет активного банка"}</span>
                </div>

                <div className="bd">
                    {!canCreate ? (
                        <div className="row">
                            <button className="btn primary" onClick={() => nav("/import")}>Импортировать банк</button>
                            <button className="btn" onClick={() => nav("/")}>На главную</button>
                        </div>
                    ) : (
                        <>
                            <div className="row mt">
                                <label className="stat">
                                    Количество:&nbsp;
                                    <input
                                        className="input input--sm"
                                        type="number"
                                        value={count}
                                        min={1}
                                        max={total}
                                        onChange={(e) => setCount(e.target.value)}
                                        style={{ width: 110 }}
                                    />

                                </label>
                            </div>

                            <div className="row mt">
                                <button className="btn primary" onClick={onCreate} disabled={creating}>
                                    Создать квиз
                                </button>
                                <button className="btn" onClick={() => nav("/archive/quizzes")}>
                                    Архив квизов
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
