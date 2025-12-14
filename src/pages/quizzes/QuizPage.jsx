import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetQuizByIdQuery, useUpdateQuizMutation } from "../../app/features/quizzes/quizzesApi.js";
import { calcScore } from "../../lib/quizEngine.js";

function Badge({ checked, selected, isCorrect }) {
    if (!checked) return selected ? <span className="badge ok">Выбрано</span> : <span className="badge wait">Нет ответа</span>;
    return isCorrect ? <span className="badge ok">Верно</span> : <span className="badge bad">Ошибка</span>;
}

export default function QuizPage() {
    const nav = useNavigate();
    const { id } = useParams();

    const { data: session, isLoading } = useGetQuizByIdQuery(id);
    const [updateQuiz] = useUpdateQuizMutation();

    const score = useMemo(() => (session ? calcScore(session) : { correct: 0, total: 0 }), [session]);
    const answeredCount = useMemo(
        () => (session?.selections ? Object.values(session.selections).filter(Boolean).length : 0),
        [session]
    );

    if (isLoading) return <div className="container">Загрузка...</div>;

    if (!session || !session.questions || session.questions.length === 0) {
        return (
            <div className="container">
                <header className="header">
                    <h1>Квиз</h1>
                    <p className="sub">Квиз не найден. Перейди в архив или создай новый.</p>
                </header>
                <section className="card">
                    <div className="bd row">
                        <button className="btn primary" onClick={() => nav("/quizzes/create")}>Создать квиз</button>
                        <button className="btn" onClick={() => nav("/archive/quizzes")}>Архив</button>
                    </div>
                </section>
            </div>
        );
    }

    const persistPatch = async (patch) => {
        await updateQuiz({ id: session.id, patch });
    };

    const toggleSelection = async (qid, letter) => {
        if (session.checked) return;

        const current = session.selections?.[qid];
        const nextSelections = { ...(session.selections || {}) };

        if (current === letter) delete nextSelections[qid];
        else nextSelections[qid] = letter;

        await persistPatch({ selections: nextSelections });
    };

    const onCheck = async () => {
        const nextScore = calcScore(session);
        await persistPatch({ checked: true, score: nextScore });
    };

    const onReset = async () => {
        await persistPatch({ selections: {}, checked: false, score: null });
    };

    return (
        <div className="container">
            <header className="header">
                <h1>{session.title}</h1>
                <p className="sub">Вопросы/ответы перемешаны. После проверки покажет ошибки по каждому вопросу.</p>
            </header>

            <section className="card">
                <div className="hd">
                    <h2>Прохождение</h2>
                    <div className="row">
                        <button className="btn primary" onClick={onCheck} disabled={session.checked}>Проверить</button>
                        <button className="btn danger" onClick={onReset}>Сбросить</button>
                        <button className="btn" onClick={() => nav("/archive/quizzes")}>Архив</button>
                    </div>
                </div>

                <div className="bd">
                    <div className="quizTop">
                        <div className="stats">
                            <div className="stat">Вопросов: <b>{session.questions.length}</b></div>
                            <div className="stat">Отвечено: <b>{answeredCount}</b></div>
                            <div className="stat">Баллы: <b>{session.checked && session.score ? `${session.score.correct}/${session.score.total}` : "—"}</b></div>
                        </div>
                        <span className="pill">{session.checked ? "Проверено" : "Не проверено"}</span>
                    </div>

                    {session.questions.map((q, idx) => {
                        const sel = session.selections?.[q.id];
                        const isCorrect = sel && sel === q.correct;

                        return (
                            <div key={q.id} className={`q ${session.checked ? (isCorrect ? "correct" : "incorrect") : ""}`}>
                                <div className="qHead">
                                    <div>
                                        <div className="qNum">Вопрос {idx + 1} (исходный №{q.originalNumber})</div>
                                        <div className="qText">{q.question}</div>
                                    </div>
                                    <div className="qMeta">
                                        <Badge checked={session.checked} selected={!!sel} isCorrect={isCorrect} />
                                    </div>
                                </div>

                                <div className="opts">
                                    {q.options.map((o) => {
                                        const checkedBox = sel === o.letter;

                                        const optClass = session.checked
                                            ? (o.letter === q.correct
                                                ? "opt correct"
                                                : (sel && sel !== q.correct && o.letter === sel ? "opt incorrect" : "opt"))
                                            : "opt";

                                        return (
                                            <label
                                                key={o.letter}
                                                className={optClass}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleSelection(q.id, o.letter);
                                                }}
                                            >
                                                <input type="checkbox" checked={checkedBox} disabled={session.checked} readOnly />
                                                <div className="txt">
                                                    <span className="letter">{o.letter}</span>
                                                    <span>{o.text}</span>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>

                                {session.checked && (
                                    <div className="explain">
                                        {isCorrect ? (
                                            <>Ответ: <b>{sel}</b>. Правильно.</>
                                        ) : (
                                            <>
                                                Твой ответ: <b>{sel || "не выбран"}</b>. Правильный ответ:{" "}
                                                <b>{q.correct}) {q.options.find((x) => x.letter === q.correct)?.text || ""}</b>.
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
