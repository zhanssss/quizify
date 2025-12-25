import React, { useEffect, useMemo, useState } from "react";
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


    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setActiveIndex(0);
    }, [id]);

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
        setActiveIndex(0);
    };

    const total = session.questions.length;
    const safeActiveIndex = Math.max(0, Math.min(activeIndex, total - 1));
    const q = session.questions[safeActiveIndex];

    const sel = session.selections?.[q.id];
    const isCorrect = !!sel && sel === q.correct;

    const goPrev = () => setActiveIndex((v) => Math.max(0, v - 1));
    const goNext = () => setActiveIndex((v) => Math.min(total - 1, v + 1));

    const jumpToFirstUnanswered = () => {
        const idx = session.questions.findIndex((qq) => !session.selections?.[qq.id]);
        setActiveIndex(idx === -1 ? 0 : idx);
    };

    const getNavItemClass = (qq, idx) => {
        const picked = !!session.selections?.[qq.id];
        const active = idx === safeActiveIndex;

        if (!session.checked) {
            return `quizNavItem ${active ? "isActive" : ""} ${picked ? "isAnswered" : "isEmpty"}`;
        }

        const ok = picked && session.selections?.[qq.id] === qq.correct;
        return `quizNavItem ${active ? "isActive" : ""} ${picked ? "isAnswered" : "isEmpty"} ${ok ? "isCorrect" : "isWrong"}`;
    };

    return (
        <div className="container">
            <header className="header">
                <h1>{session.title}</h1>
                <p className="sub">Вопросы/ответы перемешаны. Слева навигация, в центре — один вопрос.</p>
            </header>

            <section className="card quizShell">
                <aside className="quizSidebar">
                    <div className="quizSidebarTop">
                        <div className="quizSidebarTitle">Навигация</div>
                        <div className="quizSidebarMeta">
                            <div className="quizSidebarStat">Вопросов: <b>{total}</b></div>
                            <div className="quizSidebarStat">Отвечено: <b>{answeredCount}</b></div>
                            <div className="quizSidebarStat">Баллы: <b>{session.checked && session.score ? `${session.score.correct}/${session.score.total}` : "—"}</b></div>
                        </div>

                        <div className="quizSidebarActions">
                            <button className="btn primary" onClick={onCheck} disabled={session.checked}>Проверить</button>
                            <button className="btn danger" onClick={onReset}>Сбросить</button>
                            <button className="btn" onClick={() => nav("/archive/quizzes")}>Архив</button>
                        </div>

                        <div className="quizSidebarRow">
                            <button className="btn" onClick={jumpToFirstUnanswered}>К первому без ответа</button>
                            <span className="pill">{session.checked ? "Проверено" : "Не проверено"}</span>
                        </div>
                    </div>

                    <div className="quizNavGrid">
                        {session.questions.map((qq, idx) => (
                            <button
                                key={qq.id}
                                type="button"
                                className={getNavItemClass(qq, idx)}
                                onClick={() => setActiveIndex(idx)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="quizMain">
                    <div className="quizMainHeader">
                        <div className="quizMainTitle">
                            <div className="qNum">Вопрос {safeActiveIndex + 1} (исходный №{q.originalNumber})</div>
                            <div className="qText">{q.question}</div>
                        </div>

                        <div className="quizMainMeta">
                            <Badge checked={session.checked} selected={!!sel} isCorrect={isCorrect} />
                        </div>
                    </div>

                    <div className="quizQuestionArea">
                        <div className={`q quizOne ${session.checked ? (isCorrect ? "correct" : "incorrect") : ""}`}>
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
                    </div>

                    <div className="quizBottomBar">
                        <button className="btn" onClick={goPrev} disabled={safeActiveIndex === 0}>Назад</button>
                        <div className="quizProgress">
                            {safeActiveIndex + 1} / {total}
                        </div>
                        <button className="btn primary" onClick={goNext} disabled={safeActiveIndex === total - 1}>Вперёд</button>
                    </div>
                </main>
            </section>
        </div>
    );
}
